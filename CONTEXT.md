# Domain Context

## Check-in

A daily mood log the user records once per day during an active round. Stored as a flat global list (not nested inside a Round) and linked to rounds at runtime via date-range matching.

A check-in has:
- **date** — `YYYY-MM-DD`
- **mood** — one of `struggling`, `neutral`, or `strong`
- **note** — optional free-text reflection (max 280 chars)

Check-ins carry no `roundId`. They are linked to rounds at runtime by date-range matching — a check-in belongs to the round whose `startDate`–`endDate` window contains its date. See ADR 0002.

## Mood

The emotional state a user self-reports at check-in time. Three states, each with a canonical emoji:

| Mood | Emoji |
|------|-------|
| `struggling` | 😤 |
| `neutral` | 😐 |
| `strong` | 💪 |

## Round

A 90-day attempt. Has a start date, an optional end date (null if active), and a list of relapse events. Multiple rounds accumulate over time; only one can be active at a time.
