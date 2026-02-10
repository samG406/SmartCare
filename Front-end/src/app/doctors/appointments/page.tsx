'use client';

import React, { useState, useEffect } from 'react';
import DoctorNavbar from '@/components/DoctorNavbar';
import { apiFetch } from '@/config/api';

interface AppointmentRow {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  status: string;
  appointment_type: string | null;
  notes: string | null;
  patient_name?: string | null;
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

export default function AppointmentsPage() {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  
  // Stats
  const [totalCount, setTotalCount] = useState<number>(0);
  const [confirmedCount, setConfirmedCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [cancelledCount, setCancelledCount] = useState<number>(0);

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
    const loadAppointments = async () => {
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
        const myAppts = (await apptsRes.json()) as AppointmentRow[];

        // Calculate stats
        setTotalCount(myAppts.length);
        setConfirmedCount(myAppts.filter(a => a.status === 'Scheduled').length);
        setPendingCount(myAppts.filter(a => a.status === 'pending' || a.status === 'Pending').length);
        setCancelledCount(myAppts.filter(a => a.status === 'Canceled' || a.status === 'cancelled').length);

        // Transform appointments
        const transformedAppts: Appointment[] = myAppts.map((a: AppointmentRow) => {
          const patientName = a.patient_name || 'Unknown Patient';
          const patientId = `PT${String(a.patient_id).padStart(3, '0')}`;

          const dt = new Date(a.appointment_date);
          const dateStr = dt.toISOString().slice(0, 10);
          let hours = dt.getHours();
          const minutes = dt.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
          const timeStr = `${hours}:${minutesStr} ${ampm}`;

          // Map status
          let status: 'pending' | 'confirmed' | 'completed' | 'cancelled' = 'pending';
          if (a.status === 'Scheduled') status = 'confirmed';
          else if (a.status === 'Completed') status = 'completed';
          else if (a.status === 'Canceled' || a.status === 'cancelled') status = 'cancelled';
          else status = 'pending';

          // Determine priority based on date (upcoming appointments get higher priority)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const apptDate = new Date(dateStr);
          apptDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          let priority: 'low' | 'medium' | 'high' = 'medium';
          if (daysDiff <= 1) priority = 'high';
          else if (daysDiff > 7) priority = 'low';

          return {
            id: String(a.appointment_id),
            patientName,
            patientId,
            date: dateStr,
            time: timeStr,
            type: a.appointment_type || 'Consultation',
            status,
            priority
          };
        });

        // Sort by date (ascending)
        transformedAppts.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateA !== dateB) return dateA - dateB;
          return a.time.localeCompare(b.time);
        });

        setAppointments(transformedAppts);
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      loadAppointments();
    }
  }, [doctorId]);

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    apptDate.setHours(0, 0, 0, 0);

    if (filter === 'today') {
      return apptDate.getTime() === today.getTime();
    } else if (filter === 'upcoming') {
      return apptDate >= today && appt.status !== 'completed' && appt.status !== 'cancelled';
    }
    return true; // 'all'
  });

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-500',
      medium: 'text-yellow-500',
      low: 'text-green-500',
    };
    return colors[priority] || 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <DoctorNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Appointments
          </h1>
          <p className="text-gray-600">Manage and track all your patient appointments</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          {(['all', 'today', 'upcoming'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                filter === filterType
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Appointments</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : totalCount}</h2>
              </div>
              <div className="text-4xl"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmed</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : confirmedCount}</h2>
              </div>
              <div className="text-4xl"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : pendingCount}</h2>
              </div>
              <div className="text-4xl"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cancelled</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : cancelledCount}</h2>
              </div>
              <div className="text-4xl"></div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading appointments...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No appointments found.</div>
            ) : (
              filteredAppointments.map((appointment) => {
                const statusStyle = getStatusStyle(appointment.status);
                const dt = new Date(appointment.date);
                const displayTime = appointment.time;

                return (
                  <div
                    key={appointment.id}
                    className="p-6 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {appointment.patientName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${getPriorityColor(appointment.priority)}`}>
                            <div className={`w-full h-full rounded-full ${appointment.priority === 'high' ? 'bg-red-500' : appointment.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{appointment.patientName}</h3>
                          <p className="text-gray-600 text-sm">ID: {appointment.patientId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-gray-600 text-sm">Date & Time</p>
                          <p className="font-semibold text-gray-900">{dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          <p className="text-blue-600 font-medium">{displayTime}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600 text-sm">Type</p>
                          <p className="font-semibold text-gray-900">{appointment.type}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full border-2 font-medium text-sm ${statusStyle}`}>
                          {appointment.status}
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                            📋
                          </button>
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (appointment.status !== 'completed') {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  const res = await apiFetch(`/appointments/${appointment.id}`, {
                                    method: 'PUT',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ status: 'Completed' })
                                  });
                                  if (res.ok) {
                                    window.location.reload();
                                  }
                                } catch (err) {
                                  console.error('Error updating appointment:', err);
                                }
                              }
                            }}
                            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                          >
                            ✅
                          </button>
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (appointment.status !== 'cancelled') {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  const res = await apiFetch(`/appointments/${appointment.id}`, {
                                    method: 'PUT',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ status: 'Canceled' })
                                  });
                                  if (res.ok) {
                                    window.location.reload();
                                  }
                                } catch (err) {
                                  console.error('Error updating appointment:', err);
                                }
                              }
                            }}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
