import { getQuoteForDay, QUOTES } from '@/utils/quotes';

describe('getQuoteForDay', () => {
  it('returns a quote with non-empty text and author for day 1', () => {
    const quote = getQuoteForDay(1);
    expect(typeof quote.text).toBe('string');
    expect(quote.text.length).toBeGreaterThan(0);
    expect(typeof quote.author).toBe('string');
    expect(quote.author.length).toBeGreaterThan(0);
  });

  it('day 1 returns the first quote by Marcus Aurelius', () => {
    const quote = getQuoteForDay(1);
    expect(quote.author).toBe('Marcus Aurelius');
    expect(quote.text).toContain('You have power over your mind');
  });

  it('day 117 returns the last quote — Nietzsche "Become who you are"', () => {
    const quote = getQuoteForDay(117);
    expect(quote.author).toBe('Friedrich Nietzsche');
    expect(quote.text).toBe('Become who you are.');
  });

  it('day 118 wraps back to the first quote', () => {
    expect(getQuoteForDay(118)).toEqual(getQuoteForDay(1));
  });

  it('day 0 returns a valid quote without throwing', () => {
    const quote = getQuoteForDay(0);
    expect(quote.text.length).toBeGreaterThan(0);
    expect(quote.author.length).toBeGreaterThan(0);
  });

  it('QUOTES array contains exactly 117 entries', () => {
    expect(QUOTES).toHaveLength(117);
  });
});
