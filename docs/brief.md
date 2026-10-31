# Project brief

> Status: agreed on 2026-10-26. One page at most.

## Problem

In Bordeaux, a bike and public transport go well together: the bike rides the tram outside peak hours, the TER and Le Bato. Trip planners do not know it. The TBM open data says "no information" about bikes for every tram trip, which routing engines read as "not allowed", so they never suggest the tram with a bike. Comparing walking, cycling and transit takes three apps and some guessing.

## What maillon does

One form, one screen. From a place to a place, now or at a chosen time over the coming days, it compares the door-to-door options: walk, bike, transit, transit with the bike on board. The options are sorted by arrival time.

## Audience

1. People in Bordeaux Métropole who own a bike and use TBM, mostly on a phone and often in a hurry.
2. People reading the public repository. No extra showcase work is done for them.

## Value: simplicity, measured

- At most 3 interactions from opening the page to the first result.
- An answer in under 2 s at the 95th percentile.
- In a usability test, at least 4 people out of 5 complete "go from X to Y with your bike, leaving in an hour" in under a minute, without help.

## MVP scope (M1 and M2)

- From and to: an address, a stop name or "my position".
- When: now, leave at or arrive by, on any date the timetables cover.
- Walk, bike, transit, transit + bike, and a folding bike option that allows the bus.
- Step-by-step text; the best option's map with the results, the others on request.
- Real-time delays for departures in the near future (M2).

## Out of scope for the MVP

Accounts, anything stored on a server for a person, bike sharing (V³), bike parking, traffic alerts, mobile apps, cities other than Bordeaux. They wait in the PRD's *Later* section.

## Data facts (checked on 2026-10-26)

- TBM GTFS: valid from 2026-10-24 to 2027-01-22, updated daily. `bikes_allowed` is 0 for all 15,210 tram trips and 51,768 bus trips, and 1 for the 1,556 Bato trips (lines 951 to 953).
- TBM rules: no bikes on the tram from 7 to 9 am and from 4 to 7 pm, every day, allowed otherwise "if crowding allows"; no bikes on buses unless folded; 6 bikes per boat on Le Bato (Bordeaux Métropole; another TBM page said 10).
- The TBM feed has no trains: the SNCF GTFS (ODbL) is needed. It has no `bikes_allowed` column at all. TER Nouvelle-Aquitaine takes bikes for free outside summer, with a €3 bike ticket on 11 lines from 1 May to 27 September.

## Success criteria

- The usability target above is met in M2.
- A route reported wrong becomes a golden route before its fix and never breaks again.
- RGAA and RGESN statements are published, honestly "partially compliant".
