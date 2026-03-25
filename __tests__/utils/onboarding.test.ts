import { isValidStartDate, isPastDate, shouldSkipOnboarding } from '@/utils/onboarding';

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

describe('shouldSkipOnboarding', () => {
  it('returns false when startDate is null and onboarding not yet done', async () => {
    const result = await shouldSkipOnboarding(null, async () => false);
    expect(result).toBe(false);
  });

  it('returns true when startDate is already set in memory', async () => {
    const result = await shouldSkipOnboarding(new Date(), async () => false);
    expect(result).toBe(true);
  });

  it('returns true when persistent onboarding flag is set even if startDate is null', async () => {
    const result = await shouldSkipOnboarding(null, async () => true);
    expect(result).toBe(true);
  });

  it('does not call the persistent check when startDate is already set', async () => {
    const check = jest.fn(async () => false);
    await shouldSkipOnboarding(new Date(), check);
    expect(check).not.toHaveBeenCalled();
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
