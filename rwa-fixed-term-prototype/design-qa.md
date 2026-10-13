# Design QA

## Reference and implementation

- Source: live `https://rwa.dforce.network/` in connected-wallet state.
- Source captures: `/tmp/rwa-source-earn.png`, `/tmp/rwa-source-detail.png`, `/tmp/rwa-source-earn-mobile.png`, `/tmp/rwa-source-detail-mobile.png`.
- Implementation captures: `/tmp/rwa-prototype-earn.png`, `/tmp/rwa-prototype-detail.png`, `/tmp/rwa-prototype-earn-mobile.png`, `/tmp/rwa-prototype-detail-mobile.png`.
- Side-by-side comparisons: `/tmp/rwa-detail-comparison.jpg`, `/tmp/rwa-detail-mobile-comparison.jpg`.

## Viewports and normalization

- Source desktop capture: 1469 px wide; implementation desktop capture: 1280 px wide. Compared after proportional height normalization.
- Source and implementation mobile captures: 390 px CSS viewport width.
- Mobile horizontal overflow: none (`scrollWidth = innerWidth = 390`) on both Earn and vault detail views.
- State: connected wallet, Conflux eSpace, active Earn product, weekly-withdrawal tab selected.

## Visual comparison

- Reused the live product's Onest font, dForce logo, Conflux/USDT/curator icons, social icons, and animated background.
- Preserved the rounded dark navigation shell, neon-green active/action color, dark card hierarchy, typography scale, table density, footer, and responsive stacking behavior.
- Intentional differences are limited to the new S3 fixed-term content: term schedule, weekly withdrawal request controls, the merged epoch entries replacing the APY chart, confirmation modals, and claim settlement flow.
- Mobile keeps the source product's compact header and single-column detail layout without clipping.

## Interaction verification

- Earn product row opens the S3 vault detail.
- Multiple withdrawal requests aggregate into Epoch #42 (2,500 to 3,500 USDT in the test).
- Withdrawal confirmation states that the request is irreversible and identifies the weekly UTC window.
- Claim opens the permissionless whole-epoch settlement confirmation; completion changes Epoch #41 from Claimable to Claimed.
- Wallet account modal opens and Copy address changes to Copied.
- Earn/Borrow navigation works; Borrow remains a reference-only screen.
- Supplied balance reconciles into pending, exact claimable, and accruing underlying amounts; new requests reduce the accruing amount.
- Prototype state selector covers regular epoch, last epoch, and matured states. Last epoch blocks requests with a maturity notice; matured enables direct withdrawal.
- Withdrawal requests remain visible in every lifecycle state, conditionally showing pending/claimable data or a state-specific empty message.
- Browser console: no warnings or errors.
- `npm run build`: passed.
- `npm run test:sites`: 4/4 passed.

## Product-decision boundary

- Interest settlement uses option A: interest stops exactly at the weekly anchor, even if settlement happens later.
- Only one pending and one claimable entry are displayed; requests with the same epoch and status merge into that entry.
- Wallet, RPC, approvals, and transactions are mocked local UI state; no onchain writes are performed.

final result: passed
