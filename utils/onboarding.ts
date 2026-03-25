const MAX_DAYS_AGO = 90;

export async function shouldSkipOnboarding(
  startDate: Date | null,
  hasCompletedOnboarding: () => Promise<boolean>
): Promise<boolean> {
  if (startDate !== null) return true;
  return hasCompletedOnboarding();
}

export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export function isValidStartDate(date: Date): boolean {
  const now = new Date();
  if (date > now) return false;
  const minDate = new Date(now.getTime() - MAX_DAYS_AGO * 24 * 60 * 60 * 1000);
  if (date < minDate) return false;
  return true;
}
