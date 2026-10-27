# Story 012: The best option first, on its map

- **PRD:** E4.9 (the criteria live there; it changes E4.6)
- **Status:** Done
- **Golden routes:** run: GR1 to GR7; added: none
- **Budgets touched:** NFR2: HTML of the results page, the "Voir sur la carte" islands; the map stays out of the budget (ADR-0006)

## Plan

1. ADR-0006 before the code: the map loads with the results, unless Save-Data.
2. Markers, tests first: the map's GeoJSON gives each option a start, an end and a change at the start of each step after the first, with the next step's mode and a title from the steps' text ("Montez à Gare Saint-Jean à 10 h 31").
3. Results page: "Meilleure option" first, "Arrive en premier", its card highlighted with its steps open and the map under it; then "Autres options", the options with no result last. No result at all: the messages only. Without JavaScript: the full text, no map, no button.
4. Map island: it loads on its own once hydrated, unless Save-Data, which keeps the button. One option drawn at a time, framed, titled "Sur la carte : {option}"; its line style and the three markers in the legend; "Masquer la carte" and Escape stay.
5. "Voir sur la carte" on each other option found: a small island per card, shown once hydrated; it tells the map through a window event, loads the map first if it waits for Save-Data, scrolls to it (instantly under reduced motion), and a status message says which option the map shows. The pressed button carries `aria-pressed`.
6. Markers drawn as HTML: start a dark disc, end a flag (Lucide's `flag`, ISC), change a white disc with an accent ring and the next mode's icon; told apart by shape and icon, a tooltip from the title, the text as the alternative. Replaced at each change of option.
7. Checks: `npm run check`; golden routes; Firefox on GR3 and Lormont Bas → La Cité du Vin, 360 and 1280 px, light and dark: the best option first and its map loaded alone (MapLibre and tiles in the network panel); "Voir sur la carte" replaces the route, the title and the announcement; the markers (screenshot); Escape hides the map and gives the focus back; Save-Data forced by an init script: the map waits for the button; the results without JavaScript.

## Notes

- Criterion 1: GR3 and Lormont Bas → La Cité du Vin, Firefox at 360 and 1280 px, light and dark: "Meilleure option" first with "Arrive en premier" and its steps open, then "Autres options", headings h2 then h3. No sideways scroll.
- Criterion 2: the map draws the best option once hydrated, with no press; Save-Data forced by an init script: "Afficher la carte" waits and nothing of MapLibre or OpenFreeMap loads.
- Criterion 3: "Voir sur la carte : Transports en commun" redraws that option alone, its title "Sur la carte : Transports en commun", the status "La carte montre : Transports en commun.", `aria-pressed` on its button, the page scrolled to the map. Under Save-Data, the button loads the map first.
- Criterion 4: GR3 by transit: a start disc, a ring with the tram icon, a ring with the walk icon, a flag at the end; each one's title is its step's text. They overlap at a stop a minute's walk away: the text stays the alternative.
- Criterion 5: Escape from the map hides it, gives the focus back to "Afficher la carte" and unpresses the buttons; the steps stay.
- Without JavaScript, the production HTML holds both sections and the best option's steps open, with no map and no button.
- Astro's server sends `max-age=0` on its hashed assets: a repeat search revalidates MapLibre instead of keeping it, unless the server's proxy says otherwise. OpenFreeMap's tiles are kept ten years.

**Measure:** JavaScript before the map 34.7 → 37.3 kB compressed (the buttons' island, the markers, Vue's runtime split in two chunks); results page HTML 6.4 → 6.1 kB. Transferred on a first search at 360 px with the map loaded on its own: 443 kB from the app (MapLibre 438 kB) and 544 kB from OpenFreeMap (4 tiles 395 kB, 2 glyph ranges 90 kB, sprite 53 kB, style 9 kB), about 990 kB.
