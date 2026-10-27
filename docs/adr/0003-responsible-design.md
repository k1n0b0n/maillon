# ADR-0003: Responsible design

- **Status:** Accepted, amended by ADR-0005 (map tiles from a third party, on request)
- **Date:** 2026-10-26

## Context

RGAA 4.1.2 AA and RGESN 2024 apply, with reasonable trade-offs. In balise, a self-audit of the 106 RGAA criteria was published as "fully compliant", which its own ADR said was not credible, and the RGESN page weight criterion (6.1) had no budget.

## Decision

- **Measured, from the first page**: the budgets of NFR2 (50 kB of compressed JavaScript, 200 kB transferred, the map excluded) and axe with no violation on the main path, both in CI from E1.3.
- **By default**: server-rendered HTML that works without JavaScript; system fonts; no third party (no analytics, CDN or font service); the map and its tiles load only on request.
- **Audited by people**: at each milestone, the main path with the keyboard, VoiceOver, 200 % zoom and a 320 px width (NFR1).
- **Stated honestly**: the statements (E5.3) say "partially compliant" until an external audit.
- **Supported**: the last two versions of evergreen browsers, Safari on iOS 17 and later; older browsers get the HTML, which works.

## Alternatives considered

| Option | Why not |
|---|---|
| Full self-audit of the 106 criteria at each story | Costly, and a self-audit is not credible as "fully compliant" |
| Budgets measured by hand | They drift: balise never measured its page weight |

## Consequences

- Easier: an accessibility or weight regression fails CI instead of waiting for an audit.
- Harder: every island must justify its weight; a map library alone exceeds the JavaScript budget, hence the map on request.
