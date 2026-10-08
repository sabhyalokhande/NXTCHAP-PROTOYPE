# NOVA by NXT Chapter: pitch prototype

A clickable prototype of NOVA, the gamified pre-counselling journey that hands qualified, document-verified students to human counsellors. Built for the Alibaba Cloud-SUSS entry pitch (13 Oct 2026).

React (App Router) · TypeScript · Tailwind v4 · three.js / react-three-fiber · no backend, no env vars.

## Run

```bash
npm install
npm run dev -- -p 3100   # http://localhost:3100
npm run build            # production build
npm start                # serve the production build
```

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Immersive landing page: interactive 3D globe with animated routes from India and Sri Lanka, animated quest map, entry points (QR, WhatsApp, referral, Instagram, website) that tag the source |
| `/journey` | Nova's guided journey: 3D globe country picker, live 3D XP crystal, quest log, badges, document verification, weighted match scores, shortlist, counsellor handoff |
| `/counsellor` | Counsellor inbox and lead detail (brief, verified documents, match breakdown, journey history, notes), plus admin Insights (channels, funnel, drop-off) |

## 30-second demo path

1. `/journey?src=whatsapp`, enter a name.
2. Australia → Master's → Jul 2027 + Business & Management → Continue (defaults are fine) → contact details + consent.
3. Click **Use sample** on both document cards (watch the checks), then **Unlock my university matches**. Scores update after verification.
4. Shortlist 3 → **Meet my counsellor** → **Send to my counsellor**.
5. **See what your counsellor sees** opens the new lead, marked LIVE, at the top of the counsellor inbox.

To demo the "not yet qualified" path pick UK → PhD → Design with the budget slider at S$10k.

**Restart** (journey header) starts a new student. **Clear demo data** (counsellor page) wipes live leads and notes.

## 3D and motion

- The globe and XP crystal are WebGL (three.js). Continents are real coastline data rasterised into dots; nothing is fetched at runtime.
- If WebGL is unavailable the app falls back to a static visual. `prefers-reduced-motion` stops auto-rotation and ambient animation.
- In `npm run dev` the first load of a page that uses 3D can take a few seconds to compile; the production build is fast.

## What is real and what is simulated

- Real: the weighted match engine (GPA 30 · English 20 · Course 20 · Budget 15 · Visa 15, from the client's sample), the 60% qualification threshold, XP/level/badge rules, funnel and channel tagging, cross-tab sync between the student and counsellor views.
- Simulated: document reading (always returns sample values, labelled in the UI), counsellor assignment, the university catalogue (illustrative, not live partner data), and the 8 seeded sample students.
- State lives in the browser's `localStorage`, so the student and counsellor views share data on the same device and browser only.

## Deploy

Standard Node build with no environment variables: `npm run build`, then `npm start` on any Node host, or any platform that builds a web app from a repo.
