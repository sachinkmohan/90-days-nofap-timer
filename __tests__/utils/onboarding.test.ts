import { isValidStartDate, isPastDate } from '@/utils/onboarding';

function minutesFromNow(n: number): Date {
  return new Date(Date.now() + n * 60 * 1000);
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

describe('isValidStartDate', () => {
  it('returns false for a date in the future', () => {
    expect(isValidStartDate(minutesFromNow(1))).toBe(false);
  });

  it('returns false for a date more than 90 days ago', () => {
    expect(isValidStartDate(daysAgo(91))).toBe(false);
  });

  it('returns true for right now', () => {
    expect(isValidStartDate(new Date())).toBe(true);
  });

  it('returns true for a date 45 days ago', () => {
    expect(isValidStartDate(daysAgo(45))).toBe(true);
  });

  it('returns true for exactly 90 days ago', () => {
    expect(isValidStartDate(daysAgo(90))).toBe(true);
  });
});

describe('isPastDate', () => {
  it('returns true for a date set to yesterday', () => {
    expect(isPastDate(daysAgo(1))).toBe(true);
  });

  it('returns false for right now', () => {
    expect(isPastDate(new Date())).toBe(false);
  });
});
