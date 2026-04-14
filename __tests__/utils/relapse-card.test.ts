import { getRelapseCardDisplayMode } from '@/utils/relapse-card';

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
