'use client';

import React, { useState, useEffect, useMemo } from 'react';
import PatientNavbar from '@/components/PatientNavbar';
import { API_URL } from '@/config/api';

interface Doctor {
  doctor_id: number;
  user_id: number;
  title: string;
  department: string;
  experience: number | null;
  mobile: string;
  hospital_affiliation: string | null;
  full_name?: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface ScheduleData {
  [weekday: string]: TimeSlot[];
}

type PatientRow = { patient_id: number; user_id: number };
type AppointmentRow = {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string; // ISO or 'YYYY-MM-DD HH:mm:ss'
  status: string;
  notes: string | null;
};

export default function BookingPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<ScheduleData>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('Consultation');
  const [notes, setNotes] = useState<string>('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [lastBooking, setLastBooking] = useState<{
    appointment_id?: number;
    doctor?: Doctor | null;
    date?: string;
    time?: string;
    status?: string;
    notes?: string | null;
  }>({});
  type BookingSummary = {
    appointment_id: number;
    doctor: Doctor | null;
    date: string;
    time: string;
    status: string;
    notes: string | null;
  };
  const [dbSummary, setDbSummary] = useState<BookingSummary[] | null>(null);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${API_URL}/doctors`);
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch schedule when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) {
      setSchedule({});
      return;
    }
    setScheduleLoading(true);
    fetch(`${API_URL}/api/timings/${selectedDoctor}`)
      .then(res => res.ok ? res.json() : {})
      .then(data => {
        setSchedule(data || {});
      })
      .catch(err => {
        console.error('Failed to fetch schedule:', err);
        setSchedule({});
      })
      .finally(() => setScheduleLoading(false));
  }, [selectedDoctor]);

  // Get available time slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const date = new Date(selectedDate);
    const weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const intervals = schedule[weekday] || [];
    const slots: string[] = [];
    
    intervals.forEach((iv: TimeSlot) => {
      const [startH, startM] = iv.start.split(':').map(Number);
      const [endH, endM] = iv.end.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      
      // Generate 30-minute slots
      for (let m = startMinutes; m < endMinutes; m += 30) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
      }
    });
    
    return slots;
  }, [selectedDate, schedule]);

  const selectedDoctorData = doctors.find(d => d.doctor_id === selectedDoctor);
  const minDate = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    
    setBooking(true);
    try {
      const userId = (() => {
        try {
          const u = localStorage.getItem('user');
          return u ? JSON.parse(u).user_id : null;
        } catch { return null; }
      })();
      
      if (!userId) {
        alert('Please log in to book an appointment');
        return;
      }

      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          doctor_id: selectedDoctor,
          appointment_date: `${selectedDate} ${selectedTime}:00`,
          status: 'Scheduled',
          notes: notes || null
        })
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        // capture and show a read-only summary
        setLastBooking({
          appointment_id: data?.appointment_id,
          doctor: doctors.find(d => d.doctor_id === selectedDoctor) || null,
          date: selectedDate,
          time: selectedTime,
          status: 'Scheduled',
          notes: notes || null,
        });
        // refresh from DB as source of truth
        await loadFromDb();
        setShowForm(false);
        // Reset form selections
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedTime('');
        setNotes('');
        setAppointmentType('Consultation');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to book appointment');
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  // Fetch all appointments for current user from DB
  const loadFromDb = async () => {
    try {
      const u = localStorage.getItem('user');
      const parsed = u ? JSON.parse(u) : null;
      const userId = parsed?.user_id;
      if (!userId) return;

      // Get patient_id for this user
      const pRes = await fetch(`${API_URL}/patients`);
      if (!pRes.ok) return;
      const patients = (await pRes.json()) as PatientRow[];
      const patient = Array.isArray(patients) ? patients.find((p: PatientRow) => p.user_id === userId) : null;
      if (!patient?.patient_id) return;

      // Get all appointments for this patient
      const aRes = await fetch(`${API_URL}/appointments`);
      if (!aRes.ok) return;
      const appts = (await aRes.json()) as AppointmentRow[];
      const mine = (Array.isArray(appts) ? appts : []).filter((a: AppointmentRow) => a.patient_id === patient.patient_id);
      if (mine.length === 0) { setDbSummary([]); return; }
      mine.sort((a: AppointmentRow, b: AppointmentRow) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

      // Fetch doctor for display
      const dRes = await fetch(`${API_URL}/doctors`);
      const docs = (dRes.ok ? (await dRes.json()) : []) as Doctor[];
      const list: BookingSummary[] = mine.map((a: AppointmentRow) => {
        const d = Array.isArray(docs) ? docs.find((doc: Doctor) => doc.doctor_id === a.doctor_id) : null;
        const dt = new Date(a.appointment_date);
        
        // Format time in 12-hour format
        let hours = dt.getHours();
        const minutes = dt.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
        const timeStr = `${hours}:${minutesStr} ${ampm}`;
        
        return {
          appointment_id: a.appointment_id,
          doctor: d || null,
          date: dt.toISOString().slice(0,10),
          time: timeStr,
          status: a.status,
          notes: a.notes || null,
        };
      });
      setDbSummary(list);
    } catch {}
  };

  useEffect(() => {
    if (!showForm) {
      loadFromDb();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  // Load existing appointments on initial mount as well
  useEffect(() => {
    loadFromDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Appointments</h1>
            <p className="text-gray-600">Select a doctor and choose your preferred date and time</p>
          </div>
          {((dbSummary && dbSummary.length > 0) || lastBooking?.doctor) && !showForm && (
            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                setLastBooking({});
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              + New Appointment
            </button>
          )}
        </div>

        {/* Read-only last booking summary */}
        {!showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Appointments</h2>
            {((dbSummary && dbSummary.length > 0) || lastBooking?.doctor) ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(dbSummary && dbSummary.length > 0 ? dbSummary : [
                      {
                        appointment_id: lastBooking.appointment_id!,
                        doctor: lastBooking.doctor!,
                        date: lastBooking.date!,
                        time: lastBooking.time!,
                        status: lastBooking.status!,
                        notes: lastBooking.notes || null,
                      }
                    ]).map((row) => (
                      <tr key={row.appointment_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">{row.appointment_id}</td>
                        <td className="px-6 py-4 text-gray-900">
                          {row.doctor ? (
                            <div>
                              <div className="font-semibold">{row.doctor.full_name || 'Unknown Doctor'}</div>
                              <div className="text-sm text-gray-600">{row.doctor.title} - {row.doctor.department}</div>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{row.date}</td>
                        <td className="px-6 py-4 text-gray-700">{row.time}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-sm">{row.status}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{row.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments</h3>
                <p className="text-gray-600 mb-6">Schedule your appointment.</p>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setLastBooking({});
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Book Appointment
                </button>
              </div>
            )}
          </div>
        )}

        {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Doctor Selection */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Select Doctor</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose a Doctor</label>
              <select
                value={selectedDoctor || ''}
                onChange={(e) => setSelectedDoctor(Number(e.target.value) || null)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.doctor_id} value={doc.doctor_id}>
                    {doc.full_name || 'Unknown Doctor'} - {doc.title} - {doc.department}
                    {doc.experience && ` (${doc.experience} years)`}
                  </option>
                ))}
              </select>
            </div>

            {selectedDoctorData && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {selectedDoctorData.full_name 
                      ? selectedDoctorData.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      : selectedDoctorData.title.split(' ')[0].slice(0,2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {selectedDoctorData.full_name || 'Unknown Doctor'}
                    </h3>
                    <p className="text-sm text-gray-700 font-medium">{selectedDoctorData.title} - {selectedDoctorData.department}</p>
                    {selectedDoctorData.experience && (
                      <p className="text-sm text-gray-600 mt-1">{selectedDoctorData.experience} years of experience</p>
                    )}
                    {selectedDoctorData.hospital_affiliation && (
                      <p className="text-sm text-gray-600 mt-1">{selectedDoctorData.hospital_affiliation}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedDoctor && scheduleLoading && (
              <div className="mt-4 text-sm text-gray-500">Loading schedule...</div>
            )}
          </div>

          {/* Step 2: Date & Time Selection */}
          {selectedDoctor && Object.keys(schedule).length > 0 && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Select Date & Time</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime('');
                    }}
                    min={minDate}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
                    required
                  />
                  {selectedDate && availableSlots.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">No available slots for this day</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                  {selectedDate ? (
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border-2 border-gray-200 rounded-xl">
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedTime === slot
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {slot}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-4 text-center text-gray-500 text-sm py-4">
                          No slots available
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-400">
                      Select a date first
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Appointment Details */}
          {selectedDoctor && selectedDate && selectedTime && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Appointment Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="New Patient">New Patient</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
                  <div className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-700">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, {selectedTime}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-24 focus:border-blue-500 focus:outline-none"
                    placeholder="Add any additional notes or concerns..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedDoctor && selectedDate && selectedTime && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctor(null);
                  setSelectedDate('');
                  setSelectedTime('');
                  setNotes('');
                  setAppointmentType('Consultation');
                  setShowForm(false);
                }}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={booking}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {booking ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </form>
        )}
      </div>
    </div>
  );
}
