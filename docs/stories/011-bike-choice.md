# Story 011: No bike, a bike or a folding bike

- **PRD:** E4.8 (the criteria live there)
- **Status:** Draft
- **Golden routes:** run: GR1 to GR7; added: GR7
- **Budgets touched:** NFR2: HTML of the search form; no new JavaScript

## Plan

1. Domain, tests first: the search's folding flag becomes a bike, none, classic or folding. `velo=aucun` reads as none, `velo=pliant` as folding, anything else or nothing as classic, so older links keep their results. The options compared follow the bike: walk and transit without one, the four otherwise.
2. Engine adapter: without a bike, one request on foot and no transit + bike request; the cache key holds the bike.
3. Form: a "Votre vélo" group of three radios, "Pas de vélo", "Vélo classique" (checked by default) and "Vélo pliant", each in a 44 px label; the bus hint stays under the folding bike.
4. The bike travels wherever the folding flag did: the results page, its "Inverser le trajet" link and the map's query, the cards, the options' names, the map's API, the golden routes' harness.
5. GR7: GR3 without a bike, on transit, never a bike leg; GR6 says `bike: folding`.
6. Checks: `npm run check`; golden routes; Firefox at 360 and 1280 px, light and dark: "Pas de vélo" shows walk and transit only, an old `velo=pliant` link still shows the bus; the results without JavaScript.

## Notes

**Measure:** the search form's HTML, before → after; JavaScript unchanged at 34.8 kB.
