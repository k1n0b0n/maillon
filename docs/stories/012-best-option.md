# Story 012: The best option first, on its map

- **PRD:** E4.9 (the criteria live there; it changes E4.6)
- **Status:** Done
- **Golden routes:** run: GR1 to GR7; added: none
- **Budgets touched:** NFR2: HTML of the results page, the options' picker island; the map stays out of the budget (ADR-0006)

## Plan

1. ADR-0006 before the code: the map loads with the results, unless Save-Data.
2. Markers, tests first: the map's GeoJSON gives each option a start, an end and a change at the start of each step after the first, with the next step's mode and a title from the steps' text ("Montez à Gare Saint-Jean à 10 h 31").
3. Results page, one view: a picker lists every option by arrival, with its time and duration, "le plus rapide" on the first; under it the map, then the shown option's panel with its steps open, "Arrive en premier" on the best. The other panels are rendered hidden. No result at all: the messages only. Without JavaScript: the picker's links reload the page with `option=` set, no map.
4. Map island: it loads on its own once hydrated, unless Save-Data, which keeps the button. One option drawn at a time, framed; the three markers in the legend; "Masquer la carte" and Escape stay. An option with no result: no canvas, a sentence says so.
5. Picker island: once hydrated, a press shows the option's panel in place, replaces the address with its link, tells the map through a window event, and a status message says which option is shown; the link carries `aria-current`. A map hidden or waiting for Save-Data stays so.
6. Markers drawn as HTML: start a dark disc, end a flag (Lucide's `flag`, ISC), change a white disc with an accent ring and the next mode's icon; told apart by shape and icon, a tooltip from the title, the text as the alternative. Replaced at each change of option.
7. Checks: `npm run check`; golden routes; Firefox on GR3 and Lormont Bas → La Cité du Vin, 360 and 1280 px, light and dark: the best option shown and its map loaded alone (MapLibre and tiles in the network panel); a press on another option replaces the panel, the route and the announcement; the markers (screenshot); Escape hides the map and gives the focus back; Save-Data forced by an init script: the map waits for the button; the results without JavaScript.

## Notes

- Criterion 1: GR3, Firefox at 360 and 1280 px, light and dark: the picker lists À vélo 10 h 40 "le plus rapide", Transports + vélo 10 h 41, Transports 10 h 45, À pied 11 h 02; À vélo is shown with "Arrive en premier" and its steps open. At 360 px the first screen holds the picker, the map, the legend and the shown option's heading. No sideways scroll.
- Criterion 2: the map draws the best option once hydrated, with no press; Save-Data forced by an init script: "Afficher la carte" waits and nothing of MapLibre or OpenFreeMap loads.
- Criterion 3: "Transports + vélo" shows its panel alone, draws its route and markers, puts `option=transports-velo` in the address, says "Affiché : Transports avec votre vélo.", and the focus stays on the link; by keyboard, Tab then Enter on "À pied" does the same. A link with `option=transports` opens on that option. Under Save-Data, a press shows the panel and loads nothing of MapLibre. Gare Saint-Jean → Gare d'Arcachon: "À pied, Aucun trajet" shows "Trop loin pour y aller à pied." and no canvas; back to the best, the map frames its route again.
- Criterion 4: GR3 by transit: a start disc, a ring with the tram icon, a ring with the walk icon, a flag at the end; each one's title is its step's text. They overlap at a stop a minute's walk away: the text stays the alternative.
- Criterion 5: Escape from the map hides it and gives the focus back to "Afficher la carte"; the steps stay. Another option chosen while hidden is drawn once the map shows again.
- Without JavaScript, the HTML holds the picker's four links, `aria-current` on the one shown, its panel and the three others `hidden`, and no map.
- In review, the map sat in the best option's card: another option's route showed under the best option's arrival, with its steps below. The maintainer chose, from two clickable mock-ups, one view in place of the two sections: the picker, the map, then the shown option.
- Astro's server sends `max-age=0` on its hashed assets: a repeat search revalidates MapLibre instead of keeping it, unless the server's proxy says otherwise. OpenFreeMap's tiles are kept ten years.

**Measure:** JavaScript before the map 34.7 → 38.2 kB compressed (the picker's island and the icons it shows, the markers, Vue's runtime split in two chunks); results page HTML 6.4 → 6.5 kB. Transferred on a first search at 360 px with the map loaded on its own: 443 kB from the app (MapLibre 438 kB) and 544 kB from OpenFreeMap (4 tiles 395 kB, 2 glyph ranges 90 kB, sprite 53 kB, style 9 kB), about 990 kB.
