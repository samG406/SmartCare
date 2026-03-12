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
import CircularReveal from '@/components/CircularReveal';
import HowItWorksSection from '@/components/HowItWorksSection';
import FeaturesHubSection from '@/components/FeaturesHubSection';

interface Speciality {
  name: string;
  icon: StaticImageData;
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [pageReady, setPageReady] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

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

  // Intro only on first visit while the page is still loading; skip if already rendered.
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      try {
        if (sessionStorage.getItem('smartcare-home-reveal-seen') === '1') {
          setPageReady(true);
          return;
        }

        const nav = performance.getEntriesByType('navigation')[0] as
          | PerformanceNavigationTiming
          | undefined;
        if (nav?.type === 'back_forward') {
          sessionStorage.setItem('smartcare-home-reveal-seen', '1');
          setPageReady(true);
          return;
        }

        if (document.readyState === 'complete') {
          sessionStorage.setItem('smartcare-home-reveal-seen', '1');
          setPageReady(true);
          return;
        }

        setShowIntro(true);
      } catch {
        setPageReady(true);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleIntroMidpoint = () => {
    setPageReady(true);
  };

  const handleCircularRevealComplete = () => {
    try {
      sessionStorage.setItem('smartcare-home-reveal-seen', '1');
    } catch {}
    setPageReady(true);
    setShowIntro(false);
  };

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
      {showIntro && !pageReady && (
        <div className="fixed inset-0 z-9997 bg-[#f9f9f9]" aria-hidden />
      )}
      {showIntro && (
        <CircularReveal
          isPlaying
          color="rgb(40, 167, 69)"
          duration={2200}
          spinnerDuration={150}
          onMidpoint={handleIntroMidpoint}
          onComplete={handleCircularRevealComplete}
        />
      )}
      <div
        className={pageReady ? undefined : 'invisible'}
        aria-hidden={!pageReady}
      >
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
      <section className="pt-32 pb-10" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          {/* Hero Heading */}
          <div className="mb-8">
            <h1
              className="mx-auto max-w-4xl text-balance text-4xl text-slate-900 sm:text-5xl md:text-[3.25rem] md:leading-tight"
              style={{
                fontFamily: 'var(--font-instrument-serif), "Cormorant Garamond", Georgia, serif',
                fontWeight: 400,
                letterSpacing: '0.03em',
              }}
            >
              Healthcare that actually
              <br />
              <span style={{ color: '#28a745' }}>feels like care.</span>
            </h1>
            <p
              className="mx-auto mt-5 max-w-2xl text-pretty text-base text-slate-600 sm:text-lg"
              style={{ fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif' }}
            >
              One calm platform for patients, doctors and clinics — booking, records and follow-ups in one place.
            </p>
          </div>
        </div>

        {/* Hero Image — full viewport width */}
        <div className="mt-10 w-full">
          <Image
            src={homeimg}
            alt="Hero City Illustration"
            className="h-auto w-full shadow-lg"
            width={1920}
            height={600}
            sizes="100vw"
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          {/* Hero CTAs — below image */}
          <div className="mt-14 mb-16 flex flex-wrap items-center justify-center gap-3 sm:gap-4 sm:mt-16">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-95 sm:px-7 sm:py-3.5 sm:text-[15px]"
              style={{
                backgroundColor: '#1a4d32',
                fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
              }}
            >
              Get started
              <span aria-hidden>→</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center rounded-full border border-stone-300 bg-white/80 px-6 py-3 text-sm font-medium text-slate-900 transition-colors hover:border-stone-400 hover:bg-white sm:px-7 sm:py-3.5 sm:text-[15px]"
              style={{ fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif' }}
            >
              See how it works
            </a>
          </div>

          {/* Specialities Section */}
          <div className="py-16" style={{ backgroundColor: '#f9f9f9' }}>
            <div className="mb-12 text-center">
              <h2
                className="text-2xl font-bold leading-tight text-[#0B1426] sm:text-3xl"
                style={{ fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif' }}
              >
                Clinic and Specialities
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
                Our multidisciplinary team brings together leading physicians across six specialities — so you get the right expertise without the runaround.
              </p>
            </div>

            {/* Speciality Icons — outer scroll only; inner padding avoids clipping hover lift/scale */}
            <div className="overflow-x-auto px-4 pb-2">
              <div className="flex min-w-min justify-center gap-10 px-4 py-8">
              {specialities.map((speciality) => (
                <div
                  key={speciality.name}
                  className="shrink-0 cursor-pointer text-center transition-transform duration-300 ease-out hover:-translate-y-2 hover:scale-105"
                >
                  <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-full border-4 border-blue-50 bg-white shadow-md">
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
        </div>
      </section>

      {/* Features Section */}
      <div className="py-20" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturesHubSection />

          <HowItWorksSection />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-stone-200/90 bg-linear-to-b from-stone-50 via-white to-stone-50/80 text-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-0">
          <div className="grid grid-cols-1 gap-12 sm:gap-14 md:grid-cols-12 md:gap-10 lg:gap-14">
            {/* Brand */}
            <div className="md:col-span-5 lg:col-span-6">
              <p className="text-[15px] font-semibold tracking-tight text-stone-900">SmartCare</p>
              <p className="mt-3 max-w-md text-[13px] leading-[1.65] text-stone-600">
                A calmer way to run appointments and records—built for busy clinics and the people they care for.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="rounded-full p-2.5 text-stone-500 transition-colors duration-200 hover:bg-stone-200/60 hover:text-emerald-700"
                >
                  <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="rounded-full p-2.5 text-stone-500 transition-colors duration-200 hover:bg-stone-200/60 hover:text-emerald-700"
                >
                  <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="rounded-full p-2.5 text-stone-500 transition-colors duration-200 hover:bg-stone-200/60 hover:text-emerald-700"
                >
                  <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="rounded-full p-2.5 text-stone-500 transition-colors duration-200 hover:bg-stone-200/60 hover:text-emerald-700"
                >
                  <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Explore */}
            <div className="md:col-span-3 lg:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Explore</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    href="/doctors/dashboard"
                    className="text-[13px] text-stone-700 underline-offset-4 transition-colors duration-200 hover:text-emerald-700 hover:underline"
                  >
                    For clinicians
                  </Link>
                </li>
                <li>
                  <Link
                    href="/patient/dashboard"
                    className="text-[13px] text-stone-700 underline-offset-4 transition-colors duration-200 hover:text-emerald-700 hover:underline"
                  >
                    For patients
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-[13px] text-stone-700 underline-offset-4 transition-colors duration-200 hover:text-emerald-700 hover:underline"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-[13px] text-stone-700 underline-offset-4 transition-colors duration-200 hover:text-emerald-700 hover:underline"
                  >
                    Create an account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-4 lg:col-span-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Reach us</p>
              <address className="mt-4 space-y-4 not-italic">
                <div>
                  <p className="text-[11px] text-stone-500">Email</p>
                  <a
                    href="mailto:support@smartcare.com"
