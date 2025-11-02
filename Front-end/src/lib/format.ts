export function formatDateUTC(dateInput: string | number | Date): string {
  const d = new Date(dateInput);
  // Use a fixed locale and UTC timezone to ensure deterministic output
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(d);
}


