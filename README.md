# maillon

Door-to-door trip planner for Bordeaux. It compares walking, cycling, public transport, and public transport with your bike on board: the tram outside peak hours, the TER and Le Bato, never the bus.

> Status: under construction (M0); [docs/README.md](docs/README.md) says where the project stands.

## Run it

With Docker only: `docker compose up -d`, then open http://localhost:4321. [AGENTS.md](AGENTS.md) lists the other commands.

## Why

In Bordeaux you can take your bike on the tram outside peak hours, on the TER and on Le Bato, but the open data does not say so: the TBM timetables give "no information" about bikes for every tram trip, so trip planners never suggest it. maillon applies the network's published rules and puts the four options side by side, on one screen.

## Documentation

- [Brief](docs/brief.md): the problem, the audience, the scope.
- [PRD](docs/prd.md): what each milestone delivers, as behaviour.
- [Architecture](docs/architecture.md) and its [decisions](docs/adr/).
- [Workflow](docs/README.md): how the work is done with AI agents, and how the method itself improves.

## Data

- TBM timetables, [Licence Ouverte](https://www.etalab.gouv.fr/licence-ouverte-open-licence/)
- SNCF timetables, ODbL
- © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, ODbL

## License

The code is under the [MIT License](LICENSE).
