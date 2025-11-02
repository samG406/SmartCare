'use client';

import React, { useMemo, useState, useEffect } from 'react';
import DoctorNavbar from '@/components/DoctorNavbar';
import { API_URL } from '@/config/api';

interface TimeSlot {
  start: string;
  end: string;
}

export default function ScheduleTimingPage() {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [slotDuration, setSlotDuration] = useState('30');
  const [openByDay, setOpenByDay] = useState<Record<string, boolean>>({
    monday: true,
    tuesday: false,
    wednesday: true,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [intervalsByDay, setIntervalsByDay] = useState<Record<string, TimeSlot[]>>({
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [],
    wednesday: [{ start: '10:00', end: '16:00' }],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });
  // no SSR-sensitive data here; no need for mounted flag

  const days = [
    { id: 'monday', label: 'Monday', short: 'Mon' },
    { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { id: 'thursday', label: 'Thursday', short: 'Thu' },
    { id: 'friday', label: 'Friday', short: 'Fri' },
    { id: 'saturday', label: 'Saturday', short: 'Sat' },
    { id: 'sunday', label: 'Sunday', short: 'Sun' },
  ];

  const currentIntervals = intervalsByDay[selectedDay] || [];
  const [showModal, setShowModal] = useState(false);
  const [editableIntervals, setEditableIntervals] = useState<TimeSlot[]>([]);

  const handleEdit = () => {
    setEditableIntervals([...currentIntervals]);
    setShowModal(true);
  };

  const handleSave = () => {
    setIntervalsByDay({ ...intervalsByDay, [selectedDay]: editableIntervals });
    setShowModal(false);
  };

  const handleAddSlot = () => {
    setEditableIntervals([...editableIntervals, { start: '', end: '' }]);
  };

  const handleRemoveSlot = (index: number) => {
    setEditableIntervals(editableIntervals.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...editableIntervals];
    updated[index][field] = value;
    setEditableIntervals(updated);
  };

  const toggleOpenDay = (dayId: string) => {
    const next = !openByDay[dayId];
    setOpenByDay({ ...openByDay, [dayId]: next });
    if (next && (intervalsByDay[dayId] || []).length === 0) {
      setIntervalsByDay({ ...intervalsByDay, [dayId]: [{ start: '09:00', end: '17:00' }] });
    }
  };

  const copyDayToAll = (fromDay: string) => {
    const src = intervalsByDay[fromDay] || [];
    const updated: Record<string, TimeSlot[]> = { ...intervalsByDay };
    const openUpdated: Record<string, boolean> = { ...openByDay };
    Object.keys(updated).forEach((d) => {
      if (d !== fromDay) {
        updated[d] = [...src];
        openUpdated[d] = true;
      }
    });
    setIntervalsByDay(updated);
    setOpenByDay(openUpdated);
  };

  const clearDay = (day: string) => {
    setIntervalsByDay({ ...intervalsByDay, [day]: [] });
  };

  const timezone = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'Local time'; }
  }, []);

  const [publishing, setPublishing] = useState(false);
  const allDayIds = days.map(d => d.id);
  const [showEditor, setShowEditor] = useState(false);
  const getDoctorId = () => {
    try {
      const u = localStorage.getItem('user');
      if (!u) return null;
      const parsed = JSON.parse(u);
      // Must be a valid Doctors.doctor_id to satisfy FK
      return parsed.doctor_id || null;
    } catch { return null; }
  };

  const [summary, setSummary] = useState<Record<string, { start: string; end: string; }[]>>({});
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchSummary = async () => {
    const doctorId = getDoctorId();
    if (!doctorId) return;
    setSummaryLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/timings/${doctorId}`);
      if (resp.ok) {
        const data = await resp.json();
        setSummary(data || {});
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publishAll = async () => {
    const doctorId = getDoctorId();
    if (!doctorId) {
      console.warn('[schedule] Missing doctor_id in localStorage.user; cannot publish schedule.');
      return;
    }
    setPublishing(true);
    try {
      await Promise.all(
        allDayIds.map((d) => {
          const open = openByDay[d];
          const intervals = open ? (intervalsByDay[d] || []) : [];
          return fetch(`${API_URL}/api/timings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctor_id: doctorId, weekday: d, intervals })
          });
        })
      );
      await fetchSummary();
      // After successful publish, collapse editor to show only summary
      setShowEditor(false);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Schedule Settings
          </h1>
          <p className="text-gray-600">Configure your availability and time slots</p>
        </div>

        {/* Add Schedule button (shows editor) */}
        {!showEditor && (
          <div className="bg-white rounded-2xl shadow p-6 mb-8 flex justify-between items-center">
            <div>
              <p className="text-gray-900 font-semibold">No schedule changes in progress</p>
              <p className="text-gray-600 text-sm">Click Add Schedule to configure availability</p>
            </div>
            <button onClick={() => setShowEditor(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add Schedule</button>
          </div>
        )}

        {/* Global Settings (optional helpers) */}
        {showEditor && (
          <div className="bg-white rounded-2xl shadow p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot Duration</label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  className="w-48 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>
              <div>
                <p className="text-sm text-gray-500">Timezone</p>
                <p className="text-gray-900 font-medium">{timezone}</p>
              </div>
              <div className="flex-1" />
              <div className="flex gap-3">
                <button onClick={() => copyDayToAll(selectedDay)} className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50">Copy current day to all</button>
                <button onClick={() => clearDay(selectedDay)} className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50">Clear current day</button>
              </div>
            </div>
          </div>
        )}

        {/* Day Selector */}
        {showEditor && (
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Day</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  selectedDay === day.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-bold">{day.short}</div>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Day Schedule */}
        {showEditor && (
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {days.find(d => d.id === selectedDay)?.label} Schedule
            </h2>
            {(openByDay[selectedDay] && currentIntervals.length > 0) && (
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Edit Schedule
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" checked={openByDay[selectedDay]} onChange={() => toggleOpenDay(selectedDay)} className="w-5 h-5" />
              <span className="text-gray-800 font-medium">Open this day</span>
            </label>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Slot duration: {slotDuration} min</span>
          </div>

          {!openByDay[selectedDay] || currentIntervals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{openByDay[selectedDay] ? 'No time intervals yet' : 'Day is closed'}</h3>
              <p className="text-gray-600 mb-6">{openByDay[selectedDay] ? 'Add your available time ranges' : 'Enable this day to accept bookings'}</p>
              <button
                onClick={() => {
                  setEditableIntervals([{ start: '', end: '' }]);
                  setShowModal(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                + Add Time Slots
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {currentIntervals.map((slot, index) => (
                <div
                  key={index}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow font-medium"
                >
                  {slot.start} - {slot.end}
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Edit Modal */}
        {showEditor && showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Time Slots</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {editableIntervals.map((slot, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => handleSlotChange(index, 'start', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => handleSlotChange(index, 'end', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                    </div>
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddSlot}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  + Add More Slots
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Read-only timetable summary (calendar style) */}
        <div className="mt-8 bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Published Timetable</h3>
            {summaryLoading && <span className="text-sm text-gray-500">Refreshing…</span>}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {days.map((d) => {
              const list = summary[d.id] || [];
              return (
                <div key={d.id} className="border border-gray-200 rounded-xl min-h-[140px] flex flex-col">
                  <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl text-sm font-semibold text-gray-700">
                    {d.label}
                  </div>
                  <div className="p-3 flex-1 space-y-2 overflow-auto">
                    {list.length === 0 ? (
                      <div className="text-gray-400 text-sm">Closed</div>
                    ) : (
                      list.map((iv, idx) => (
                        <div key={idx} className="rounded-md bg-blue-50 border border-blue-100 px-2 py-1">
                          <div className="text-blue-800 text-sm font-medium">{iv.start} - {iv.end}</div>
                          <div className="text-[11px] text-blue-600">Available</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showEditor && (
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setShowEditor(false)} className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50">Discard</button>
            <button onClick={publishAll} disabled={publishing} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60">
              {publishing ? 'Publishing…' : 'Publish Schedule'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
