import { getCheckInPrompt, CHECK_IN_PROMPTS } from '@/utils/check-in';

describe('getCheckInPrompt', () => {
  it('returns the first prompt for day of year 1', () => {
    expect(getCheckInPrompt(1)).toBe(CHECK_IN_PROMPTS[0]);
  });

  it('cycles through all 5 prompts across consecutive days', () => {
    for (let i = 0; i < 5; i++) {
      expect(getCheckInPrompt(i + 1)).toBe(CHECK_IN_PROMPTS[i]);
    }
  });

  it('wraps back to first prompt on day 6', () => {
    expect(getCheckInPrompt(6)).toBe(CHECK_IN_PROMPTS[0]);
  });
});
