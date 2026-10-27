# Story 011: No bike, a bike or a folding bike

- **PRD:** E4.8 (the criteria live there)
- **Status:** Done
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

- Criterion 1: Firefox at 360 px: a "Votre vélo" group, its legend read with each radio; three native radios in 44 px labels, "Vélo classique" checked; the bus hint under "Vélo pliant", tied to it by `aria-describedby`.
- Criterion 2: GR3's places with "Pas de vélo": two cards, "Transports en commun" then "À pied"; the map's API draws those two; one request to the engine instead of two. GR7 holds it on the frozen dataset.
- Criterion 3: a `velo=pliant` link on GR1's places rides Bus 1 and Bus 9 with the folding bike; GR6 too.
- Criterion 4: a link without `velo`, or with an unknown value, reads as a classic bike, `pliant` still as folding (unit tests); GR3's old link shows the four options.
- The URL now always holds `velo`, `classique` included, as the form sends it; "Inverser le trajet" and the map keep it.
- Checked at 360 and 1280 px, light and dark: no sideways scroll. Without JavaScript, the production HTML holds the three radios.

**Measure:** engine requests per search without a bike 2 → 1; home page HTML 4.5 → 4.5 kB compressed (4,527 B); JavaScript unchanged at 34.8 kB.
