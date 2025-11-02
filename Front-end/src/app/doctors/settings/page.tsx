'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from 'react';
import DoctorNavbar from '@/components/DoctorNavbar';
import { API_URL } from '@/config/api';

export default function ProfileSettingsPage() {
  const [pricingType, setPricingType] = useState<'free' | 'custom'>('custom');
  const [customPrice, setCustomPrice] = useState('150');
  const [services, setServices] = useState<string[]>(['General Consultation', 'Follow-up']);
  const [specializations, setSpecializations] = useState<string[]>(['Cardiology', 'Internal Medicine']);
  const [newService, setNewService] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [yearsExperience, setYearsExperience] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const user = mounted ? (() => { try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; } catch { return null; } })() : null;
  const userName = user?.full_name || user?.name || '';
  const userEmail = user?.email || '';
  const role = (user?.role || '').toLowerCase();
  useEffect(() => { if (mounted) setFullName(userName); }, [mounted, userName]);

  const handleAddService = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newService.trim() !== '') {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const handleAddSpecialization = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSpecialization.trim() !== '') {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const removeSpecialization = (index: number) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };

  type DoctorProfilePayload = {
    full_name?: string;
    phone: string;
    years_experience: number | null;
    services: string[];
    specializations: string[];
    pricing_type: 'free' | 'custom';
    custom_price: number | null;
  };

  const handleSave = async () => {
    const profile: DoctorProfilePayload = {
      full_name: fullName || undefined,
      phone,
      years_experience: yearsExperience ? Number(yearsExperience) : null,
      services,
      specializations,
      pricing_type: pricingType,
      custom_price: pricingType === 'custom' ? Number(customPrice || 0) : null,
    };

    // Save to DB
    try {
      const uid = user?.user_id;
      if (uid) {
        await fetch(`${API_URL}/api/doctor/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: uid, ...profile }),
        });
        if (profile.full_name) {
          try { const u = localStorage.getItem('user'); if (u) { const parsed = JSON.parse(u); parsed.full_name = profile.full_name; localStorage.setItem('user', JSON.stringify(parsed)); } } catch {}
        }
      }
    } catch {}

    // Cache locally and close form
    try { localStorage.setItem('doctor_profile', JSON.stringify(profile)); } catch {}
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Profile
            </h1>
            <p className="text-gray-600">Manage your professional information and preferences</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(v => !v)}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {isEditing ? 'Close' : 'Edit'}
          </button>
        </div>

        {/* Read-only Summary */}
        {!isEditing && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {mounted ? (userName ? userName.split(' ').map((n:string)=>n[0]).join('').slice(0,2) : 'DR') : ''}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{mounted ? (userName || 'Doctor') : 'Doctor'}</h2>
                <p className="text-gray-600 text-sm">{mounted ? userEmail : ''}</p>
                <p className="text-gray-500 text-sm capitalize">{mounted ? role : ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Pricing</p>
                <p className="text-gray-900 font-medium">{pricingType === 'free' ? 'Free' : `$${customPrice} / visit`}</p>
              </div>
              {specializations.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Specializations</p>
                  <p className="text-gray-900 font-medium">{specializations.join(', ')}</p>
                </div>
              )}
              {yearsExperience && (
                <div>
                  <p className="text-sm text-gray-500">Years of Experience</p>
                  <p className="text-gray-900 font-medium">{yearsExperience}</p>
                </div>
              )}
              {fullName && (
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-gray-900 font-medium">{fullName}</p>
                </div>
              )}
              {phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">{phone}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Services</p>
                <p className="text-gray-900 font-medium">{services.join(', ') || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              JD
            </div>
            <div>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                Upload Photo
              </button>
              <p className="text-sm text-gray-500 mt-2">JPG, GIF or PNG. Max 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input type="text" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" placeholder="Full name" />
            </div>
            <div />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50" placeholder="email@domain.com" disabled />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" placeholder="Phone number" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
              <input type="number" value={yearsExperience} onChange={(e)=>setYearsExperience(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" placeholder="Years" />
            </div>
          </div>
        </div>
        )}

        {isEditing && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing</h2>
          
          <div className="space-y-4 mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="pricing"
                checked={pricingType === 'free'}
                onChange={() => setPricingType('free')}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900 font-medium">Free Consultation</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="pricing"
                checked={pricingType === 'custom'}
                onChange={() => setPricingType('custom')}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900 font-medium">Custom Price (per visit)</span>
            </label>
          </div>

          {pricingType === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                <input
                  type="text"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="150"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">Set your consultation fee</p>
            </div>
          )}
        </div>
        )}

        {isEditing && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Services</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {services.map((service, index) => (
              <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium">
                {service}
                <button onClick={() => removeService(index)} className="text-blue-700 hover:text-blue-900 font-bold">×</button>
              </span>
            ))}
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={handleAddService}
              placeholder="Add service..."
              className="flex-1 min-w-48 px-4 py-2 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <p className="text-sm text-gray-500">Press Enter to add</p>
        </div>
        )}

        {isEditing && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Specializations</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {specializations.map((spec, index) => (
              <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                {spec}
                <button onClick={() => removeSpecialization(index)} className="text-indigo-700 hover:text-indigo-900 font-bold">×</button>
              </span>
            ))}
            <input
              type="text"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyDown={handleAddSpecialization}
              placeholder="Add specialization..."
              className="flex-1 min-w-48 px-4 py-2 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <p className="text-sm text-gray-500">Press Enter to add</p>
        </div>
        )}

        {isEditing && (
        <div className="flex justify-end gap-4">
          <button className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold" onClick={handleSave}>
            Save Changes
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
