'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';

export default function PatientNavbar() {
  const pathname = usePathname();
  const { isOpen } = useSidebar();
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'dashboard';
  const pageLabel = lastSegment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const isBookingFromAppointments = pathname === '/patient/booking';
  const breadcrumbLabel = isBookingFromAppointments ? 'Booking' : pageLabel;

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div
        className={`grid h-16 items-center transition-all duration-300 ${
          isOpen ? 'grid-cols-[16rem_1fr_auto]' : 'grid-cols-[4rem_1fr_auto]'
        }`}
      >
        {/* Logo - Ignored as per request, keeping minimal */}
        <div className="flex items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            SmartCare
          </Link>
        </div>

        <div className="flex items-center text-sm text-gray-500 pl-8 min-w-0">
          <Link href="/patient/dashboard" className="hover:text-gray-900 transition-colors">
            Portal
          </Link>
          <svg className="mx-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {isBookingFromAppointments && (
            <>
              <Link href="/patient/appointments" className="hover:text-gray-900 transition-colors">
                Appointments
              </Link>
              <svg className="mx-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
          <span className="font-medium text-gray-900 truncate">{breadcrumbLabel}</span>
        </div>

        {/* Right Side: Search and Notifications */}
        <div className="flex items-center justify-end gap-4 pr-4 sm:pr-6 lg:pr-8">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search records..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              suppressHydrationWarning
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Notification Bell */}
          <button
            className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors"
            suppressHydrationWarning
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Red notification dot */}
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
