'use client';

import React, { useEffect, useState } from 'react';
import PatientNavbar from '@/components/PatientNavbar';
import PatientSidebar from '@/components/PatientSidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import { formatDateUTC } from '@/lib/format';
import { apiFetch } from '@/config/api';

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
  doctor_name?: string | null;
  doctor_department?: string | null;
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
  phone_number?: string;
}

export default function PatientDashboard() {
  const { isOpen } = useSidebar();
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
        const doctorsRes = await apiFetch('/doctors');
        if (doctorsRes.ok) {
          const doctors = (await doctorsRes.json()) as Doctor[];
          setTotalDoctors(Array.isArray(doctors) ? doctors.length : 0);
        }

        // Fetch appointments for this user (includes doctor name/department)
        const apptsRes = await apiFetch(`/appointments/by-user/${userId}`);
        if (!apptsRes.ok) {
          setLoading(false);
          return;
        }
        const appts = (await apptsRes.json()) as AppointmentRow[];

        // Fetch doctors for appointment details
        const docsRes = await apiFetch('/doctors');
        const docs = (docsRes.ok ? (await docsRes.json()) : []) as Doctor[];

        // Transform appointments to dashboard format
        const transformedAppts: Appointment[] = (Array.isArray(appts) ? appts : []).map((a: AppointmentRow) => {
          const doctor = Array.isArray(docs) ? docs.find((d: Doctor) => d.doctor_id === a.doctor_id) : null;
          const doctorName = a.doctor_name || doctor?.full_name || doctor?.name || 'Unknown Doctor';
          const doctorDepartment = a.doctor_department || doctor?.department || doctor?.specialization || 'General';
          const doctorMobile = doctor?.mobile || doctor?.phone_number;
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
              name: doctorName,
              specialty: doctorDepartment,
              image: '/doctor-thumb-01.jpg',
              title: doctor?.title,
              department: doctorDepartment,
              experience: doctor?.experience,
              hospital_affiliation: doctor?.hospital_affiliation,
              mobile: doctorMobile
            },
            apptDate,
            apptTime,
            bookingDate: apptDate,
            amount: '$0',
            followUp: '',
            status: a.status === 'confirmed' ? 'Confirm' : a.status === 'cancelled' ? 'Cancelled' : a.status === 'completed' ? 'Completed' : 'Pending'
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PatientNavbar />
      <div className="flex flex-1">
        <PatientSidebar />
        <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-16'} p-8`}>
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
              <div className="text-blue-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : confirmedCount}</h2>
              </div>
              <div className="text-green-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : pendingCount}</h2>
              </div>
              <div className="text-yellow-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Providers</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : totalDoctors}</h2>
              </div>
              <div className="text-indigo-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-3m-6 6H4v-2a4 4 0 014-4h3m2-4a4 4 0 11-8 0 4 4 0 018 0zm8 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
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
                <div className="text-blue-500 mb-2 flex justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-700">Book Appointment</div>
              </a>
              <a href="/patient/medical-records" className="p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-center">
                <div className="text-indigo-500 mb-2 flex justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-700">Medical Records</div>
              </a>
              <a href="/patient/prescriptions" className="p-4 rounded-xl bg-green-50 hover:bg-green-100 text-center">
                <div className="text-green-500 mb-2 flex justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a4 4 0 118 0v2m-8 4h8m-8 4h8m-9 4h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-700">Prescriptions</div>
              </a>
              <a href="/patient/checkout" className="p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-center">
                <div className="text-yellow-500 mb-2 flex justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 8a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8zm0 2h20" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-700">Payments</div>
              </a>
            </div>
          </div>
        </div>
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
