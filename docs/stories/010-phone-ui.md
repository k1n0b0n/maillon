# Story 010: Readable on a phone

- **PRD:** E4.7 (the criteria live there)
- **Status:** Draft
- **Golden routes:** run: GR1 to GR6; added: none
- **Budgets touched:** NFR2: HTML and CSS of the search and results pages; no new JavaScript

## Plan

Sober and utilitarian: system fonts, one accent colour, no third party (ADR-0003). Screenshots of `/` and GR3's results at 320 and 1280 px, light and dark, before and after.

1. Design tokens in the layout, light and dark: a surface for the cards, field borders at 3:1 at least, text on the accent, a radius. Fields and buttons styled once, 44 px high at least; the islands drop their own copies. Times in tabular figures. An inline chain-link logo next to the name.
2. Home and form: a sentence before the form on what maillon compares; the folding bike checkbox enlarged, with a hint that the bus then takes the bike; a full-width primary submit; "Utiliser ma position" as a 44 px secondary button with an icon.
3. Mode icons: inline SVG rendered on the server, from Lucide (ISC, notice kept), always hidden from screen readers since the text says the mode.
4. Cards: the option's icon and name; the arrival time large; then duration, changes and departure; "Arrive en premier" on the first card with a result; bike notes in a callout; a card with no result dashed and muted, still AA. Under the title, "Départ maintenant · classées par heure d'arrivée" and an "Inverser le trajet" link that keeps the coordinates and the folding bike, with no JavaScript.
5. Steps as a timeline: the formatter gives each step a title and a detail instead of a sentence, tests first; the `<details>` stays, its summary says "Voir les N étapes"; each step has its departure time, a rail (solid for a ride, dotted for walking or cycling, as on the map), its icon, its title with a neutral line badge, its detail muted; each item still reads in order to a screen reader.
6. Checks: `npm run check`; contrast of the tokens computed; no sideways scroll at 320 px; keyboard path; 200 % zoom; the results page without JavaScript; golden routes.

## Notes

**Measure:** results page HTML and CSS compressed, before → after; JavaScript unchanged at 34.3 kB.
