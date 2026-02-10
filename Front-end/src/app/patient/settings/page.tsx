'use client';

import React, { useEffect, useState } from 'react';
import PatientNavbar from '@/components/PatientNavbar';
import PatientSidebar from '@/components/PatientSidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import { apiFetch } from '@/config/api';

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
  const { isOpen } = useSidebar();
  const [profile, setProfile] = useState<PatientProfile>(defaultProfile);
  const [originalProfile, setOriginalProfile] = useState<PatientProfile>(defaultProfile);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [notifyAppointments, setNotifyAppointments] = useState(true);
  const [notifyResults, setNotifyResults] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);
  // Constraint: user must be at least 17 years old; compute max allowed DOB (today - 17 years)
  const [maxDob, setMaxDob] = useState<string>('');
  useEffect(() => {
    const now = new Date();
    const d = new Date(now.getFullYear() - 17, now.getMonth(), now.getDate());
    const toStr = (n: number) => String(n).padStart(2, '0');
    setMaxDob(`${d.getFullYear()}-${toStr(d.getMonth() + 1)}-${toStr(d.getDate())}`);
  }, []);

  const refreshProfile = async (currentUserId: number) => {
    try {
      const resp = await apiFetch(`/api/patient/profile?user_id=${currentUserId}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.profile) {
          const formattedProfile = {
            ...data.profile,
            date_of_birth: data.profile.date_of_birth
              ? (data.profile.date_of_birth.includes('T')
                  ? data.profile.date_of_birth.split('T')[0]
                  : data.profile.date_of_birth.split(' ')[0])
              : '',
          };
          setProfile(formattedProfile);
          setOriginalProfile(formattedProfile);
          localStorage.setItem(`patient_profile_${currentUserId}`, JSON.stringify(formattedProfile));
        }
      }
    } catch (fetchErr) {
      console.error('Failed to fetch profile from database:', fetchErr);
    }
  };

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

            // Try to load from localStorage first (user-specific cache)
            const cachedKey = `patient_profile_${currentUserId}`;
            const cached = localStorage.getItem(cachedKey);
            if (cached) {
              const cachedProfile = JSON.parse(cached);
              setProfile(cachedProfile);
              setOriginalProfile(cachedProfile);
            }

            await refreshProfile(currentUserId);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
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
    setError(null);
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setError(null);
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
          setSaving(false);
          return;
        }
      }
      if (profile.phone_number && profile.phone_number.replace(/\D/g, '').length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        setSaving(false);
        return;
      }
      if (profile.emergency_contact) {
        const emergencyDigits = profile.emergency_contact.replace(/\D/g, '');
        if (emergencyDigits.length !== 10) {
          setError('Emergency contact must be exactly 10 digits.');
          setSaving(false);
          return;
        }
        if (profile.phone_number && emergencyDigits === profile.phone_number.replace(/\D/g, '')) {
          setError('Emergency contact cannot be the same as phone number.');
          setSaving(false);
          return;
        }
      }
      if (!userId) {
        setError('User not found. Please sign in again.');
        setSaving(false);
        return;
      }

      const resp = await apiFetch('/api/patient/profile', {
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
        const text = await resp.text();
        let errorData: { message?: string; error?: string; code?: string } = {};
        try {
          if (text && text.trim()) {
            errorData = JSON.parse(text);
          }
        } catch (parseErr) {
          console.error('Failed to parse error response:', parseErr);
          errorData = { message: text || 'Unknown error' };
        }
        const errorMessage = errorData.message || errorData.error || `Failed to save profile (${resp.status})`;
        setError(errorMessage);
        setSaving(false);
        return;
      }

      // Cache locally for quick loads (user-specific cache)
      if (userId) {
        localStorage.setItem(`patient_profile_${userId}`, JSON.stringify(profile));
      }
      setOriginalProfile(profile);
      if (userId) {
        await refreshProfile(userId);
      }
      setSaved(true);
      setViewMode(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Unexpected error saving profile:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PatientNavbar />
      <div className="flex flex-1">
        <PatientSidebar />
        <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-16'} p-8`}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal information, contact details, and preferences.
          </p>
        </div>

        {saved && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            Profile saved successfully.
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="text-center py-8">
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        )}

        {!loading && viewMode && (
          <div className="space-y-3 max-w-2xl mx-auto">
            <section className="bg-white rounded-2xl shadow p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {userName ? userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Profile Overview</h3>
                    <p className="text-sm text-gray-500 mt-1">Your saved information.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode(false)}
                  className="h-9 px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Edit
                </button>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{userName || '—'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{userEmail || '—'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">{profile.phone_number || '—'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500">Date of Birth</p>
                  <p className="text-sm font-medium text-gray-900">{profile.date_of_birth || '—'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500">Gender</p>
                  <p className="text-sm font-medium text-gray-900">{profile.gender || '—'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500">Emergency Contact</p>
                  <p className="text-sm font-medium text-gray-900">{profile.emergency_contact || '—'}</p>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <p className="text-xs font-medium text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">{profile.address || '—'}</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow p-3">
              <h3 className="text-base font-semibold text-gray-900">Notification Preferences</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                  <span>Appointment Reminders</span>
                  <span className="text-gray-700">{notifyAppointments ? 'On' : 'Off'}</span>
                </div>
                <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                  <span>Test Results</span>
                  <span className="text-gray-700">{notifyResults ? 'On' : 'Off'}</span>
                </div>
                <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                  <span>Marketing & News</span>
                  <span className="text-gray-700">{notifyMarketing ? 'On' : 'Off'}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Profile form */}
        {!loading && !viewMode && (
        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div>
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            </div>
          )}

          <section className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-10 border-b border-gray-200">
            <div className="relative group cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                {userName ? userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'U'}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h3l2-2h8l2 2h3v12H3V7zm9 3a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">Profile Photo</h3>
              <p className="text-sm text-gray-500 mt-1">This will be displayed on your medical records.</p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  className="h-8 px-3 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors"
                >
                  Change Photo
                </button>
                <button type="button" className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-500 mt-1">Update your identification details.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  disabled
                  className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <svg className="absolute left-3 top-2.5 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l9 6 9-6M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">Phone Number</label>
                <div className="relative">
                  <svg className="absolute left-3 top-2.5 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H7v2a10 10 0 0010 10h2a2 2 0 012 2v2a2 2 0 01-2 2h-1C9.716 23 3 16.284 3 8V5z" />
                  </svg>
                  <input
                    type="tel"
                    name="phone_number"
                    value={profile.phone_number}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      setProfile(p => ({ ...p, phone_number: v }));
                      setSaved(false);
                      setError(null);
                    }}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    minLength={10}
                    maxLength={10}
                    title="Enter exactly 10 digits"
                    className="w-full h-9 pl-9 pr-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
                  />
                </div>
                {profile.phone_number && profile.phone_number.length !== 10 && (
                  <p className="text-[10px] text-amber-600">Must be exactly 10 digits</p>
                )}
                {profile.phone_number && profile.emergency_contact && profile.phone_number === profile.emergency_contact && (
                  <p className="text-[10px] text-red-600">Phone number cannot be the same as emergency contact</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
                <div className="relative">
                  <svg className="absolute left-3 top-2.5 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={profile.date_of_birth}
                    onChange={handleChange}
                    max={maxDob}
                    min="1900-01-01"
                    className="w-full h-9 pl-9 pr-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm appearance-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">Emergency Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={profile.emergency_contact}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setProfile(p => ({ ...p, emergency_contact: v }));
                    setSaved(false);
                    setError(null);
                  }}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  minLength={10}
                  maxLength={10}
                  title="Enter exactly 10 digits"
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
                />
                {profile.emergency_contact && profile.emergency_contact.length !== 10 && (
                  <p className="text-[10px] text-amber-600">Must be exactly 10 digits</p>
                )}
                {profile.emergency_contact && profile.phone_number && profile.emergency_contact === profile.phone_number && (
                  <p className="text-[10px] text-red-600">Emergency contact cannot be the same as phone number</p>
                )}
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          <section>
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500 mt-1">Manage how we communicate with you.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Appointment Reminders</p>
                  <p className="text-xs text-gray-500 mt-0.5">Receive reminders 24 hours before your visit.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyAppointments((v) => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifyAppointments ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                  aria-pressed={notifyAppointments}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white border border-gray-300 shadow-sm transition-transform ${
                      notifyAppointments ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Test Results</p>
                  <p className="text-xs text-gray-500 mt-0.5">Notify me when lab results are available.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyResults((v) => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifyResults ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                  aria-pressed={notifyResults}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white border border-gray-300 shadow-sm transition-transform ${
                      notifyResults ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Marketing & News</p>
                  <p className="text-xs text-gray-500 mt-0.5">Receive health tips and clinic news.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyMarketing((v) => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifyMarketing ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                  aria-pressed={notifyMarketing}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white border border-gray-300 shadow-sm transition-transform ${
                      notifyMarketing ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="h-9 px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 bg-gray-900 border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-800 shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        )}
        </div>
      </div>
    </div>
  );
}


