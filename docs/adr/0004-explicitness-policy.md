# ADR 0004 — Two-surface explicitness policy: store explicit, in-app neutral except onboarding

## Status
Accepted

## Context
The app is specifically for porn recovery, but "porn" appearing on a home screen icon, in a notification banner, or in a widget is a privacy problem — those surfaces are ambient and potentially visible to others. At the same time, burying the purpose entirely hurts App Store discoverability and leaves new users uncertain they've downloaded the right thing.

## Decision
Apply different explicitness rules to different surfaces:

- **Store listing (App Store / Play Store):** Explicit. The description and keywords name pornography directly. Users are in a deliberate, private discovery context; search visibility matters.
- **Onboarding welcome screen:** Explicit once. The subtitle says "Built to help you break free from porn. One day at a time." This is the single moment of purpose-setting — enough for a new user to confirm they're in the right place.
- **All other in-app surfaces:** Neutral. Notifications, widgets, the home screen, history, check-in modals, and milestone copy use only "relapse", "recovery", and "clean days". No mention of porn after onboarding.

## Reasons
- Ambient surfaces (lock screen notifications, home screen widgets) are seen by others. "Day 12 — porn recovery check-in" on a lock screen is a privacy violation.
- The onboarding welcome screen is the highest-value moment for explicit purpose-setting: new users are alone, deciding whether to proceed, and need to know immediately what the app is for.
- Repeating the explicit framing after onboarding adds no value — the user already knows what they signed up for.
