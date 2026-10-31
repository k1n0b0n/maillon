# Story 002: Application skeleton and quality gates

- **PRD:** E1.1 (the criteria live there)
- **Status:** Done
- **Golden routes:** none yet (E2.3)
- **Budgets touched:** none (E1.3)

## Plan

1. Astro in server mode with its Docker image (dev and production targets) and `compose.yaml`.
2. The search form and its URL, parsed by the domain; `/health` asks the engine through an adapter.
3. `npm run check`: types, ESLint, dependency-cruiser, Vitest; CI runs it, audits the production dependencies, and smoke-tests the production image.
4. The PR title check, Renovate, ADR-0002 (stack) and ADR-0003 (responsible design).
5. Prove the boundary with a deliberate violation in CI.

## Notes

- The boundary failed CI on purpose: a domain file importing the MOTIS adapter (see the pull request's checks).
- `astro:env` modules are virtual: dependency-cruiser ignores `astro:*`, and tests may import Vitest from the domain.
- CodeRabbit skips a pull request whose base is not `main`: `base_branches` now lets it review stacked ones.
- The `ci` and `pr-title` checks become required in the `main` ruleset once this story is merged; Renovate needs its GitHub App on the repository.

**Measure:** home page 2,052 bytes of HTML and no JavaScript; production image 428 MB.
