# ADR 0002 — Check-ins linked to rounds by date range, not by roundId

## Status
Accepted

## Context
Check-ins are stored as a flat global list (`CheckInEntry[]`) with no reference to a round. Associating them to a round is done at runtime by filtering on date: a check-in belongs to whichever round's `startDate`–`endDate` window contains it.

An alternative is to store a `roundId` on `CheckInEntry`, making the association explicit and unambiguous.

## Decision
Keep date-range linking. Do not add `roundId` to `CheckInEntry`.

## Reasons
- In real usage, rounds are sequential and non-overlapping (each is a 90-day attempt), so a check-in date can only ever fall in one round's window.
- The ambiguity only surfaces in dev mode, where multiple rounds can be created and completed on the same calendar day.
- Adding `roundId` would require a storage migration, changes to `StorageService`, the `CheckInEntry` type, and every call site — complexity not justified for a dev-only edge case.
