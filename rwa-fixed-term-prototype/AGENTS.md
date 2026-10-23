# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Prototype decisions

- Match the live `rwa.dforce.network` product shell and dark visual system; use its captured assets rather than redesigning it.
- The prototype models a fixed-rate RWA vault with deposits open during the interest period and a weekly UTC withdrawal-request anchor.
- Withdrawal requests are irreversible, may be added multiple times per Epoch, and lock shares until the Epoch is settled and claimed.
- Settlement is permissionless, atomic for the full Epoch, and may be triggered by the first claimant; insufficient liquidity leaves the Epoch pending.
- The final week accepts no withdrawal requests; normal redeem resumes after maturity.
- Interest settlement uses option A: interest stops accruing exactly at the weekly anchor, regardless of when the epoch is settled.
- Direct transfers to the queue are unsupported and have no recovery flow.
- Earn vault rows show concise product-feature descriptions beneath the vault name.
