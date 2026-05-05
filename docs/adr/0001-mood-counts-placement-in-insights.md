# ADR 0001 — Mood counts shown inline, not as a fourth stats row

## Status
Accepted

## Context
The insights tab round card already has three stats (relapses, longest streak, days). When adding mood counts (😤 · 😐 · 💪) from check-in data, there were two placement options: extend the stats row to include mood counts, or show a compact inline line between the date range and the stats.

## Decision
Show mood counts as a compact inline line (`😤 5 · 😐 12 · 💪 23`) between the date range and the stats row. Hide the line entirely when a round has no check-ins.

## Reasons
- Adding mood counts to the stats row creates too many numbers in one visual area, which is confusing.
- Mood counts are secondary context (how you felt) rather than primary outcome metrics (relapses, streak, days), so lighter visual weight is appropriate.
- Hiding the row for rounds with no check-ins avoids placeholder noise on old rounds.
