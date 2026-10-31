# Story 006: Four options on one screen

- **PRD:** E4.2 (the criteria live there)
- **Status:** Done
- **Golden routes:** run: GR1 to GR5
- **Budgets touched:** NFR2

## Plan

1. The domain ranks the four options: arrival, then fewer changes, the options without a result last.
2. One card per option, with its steps in a `details` element, and a reason when the engine found nothing.

## Notes

- Checked by hand on 2026-10-26 at 22:48, Pessac → Place de la Bourse: bike 23:18, tram B with the bike 23:21, bus and tram 23:29, on foot 00:27.
- The steps fold into `details`: no JavaScript, and the keyboard opens them. E4.5 gives the detail its own URL.
- The number of changes shows on the transit cards only; on foot or by bike it would always read "sans correspondance".
- The four cards come from the two requests of ADR-0001; MOTIS's limit of 6 h decides "too far to walk".

**Measure:** results page with four cards, 0 script.
