'use client';

import React, { useState, useEffect } from 'react';
import DoctorNavbar from '@/components/DoctorNavbar';
import { formatDateUTC } from '@/lib/format';
import { apiFetch } from '@/config/api';

interface AppointmentRow {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  status: string;
  appointment_type: string | null;
  patient_name?: string | null;
  patient_date_of_birth?: string | null;
  patient_gender?: string | null;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  lastVisit: string;
  nextAppointment: string;
  status: 'active' | 'recovering' | 'chronic';
}

export default function MyPatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [doctorId, setDoctorId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.doctor_id) {
          setDoctorId(Number(u.doctor_id));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const loadPatients = async () => {
      if (!doctorId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch appointments for this doctor (includes patient info)
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const apptsRes = await apiFetch(`/appointments/by-doctor/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!apptsRes.ok) {
          setLoading(false);
          return;
        }
        const myAppointments = (await apptsRes.json()) as AppointmentRow[];

        // Calculate age from date_of_birth
        const calculateAge = (dob: string | null | undefined): number => {
          if (!dob) return 0;
          const birthDate = new Date(dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        };

        // Transform patients
        const patientMap = new Map<number, { name: string; gender: string; dob: string | null }>();
        myAppointments.forEach((a) => {
          if (!patientMap.has(a.patient_id)) {
            patientMap.set(a.patient_id, {
              name: a.patient_name || 'Unknown Patient',
              gender: a.patient_gender || 'Not specified',
              dob: a.patient_date_of_birth || null,
            });
          }
        });

        const transformedPatients: Patient[] = Array.from(patientMap.entries()).map(([patientId, info]) => {
          // Get appointments for this patient
          const patientAppts = myAppointments.filter(a => a.patient_id === patientId);
          
          // Sort appointments by date
          const sortedAppts = [...patientAppts].sort((a, b) => 
            new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
          );

          // Get last visit (most recent completed appointment)
          const completedAppts = sortedAppts.filter(a => a.status === 'Completed');
          const lastVisitAppt = completedAppts.length > 0 
            ? completedAppts[completedAppts.length - 1] 
            : null;
          const lastVisit = lastVisitAppt 
            ? new Date(lastVisitAppt.appointment_date).toISOString().slice(0, 10)
            : '';

          // Get next appointment (future scheduled appointment)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const futureAppts = sortedAppts.filter(a => {
            const apptDate = new Date(a.appointment_date);
            apptDate.setHours(0, 0, 0, 0);
            return apptDate >= today && (a.status === 'Scheduled' || a.status === 'pending');
          });
          const nextAppt = futureAppts.length > 0 ? futureAppts[0] : null;
          const nextAppointment = nextAppt
            ? new Date(nextAppt.appointment_date).toISOString().slice(0, 10)
            : '';

          // Determine condition from most recent appointment type
          const condition = lastVisitAppt?.appointment_type || 
                          nextAppt?.appointment_type || 
                          (sortedAppts.length > 0 ? sortedAppts[sortedAppts.length - 1]?.appointment_type : null) || 
                          'General';

          // Determine status based on appointment frequency and recency
          let status: 'active' | 'recovering' | 'chronic' = 'active';
          if (patientAppts.length >= 5) {
            status = 'chronic';
          } else if (patientAppts.some(a => a.appointment_type?.toLowerCase().includes('surgery') || 
                                            a.appointment_type?.toLowerCase().includes('follow'))) {
            status = 'recovering';
          }

          const age = calculateAge(info.dob);

          return {
            id: `PT${String(patientId).padStart(3, '0')}`,
            name: info.name,
            age: age || 0,
            gender: info.gender,
            condition: condition || 'General',
            lastVisit: lastVisit || '',
            nextAppointment: nextAppointment || '',
            status
          };
        });

        // Sort by name
        transformedPatients.sort((a, b) => a.name.localeCompare(b.name));

        setPatients(transformedPatients);
      } catch (error) {
        console.error('Error loading patients:', error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      loadPatients();
    }
  }, [doctorId]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      recovering: 'bg-blue-100 text-blue-700',
      chronic: 'bg-orange-100 text-orange-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Patients
          </h1>
          <p className="text-gray-600">Manage your patient roster and track their health journeys</p>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-12 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500">
            <p className="text-gray-600 text-sm mb-1">Total Patients</p>
            <h2 className="text-4xl font-bold text-gray-900">{loading ? '...' : patients.length}</h2>
          </div>
        </div>

        {/* Patient Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading patients...</h3>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="bg-blue-600 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <span className="text-2xl font-bold text-blue-600">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{patient.name}</h3>
                <p className="text-blue-100 text-sm">ID: {patient.id}</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Age</span>
                    <span className="font-semibold text-gray-900">{patient.age} years</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Gender</span>
                    <span className="font-semibold text-gray-900">{patient.gender}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-semibold text-gray-900">{patient.condition}</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <p className="text-xs text-gray-600 mb-1">Last Visit</p>
                    <p className="font-semibold text-gray-900">{patient.lastVisit ? formatDateUTC(patient.lastVisit) : 'N/A'}</p>
                    <p className="text-xs text-gray-600 mt-2 mb-1">Next Appointment</p>
                    <p className="font-semibold text-blue-600">{patient.nextAppointment ? formatDateUTC(patient.nextAppointment) : 'Not scheduled'}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  View Full Profile
                </button>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
}
