export const CHECK_IN_PROMPTS = [
  "What's one thing that felt hard today?",
  "What are you proud of this week?",
  "What triggered you recently and how did you handle it?",
  "What would you tell yourself on day 1?",
  "What helped you get through today?",
] as const;

export function getCheckInPrompt(dayOfYear: number): string {
  const index = (dayOfYear - 1) % CHECK_IN_PROMPTS.length;
  return CHECK_IN_PROMPTS[index];
}
