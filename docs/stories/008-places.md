# Story 008: Places, with suggestions

- **PRD:** E4.1 (the criteria live there)
- **Status:** Done
- **Golden routes:** run: GR1 to GR6
- **Budgets touched:** NFR2: the first JavaScript, Vue's runtime

## Plan

1. `/api/lieux` asks the engine's geocoder for six suggestions: stops with what stops there, addresses, places, with their town.
2. A Vue island per place field, an ARIA combobox; the chosen place's coordinates go into the URL (`dep`, `arr`), so the server does not look the name up again.
3. "Utiliser ma position" for the departure; a place outside the Gironde stops the search with a message.
4. `vue-tsc` and the Vue ESLint rules join `npm run check`.

## Notes

- Checked in Firefox: "cité du vin" lists the tram stop and Le Bato's apart; arrows, Enter and the mouse choose without sending the form; the screen reader hears the count.
- Without JavaScript the island's server HTML is a plain text field: the server picks the best match, as before.
- The Vue lint found a real bug: a function named like the `locate` prop, which the button would have called.
- The id `a` met one of Astro's development toolbar: the fields' ids are `lieu-de` and `lieu-a`. The dev server now starts with `--ignore-lock`: Astro's lock outlives a container's restart.

**Measure:** search page JavaScript 0 → 31.2 kB compressed (Vue 28.3 kB, the island 2.2 kB), under NFR2's 50 kB.
