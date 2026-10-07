# RM & Co. website

Public website for RM & Co., including the RM Digital portfolio.

## Business lines

- RM Digital: owner of FleetOrbit, Shopping Lyst, OpenWheels and Orbit eDrive; also home to the Field Force product.
- RM Mobility
- RM Capital
- RM Industrial
- RM Risk: launching soon, with planned focus on enterprise and operational risk, GRC, insurance and claims advisory, fleet and mobility risk, supplier risk, health and safety, and business continuity.

Orbit eDrive is a focused FleetOrbit edition for SME fleet and rent-to-own operators. Its complete commercial workflow remains in development. Public copy must distinguish planned scope from available capabilities; the Value Car Hire implementation does not establish general launch readiness.

## Development

Requires Node.js 22.13 or later. Run `npm run dev -- --port 4174` for local preview and `npm test` for the production build and rendered-page checks.

Production domain: https://rmandco.co.za. The linked Sites project is recorded in `.openai/hosting.json`; a separate Vercel project is also configured locally. Verify the active production host before publishing.

## Logos

Pages display trimmed derivatives from `public/brand/web/`, rendered by `app/components/Logo.tsx`. They are generated from the approved originals in `public/brand/` by `python3 scripts/build-web-logos.py` (needs Pillow); do not edit them or `app/components/logo-data.ts` by hand. Size logos in CSS by setting `--area` (visual area) in the surrounding context rather than a fixed width, so every logo carries equal weight.

## Egoli client demo

The RM Industrial section on `/businesses/` links to `/businesses/rm-industrial/egoli/`. The self-contained demo is served from `public/businesses/rm-industrial/egoli/`, copied from the neighbouring `rm-industrial-egoli/dist/` project. Its header identifies a public client demo, with a return link to the business section. Scenario values are illustrative and stored only in the visitor’s browser. No source PDFs are published.


### Egoli workflow twin

`/businesses/rm-industrial/egoli/twin/` is a discrete-time scenario simulator, not a connected or validated plant twin. Its source of truth lives in this repository under `public/businesses/rm-industrial/egoli/twin*`; avoid overwriting these files when copying the neighbouring demo. The 3D layout is illustrative. Operating parameters, roles, shifts and demand are unconfirmed assumptions, editable in Model basis.

The engine uses quarter-hour ticks, separate deterministic random streams, finite buffers, explicit quality dispositions, material/kit conservation, whole-unit dispatch, due-date orders and a seven-day due-cohort OTIF. BE denotes bottle equivalent at finished strength, not a verified bottle size or spirit ABV. Held lots require a simulated decision after the assumed review delay; they never release automatically. Queue pressure suggests a constraint candidate and does not establish causality.

Experiment lab compares fresh fourteen-day baseline and intervention runs using identical opening stocks, seed and stochastic streams. It excludes ad hoc disruptions and operator decisions in the inspection run. One-seed results are illustrative; investment decisions require calibrated inputs and replicated trials. Exports contain the configuration, run ledger, orders, lots and recorded dispositions. No plant commands are issued. Aggregate tank occupancy does not enforce physical vessel assignment; CIP, recipes, energy, shared labour and financial valuation are outside scope.

Three.js 0.160.0 and OrbitControls are vendored locally under `vendor/` with the MIT licence. Google Fonts are optional with system fallbacks. The inspector and simulator remain usable without WebGL. `npm test` builds the site and runs rendered-export and simulation-integrity tests, including conservation across multiple seeds and disruptions, capacity bounds, holds, dispatch schedules and repeatability.
