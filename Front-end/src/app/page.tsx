'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteCookie } from '@/lib/cookies';
import logo from '@/icons/SC-logo.png';
import homeimg from '@/icons/homeimg.jpg';
import neuro from '@/icons/neuro.png';
import cardio from '@/icons/cardio.png';
import ortho from '@/icons/ortho.png';
import tooth from '@/icons/tooth.png';
import psychology from '@/icons/psychology.png';
import lungs from '@/icons/lungs.png';
import type { StaticImageData } from 'next/image';

interface Speciality {
  name: string;
  icon: StaticImageData;
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
      try {
        const hasUser = Boolean(localStorage.getItem('user') && localStorage.getItem('token'));
        setIsLoggedIn(hasUser);
      } catch {
        setIsLoggedIn(false);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      deleteCookie('token');
      deleteCookie('role');
      setIsLoggedIn(false);
    } catch {}
  };

  const specialities: Speciality[] = [
    { name: 'Neurology', icon: neuro },
    { name: 'Cardiology', icon: cardio },
    { name: 'Orthopedic', icon: ortho },
    { name: 'Dentist', icon: tooth },
    { name: 'Psychology', icon: psychology },
    { name: 'Pulmonology', icon: lungs },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9f9' }}>
      {/* Navigation */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 5px 12px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '12px 0',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/">
                <Image 
                  src={logo} 
                  alt="SmartCare Logo" 
                  className="h-12 w-auto"
                  width={120}
                  height={48}
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {mounted && !isLoggedIn && (
                <Link 
                  href="/login" 
                  className="custom-login-btn"
                  style={{
                    fontSize: '14px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease-in-out',
                    border: '2px solid #28a745',
                    color: '#28a745'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#63e0bc';
                    e.currentTarget.style.borderColor = '#63e0bc';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#28a745';
                    e.currentTarget.style.color = '#28a745';
                  }}
                >
                  Login / SignUp
                </Link>
              )}
              {mounted && isLoggedIn && (
                <button onClick={handleLogout} className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium border border-red-200 hover:border-red-300">
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="max-w-7xl mx-auto text-center">
          {/* Hero Heading */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Search Doctor, Make an Appointment
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the best doctors, clinic & hospital the city nearest to you.
            </p>
          </div>

          {/* Hero Image */}
          <div className="mt-10 mb-16 w-full">
            <Image 
              src={homeimg} 
              alt="Hero City Illustration" 
              className="w-full h-auto rounded-lg shadow-lg"
              width={1920}
              height={600}
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* Specialities Section */}
          <div className="py-16" style={{ backgroundColor: '#f9f9f9' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Clinic and Specialities
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-10">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </p>

            {/* Speciality Icons */}
            <div className="flex justify-center gap-10 overflow-x-auto pb-4 px-4">
              {specialities.map((speciality) => (
                <div key={speciality.name} className="shrink-0 text-center">
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-blue-50 shadow-md flex items-center justify-center mx-auto mb-3 transition-transform hover:scale-105 cursor-pointer">
                    <Image
                      src={speciality.icon}
                      alt={speciality.name}
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{speciality.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="py-20" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Healthcare Management
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools for doctors, patients, and administrators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Appointment Management</h3>
              <p className="text-gray-600">Schedule and manage appointments efficiently</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Medical Records</h3>
              <p className="text-gray-600">Secure and organized patient records</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient Management</h3>
              <p className="text-gray-600">Comprehensive patient care tools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200" style={{ backgroundColor: 'rgb(239 246 255)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-2xl font-bold text-green-600 mb-4">SmartCare</h2>
              <p className="text-gray-600 mb-4">
                Streamline your healthcare practice with our comprehensive platform.
                Manage appointments, patients, and medical records efficiently.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/doctors/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">
                    Doctor Portal
                  </Link>
                </li>
                <li>
                  <Link href="/patient/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">
                    Patient Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-600 hover:text-green-600 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-gray-600 hover:text-green-600 transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Email: support@smartcare.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Healthcare St, Medical City</li>
              </ul>
            </div>
          </div>

          <div className=" border-gray-300 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} SmartCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
