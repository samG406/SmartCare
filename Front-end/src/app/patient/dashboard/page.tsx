'use client';

import React, { useEffect, useState } from 'react';
import PatientNavbar from '@/components/PatientNavbar';
import { formatDateUTC } from '@/lib/format';
import { API_URL } from '@/config/api';

interface Appointment {
  doctor: {
    doctor_id?: number;
    name: string;
    specialty: string;
    image: string;
    title?: string;
    department?: string;
    experience?: number | null;
    hospital_affiliation?: string | null;
    mobile?: string;
  };
  apptDate: string;
  apptTime: string;
  bookingDate: string;
  amount: string;
  followUp: string;
  status: string;
}

interface AppointmentRow {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  status: string;
  notes: string | null;
}

interface PatientRow {
  patient_id: number;
  user_id: number;
}

interface Doctor {
  doctor_id: number;
  full_name?: string;
  name?: string;
  department?: string;
  specialization?: string;
  title?: string;
  experience?: number | null;
  hospital_affiliation?: string | null;
  mobile?: string;
}

export default function PatientDashboard() {
  const [name, setName] = useState<string | null>(null);
  const [totalDoctors, setTotalDoctors] = useState<number>(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorProfile, setShowDoctorProfile] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        setName(u.full_name || u.name || null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const u = localStorage.getItem('user');
        const parsed = u ? JSON.parse(u) : null;
        const userId = parsed?.user_id;
        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch total doctors count
        const doctorsRes = await fetch(`${API_URL}/doctors`);
        if (doctorsRes.ok) {
          const doctors = (await doctorsRes.json()) as Doctor[];
          setTotalDoctors(Array.isArray(doctors) ? doctors.length : 0);
        }

        // Get patient_id for this user
        const patientsRes = await fetch(`${API_URL}/patients`);
        if (!patientsRes.ok) {
          setLoading(false);
          return;
        }
        const patients = (await patientsRes.json()) as PatientRow[];
        const patient = Array.isArray(patients) ? patients.find((p: PatientRow) => p.user_id === userId) : null;
        if (!patient?.patient_id) {
          setLoading(false);
          return;
        }

        // Fetch all appointments for this patient
        const apptsRes = await fetch(`${API_URL}/appointments`);
        if (!apptsRes.ok) {
          setLoading(false);
          return;
        }
        const appts = (await apptsRes.json()) as AppointmentRow[];
        const myAppointments = (Array.isArray(appts) ? appts : []).filter(
          (a: AppointmentRow) => a.patient_id === patient.patient_id
        );

        // Fetch doctors for appointment details
        const docsRes = await fetch(`${API_URL}/doctors`);
        const docs = (docsRes.ok ? (await docsRes.json()) : []) as Doctor[];

        // Transform appointments to dashboard format
        const transformedAppts: Appointment[] = myAppointments.map((a: AppointmentRow) => {
          const doctor = Array.isArray(docs) ? docs.find((d: Doctor) => d.doctor_id === a.doctor_id) : null;
          const dt = new Date(a.appointment_date);
          const apptDate = dt.toISOString().slice(0, 10);
          
          // Format time in 12-hour format
          let hours = dt.getHours();
          const minutes = dt.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12; // 0 should be 12
          const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
          const apptTime = `${hours}:${minutesStr} ${ampm}`;

          return {
            doctor: {
              doctor_id: doctor?.doctor_id,
              name: doctor?.full_name || doctor?.name || 'Unknown Doctor',
              specialty: doctor?.department || doctor?.specialization || 'General',
              image: '/doctor-thumb-01.jpg',
              title: doctor?.title,
              department: doctor?.department || doctor?.specialization,
              experience: doctor?.experience,
              hospital_affiliation: doctor?.hospital_affiliation,
              mobile: doctor?.mobile
            },
            apptDate,
            apptTime,
            bookingDate: apptDate,
            amount: '$0',
            followUp: '',
            status: a.status === 'Scheduled' ? 'Confirm' : a.status === 'Canceled' ? 'Cancelled' : 'Pending'
          };
        });

        // Sort by date (newest first)
        transformedAppts.sort((a, b) => new Date(b.apptDate).getTime() - new Date(a.apptDate).getTime());

        setAppointments(transformedAppts);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirm':
        return 'bg-[#dcfce7] text-[#15803d]';
      case 'cancelled':
        return 'bg-[#fee2e2] text-[#b91c1c]';
      case 'pending':
        return 'bg-[#fef9c3] text-[#854d0e]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate upcoming appointments: status is 'Scheduled' (mapped to 'Confirm') and date is today or future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalUpcoming = appointments.filter(a => {
    const apptDate = new Date(a.apptDate);
    apptDate.setHours(0, 0, 0, 0);
    return (a.status.toLowerCase() === 'confirm' || a.status.toLowerCase() === 'pending') && apptDate >= today;
  }).length;

  const pendingCount = appointments.filter(a => a.status.toLowerCase() === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status.toLowerCase() === 'confirm').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your appointments, records and tasks</p>
          </div>
          <div className="text-gray-900 text-base md:text-lg font-semibold">
            {name ? `Welcome, ${name}` : ''}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : totalUpcoming}</h2>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : confirmedCount}</h2>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : pendingCount}</h2>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Providers</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : totalDoctors}</h2>
              </div>
              <div className="text-3xl">👩‍⚕️</div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
              <a href="/patient/booking" className="text-blue-600 hover:text-blue-800 text-sm font-medium">Book New</a>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="py-8 text-center text-gray-500">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p className="mb-2">No appointments found.</p>
                  <a href="/patient/booking" className="text-blue-600 hover:text-blue-800 text-sm font-medium">Book your first appointment</a>
                </div>
              ) : (
                appointments.map((appt, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          if (appt.doctor.doctor_id) {
                            const fullDoctor: Doctor = {
                              doctor_id: appt.doctor.doctor_id,
                              full_name: appt.doctor.name,
                              title: appt.doctor.title,
                              department: appt.doctor.department,
                              specialization: appt.doctor.specialty,
                              experience: appt.doctor.experience,
                              hospital_affiliation: appt.doctor.hospital_affiliation,
                              mobile: appt.doctor.mobile
                            };
                            setSelectedDoctor(fullDoctor);
                            setShowDoctorProfile(true);
                          }
                        }}
                        className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center cursor-pointer hover:bg-indigo-200 transition-colors"
                      >
                        <span className="text-indigo-600 font-semibold text-sm">{appt.doctor.name.split(' ').map(n => n[0]).join('')}</span>
                      </button>
                      <div>
                        <h3 className="text-gray-900 font-medium">{appt.doctor.name}</h3>
                        <p className="text-gray-600 text-sm">{appt.doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-medium">{formatDateUTC(appt.apptDate)}</p>
                      <p className="text-blue-600 text-sm">{appt.apptTime}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(appt.status)}`}>{appt.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
                    </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <a href="/patient/booking" className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-center">
                <div className="text-2xl mb-2">🗓️</div>
                <div className="text-sm font-medium text-gray-700">Book Appointment</div>
              </a>
              <a href="/patient/medical-records" className="p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-center">
                <div className="text-2xl mb-2">📁</div>
                <div className="text-sm font-medium text-gray-700">Medical Records</div>
              </a>
              <a href="/patient/prescriptions" className="p-4 rounded-xl bg-green-50 hover:bg-green-100 text-center">
                <div className="text-2xl mb-2">💊</div>
                <div className="text-sm font-medium text-gray-700">Prescriptions</div>
              </a>
              <a href="/patient/checkout" className="p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-center">
                <div className="text-2xl mb-2">💳</div>
                <div className="text-sm font-medium text-gray-700">Payments</div>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><span>✅</span> Appointment with Dr. Ruby Perrin confirmed.</li>
            <li className="flex items-start gap-3"><span>📄</span> New lab results uploaded to Medical Records.</li>
            <li className="flex items-start gap-3"><span>💳</span> Payment of $160 received for consultation.</li>
          </ul>
        </div>
      </div>

      {/* Doctor Profile Modal */}
      {showDoctorProfile && selectedDoctor && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDoctorProfile(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Doctor Profile</h2>
              <button
                onClick={() => setShowDoctorProfile(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedDoctor.full_name 
                    ? selectedDoctor.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'DR'}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedDoctor.full_name || 'Unknown Doctor'}
                  </h3>
                  {selectedDoctor.title && (
                    <p className="text-gray-600 text-lg mt-1">{selectedDoctor.title}</p>
                  )}
                  {(selectedDoctor.department || selectedDoctor.specialization) && (
                    <p className="text-indigo-600 font-medium mt-1">
                      {selectedDoctor.department || selectedDoctor.specialization}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {selectedDoctor.experience !== null && selectedDoctor.experience !== undefined && (
                  <div className="flex items-start gap-3">
                    <div className="text-gray-500 min-w-[140px]">Experience:</div>
                    <div className="text-gray-900 font-medium">{selectedDoctor.experience} years</div>
                  </div>
                )}

                {selectedDoctor.hospital_affiliation && (
                  <div className="flex items-start gap-3">
                    <div className="text-gray-500 min-w-[140px]">Hospital:</div>
                    <div className="text-gray-900 font-medium">{selectedDoctor.hospital_affiliation}</div>
                  </div>
                )}

                {selectedDoctor.mobile && (
                  <div className="flex items-start gap-3">
                    <div className="text-gray-500 min-w-[140px]">Contact:</div>
                    <div className="text-gray-900 font-medium">{selectedDoctor.mobile}</div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDoctorProfile(false);
                    window.location.href = '/patient/booking';
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
