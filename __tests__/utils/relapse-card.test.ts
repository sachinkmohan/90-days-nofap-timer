import { getRelapseCardDisplayMode, getRelapseMessage } from '@/utils/relapse-card';

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-04-14T12:00:00Z'));
});

afterAll(() => {
  jest.useRealTimers();
});

describe('getRelapseCardDisplayMode', () => {
  it('returns none when there is no last relapse', () => {
    expect(getRelapseCardDisplayMode(null)).toBe('none');
  });

  it('returns precise when relapse was less than 24 hours ago', () => {
    const threeHoursAgo = new Date('2026-04-14T09:00:00Z').toISOString();
    expect(getRelapseCardDisplayMode(threeHoursAgo)).toBe('precise');
  });

  it('returns days when relapse was 24 or more hours ago', () => {
    const twoDaysAgo = new Date('2026-04-12T12:00:00Z').toISOString();
    expect(getRelapseCardDisplayMode(twoDaysAgo)).toBe('days');
  });

  it('returns precise at exactly 23h 59m', () => {
    const justUnder24h = new Date('2026-04-13T12:01:00Z').toISOString();
    expect(getRelapseCardDisplayMode(justUnder24h)).toBe('precise');
  });

  it('returns days at exactly 24h', () => {
    const exactly24h = new Date('2026-04-13T12:00:00Z').toISOString();
    expect(getRelapseCardDisplayMode(exactly24h)).toBe('days');
  });
});

describe('getRelapseMessage', () => {
  it('returns encouragement when no relapses today yet', () => {
    expect(getRelapseMessage(0)).toBe(
      "One setback doesn't define your journey. If you feel the urge to go again today, that's the chaser effect. It passes."
    );
  });

  it('returns chaser effect message when 1 relapse already today', () => {
    expect(getRelapseMessage(1)).toBe(
      "What you're feeling right now is the chaser effect. It's strongest in the next few hours, then it passes. Just get through today."
    );
  });

  it('returns null when 2 relapses already today', () => {
    expect(getRelapseMessage(2)).toBeNull();
  });

  it('returns null when 5 relapses already today', () => {
    expect(getRelapseMessage(5)).toBeNull();
  });
});
