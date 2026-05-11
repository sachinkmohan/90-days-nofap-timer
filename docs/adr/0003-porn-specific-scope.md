# ADR 0003 — App scope is porn recovery, not a general habit tracker

## Status
Accepted

## Context
The app tracks 90-day abstinence rounds, relapses, and mood check-ins. These primitives are generic enough to apply to any compulsive habit (alcohol, social media, gambling). A general-purpose positioning would reach a larger addressable market and allow the same codebase to serve multiple use cases.

## Decision
The app is scoped exclusively to pornography recovery. The 90-day frame, the brain-rewiring messaging, the shame-sensitive relapse UX, and all copy are tuned for this specific context and should not be generalised.

## Reasons
- The 90-day frame is grounded in pornography-specific neuroplasticity research. For other habits, the number is arbitrary and the rationale falls apart.
- The post-relapse UX (shame reframe, momentum restart) is specific to porn recovery psychology. Applying it to, say, a caffeine habit would feel overwrought and off-brand.
- Specific apps beat generic apps in crowded markets. "The best porn recovery tracker" is a defensible position; "another habit tracker" competes with Streaks, Habitify, and dozens of others.
- The relapse definition is intentionally left generic within the porn-recovery context (porn only vs. PMO is user-defined), but the context itself is fixed.
