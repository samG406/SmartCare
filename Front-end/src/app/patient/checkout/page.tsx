'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PatientNavbar from '@/components/PatientNavbar';
import PatientSidebar from '@/components/PatientSidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import { apiFetch } from '@/config/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { resetBooking } from '@/lib/slices/bookingSlice';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isOpen } = useSidebar();
  
  // Get booking details from Redux
  const {
    selectedDoctor,
    selectedDate,
    selectedTime,
    appointmentType,
    notes,
    doctors,
  } = useAppSelector((state) => state.booking);
  
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
    email: '',
  });

  // Find selected doctor data
  const selectedDoctorData = doctors.find((d) => d.doctor_id === selectedDoctor);

  // Redirect if no booking data (but not if notification is showing)
  useEffect(() => {
    if (!showNotification && (!selectedDoctor || !selectedDate || !selectedTime)) {
      router.push('/patient/booking');
    }
  }, [selectedDoctor, selectedDate, selectedTime, showNotification, router]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert('Missing booking information. Please go back and complete your booking.');
      return;
    }

    setLoading(true);
    try {
      const userId = (() => {
        try {
          const u = localStorage.getItem('user');
          return u ? JSON.parse(u).user_id : null;
        } catch {
          return null;
        }
      })();

      if (!userId) {
        alert('Please log in to complete payment');
        setLoading(false);
        router.push('/login');
        return;
      }

      // Create appointment in database
      const res = await apiFetch('/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          doctor_id: selectedDoctor,
          appointment_date: `${selectedDate} ${selectedTime}:00`,
          status: 'confirmed',
          appointment_type: appointmentType,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        await res.json().catch(() => ({}));
        
        // Show success notification
        setShowNotification(true);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Failed to book appointment. Please try again.');
      }
    } catch (err) {
      console.error('Payment/Booking error:', err);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total
  const consultationFee = 150.00;
  const serviceCharge = 10.00;
  const total = consultationFee + serviceCharge;

  // Format date for display
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // Format time for display (convert 24h to 12h)
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get doctor initials
  const getDoctorInitials = () => {
    if (!selectedDoctorData?.full_name) return 'DR';
    return selectedDoctorData.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (!selectedDoctor || !selectedDate || !selectedTime) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PatientNavbar />
        <div className="flex flex-1">
          <PatientSidebar />
          <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-16'} p-8`}>
            <div className="text-center">
              <p className="text-gray-600">No booking information found. Redirecting...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 overflow-hidden flex flex-col">
      <PatientNavbar />
      <div className="flex flex-1 overflow-hidden">
        <PatientSidebar />
        <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-16'} flex items-center justify-center p-4 overflow-hidden`}>
        {/* Main Compact Container */}
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-gray-200/50 max-h-[calc(100vh-120px)]">
          
          {/* Left Panel: Summary (Dark / Visual) */}
          <div className="w-full md:w-5/12 bg-[#1C1C1E] text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden overflow-y-auto">
            {/* Ambient glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 opacity-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs font-medium tracking-widest uppercase">Secure Checkout</span>
              </div>

              {/* Booking Card */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
                    {getDoctorInitials()}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">
                      {selectedDoctorData?.full_name || 'Unknown Doctor'}
                    </h3>
                    <p className="text-xs text-gray-400">{selectedDoctorData?.department || ''}</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatTime(selectedTime)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="relative z-10 pt-6 mt-auto border-t border-white/10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Amount</p>
                  <p className="text-3xl font-semibold tracking-tight">${total.toFixed(2)}</p>
                </div>
                <div className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">USD</div>
              </div>
            </div>
          </div>

          {/* Right Panel: Payment Inputs (Clean) */}
          <div className="w-full md:w-7/12 p-6 md:p-8 bg-white relative overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Payment Method</h2>
              <div className="flex -space-x-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="w-8 h-5 rounded bg-gray-200 border border-white"></div>
                <div className="w-8 h-5 rounded bg-gray-300 border border-white"></div>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              {/* Card Number */}
              <div className="group">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={paymentData.cardNumber}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cardNumber: e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19),
                      })
                    }
                    placeholder="0000 0000 0000 0000"
                    className="bg-gray-50 w-full rounded-xl border-none ring-1 ring-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:shadow-[0_0_0_1px_#000000,0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Row: Expiry & CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Expiry</label>
                  <input
                    type="text"
                    required
                    value={paymentData.expiry}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        expiry: e.target.value
                          .replace(/\D/g, '')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .substring(0, 5),
                      })
                    }
                    placeholder="MM/YY"
                    className="bg-gray-50 w-full rounded-xl border-none ring-1 ring-gray-200 py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none text-center focus:bg-white focus:shadow-[0_0_0_1px_#000000,0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out"
                  />
                </div>
                <div>
                  <label className="flex text-xs font-medium text-gray-500 mb-1.5 ml-1 justify-between">
                    CVC
                    <svg className="w-3 h-3 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentData.cvv}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cvv: e.target.value.replace(/\D/g, '').substring(0, 3),
                      })
                    }
                    placeholder="123"
                    className="bg-gray-50 w-full rounded-xl border-none ring-1 ring-gray-200 py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none text-center focus:bg-white focus:shadow-[0_0_0_1px_#000000,0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out"
                  />
                </div>
              </div>

              {/* Name on Card */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={paymentData.cardName}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, cardName: e.target.value })
                  }
                  placeholder="Name on card"
                  className="bg-gray-50 w-full rounded-xl border-none ring-1 ring-gray-200 py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:shadow-[0_0_0_1px_#000000,0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out"
                />
              </div>

              {/* Email (Optional for receipt) */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Email Receipt</label>
                <input
                  type="email"
                  value={paymentData.email}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="bg-gray-50 w-full rounded-xl border-none ring-1 ring-gray-200 py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:shadow-[0_0_0_1px_#000000,0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200 ease-in-out"
                />
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gray-900 hover:bg-black text-white text-sm font-medium py-3 rounded-xl transition-all shadow-lg shadow-gray-200 active:scale-[0.99] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Pay ${total.toFixed(2)}</span>
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Encrypted & Secure
              </p>
            </form>
          </div>
        </div>
        </div>
      </div>

      {/* Success Notification Popup */}
      {showNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative animate-[fadeIn_0.3s_ease-out_forwards]">
            {/* Close Button - Top Right */}
            <button
              onClick={() => {
                setShowNotification(false);
                // Reset booking state before redirect
                dispatch(resetBooking());
                router.push('/patient/dashboard');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Close notification"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Notification Content */}
            <div className="p-8 text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h3>

              {/* Message */}
              <p className="text-gray-600 mb-6">
                Your appointment with <span className="font-semibold text-gray-900">{selectedDoctorData?.full_name || 'the doctor'}</span> has been successfully scheduled.
              </p>

              {/* Appointment Details */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700 font-medium">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700 font-medium">{formatTime(selectedTime)}</span>
                </div>
              </div>

              {/* View Appointments Button */}
              <button
                onClick={() => {
                  setShowNotification(false);
                  dispatch(resetBooking());
                  router.push('/patient/appointments');
                }}
                className="mx-auto mt-4 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                View in Appointments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
