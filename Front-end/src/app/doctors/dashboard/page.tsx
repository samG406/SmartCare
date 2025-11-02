'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DoctorNavbar from '@/components/DoctorNavbar';
import { API_URL } from '@/config/api';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  trend: 'up' | 'down';
  color: string;
  onClick?: () => void;
}

function StatCard({ title, value, change, icon, trend, color, onClick }: StatCardProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
          <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ name, date, time, type, status }: { name: string; date: string; time: string; type: string; status: string }) {
  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{type}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {date}
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {time}
      </div>
    </div>
  );
}

interface AppointmentRow {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  status: string;
  appointment_type: string | null;
  notes: string | null;
}

interface PatientRow {
  patient_id: number;
  user_id: number;
  full_name?: string;
  name?: string;
}

interface AppointmentData {
  name: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentData[]>([]);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [recentPatients, setRecentPatients] = useState<Array<{ name: string; visit: string; reason: string; avatar: string }>>([]);
  const [allMyAppointments, setAllMyAppointments] = useState<AppointmentRow[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        setName(u.full_name || u.name || null);
        if (u.doctor_id) {
          setDoctorId(Number(u.doctor_id));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!doctorId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all appointments for this doctor
        const apptsRes = await fetch(`${API_URL}/appointments`);
        if (!apptsRes.ok) {
          setLoading(false);
          return;
        }
        const allAppointments = (await apptsRes.json()) as AppointmentRow[];
        const myAppointments = (Array.isArray(allAppointments) ? allAppointments : []).filter(
          (a: AppointmentRow) => a.doctor_id === doctorId
        );
        setAllMyAppointments(myAppointments);

        // Fetch all patients (now includes full_name from Users table)
        const patientsRes = await fetch(`${API_URL}/patients`);
        const patients = (patientsRes.ok ? (await patientsRes.json()) : []) as PatientRow[];

        // Calculate total unique patients
        const uniquePatientIds = new Set(myAppointments.map(a => a.patient_id));
        setTotalPatients(uniquePatientIds.size);

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().slice(0, 10);

        // Filter today's appointments
        const todayAppts = myAppointments.filter((a: AppointmentRow) => {
          const apptDate = new Date(a.appointment_date);
          apptDate.setHours(0, 0, 0, 0);
          return apptDate.toISOString().slice(0, 10) === todayStr;
        });

        // Count pending appointments for today
        const pendingToday = todayAppts.filter(a => a.status === 'Scheduled' || a.status === 'pending').length;
        setPendingCount(pendingToday);
        setTodayAppointmentsCount(todayAppts.length);

        // Format today's appointments
        const formattedTodayAppts: AppointmentData[] = todayAppts
          .slice(0, 3) // Show only first 3
          .map((a: AppointmentRow) => {
            const patient = Array.isArray(patients) ? patients.find(p => p.patient_id === a.patient_id) : null;
            const patientName = patient?.full_name || 'Unknown Patient';
            
            const dt = new Date(a.appointment_date);
            let hours = dt.getHours();
            const minutes = dt.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
            const timeStr = `${hours}:${minutesStr} ${ampm}`;

            const dateStr = `Today, ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

            return {
              name: patientName,
              date: dateStr,
              time: timeStr,
              type: a.appointment_type || 'Consultation',
              status: a.status === 'Scheduled' ? 'confirmed' : a.status.toLowerCase() === 'canceled' ? 'cancelled' : 'pending'
            };
          });

        setTodayAppointments(formattedTodayAppts);

        // Get recent patients (last 3 unique patients from appointments, ordered by most recent)
        const recentAppts = [...myAppointments]
          .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
          .slice(0, 10);

        const recentPatientIds = new Set<number>();
        const recentPatientsList: Array<{ name: string; visit: string; reason: string; avatar: string }> = [];

        for (const appt of recentAppts) {
          if (recentPatientIds.has(appt.patient_id)) continue;
          if (recentPatientsList.length >= 3) break;

          const patient = Array.isArray(patients) ? patients.find(p => p.patient_id === appt.patient_id) : null;
          const patientName = patient?.full_name || 'Unknown Patient';
          
          const apptDate = new Date(appt.appointment_date);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - apptDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const visitStr = diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;

          recentPatientIds.add(appt.patient_id);
          recentPatientsList.push({
            name: patientName,
            visit: visitStr,
            reason: appt.appointment_type || 'Consultation',
            avatar: patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          });
        }

        setRecentPatients(recentPatientsList);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      loadDashboardData();
    }
  }, [doctorId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here&apos;s what&apos;s happening today.</p>
          </div>
          <div className="text-gray-900 text-base md:text-lg font-semibold">
            {name ? `Welcome, ${name}` : ''}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Patients"
            value={loading ? '...' : totalPatients.toString()}
            change="Unique patients"
            icon="👥"
            trend="up"
            color="#3B82F6"
          />
          <StatCard
            title="Today's Appointments"
            value={loading ? '...' : todayAppointmentsCount.toString()}
            change={loading ? '...' : `${pendingCount} pending`}
            icon="📅"
            trend="up"
            color="#10B981"
          />
          <StatCard
            title="Upcoming"
            value={loading ? '...' : allMyAppointments.filter((a: AppointmentRow) => {
              const apptDate = new Date(a.appointment_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return apptDate >= today && (a.status === 'Scheduled' || a.status === 'pending');
            }).length.toString()}
            change="Scheduled appointments"
            icon="📋"
            trend="up"
            color="#8B5CF6"
            onClick={() => router.push('/doctors/appointments')}
          />
          <StatCard
            title="Completed"
            value={loading ? '...' : allMyAppointments.filter((a: AppointmentRow) => a.status === 'Completed').length.toString()}
            change="Total completed"
            icon="✅"
            trend="up"
            color="#F59E0B"
          />
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
            <h2 className="text-xl font-bold text-gray-900">Today&apos;s Appointments</h2>
            <p className="text-sm text-gray-600">You have {todayAppointments.length} appointments scheduled</p>
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 text-center text-gray-500 py-4">Loading appointments...</div>
            ) : todayAppointments.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 py-4">No appointments scheduled for today.</div>
            ) : (
              todayAppointments.map((appt, index) => (
                <AppointmentCard key={index} {...appt} />
              ))
            )}
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Patients</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-gray-500 py-4">Loading recent patients...</div>
              ) : recentPatients.length === 0 ? (
                <div className="text-center text-gray-500 py-4">No recent patients.</div>
              ) : (
                recentPatients.map((patient, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">{patient.avatar}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-500">{patient.visit}</p>
                      </div>
                    </div>
                    <span className="text-sm text-indigo-600 font-medium">{patient.reason}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="text-2xl mb-2">📋</div>
                <span className="text-sm font-medium text-gray-700">New Appointment</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="text-2xl mb-2">👤</div>
                <span className="text-sm font-medium text-gray-700">Add Patient</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="text-2xl mb-2">📄</div>
                <span className="text-sm font-medium text-gray-700">View Reports</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="text-2xl mb-2">⚙️</div>
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
