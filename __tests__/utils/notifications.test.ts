import { getPresetHour, getDailyNotificationBody, getMilestoneReached, getMilestoneNotificationBody } from '@/utils/notifications';

describe('getPresetHour', () => {
  it('returns 8 for morning', () => {
    expect(getPresetHour('morning')).toBe(8);
  });

  it('returns 14 for afternoon', () => {
    expect(getPresetHour('afternoon')).toBe(14);
  });

  it('returns 20 for evening', () => {
    expect(getPresetHour('evening')).toBe(20);
  });
});

describe('getDailyNotificationBody', () => {
  it('returns correct text for day 1', () => {
    expect(getDailyNotificationBody(1)).toBe('Day 1 — tap to check in');
  });

  it('returns correct text for day 47', () => {
    expect(getDailyNotificationBody(47)).toBe('Day 47 — tap to check in');
  });

  it('returns correct text for day 90', () => {
    expect(getDailyNotificationBody(90)).toBe('Day 90 — tap to check in');
  });
});

describe('getMilestoneReached', () => {
  it('returns null when days is 0', () => {
    expect(getMilestoneReached(0)).toBeNull();
  });

  it('returns null for non-milestone days', () => {
    expect(getMilestoneReached(5)).toBeNull();
    expect(getMilestoneReached(13)).toBeNull();
    expect(getMilestoneReached(31)).toBeNull();
  });

  it('returns 7 when daysSinceLastRelapse is 7', () => {
    expect(getMilestoneReached(7)).toBe(7);
  });

  it('returns 14 when daysSinceLastRelapse is 14', () => {
    expect(getMilestoneReached(14)).toBe(14);
  });

  it('returns 30 when daysSinceLastRelapse is 30', () => {
    expect(getMilestoneReached(30)).toBe(30);
  });

  it('returns 60 when daysSinceLastRelapse is 60', () => {
    expect(getMilestoneReached(60)).toBe(60);
  });
});

describe('getMilestoneNotificationBody', () => {
  it('returns correct message for 7 days', () => {
    expect(getMilestoneNotificationBody(7)).toBe('7 days since your last relapse. Keep going.');
  });

  it('returns correct message for 14 days', () => {
    expect(getMilestoneNotificationBody(14)).toBe('14 days since your last relapse. Keep going.');
  });

  it('returns correct message for 30 days', () => {
    expect(getMilestoneNotificationBody(30)).toBe('30 days since your last relapse. Keep going.');
  });

  it('returns correct message for 60 days', () => {
    expect(getMilestoneNotificationBody(60)).toBe('60 days since your last relapse. Keep going.');
  });
});
