# ADR-0006: Map with the results

- **Status:** Accepted
- **Date:** 2026-10-27

## Context

ADR-0005 loads the map only when the person presses "Afficher la carte". On the prototype, the maintainer wants the results to lead with the best option, its map already drawn: the press hides the map from most people, on a phone in a hurry. ADR-0003 keeps the map out of the JavaScript budget and allows its tiles from a third party only on request. Measured on 2026-10-27 (story 009): MapLibre GL JS 6, its worker and its stylesheet weigh 437 kB compressed once loaded; the page's own JavaScript, 34.8 kB.

## Decision

- **The map loads with the results**: the map's island loads MapLibre once it is hydrated, then draws the best option. It still waits for a press when the browser asks to save data (`navigator.connection.saveData`, or `prefers-reduced-data: reduce`).
- **MapLibre GL JS 6 and OpenFreeMap stay** as ADR-0005 set them: same library, worker, style and attribution.
- **Measured** (story 012): a first search at 360 px transfers about 990 kB with the map, 443 kB of it from the app (MapLibre) and 544 kB from OpenFreeMap (tiles, glyphs, sprite). NFR2's budgets still exclude the map.

This replaces ADR-0005's "on request" and amends ADR-0003's default.

## Alternatives considered

| Option | Why not |
|---|---|
| Keep the map on request (ADR-0005) | The maintainer's feedback: the best option should be seen on its map at once |
| Load it on wide screens only | The phone is the main audience; Save-Data already lets a person on a small data plan keep the press |
| A static image of the best option | Needs a rendering service, as in ADR-0005, and cannot be zoomed |

## Consequences

- Easier: the best option is seen at once, with no press.
- Harder: every results page transfers the map library and tiles unless the browser has them cached or asks to save data. OpenFreeMap is contacted at each search, so it learns the area a person looks at: the RGAA and RGESN statements (E5.3) say so.
- Revisit if the measured weight weighs on the usability tests, if OpenFreeMap fails often, or if the engine's own tiles can be built in CI (ADR-0005).
