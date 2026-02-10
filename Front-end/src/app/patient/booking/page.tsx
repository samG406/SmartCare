'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PatientNavbar from '@/components/PatientNavbar';
import PatientSidebar from '@/components/PatientSidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import { apiFetch } from '@/config/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  setSelectedDoctor,
  setSelectedDate,
  setSelectedTime,
  setAppointmentType,
  setNotes,
  setDoctors,
  setSchedule,
  setScheduleLoading,
  setCurrentStep,
  resetBooking,
  setBookedSlots,
} from '@/lib/slices/bookingSlice';

interface TimeSlot {
  start: string;
  end: string;
}


type AppointmentRow = {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  status: string;
  notes: string | null;
  doctor_name?: string | null;
  doctor_department?: string | null;
};

export default function BookingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isOpen } = useSidebar();
  
  const {
    doctors,
    selectedDoctor,
    schedule,
    selectedDate,
    selectedTime,
    appointmentType,
    notes,
    scheduleLoading,
    currentStep,
    bookedSlots,
  } = useAppSelector((state) => state.booking);
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiFetch('/doctors');
        if (res.ok) {
          const data = await res.json();
          dispatch(setDoctors(data));
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };
    fetchDoctors();
  }, [dispatch]);

  useEffect(() => {
    if (!selectedDoctor) {
      dispatch(setSchedule({}));
      return;
    }
    dispatch(setScheduleLoading(true));
    apiFetch(`/api/timings/${selectedDoctor}`)
      .then(async res => {
        const text = await res.text();
        
        if (res.ok) {
          try {
            const data = text ? JSON.parse(text) : {};
            return data;
          } catch (parseErr) {
            console.error('Failed to parse timings response:', parseErr);
            return {};
          }
        } else {
          try {
            const errorData = text ? JSON.parse(text) : { error: 'Empty error response' };
            console.error('Failed to fetch schedule:', res.status, errorData.error || errorData.message);
            return {};
          } catch (parseErr) {
            console.error('Failed to parse error response:', parseErr);
            return {};
          }
        }
      })
      .then(data => {
        dispatch(setSchedule(data || {}));
      })
      .catch(err => {
        console.error('Failed to fetch schedule:', err);
        dispatch(setSchedule({}));
      })
      .finally(() => dispatch(setScheduleLoading(false)));
  }, [selectedDoctor, dispatch]);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      dispatch(setBookedSlots([]));
      return;
    }

    const fetchBookedSlots = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          dispatch(setBookedSlots([]));
          return;
        }
        const res = await apiFetch(`/appointments/by-doctor/${selectedDoctor}/slots`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const appointments = await res.json();
          if (Array.isArray(appointments)) {
            const dateStr = selectedDate;
            const booked = appointments
              .filter((apt: AppointmentRow) => {
                if (apt.doctor_id !== selectedDoctor) return false;
                if (apt.status?.toLowerCase() === 'cancelled') return false;
                
                const aptDate = new Date(apt.appointment_date);
                const selectedDateObj = new Date(dateStr);
                
                return aptDate.toISOString().split('T')[0] === selectedDateObj.toISOString().split('T')[0];
              })
              .map((apt: AppointmentRow) => {
                const aptDate = new Date(apt.appointment_date);
                const hours = String(aptDate.getHours()).padStart(2, '0');
                const minutes = String(aptDate.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
              });
            
            dispatch(setBookedSlots(booked));
          }
        }
      } catch (err) {
        console.error('Failed to fetch booked slots:', err);
        dispatch(setBookedSlots([]));
      }
    };

    fetchBookedSlots();
  }, [selectedDoctor, selectedDate, dispatch]);

  useEffect(() => {
    if (!selectedDoctor) return;

    if (selectedDate && selectedTime) {
      dispatch(setCurrentStep(3));
    } else if (selectedDate || (Object.keys(schedule).length > 0 && !scheduleLoading)) {
      dispatch(setCurrentStep(2));
    } else if (Object.keys(schedule).length === 0 && !scheduleLoading && selectedDoctor) {
      dispatch(setCurrentStep(1));
    }
  }, [selectedDoctor, selectedDate, selectedTime, schedule, scheduleLoading, dispatch]);

  useEffect(() => {
    if (selectedDoctor && Object.keys(schedule).length > 0 && currentStep === 1 && !scheduleLoading) {
      dispatch(setCurrentStep(2));
    }
  }, [selectedDoctor, schedule, scheduleLoading, currentStep, dispatch]);

  const allTimeSlots = useMemo(() => {
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
      
      for (let m = startMinutes; m < endMinutes; m += 30) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const slotTime = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        slots.push(slotTime);
      }
    });
    
    return slots;
  }, [selectedDate, schedule]);

  const availableSlots = useMemo(() => {
    return allTimeSlots.filter(slot => !bookedSlots.includes(slot));
  }, [allTimeSlots, bookedSlots]);

  const selectedDoctorData = doctors.find(d => d.doctor_id === selectedDoctor);
  const minDate = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert('Please complete all required fields');
      return;
    }

    router.push('/patient/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PatientNavbar />
      <div className="flex flex-1">
        <PatientSidebar />
        <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-16'} p-8`}>
          <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Book Appointment</h1>
            <p className="text-slate-600">Select a doctor and choose your preferred date and time</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/patient/appointments"
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Appointments
            </Link>
          </div>
        </div>
        <div className="flex gap-0">
          <div className="w-full md:w-80 lg:w-96 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 shrink-0">
            <div className="p-6 md:p-8 flex flex-col justify-between h-full min-h-[500px] md:min-h-0">
              <div>
                <div className="space-y-0">
                  <div className={`flex items-center gap-3 ${selectedDoctor ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedDoctor ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      1
                    </div>
                    <span className={`text-sm font-medium ${selectedDoctor ? 'text-slate-900' : 'text-slate-400'}`}>
                      Specialist
                    </span>
                  </div>
                  <div className="w-px h-4 bg-slate-200 ml-3"></div>
                  <div className={`flex items-center gap-3 ${selectedDate && selectedTime ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedDate && selectedTime ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      2
                    </div>
                    <span className={`text-sm font-medium ${selectedDate && selectedTime ? 'text-slate-900' : 'text-slate-400'}`}>
                      Date & Time
                    </span>
                  </div>
                  <div className="w-px h-4 bg-slate-200 ml-3"></div>
                  <div className={`flex items-center gap-3 ${selectedDoctor && selectedDate && selectedTime ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedDoctor && selectedDate && selectedTime ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      3
                    </div>
                    <span className={`text-sm font-medium ${selectedDoctor && selectedDate && selectedTime ? 'text-slate-900' : 'text-slate-400'}`}>
                      Details
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  {selectedDoctorData ? (
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-sm font-bold">
                          {selectedDoctorData.full_name 
                            ? selectedDoctorData.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                            : selectedDoctorData.title.split(' ')[0].slice(0,2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 leading-tight">
                            {selectedDoctorData.full_name || 'Unknown Doctor'}
                          </div>
                          <div className="text-xs text-slate-500">{selectedDoctorData.department}</div>
                        </div>
                      </div>
                      
                      {selectedDate && selectedTime && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(selectedDate).toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'})}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{selectedTime}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-dashed text-center">
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-400">Select a doctor to begin</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="flex-1 bg-white">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="p-6 md:p-10">
                  <h2 className="text-xl font-bold text-slate-900 mb-5">Select Specialist</h2>

                  <div className="space-y-3">
                    {doctors.map((doc) => {
                      const isSelected = selectedDoctor === doc.doctor_id;
                      const initials = doc.full_name
                        ? doc.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        : doc.title.split(' ')[0].slice(0,2);
                      
                      const avatarColors = [
                        'bg-pink-100 text-pink-700',
                        'bg-blue-100 text-blue-700',
                        'bg-orange-100 text-orange-700',
                        'bg-purple-100 text-purple-700',
                        'bg-green-100 text-green-700',
                        'bg-yellow-100 text-yellow-700'
                      ];
                      const colorIndex = doc.doctor_id % avatarColors.length;
                      const avatarColor = avatarColors[colorIndex];
                      
                      return (
                        <button
                          key={doc.doctor_id}
                          type="button"
                          onClick={() => {
                            dispatch(setSelectedDoctor(doc.doctor_id));
                          }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                            isSelected 
                              ? 'border-teal-500 bg-white' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {/* Selection indicator in top right */}
                          <div className="absolute top-4 right-4">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white"></div>
                            )}
                          </div>

                          <div className="flex items-start gap-4 pr-8">
                            <div className={`w-12 h-12 ${avatarColor} rounded-lg flex items-center justify-center text-sm font-bold shrink-0`}>
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 text-base mb-0.5">
                                {doc.full_name || 'Unknown Doctor'}
                              </h3>
                              <p className="text-sm text-teal-600 font-medium mb-2">{doc.department}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                {doc.experience && (
                                  <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{doc.experience} yrs</span>
                                  </div>
                                )}
                                {doc.hospital_affiliation && (
                                  <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="truncate">{doc.hospital_affiliation}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedDoctor && scheduleLoading && (
                    <div className="mt-4 text-sm text-slate-500">Loading schedule...</div>
                  )}
                </div>
              )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && selectedDoctor && Object.keys(schedule).length > 0 && (
            <div className="p-6 md:p-10">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Date & Time</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      dispatch(setSelectedDate(e.target.value));
                      dispatch(setSelectedTime(''));
                    }}
                    min={minDate}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-white text-slate-700 transition-all"
                    required
                  />
                  {selectedDate && availableSlots.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">No available slots for this day</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Time</label>
                  {selectedDate ? (
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-300 rounded-lg bg-slate-50">
                      {allTimeSlots.length > 0 ? (
                        allTimeSlots.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          const isAvailable = !isBooked;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => isAvailable && dispatch(setSelectedTime(slot))}
                              disabled={isBooked}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isBooked
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed line-through opacity-60'
                                  : selectedTime === slot
                                  ? 'bg-slate-700 text-white'
                                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                              }`}
                              title={isBooked ? 'This time slot is already booked' : ''}
                            >
                              {slot}
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-4 text-center text-slate-500 text-sm py-4">
                          No slots available
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-400 bg-slate-50">
                      Select a date first
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Appointment Details */}
          {currentStep === 3 && selectedDoctor && selectedDate && selectedTime && (
            <div className="p-6 md:p-10">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Type</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => dispatch(setAppointmentType(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-white text-slate-700 transition-all"
                    required
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="New Patient">New Patient</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Scheduled Time</label>
                  <div className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-slate-50 text-slate-700 font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, {selectedTime}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => dispatch(setNotes(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 h-24 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-white text-slate-700 transition-all resize-none"
                    placeholder="Add any additional notes or concerns..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep === 2 && (
            <div className="px-6 md:px-10 py-5 border-t border-slate-100 bg-white flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  dispatch(setSelectedDoctor(null));
                  dispatch(setSchedule({}));
                  dispatch(setBookedSlots([]));
                  dispatch(setSelectedDate(''));
                  dispatch(setSelectedTime(''));
                  dispatch(setCurrentStep(1));
                }}
                className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedDate && selectedTime) {
                    dispatch(setCurrentStep(3));
                  }
                }}
                disabled={!selectedDate || !selectedTime}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
              >
                Continue
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="px-6 md:px-10 py-5 border-t border-slate-100 bg-white flex justify-between items-center">
              <button
                type="button"
                onClick={() => dispatch(setCurrentStep(2))}
                className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition-colors"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    dispatch(resetBooking());
                  }}
                  className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-black font-medium transition-colors shadow-sm"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
