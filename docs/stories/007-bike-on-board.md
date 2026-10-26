# Story 007: Bike on board

- **PRD:** E4.3 (the criteria live there)
- **Status:** Done
- **Golden routes:** run: GR1 to GR6; added: GR6 (folding bike on the bus)
- **Budgets touched:** NFR2

## Plan

1. "J’ai un vélo pliant" in the form and the URL (`velo=pliant`): the bike-on-board request drops `requireBikeTransport`.
2. The rules an itinerary meets, from the domain's bike rules, under the card of transit with the bike.

## Notes

- Criterion 1 (no bus, no tram in a peak) holds through the data (story 003), checked by GR1 to GR3.
- Checked by hand on 2026-10-26 at 22:50: Gare Saint-Jean → Place de la Bourse shows the tram's note; Pessac → Talence Thouars with a folding bike names the card "vélo pliant" and keeps the box ticked.
- The notes are written from the rules' fields, so a rule checked again updates the page: Le Bato's 6 bikes come from `capacity`.
- A train leg reads as a TER: the itinerary does not say which kind of train, and only the TER takes an unfolded bike.

**Measure:** golden routes 5 → 6, all green.
