# Story 005: First search online

- **PRD:** E3.1 (the criteria live there)
- **Status:** Done
- **Golden routes:** run: GR1 to GR5 (the engine adapter is theirs)
- **Budgets touched:** NFR2, first measure

## Plan

1. The engine's geocoder behind an adapter; the next transit itinerary, earliest arrival first.
2. The results page: the itinerary as text, the form below it, a message for each failure.
3. French formatting of times, durations, distances and steps, tested.

## Notes

- Checked by hand on the development stack, 2026-10-26 at 22:46: Gare Saint-Jean → Place de la Bourse gives tram D in 0.29 s; "zqxwvk" says which place is not found and keeps both fields; with the engine stopped the page answers 503 with its message, the form filled.
- The page ships no JavaScript, so it works the same without it; the URL holds the whole search (`/trajet?de=…&a=…`), for now at the time of the request.
- The engine calls the search's ends `START` and `END`: the adapter blanks them, the page names them after the places found.
- `no-console` now allows `console.error`: the container's logs say why a search failed.

**Measure:** results page 2,733 bytes of HTML (1,307 compressed), 0 script.
