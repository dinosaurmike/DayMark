# DayMark: guide for contributors and AI coding assistants

DayMark is a daily check-in app by Mike Warren ([dinosaurmike](https://github.com/dinosaurmike)): five "vials"
(Growth, Livelihood, Connection, Health, Purpose) set from 0 to 100 each day, a 60-day timeline and
observations drawn from the person's own history. Tagline: "Capacity, not productivity." Live at
<https://dinomike.ca/DayMark/>. All rights reserved (see `LICENSE`).

## What this repository contains

* **The built app only** (a Vite production build): `index.html`, `assets/index-dm1.js` (React, React Router
  with hash routes `#/dashboard` and `#/insights`, Framer Motion, Recharts) and `assets/index-<hash>.css`
  (Tailwind). The original source project is not here yet; when it is added, update this file.
* `logo.svg` (tab icon), `favicon.svg`, `icons.svg`.
* `docs/images/`: README header GIF and social preview. `source/record.js` records the app on a phone-sized
  page on a virtual clock (`vclock.js`) with 59 days of seeded sample data, `banner.html` is the background,
  and `make-gif.py` composites the frames into its phone.

## Data

Everything is in the browser's `localStorage`; there is no server, account or API key.
* `daymark_data`: array of `{id, timestamp, values: {growth, livelihood, connection, health, purpose},
  notes: {...}}`, one entry per day, in date order.
* `daymark_pillars`: names, colours and targets (target defaults to 70).
"Sign Out (Clear Data)" in the profile deletes both. Keep it local-first: don't add tracking of the
person's entries (the page has the site-wide Google Analytics tag from dinomike.ca, which sees page views only).

## Changes made to the original build (keep them, or redo them in the source)

The Insights screen showed some fixed sentences regardless of the data. In `index-dm1.js`:
* the logging streak is the real number of consecutive days logged (ending today or yesterday), shown from 7;
* "Purpose and Health rise after weekends" appears only if their Monday/Tuesday average beats Wednesday to
  Friday by more than 5 points over the last 8 weeks;
* "Livelihood and Purpose move together" appears only if their correlation over the last 30 check-ins is
  above 0.5;
* "Health is dipping below your historical average" compares with the real average (minus 10), not a fixed 40.
The bundle was renamed from `index-DhHMop2U.js` to `index-dm1.js` so browsers fetch the new one.

## Notes

* Paths are relative (`./assets/...`), so the app runs from any folder; on dinomike.ca it lives at `/DayMark/`.
* Observations need at least 14 entries ("Need more days to generate insights." before that).
