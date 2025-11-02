'use client';

import React, { useEffect, useState } from 'react';
import PatientNavbar from '@/components/PatientNavbar';
import { API_URL } from '@/config/api';

type PatientProfile = {
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  phone_number: string;
  address: string;
  emergency_contact: string;
};

const defaultProfile: PatientProfile = {
  date_of_birth: '',
  gender: '',
  phone_number: '',
  address: '',
  emergency_contact: '',
};

export default function PatientSettingsPage() {
  const [profile, setProfile] = useState<PatientProfile>(defaultProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  // Constraint: user must be at least 17 years old; compute max allowed DOB (today - 17 years)
  const [maxDob, setMaxDob] = useState<string>('');
  useEffect(() => {
    const now = new Date();
    const d = new Date(now.getFullYear() - 17, now.getMonth(), now.getDate());
    const toStr = (n: number) => String(n).padStart(2, '0');
    setMaxDob(`${d.getFullYear()}-${toStr(d.getMonth() + 1)}-${toStr(d.getDate())}`);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          const currentUserId = u?.user_id ? Number(u.user_id) : null;
          if (currentUserId) {
            setUserId(currentUserId);
            setUserName(u.full_name || u.name || '');
            setUserEmail(u.email || '');
            setRole((u.role || '').toLowerCase());

            // Try to load from localStorage first (user-specific cache)
            const cachedKey = `patient_profile_${currentUserId}`;
            const cached = localStorage.getItem(cachedKey);
            if (cached) {
              setProfile(JSON.parse(cached));
            }

            // Fetch from database to get latest data
            try {
              const resp = await fetch(`${API_URL}/api/patient/profile?user_id=${currentUserId}`);
              if (resp.ok) {
                const data = await resp.json();
                if (data.profile) {
                  // Format date_of_birth if it's a date string
                  const formattedProfile = {
                    ...data.profile,
                    date_of_birth: data.profile.date_of_birth 
                      ? (data.profile.date_of_birth.includes('T') 
                          ? data.profile.date_of_birth.split('T')[0] 
                          : data.profile.date_of_birth.split(' ')[0])
                      : ''
                  };
                  setProfile(formattedProfile);
                  // Update cache with latest data
                  localStorage.setItem(cachedKey, JSON.stringify(formattedProfile));
                }
              }
            } catch (fetchErr) {
              console.error('Failed to fetch profile from database:', fetchErr);
              // If fetch fails, use cached data if available
            }
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Simple client-side validations
      if (profile.date_of_birth) {
        const dob = new Date(profile.date_of_birth);
        const max = new Date(maxDob);
        if (dob > max) {
          setError('Date of birth indicates age under 17.');
          return;
        }
      }
      if (profile.phone_number && profile.phone_number.replace(/\D/g, '').length < 10) {
        setError('Phone number must be at least 10 digits.');
        return;
      }
      if (!userId) {
        setError('User not found. Please sign in again.');
        return;
      }

      const resp = await fetch(`${API_URL}/api/patient/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          date_of_birth: profile.date_of_birth || null,
          gender: profile.gender || null,
          phone_number: profile.phone_number || null,
          address: profile.address || null,
          emergency_contact: profile.emergency_contact || null,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save profile');
      }

      // Cache locally for quick loads (user-specific cache)
      if (userId) {
        localStorage.setItem(`patient_profile_${userId}`, JSON.stringify(profile));
      }
      setSaved(true);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {isEditing ? 'Close' : 'Edit'}
          </button>
        </div>

        {/* Read-only profile summary */}
        {!isEditing && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                {userName ? userName.split(' ').map((n: string) => n[0]).join('').slice(0,2) : 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{userName || 'User'}</h2>
                <p className="text-gray-600 text-sm">{userEmail}</p>
                <p className="text-gray-500 text-sm capitalize">{role}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {profile.date_of_birth && (
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-900 font-medium">{profile.date_of_birth}</p>
                </div>
              )}
              {profile.gender && (
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-900 font-medium">{profile.gender}</p>
                </div>
              )}
              {profile.phone_number && (
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900 font-medium">{profile.phone_number}</p>
                </div>
              )}
              {profile.emergency_contact && (
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="text-gray-900 font-medium">{profile.emergency_contact}</p>
                </div>
              )}
              {profile.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900 font-medium">{profile.address}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit form */}
        {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {error && (
            <div className="md:col-span-2">
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={profile.date_of_birth}
              onChange={handleChange}
              max={maxDob}
              min="1900-01-01"
              className="w-full md:max-w-sm border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none appearance-none bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className="w-full md:max-w-sm border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={profile.phone_number}
              onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setProfile(p => ({ ...p, phone_number: v })); setSaved(false); }}
              inputMode="numeric"
              pattern="[0-9]{10,}"
              minLength={10}
              maxLength={15}
              title="Enter at least 10 digits"
              className="w-full md:max-w-sm border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
            <input
              name="emergency_contact"
              value={profile.emergency_contact}
              onChange={handleChange}
              className="w-full md:max-w-sm border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={profile.address}
              onChange={handleChange}
              className="w-full md:max-w-2xl border-2 border-gray-200 rounded-xl px-3 py-2 h-24 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => setProfile(defaultProfile)} className="px-6 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50">Reset</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {saved && (
            <div className="md:col-span-2">
              <div className="mt-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                Profile saved successfully.
              </div>
            </div>
          )}
        </form>
        )}
      </div>
    </div>
  );
}


