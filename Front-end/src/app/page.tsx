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

