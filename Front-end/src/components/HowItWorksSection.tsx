'use client';

import { useState } from 'react';

type StepId = '01' | '02' | '03' | '04';

interface DoctorSlot {
  name: string;
  badge: string;
  badgeClass: string;
}

interface StepContent {
  id: StepId;
  label: string;
  panelTitle: string;
  searchTitle?: string;
  searchSubtitle?: string;
  slots?: DoctorSlot[];
  intakeFields?: string[];
  appointment?: { doctor: string; when: string; mode: string };
  followUps?: { title: string; when: string }[];
}

const STEPS: StepContent[] = [
  {
    id: '01',
    label: 'Book in 30 seconds',
    panelTitle: 'Find a doctor. Lock a slot.',
    searchTitle: 'Cardiology ┬╖ 5 miles',
    searchSubtitle: '22 doctors found',
    slots: [
      { name: 'Dr. Okafor ┬╖ Today ┬╖ 3:40 PM', badge: 'FASTEST', badgeClass: 'bg-emerald-50 text-emerald-600' },
      { name: 'Dr. Park ┬╖ Tomorrow ┬╖ 9:00 AM', badge: 'TOP RATED', badgeClass: 'bg-sky-50 text-sky-600' },
      { name: 'Dr. Lindgren ┬╖ Fri ┬╖ 11:00 AM', badge: 'VIDEO', badgeClass: 'bg-amber-50 text-amber-700' },
    ],
  },
  {
    id: '02',
    label: 'Smart intake',
    panelTitle: 'Share history once. Skip the repeat.',
    intakeFields: ['Symptoms & duration', 'Current medications', 'Insurance & ID on file'],
  },
  {
    id: '03',
    label: 'Meet your doctor',
    panelTitle: 'In-clinic or video ΓÇö your choice.',
    appointment: {
      doctor: 'Dr. Park ┬╖ Cardiology',
      when: 'Tomorrow ┬╖ 9:00 AM',
      mode: 'Video visit ready',
    },
  },
  {
    id: '04',
    label: 'Auto follow-up',
    panelTitle: 'Reminders and next steps, handled.',
    followUps: [
      { title: 'Lab results review', when: 'In 3 days' },
      { title: 'Medication check-in', when: 'In 1 week' },
      { title: 'Annual wellness visit', when: 'In 6 months' },
    ],
  },
];

const sans = 'var(--font-plus-jakarta), system-ui, sans-serif';

/** Matches hero headline accent ("feels like care.") */
const BRAND_GREEN = '#28a745';

function SearchIcon() {
  return (
    <svg className="h-4 w-4 text-[#16C098]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function StepMockUi({ step }: { step: StepContent }) {
  if (step.id === '01' && step.slots) {
    return (
      <div className="rounded-xl bg-[#F7F8FA] p-3">
        <div className="mb-2.5 flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#16C098]/15">
            <SearchIcon />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#0B1426]" style={{ fontFamily: sans }}>
              {step.searchTitle}
            </p>
            <p className="text-[11px] text-stone-500" style={{ fontFamily: sans }}>
              {step.searchSubtitle}
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-2">
          {step.slots.map((slot) => (
            <li
              key={slot.name}
              className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2.5 shadow-sm"
            >
              <span className="text-xs font-medium text-[#0B1426]" style={{ fontFamily: sans }}>
                {slot.name}
              </span>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${slot.badgeClass}`}
              >
                {slot.badge}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (step.id === '02' && step.intakeFields) {
    return (
      <div className="rounded-xl bg-[#F7F8FA] p-3">
        <ul className="flex flex-col gap-2">
          {step.intakeFields.map((field, i) => (
            <li
              key={field}
              className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2.5 shadow-sm"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16C098] font-mono text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-xs font-medium text-[#0B1426]" style={{ fontFamily: sans }}>
                {field}
              </span>
              <span className="ml-auto text-[11px] text-stone-400" style={{ fontFamily: sans }}>
                Complete
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (step.id === '03' && step.appointment) {
    return (
      <div className="rounded-xl bg-[#F7F8FA] p-3">
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold text-[#0B1426]" style={{ fontFamily: sans }}>
            {step.appointment.doctor}
          </p>
          <p className="mt-0.5 text-[11px] text-stone-500" style={{ fontFamily: sans }}>
            {step.appointment.when}
          </p>
          <p className="mt-2 inline-flex rounded-md bg-[#16C098]/15 px-2 py-0.5 text-[10px] font-semibold text-[#16C098]">
            {step.appointment.mode}
          </p>
        </div>
      </div>
    );
  }

  if (step.id === '04' && step.followUps) {
    return (
      <div className="rounded-xl bg-[#F7F8FA] p-3">
        <ul className="flex flex-col gap-2">
          {step.followUps.map((item) => (
            <li
              key={item.title}
              className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2.5 shadow-sm"
            >
              <span className="text-xs font-medium text-[#0B1426]" style={{ fontFamily: sans }}>
                {item.title}
              </span>
              <span className="shrink-0 text-[11px] text-stone-500" style={{ fontFamily: sans }}>
                {item.when}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<StepId>('01');

  return (
    <section id="how-it-works" className="mt-16 scroll-mt-28" aria-labelledby="how-it-works-heading">
      <div className="mb-16 text-center">
        <h2
          id="how-it-works-heading"
          className="mb-4 text-3xl font-bold text-gray-900"
          style={{ fontFamily: sans }}
        >
          From booking to{' '}
          <span style={{ color: BRAND_GREEN }}>follow-up.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          {/* Step list */}
          <nav className="flex flex-col gap-0.5" aria-label="Steps">
            {STEPS.map((step) => {
              const isActive = step.id === activeStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left ${
                    isActive
                      ? 'bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)]'
                      : 'bg-transparent'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                      isActive
                        ? 'text-white'
                        : 'border border-stone-200 bg-transparent text-stone-400'
                    }`}
                    style={isActive ? { backgroundColor: BRAND_GREEN } : undefined}
                  >
                    {step.id}
                  </span>
                  <span
                    className={`text-[13px] font-semibold leading-snug ${
                      isActive ? '' : 'text-stone-500'
                    }`}
                    style={{
                      fontFamily: sans,
                      ...(isActive ? { color: BRAND_GREEN } : {}),
                    }}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="min-h-[340px] w-full rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            {STEPS.map((step) => {
              const isActive = step.id === activeStep;
              return (
                <div
                  key={step.id}
                  className={isActive ? 'block h-full' : 'hidden'}
                  aria-hidden={!isActive}
                >
                  <h3
                    className="mb-4 text-xl font-bold leading-tight text-[#0B1426]"
                    style={{ fontFamily: sans }}
                  >
                    {step.panelTitle}
                  </h3>
                  <div className="min-h-[220px]">
                    <StepMockUi step={step} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </section>
  );
}
