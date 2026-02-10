'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import PatientNavbar from '@/components/PatientNavbar';
import PatientSidebar from '@/components/PatientSidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import { apiFetch } from '@/config/api';

interface AppointmentRow {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  status: string;
  appointment_type: string | null;
  notes: string | null;
  doctor_name?: string | null;
  doctor_department?: string | null;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  timeRange: string;
  specialist: {
    initials: string;
    name: string;
    specialty: string;
  };
  type: string;
  location: string;
  status: 'Confirmed' | 'Scheduled' | 'Completed' | 'Cancelled';
}

const parseDateOnly = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const computeNextAppointment = (list: Appointment[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = list.filter((a) => {
    const appointmentDate = parseDateOnly(a.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate >= today && (a.status === 'Confirmed' || a.status === 'Scheduled');
  });
  return upcoming.length > 0 ? upcoming[0] : null;
};

export default function AppointmentsPage() {
  const { isOpen } = useSidebar();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'canceled'>('upcoming');
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [detailsTarget, setDetailsTarget] = useState<Appointment | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const u = localStorage.getItem('user');
        const parsed = u ? JSON.parse(u) : null;
        const userId = parsed?.user_id;
        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch appointments for this user (includes doctor info)
        const apptsRes = await apiFetch(`/appointments/by-user/${userId}`);
        if (!apptsRes.ok) {
          setLoading(false);
          return;
        }
        const appts = (await apptsRes.json()) as AppointmentRow[];

        // Transform appointments
        const transformedAppts: Appointment[] = (Array.isArray(appts) ? appts : []).map((a: AppointmentRow) => {
          const [datePart, timePart = '00:00:00'] = String(a.appointment_date).split(/[T ]/);
          const dateStr = datePart || '';
          
          const [timeHours = '0', timeMinutes = '0'] = timePart.split(':');
          let hours = Number(timeHours);
          const minutes = Number(timeMinutes);
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
          const timeStr = `${hours}:${minutesStr} ${ampm}`;
          
          // Calculate end time (30 minutes later) without timezone shifts
          const totalMinutes = Number(timeHours) * 60 + minutes + 30;
          let endHours = Math.floor(totalMinutes / 60) % 24;
          const endMinutes = totalMinutes % 60;
          const endAmpm = endHours >= 12 ? 'PM' : 'AM';
          endHours = endHours % 12;
          endHours = endHours ? endHours : 12;
          const endMinutesStr = endMinutes < 10 ? `0${endMinutes}` : endMinutes;
          const endTimeStr = `${endHours}:${endMinutesStr} ${endAmpm}`;
          const timeRange = `${timeStr} - ${endTimeStr}`;

          const doctorName = a.doctor_name || 'Unknown Doctor';
          const initials = doctorName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          let status: 'Confirmed' | 'Scheduled' | 'Completed' | 'Cancelled' = 'Scheduled';
          if (a.status === 'confirmed') status = 'Confirmed';
          else if (a.status === 'completed') status = 'Completed';
          else if (a.status === 'cancelled') status = 'Cancelled';

          return {
            id: String(a.appointment_id),
            date: dateStr,
            time: timeStr,
            timeRange,
            specialist: {
              initials,
              name: doctorName,
              specialty: a.doctor_department || 'General',
            },
            type: a.appointment_type || 'Consultation',
            location: 'Online Meeting',
            status,
          };
        });

        // Sort by date
        transformedAppts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Find next appointment (first upcoming confirmed or scheduled)
        setNextAppointment(computeNextAppointment(transformedAppts));

        setAppointments(transformedAppts);
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    const aptDate = new Date();
    aptDate.setHours(0, 0, 0, 0);
    const today = aptDate;

    return appointments.filter((apt) => {
      const appointmentDate = parseDateOnly(apt.date);
      appointmentDate.setHours(0, 0, 0, 0);

      if (activeTab === 'upcoming') {
        return appointmentDate >= today && apt.status !== 'Cancelled';
      } else if (activeTab === 'history') {
        return appointmentDate < today && apt.status !== 'Cancelled';
      } else {
        return apt.status === 'Cancelled';
      }
    });
  }, [appointments, activeTab]);

  // Group appointments by month
  const groupedAppointments = useMemo(() => {
    const groups: { [key: string]: Appointment[] } = {};
    filteredAppointments.forEach((apt) => {
      const date = new Date(apt.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(apt);
    });
    return groups;
  }, [filteredAppointments]);

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getMonthAbbr = (dateStr: string) => {
    const date = parseDateOnly(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  };

  const getDay = (dateStr: string) => {
    const date = parseDateOnly(dateStr);
    return date.getDate();
  };

  const openCancelModal = (apt: Appointment) => {
    setCancelError('');
    setCancelTarget(apt);
    setShowCancelModal(true);
  };

  const openDetailsModal = (apt: Appointment) => {
    setDetailsTarget(apt);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsTarget(null);
  };

  const closeCancelModal = () => {
    if (cancelLoading) return;
    setShowCancelModal(false);
    setCancelTarget(null);
    setCancelError('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    setCancelError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCancelError('Please log in to cancel this appointment.');
        return;
      }
      const res = await apiFetch(`/appointments/${cancelTarget.id}/cancel`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCancelError(data?.error || 'Failed to cancel appointment.');
        return;
      }
      setAppointments((prev) => {
        const updated = prev.filter((a) => a.id !== cancelTarget.id);
        setNextAppointment(computeNextAppointment(updated));
        return updated;
      });
      setShowCancelModal(false);
      setCancelTarget(null);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel appointment.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <PatientNavbar />
      <div className="flex flex-1">
        <PatientSidebar />
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 mb-2">Appointments</h1>
                <p className="text-sm text-gray-500">Manage your visits and consultations.</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
              <button
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                suppressHydrationWarning
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
                <Link
                  href="/patient/booking"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Appointment
                </Link>
              </div>
            </div>

            {/* Featured: Next Appointment */}
            {nextAppointment && activeTab === 'upcoming' && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Up Next</span>
                </div>

                <div className="bg-white rounded-2xl p-6 md:p-8 relative overflow-hidden group shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-gray-200/60">
                  {/* Decorative gradient */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-50/50 to-transparent rounded-bl-[100px] pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row gap-6 md:items-center relative z-10">
                    
                    {/* Date Box */}
                    <div className="shrink-0 flex flex-row md:flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-4 md:w-24 md:h-24 text-center gap-2 md:gap-0">
                      <span className="text-xs font-medium text-red-500">{getMonthAbbr(nextAppointment.date)}</span>
                      <span className="text-2xl font-semibold tracking-tight text-gray-900">{getDay(nextAppointment.date)}</span>
                      <span className="text-xs text-gray-400">{nextAppointment.time}</span>
                    </div>

                    {/* Doctor Info */}
                    <div className="grow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{nextAppointment.specialist.name}</h3>
                          <div className="flex items-center gap-2 text-gray-500 mt-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="text-sm">{nextAppointment.specialist.specialty}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Confirmed
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-gray-50/50 px-3 py-1.5 rounded-lg border border-gray-100">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>{nextAppointment.location}</span>
                        </div>
                        <div className="flex items-center gap-2 px-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>30 min session</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <button
                        className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group-hover:bg-black transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
                        suppressHydrationWarning
                      >
                        <span>Join Call</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      <button
                        className="w-full bg-white text-red-600 border border-red-200 text-sm font-medium py-2.5 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
                        suppressHydrationWarning
                        onClick={() => openCancelModal(nextAppointment)}
                      >
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Tabs - Right Above Appointments List */}
            <div className="mb-6 flex justify-end">
              <div className="bg-gray-100/80 p-1 rounded-xl inline-flex">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'upcoming'
                      ? 'bg-white text-gray-900 shadow-sm shadow-gray-200 border border-gray-200/50'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  suppressHydrationWarning
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'history'
                      ? 'bg-white text-gray-900 shadow-sm shadow-gray-200 border border-gray-200/50'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  suppressHydrationWarning
                >
                  History
                </button>
                <button
                  onClick={() => setActiveTab('canceled')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'canceled'
                      ? 'bg-white text-gray-900 shadow-sm shadow-gray-200 border border-gray-200/50'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  suppressHydrationWarning
                >
                  Canceled
                </button>
              </div>
            </div>

            {/* Appointments List */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading appointments...</div>
            ) : Object.keys(groupedAppointments).length === 0 ? (
              <div className="text-center py-12 text-gray-500">No appointments found.</div>
            ) : (
              <section>
                {Object.entries(groupedAppointments).map(([month, apts]) => (
                  <div key={month} className="mb-8">
                    <h2 className="text-sm font-medium text-gray-900 mb-4 ml-1">{month}</h2>
                    
                    <div className="flex flex-col gap-3">
                      {apts.map((apt) => (
                        <div
                          key={apt.id}
                          className="bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gray-300 transition-colors cursor-pointer group shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-gray-200/60"
                        >
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-gray-500 shrink-0">
                            <span className="font-semibold text-sm">{apt.specialist.initials}</span>
                          </div>
                          
                          {/* Content */}
                          <div className="grow grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 sm:items-center">
                            <div className="sm:col-span-4">
                              <h4 className="text-sm font-medium text-gray-900">{apt.specialist.name}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">{apt.specialist.specialty}</p>
                            </div>
                            
                            <div className="sm:col-span-3 flex items-center gap-2 text-gray-600">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm">{formatDateShort(apt.date)}, {apt.time}</span>
                            </div>

                            <div className="sm:col-span-3 flex items-center gap-2 text-gray-600">
                              {apt.location === 'Online Meeting' ? (
                                <>
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm">{apt.location}</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="text-sm truncate">{apt.location}</span>
                                </>
                              )}
                            </div>
                            
                            {/* Arrow */}
                            <div className="sm:col-span-2 flex justify-end">
                              <button
                                className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-100 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDetailsModal(apt);
                                }}
                                aria-label="View appointment details"
                                title="View appointment details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
      {showCancelModal && cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeCancelModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel appointment</h3>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to cancel this appointment?
              </p>
            </div>
            <div className="px-6 py-4">
              {cancelError && <p className="mt-3 text-sm text-red-600">{cancelError}</p>}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={closeCancelModal}
                disabled={cancelLoading}
              >
                No
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDetailsModal && detailsTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeDetailsModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Appointment details</h3>
                <p className="mt-1 text-sm text-gray-500">Here is your appointment information.</p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={closeDetailsModal}
                aria-label="Close details"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                  {detailsTarget.specialist.initials}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900">{detailsTarget.specialist.name}</div>
                  <div className="text-sm text-gray-500">{detailsTarget.specialist.specialty}</div>
                </div>
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {detailsTarget.status}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Date</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{formatDateShort(detailsTarget.date)}</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Time</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{detailsTarget.timeRange}</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Type</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{detailsTarget.type}</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Location</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{detailsTarget.location}</div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  onClick={() => {
                    closeDetailsModal();
                    openCancelModal(detailsTarget);
                  }}
                >
                  Cancel appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
