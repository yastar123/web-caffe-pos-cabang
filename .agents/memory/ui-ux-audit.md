---
name: UI/UX audit pass
description: Full Awwwards-level audit of all 13 KopiFlow POS pages — what was found and what was fixed.
---

All CSS animation classes (animate-fade-in, animate-slide-up, stagger-children, card-hover, page-enter, urgency-pulse, animate-bounce-in) are properly defined in index.css — no missing keyframes.

use-dark-mode.ts must read localStorage synchronously in useState initializer (not in useEffect) to match the inline script in index.html that applies the .dark class before React hydrates. Fixed in this pass.

Reports date filter was using fixed w-36 inputs that broke on mobile. Fixed to flex-wrap + w-full min-w-[120px] responsive layout with quick preset buttons (Hari ini / 7 hari / 30 hari / 90 hari).

POS floating cart button on mobile now shows selected table name alongside item count and total. Also added a sticky mobile table selector at the top of the menu panel so users can pick a table before adding items.

index.html lang attribute was "en" — changed to "id" since the entire UI is in Indonesian.

**Why:** These are the highest-impact polish issues that affect daily operational use and first impressions.
