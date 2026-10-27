# Workflow (BMAD-lite v2)

This file is the only place where the process rules live. `AGENTS.md`, the skills, the review bot and agents' memories point here and never restate a rule. A rule changes only at a milestone retro (see *Changing the method*).

## Artefacts

| File | Holds | Cap |
|---|---|---|
| `brief.md` | Problem, audience, MVP scope, out of scope, data facts | 1 page |
| `prd.md` | Milestones, stories with behaviour criteria (Given / When / Then), non-functional requirements, golden routes, *Later* | 5 criteria per story; no checkboxes, file names or implementation choices |
| `architecture.md` | Overview, founding ADRs, small decisions | 2 pages |
| `adr/NNNN-*.md` | Decisions costly to reverse: a dependency, a boundary, a data store, hosting | 1 page each |
| `stories/NNN-*.md` | One per pull request: plan, golden routes and budgets touched, notes, measure | Notes: 15 lines |
| `retros/Mx.md` | One per milestone: metrics, what worked and what cost, experiments | 1 page |
| Issues labelled `idea` | Ideas not in the PRD yet, sorted at the retro | — |
| `ideas/*.md` | Only studies backed by measures | — |

Progress lives in the stories and in *Current state*, never in the PRD.

## Story loop

1. **Draft.** Copy `stories/_template.md` for a PRD story and list the golden routes and budgets it touches.
2. **Build** on a branch, tests first for the domain.
3. **Review.** Open the pull request ready for review, always: the AI review runs once on its own, on code only. Once the gates are green, the maintainer reviews it; fix the valid findings. Ask the bot for another review only when the maintainer says so.
4. **Close in the same pull request:** notes, measure, status *Done*, *Current state*. A check that can only run after the merge is a follow-up in *Current state*; its result goes to the maintainer, not into another pull request.

One story is one pull request. A `docs:` pull request is only for planning without code (PRD, ADR, retro), one per session; the AI review skips it.

## Done means

- The `ci` check is green: types, lint and boundary rules, unit tests, golden routes, the production image and its smoke test; from M1, axe, budgets and p95.
- Each of the story's PRD criteria is shown by a test, or by a manual check written in the story's notes.
- A human has reviewed the diff.

## Rules

- Keep every document as simple as possible without losing important information.
- Scope lives in `prd.md`. Anything else becomes an `idea` issue, never code in the current story.
- An ADR comes before the code for any decision costly to reverse.
- A route reported wrong becomes a failing golden route before its fix.
- RGAA AA and RGESN apply with the budgets of `prd.md`. Statements say "partially compliant" until an external audit says otherwise.

## Milestone loop

At the end of each milestone, in one `docs:` pull request:

1. A full agent review of the code, as QA and as architect. Its findings become stories, and about 20 % of the next milestone is kept for them.
2. From M1, a manual accessibility check of the main path (NFR1) and a usability test: 3 to 5 people, one task, time and errors noted.
3. The retro, `retros/Mx.md` from `retros/_template.md`: the metrics, what worked and what cost, one or two experiments.
4. A check that every process rule lives in this file only, and a sort of the `idea` issues.

## Agent skills

Each skill runs the steps of this file and restates none of its rules: `story` opens and closes a story (added with E1.1), `golden` turns a search URL into a golden route (E2.3), `retro` fills in the metrics (before the M1 retro).

## Changing the method

A process rule changes at a retro, as an experiment with a hypothesis, a measure and a review date, or when the maintainer decides. Every change is logged below.

| Date | Change | Why | Verdict |
|---|---|---|---|
| 2026-10-26 | v2 of balise's BMAD-lite: capped artefacts, rules in this file only, ideas as issues, a retro per milestone | balise: 41 % of commits were `docs`, its rules were copied in 5 places and changed 4 times in 6 days | M1 retro |
| 2026-10-26 | Every pull request opens ready for review | Maintainer's decision after story 001: the draft added a step and protected nothing | M1 retro |
| 2026-10-26 | Documents as simple as possible without losing important information | Maintainer's decision | M1 retro |

## Current state

Replaced at the end of every session. Five items, 12 lines at most.

- **Milestone:** M0, 5 of 6 stories done; M1, 5 of 8.
- **Current story:** 009, E4.6 map of the itineraries (ADR-0005), and 010, E4.7 readable on a phone, in review.
- **Follow-ups after merge:** make `ci` and `pr-title` required in the `main` ruleset; install the Renovate app; run the `osm` workflow once to create `osm-gironde`.
- **Next:** E1.2 delivery, which needs the maintainer on the server; E4.4 when; E1.3 budgets in CI.
- **Blockers:** none.
