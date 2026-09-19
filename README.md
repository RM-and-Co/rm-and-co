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
