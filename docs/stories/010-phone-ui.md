# Story 010: Readable on a phone

- **PRD:** E4.7 (the criteria live there)
- **Status:** Done
- **Golden routes:** run: GR1 to GR6; added: none
- **Budgets touched:** NFR2: HTML and CSS of the search and results pages; no new JavaScript

## Plan

Sober and utilitarian: system fonts, one accent colour, no third party (ADR-0003). Screenshots of `/` and GR3's results at 320, 360 and 1280 px, light and dark, before and after.

1. Design tokens in the layout, light and dark: a surface for the cards, field borders at 3:1 at least, text on the accent, a radius. Fields and buttons styled once, 44 px high at least; the islands drop their own copies. Times in tabular figures. An inline chain-link logo next to the name.
2. Home and form: a sentence before the form on what maillon compares; the folding bike checkbox inside a 44 px label, with a hint that the bus then takes the bike; a full-width primary submit; "Utiliser ma position" as a 44 px secondary button with an icon.
3. Mode icons: inline SVG rendered on the server, from Lucide (ISC, `LICENSES/lucide.txt`), always hidden from screen readers since the text says the mode.
4. Cards: the vehicles' icons and the option's name; the arrival time large; then duration, changes and departure; "Arrive en premier" on the first card with a result; bike notes in a callout; a card with no result dashed. Under the title, an "Inverser le trajet" link that keeps the coordinates, the time asked and the folding bike, with no JavaScript.
5. Steps as a timeline, tests first: each step is a head (mode, line badge, direction) and a detail ("Montez à … à …, descendez à … à …", or duration and distance); a rail between the icons, solid for a ride, dotted on foot or by bike, as on the map.
6. Checks: `npm run check`; contrast of the tokens; no sideways scroll at 320 px; keyboard path; the results page without JavaScript; golden routes.

## Notes

- Criterion 1: Firefox, GR3 and Lormont Bas → La Cité du Vin: the arrival time first, at 1.75 rem; one "Arrive en premier"; Le Bato's capacity in the callout.
- Criterion 2: each step's text reads "Tram F direction Mérignac Aéroport", then "Montez à Gare Saint-Jean à 10 h 31, descendez à Tauzia à 10 h 32"; the icons are `aria-hidden`.
- Criterion 3: measured at 360 px: fields 48 px, buttons and the checkbox's label 44 px; the whole label toggles the box.
- Criterion 4: the home page's sentence names the tram, the TER and Le Bato with the bike.
- Criterion 5: `scrollWidth` 320 at 320 px (1280 px at 400 %), light and dark; the 15 text and control pairs of each theme pass AA, the lowest 4.37:1 for a field border (3:1 needed).
- Times, durations and distances carry no-break spaces: "10 h" and "31" parted at the end of a line at 360 px.
- Keyboard: Tab reaches "Inverser le trajet", each card's steps, the map, then the form; Enter opens the steps; the focus ring shows on each.
- Without JavaScript, the production HTML holds the cards, the timelines and the "Inverser" link. "Départ maintenant" still shows for a search with a time: E4.4.

**Measure:** results page HTML and inlined CSS 4.7 → 6.4 kB compressed; home 3.7 → 4.5 kB; JavaScript without the map 34.7 → 34.8 kB (the locate icon).
