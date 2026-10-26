# Product requirements

> Behaviour only: no checkboxes, file names or implementation choices, and at most 5 criteria per story. Progress lives in `stories/` and in *Current state* (`README.md`).

## Goals

The three simplicity measures of the brief: at most 3 interactions to the first result, under 2 s at p95, at least 4 testers out of 5 under a minute.

## Non-functional requirements

| Id | Requirement | Checked by | From |
|---|---|---|---|
| NFR1 | RGAA 4.1.2 AA on the main path: search, results, route detail | axe in CI with no violation; at each milestone, a manual check with the keyboard, VoiceOver, 200 % zoom and a 320 px width | M1 |
| NFR2 | RGESN: the search and results pages work without JavaScript and stay under 50 kB of compressed JavaScript and 200 kB transferred, the map excluded | Budget check in CI | M1 |
| NFR3 | A search answers in under 2 s at p95 | CI on the golden routes, then production | M1 |
| NFR4 | The timetables served are less than 48 h old | After every deploy, and each night | M0 |
| NFR5 | Production runs the very image tested in CI, and a smoke test follows every deploy | CI and the deploy workflow | M0 |
| NFR6 | Every page credits OpenStreetMap (ODbL), TBM and SNCF | Test | M0 |

## Golden routes

A golden route is a search (from, to, date and time, profile) with **expected properties**, never exact minutes. CI runs them on a frozen dataset. There are 5 at the end of M0 and 10 at the end of M1; each story lists the ones it adds. The stops of GR1 and GR4 are chosen in E2.1.

| Id | Search | Profile | Expected |
|---|---|---|---|
| GR1 | A route where a bus would be the fastest | Transit + bike | No bus leg |
| GR2 | Gare Saint-Jean → Place de la Bourse, a Tuesday at 8:00 | Transit + bike | No tram leg (peak hour) |
| GR3 | The same at 10:30 | Transit + bike | A tram leg is proposed |
| GR4 | Between two Bato piers on opposite banks, far from a bridge | Transit + bike | Le Bato is proposed |
| GR5 | Pessac → Gare Saint-Jean | Transit + bike | A TER leg is proposed |

## M0: skeleton online

### E2.1 Routing engine (spike)

- Given GR1 to GR5 and the TBM data with its bike rules applied, when they run on MOTIS 2, then each expected property holds, or the gap is recorded.
- Given the TBM data as published, when GR3 runs, then no tram is proposed with a bike: the problem is reproduced.
- Given MOTIS fails a property, or needs more memory or import time than the server can give, when the same routes run on OpenTripPlanner 2, then both engines are compared on them.
- Given the stop and address names of the golden routes, when they are searched through the engine's geocoder and through the BAN, then the engine ADR says which one serves M1.
- Given the spike is over, then the engine ADR records import time, memory, and response time per route.

### E1.1 Application skeleton and quality gates

- Given a fresh clone and only Docker installed, when the maintainer runs one command, then the app answers locally.
- Given a pull request, when types, lint, unit tests or the boundary rules fail, then the `ci` check is red and the pull request cannot be merged.
- Given code in the domain that imports an adapter, when CI runs, then it fails; this is proven once by a deliberate violation.
- Given a pull request title that is not a Conventional Commit, then the pull request cannot be merged.
- Given a newer version of a dependency or base image, then an automated pull request proposes it.

### E1.2 Delivery

- Given a published release, then the image built and tested in CI is deployed on the server with no manual step.
- Given a deploy, when it ends, then a golden route runs against production and the data freshness is checked; a failure alerts the maintainer.
- Given a bad release, when the maintainer asks for a rollback, then the previous version serves again after one command.

### E2.2 Nightly data and bike rules

- Given the nightly run, when the TBM, TER and OSM downloads pass validation, then the engine serves the new data with no interruption.
- Given a download or a validation fails, or the data served gets older than 48 h, then the engine keeps the previous data and the maintainer is alerted.
- Given the bike rules, when the data is prepared, then no bus trip allows bikes, nor any tram trip that overlaps a peak window; the other tram, train and Bato trips do.
- Given a bike rule, then it states its source and the date it was last checked.

### E2.3 Golden routes in CI

- Given a golden route, when CI runs, then the engine runs it on the frozen dataset and checks every expected property.
- Given bikes allowed on buses on purpose, when CI runs, then it fails; this is proven once.
- Given the frozen dataset, then a golden route gives the same result on every run, whatever today's date.
- Given GR1 to GR5, then all of them pass.

### E3.1 First search online

- Given the search page, when a person types the names of two stops and submits, then the next transit itinerary is shown as text: each leg with its line, times and stops.
- Given a search, then its URL holds the whole search, so reloading or sharing it shows the same results.
- Given JavaScript is off, then the search works the same.
- Given the engine is down or finds nothing, then a plain message says so and the form keeps its values.

## M1: comparator

### E4.1 Places: address, stop or my position

- Given a person types part of an address or a stop name, then suggestions appear and can be chosen with the keyboard or a screen reader.
- Given JavaScript is off, when the form is sent with free text, then the server picks the best match and shows which place it used, with a way to correct it.
- Given a person chooses "my position" and allows it, then the from field holds their location; if they refuse, a message says how to type an address instead.
- Given a place outside the area the data covers, then a message says so and no search runs.

### E4.2 Four options on one screen

- Given a search, then walk, bike, transit and transit + bike are shown together, each with its duration, arrival time and number of changes, sorted by arrival.
- Given two options arrive at the same time, then the one with fewer changes comes first.
- Given an option has no result (too far to walk, no transit at night), then its card says why instead of disappearing.

### E4.3 Bike on board

- Given transit + bike, then no option uses a bus, nor a tram trip that overlaps a peak window.
- Given the folding bike option, then buses are allowed with the bike.
- Given an option with the bike on the tram, then it says that TBM accepts bikes "if crowding allows".
- Given an option with the bike on Le Bato, then it says that a crossing takes 10 bikes at most.

### E4.4 When

- Given no time is chosen, then the search is for now.
- Given "leave at" or "arrive by" with a date and a time, then every option leaves after it or arrives before it.
- Given a date that the timetables do not cover, then a message gives the dates covered and no search runs.

### E4.5 Route detail as text

- Given an option, when the person opens it, then every step is listed in order: walk or ride with distance and duration, board a line towards its destination at a stop and a time, get off at a stop.
- Given a route detail, then it has its own URL that can be shared.

### E4.6 Map on request

- Given a route detail, when the person asks for the map, then the route is drawn on it; until then, no map code or tile is loaded.
- Given the map is open, then it closes with the keyboard and the text detail stays on the page.

### E1.3 Accessibility, budgets and speed in CI

- Given a change to the search, results or detail page, when CI runs, then axe reports no violation, or CI fails.
- Given a page over a budget of NFR2, then CI fails.
- Given the golden routes, then CI reports the search's p95 and fails above NFR3.

## M2: trust and launch

Criteria are written at the M1 retro.

- E5.1 Real-time delays from the TBM trip updates (GTFS-RT) for departures in the near future.
- E5.2 "Ce trajet vous semble faux ?": a prefilled issue holding the search URL, turned into a golden route.
- E5.3 RGAA and RGESN statements, "partially compliant".
- E5.4 A public domain name, and the launch.

## Later

- Favourites and recent trips, stored in the browser; an installable PWA.
- Bike sharing (V³, GBFS).
- Bike parking at stations.
- Traffic alerts.
- A second city, by configuration.
