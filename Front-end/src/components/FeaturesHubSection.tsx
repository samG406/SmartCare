'use client';

import type { CSSProperties, ReactNode } from 'react';

/** Matches hero headline accent ("feels like care.") */
const BRAND_GREEN = '#28a745';

const CALENDAR_WEEKS = [
  { days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], dates: [3, 4, 5, 6, 7, 8, 9] },
  { days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], dates: [10, 11, 12, 13, 14, 15, 16] },
];

function dateCellClass(date: number): string {
  if (date === 6 || date === 14) return 'text-white';
  if (date === 4 || date === 12) return 'text-[#0B1426]';
  if (date === 8) return 'bg-amber-100 text-[#0B1426]';
  return 'bg-stone-100 text-stone-600';
}

function dateCellStyle(date: number): CSSProperties | undefined {
  if (date === 6 || date === 14) return { backgroundColor: BRAND_GREEN };
  if (date === 4 || date === 12) return { backgroundColor: `${BRAND_GREEN}26` };
  return undefined;
}

function ScheduleCalendar() {
  return (
    <div className="mt-3 rounded-lg border border-stone-100 bg-stone-50/80 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-[#0B1426]">Schedule</span>
        <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide text-stone-400">
          <span
            className="inline-block h-1 w-1 rounded-full"
            style={{ backgroundColor: BRAND_GREEN }}
            aria-hidden
          />
          Live
        </span>
      </div>
      <div className="space-y-1.5">
        {CALENDAR_WEEKS.map((week, wi) => (
          <div key={wi}>
            <div className="mb-0.5 grid grid-cols-7 gap-0.5">
              {week.days.map((d, i) => (
                <span key={`${wi}-d-${i}`} className="text-center text-[8px] font-medium text-stone-400">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {week.dates.map((date) => (
                <div
                  key={`${wi}-${date}`}
                  style={dateCellStyle(date)}
                  className={`flex aspect-square items-center justify-center rounded text-[10px] font-semibold ${dateCellClass(date)}`}
                >
                  {date}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HubIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      {children}
    </svg>
  );
}

/** Clipboard chart ΓÇö health records */
function MedicalRecordsIcon() {
  return (
    <HubIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </HubIcon>
  );
}

/** Patient profile & care */
function PatientManagementIcon() {
  return (
    <HubIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </HubIcon>
  );
}

function SatelliteCard({
  variant,
  title,
  description,
  icon,
  className,
}: {
  variant: 'records' | 'patients';
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}) {
  const iconBg = variant === 'records' ? 'bg-sky-100 text-sky-600' : 'bg-violet-100 text-violet-600';

  return (
    <article
      className={`cn-sat ${variant} max-w-[200px] rounded-xl border border-stone-100 bg-white p-4 shadow-[0_6px_24px_rgba(0,0,0,0.07)] ${className ?? ''}`}
    >
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
      <h3 className="text-sm font-bold text-[#0B1426]">{title}</h3>
      <p className="mt-0.5 text-xs leading-snug text-stone-500">{description}</p>
    </article>
  );
}

export default function FeaturesHubSection() {
  return (
    <section aria-labelledby="features-hub-heading">
      <div className="mb-12 text-center">
        <h2
          id="features-hub-heading"
          className="text-2xl font-bold leading-tight text-[#0B1426] sm:text-3xl"
          style={{ fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif' }}
        >
          Everything You Need for
          <br />
          <span
            style={{
              color: BRAND_GREEN,
              fontFamily: 'var(--font-instrument-serif), "Cormorant Garamond", Georgia, serif',
              fontWeight: 400,
              letterSpacing: '0.03em',
            }}
          >
            Healthcare Management
          </span>
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          Comprehensive tools for doctors, patients, and administrators
        </p>
      </div>

      {/* Desktop: hub layout with satellites + static dashed connectors */}
      <div className="relative mx-auto hidden min-h-[440px] max-w-[860px] md:block">
        <svg
          className="features-hub-conn pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 980 520"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M 220 110 Q 320 200 380 240" />
          <path d="M 770 430 Q 660 380 600 340" />
        </svg>

        <span
          className="pointer-events-none absolute left-[12%] top-[58%] h-2.5 w-2.5 rounded-full border-2 opacity-40"
          style={{ borderColor: BRAND_GREEN, backgroundColor: `${BRAND_GREEN}33` }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute right-[14%] top-[32%] h-2.5 w-2.5 rounded-full border-2 opacity-40"
          style={{ borderColor: BRAND_GREEN, backgroundColor: `${BRAND_GREEN}33` }}
          aria-hidden
        />

        <SatelliteCard
          variant="records"
          title="Medical Records"
          description="Secure and organized patient records"
          className="absolute left-0 top-8 z-10"
          icon={<MedicalRecordsIcon />}
        />

        <article className="absolute left-1/2 top-1/2 z-20 w-[min(100%,360px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-stone-100 bg-white p-4 shadow-[0_10px_32px_rgba(0,0,0,0.09)]">
          <div className="mb-2 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" aria-hidden />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" aria-hidden />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" aria-hidden />
          </div>
          <p className="text-center font-mono text-[10px] uppercase tracking-wider text-stone-400">
            Appointment Management
          </p>
          <ScheduleCalendar />
        </article>

        <SatelliteCard
          variant="patients"
          title="Patient Management"
          description="Comprehensive patient care tools"
          className="absolute bottom-4 right-0 z-10"
          icon={<PatientManagementIcon />}
        />
      </div>

      {/* Mobile: stacked layout (no absolute positioning) */}
      <div className="flex flex-col items-center gap-6 md:hidden">
        <SatelliteCard
          variant="records"
          title="Medical Records"
          description="Secure and organized patient records"
          icon={<MedicalRecordsIcon />}
        />
        <article className="w-full max-w-sm rounded-xl border border-stone-100 bg-white p-4 shadow-[0_10px_32px_rgba(0,0,0,0.09)]">
          <div className="mb-2 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" aria-hidden />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" aria-hidden />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" aria-hidden />
          </div>
          <p className="text-center font-mono text-[10px] uppercase tracking-wider text-stone-400">
            Appointment Management
          </p>
          <ScheduleCalendar />
        </article>
        <SatelliteCard
          variant="patients"
          title="Patient Management"
          description="Comprehensive patient care tools"
          icon={<PatientManagementIcon />}
        />
      </div>
    </section>
  );
}
