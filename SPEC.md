# StealthBooks Specification

## 1. Product Overview

**StealthBooks** is a privacy-native B2B billing application for Solana. It lets crypto-native businesses issue invoices in USDC, receive payment through Umbra’s privacy infrastructure, aggregate receivables into private balances, and selectively disclose only the records needed for accountants or auditors.

The product is intentionally not a wallet clone. It is a business workflow tool built around invoice issuance, payer checkout, claim management, private treasury visibility, settlement, and compliance-safe disclosure. Umbra is not an add-on feature; it is the settlement and privacy layer that makes the product meaningful.

The MVP is optimized for the Umbra side track and for a 5-week build window. It focuses on one sharp use case: repeat business payments for crypto-native organizations that want onchain settlement without exposing counterparties, receivable flows, and treasury behavior on a public ledger.

## 2. Problem Statement

Crypto-native businesses increasingly settle invoices in stablecoins, but public blockchains expose sensitive commercial information:

- customer and vendor relationships
- invoice frequency and timing
- receivables behavior
- treasury aggregation patterns
- settlement destinations

Generic wallet-based payment tools solve settlement, not privacy. Existing crypto invoice tools usually push the payer to send funds to a visible wallet address, making commercial metadata easy to infer. For agencies, DAOs, OTC desks, and service firms, this is a real operational and competitive problem.

StealthBooks solves that problem by separating:

- offchain business records: invoice metadata, line items, customer name, notes, status, attachments
- onchain private settlement: receiver-claimable UTXOs, encrypted balances, private claims, and selective disclosure through Umbra

## 3. Why This Wins the Umbra Track

StealthBooks is a strong Umbra-track candidate because it maps directly to the sponsor’s stated goals:

- It uses Umbra to build a real financial product, not a private wallet.
- It uses the core privacy primitives as the heart of the product: registration, receiver-claimable UTXOs, encrypted balances, relayer-backed claims, and selective transparency.
- It addresses a painful business problem with immediate buyer value.
- It is demoable in under 5 minutes with a clear beginning, middle, and end.
- It has credible startup potential as B2B software with usage-based revenue.

The judge-facing narrative is simple: "StealthBooks turns Umbra from protocol infrastructure into private accounts receivable software."

## 4. Hackathon Fit and Judging Strategy

### Core Integration of Umbra SDK

StealthBooks cannot function as intended without Umbra. Private settlement, claim workflows, private balance aggregation, and disclosure primitives are all core product behavior, not side features.

### Innovation

The product is differentiated from:

- private wallet demos
- one-off payment links
- generic "privacy infrastructure dashboard" ideas

It applies Umbra to a full B2B workflow where the buyer is obvious and the pain is concrete.

### Technical Execution

The MVP is scoped to a single web application with:

- strict TypeScript boundaries
- end-to-end schema validation
- client-side proof and claim handling
- clear separation between offchain app state and onchain private state
- explicit fallback states for proving, relayer, indexer, and reconciliation failures

### Product and Commercial Potential

The first customer profile is realistic: crypto-native organizations already invoicing in stablecoins but still managing privacy manually through spreadsheets, side wallets, and ad hoc treasury movements.

### Impact

The product reduces onchain business-intelligence leakage without giving up stablecoin settlement.

### Usability and Experience

The UI is a premium, desktop-first, finance-grade application with guided readiness checks, fee explanation, registration preflights, claim management, and disclosure UX designed around irreversible privacy decisions.

### Completeness and Clarity

The build is intentionally narrow:

- USDC only in MVP
- one primary invoice settlement flow
- one claim inbox
- one settlement workflow
- one disclosure workflow

That narrowness improves completeness, polish, and demo quality.


1. **Checkpointing:**  you must do Maintain a clean, professional commit history for every major architectural checkpoint    by  pushing to local git at every  checkpoint 
2. **Documentation:** Produce a comprehensive `README.md` containing precise installation instructions, high-level architectural diagrams, and exact dependency requirements.
3. **Environment Setup:** You must provide a highly detailed `.env.example` file clearly defining required variables . 
4. Make shore codebase well-structured, readable, and easy to maintain  or extend

## 5. Source-of-Truth Constraints from Official Umbra Resources




- Use the provided hackathon resources as the absolute source of truth.
- RULE: If any idea in this prompt conflicts with the official docs, the official docs win.

The specification is constrained by the official Umbra track and docs:

- Track objective: build a real financial product or prototype using Umbra SDK and privacy primitives.
- Official resources: Umbra SDK, developer docs, website, and Umbra side track listing.
- Core primitives: Encrypted Token Accounts, Unified Mixer Pool, hybrid UTXO plus account model, selective transparency.
- Supported developer path: SDK plus registration flow, query flow, indexer-assisted UTXO discovery, relayer-assisted claiming, and browser-side proving where required.
- Supported pools: USDC, USDT, wSOL, UMBRA. MVP uses USDC only.
- Registration is required before encrypted deposits or receiver-claimable UTXOs can work.
- UTXO discovery depends on the indexer.
- Proof generation is not instant and must be treated as a real UX state.
- Umbra fees make this a poor fit for micropayments; B2B settlement is the correct product fit.
- The sponsor explicitly wants ideas beyond Umbra’s existing private wallet.

Additional implementation corrections based on the docs:

- The MVP does not depend on confidential-only account-to-account transfers because those flows are not the strongest documented path for this product today.
- The MVP does not promise a fully automated third-party auditor decryption console for arbitrary Umbra history. The official selective-transparency docs support scoped mixer viewing keys and X25519 compliance grants, but some auditor-side utilities are still presented as roadmap-level. Therefore the MVP disclosure experience centers on controlled artifact generation and grant management, not unsupported "magic decrypt everything" claims.
- The MVP does not claim that invoice metadata becomes private onchain. Invoice metadata remains offchain; Umbra protects settlement flows and private balances.

Source links:

- [Umbra Side Track](https://superteam.fun/earn/listing/umbra-side-track)
- [Umbra SDK](https://sdk.umbraprivacy.com/)
- [Quickstart](https://sdk.umbraprivacy.com/quickstart)
- [Registration](https://sdk.umbraprivacy.com/sdk/registration)
- [Query](https://sdk.umbraprivacy.com/sdk/query)
- [Creating UTXOs](https://sdk.umbraprivacy.com/sdk/mixer/creating-utxos)
- [Fetching UTXOs](https://sdk.umbraprivacy.com/sdk/mixer/fetching-utxos)
- [Supported Tokens](https://sdk.umbraprivacy.com/supported-tokens)
- [Pricing](https://sdk.umbraprivacy.com/pricing)
- [What Is Umbra](https://docs.umbraprivacy.com/docs/introduction/what-is-umbra)
- [Encrypted Token Accounts](https://docs.umbraprivacy.com/docs/core-concepts/encrypted-token-accounts)
- [Unified Mixer Pool](https://docs.umbraprivacy.com/docs/core-concepts/unified-mixer-pool)
- [Hybrid Model](https://docs.umbraprivacy.com/docs/core-concepts/hybrid-model)
- [Selective Transparency](https://docs.umbraprivacy.com/docs/core-concepts/selective-transparency)
- [Umbra Website](https://www.umbraprivacy.com/)

## 6. Target Users and User Roles

### Primary Target Users

- crypto agencies invoicing clients in stablecoins
- service DAOs with recurring counterparties
- OTC or advisory businesses with sensitive customer relationships
- stablecoin-native businesses that want private receivables and private treasury aggregation

### Secondary Users

- external payers paying an invoice link
- external accountant or auditor receiving a scoped disclosure package

### MVP User Roles

`OWNER`
- creates organization
- manages members
- manages disclosure settings
- can perform all operational actions

`FINANCE_OPERATOR`
- creates and approves invoices
- manages claims
- views balances
- initiates withdrawals
- generates disclosure packages

`REVIEWER`
- read-only access to invoices, dashboard, disclosures, and audit history
- no onchain operations

`EXTERNAL_PAYER`
- views a public invoice checkout page
- connects a wallet
- completes registration if needed
- pays a single invoice

`EXTERNAL_AUDITOR`
- accesses a time-bound disclosure portal
- views generated report artifacts and disclosure metadata
- never gets broad application access

### Role Boundary Decision

MVP supports offchain org membership, but only one connected treasury/operator wallet is assumed to perform private claims and withdrawals for a given org during the demo. Complex multisig treasury orchestration is out of scope.

## 7. MVP Scope

The MVP includes:

- wallet-based organization onboarding
- Umbra readiness checks for the receiving organization
- invoice draft, approval, and shareable checkout link generation
- payer checkout with registration preflight and fee explanation
- private settlement using a receiver-claimable UTXO to the vendor
- client-side claim inbox backed by the Umbra indexer
- relayer-assisted claims into the vendor’s encrypted balance
- private balance dashboard for the vendor
- withdrawal from encrypted balance to a public USDC token account
- scoped disclosure generation and read-only disclosure portal
- audit event history and invoice-to-payment reconciliation

The MVP is USDC-only.

## 8. Non-Goals

The MVP does not include:

- consumer wallet behavior
- generic payment app features
- NFT or token-launch functionality
- payroll as a separate module
- tax filing as a separate module
- private swaps
- multi-chain support
- fiat rails
- custody of user keys on the backend
- mobile app
- DAO multisig execution flows
- automatic full-history third-party decryption tools beyond what the official Umbra docs safely support
- direct confidential-only transfer rail as the main product path

## 9. Core User Journeys

### Journey A: Organization Readiness

1. Owner connects wallet.
2. Owner signs in with wallet signature.
3. Owner creates an organization profile.
4. App checks whether the org’s operational wallet is Umbra-registered for the required privacy flows.
5. If not registered, app guides the user through registration before any invoice can be published.
6. User lands on a readiness screen confirming:
   - supported mint: USDC
   - registration state
   - current cluster
   - fee model
   - capabilities available in MVP

### Journey B: Invoice Creation and Distribution

1. Finance operator creates a draft invoice.
2. Invoice metadata is stored offchain.
3. Operator approves the invoice.
4. App generates a public invoice token and checkout link.
5. Invoice becomes payable.

### Journey C: Payer Checkout

1. External payer opens the checkout link.
2. Payer reviews invoice summary and fee explanation.
3. Payer connects wallet.
4. App checks payer Umbra registration status.
5. If not registered, app guides payer through registration.
6. Payer confirms payment.
7. App creates a receiver-claimable UTXO for the vendor.
8. App records payment intent and onchain reference.
9. Payer sees payment submitted and then confirmed.
10. Invoice status moves to `PAID_UNCLAIMED`.

### Journey D: Vendor Claim to Private Balance

1. Finance operator opens claims inbox.
2. Client scans for claimable UTXOs using the indexer.
3. App lists discovered claims linked to invoices where possible.
4. Operator selects one or more claims.
5. App claims selected UTXOs into the vendor’s encrypted balance using the relayer path.
6. App records claim events and updates invoice status to `CLAIMED_PRIVATE`.
7. Balance dashboard refreshes.

### Journey E: Settlement Withdrawal

1. Finance operator opens settlement page.
2. User sees current encrypted balance and available withdrawal amount.
3. User picks a destination public USDC token account.
4. User previews fees and final output amount.
5. User signs withdrawal.
6. App records the withdrawal event and updates settlement history.

### Journey F: Disclosure for Accountant or Auditor

1. Finance operator selects an invoice or date range.
2. App explains disclosure scope and irrevocability tradeoffs.
3. User chooses one of two supported disclosure types:
   - report package with invoice metadata plus mapped onchain references
   - scoped privacy artifacts generated from supported Umbra viewing primitives
4. App creates a time-bound disclosure session.
5. Read-only portal is shared with external reviewer.
6. Reviewer sees only the intended scope.

## 10. End-to-End Solana and Umbra Flow Mapping

### 10.1 Vendor Readiness Flow

- Vendor operational wallet connects.
- App checks registration state through the Umbra SDK query and registration flow.
- If not registered, the client performs the registration flow before invoices can be published.
- Result is stored offchain as readiness metadata, not as private key material.

### 10.2 Invoice Issuance Flow

- Invoice data is created in Postgres.
- No private invoice data is written onchain.
- A public invoice token is generated and stored hashed in the database.

### 10.3 Primary MVP Payment Flow

The primary MVP payment rail is:

`payer public USDC token account -> receiver-claimable UTXO -> vendor encrypted token account`

This flow is chosen because it is the best balance of:

- documented support
- checkout simplicity
- sponsor-native integration
- ability to finish in 5 weeks

Privacy envelope of the MVP rail:

- hides the vendor’s receiving address from the payer and chain observers
- hides vendor balance aggregation until vendor chooses to withdraw
- weakens payer-to-vendor linkability
- does not fully hide the payer’s outgoing spend amount from the payer side because the spend originates from a public USDC token account

This limitation is made explicit in the product copy and README. A stronger shield-first payer flow is a roadmap item, not a core MVP dependency.

### 10.4 Claim Flow

- Vendor client scans claimable UTXOs using the Umbra indexer.
- Scan runs client-side because the backend does not custody secrets.
- User selects claims and submits a relayer-backed claim into the vendor ETA.
- App records claim metadata and updates linked invoice states.

### 10.5 Balance Query Flow

- Vendor client queries encrypted USDC balance using Umbra SDK.
- Exact decrypted private balances are rendered client-side.
- Backend stores only optional redacted snapshot metadata for audit and freshness tracking.

### 10.6 Withdrawal Flow

- Vendor initiates withdrawal from ETA to a chosen public USDC token account.
- App previews fees and expected output before signing.
- On success, settlement event is recorded offchain.

### 10.7 Disclosure Flow

- Invoice metadata always comes from the app database.
- Onchain settlement evidence comes from stored Umbra transaction mappings.
- When the user requests a disclosure package, the client assembles:
  - selected invoice records
  - linked payment and claim references
  - human-readable reconciliation summary
  - optional exported viewing artifacts where the docs support them
- Backend stores the resulting artifact package encrypted at rest and scoped to a disclosure session.

## 11. Functional Requirements

### 11.1 Organization and Readiness

- The system must allow wallet-based sign-in.
- The system must allow creation of an organization with name, slug, and operational wallet.
- The system must track org readiness status for Umbra-dependent actions.
- The system must block invoice publication if the vendor operational wallet is not properly registered.
- The system must display supported mint availability and current cluster.
- The system must explain that exact privacy guarantees depend on the chosen payment rail.

### 11.2 Invoices

- The system must support draft creation.
- The system must support editing drafts until approval.
- The system must support line items, due date, memo, internal note, and counterparty display name.
- The system must generate a unique invoice number per organization.
- The system must support approval and public checkout token generation.
- The system must support voiding an unpaid invoice.
- The system must support invoice status transitions.
- The system must support linking one invoice to one active payment intent at a time in MVP.

### 11.3 Checkout

- The system must expose a public checkout page for an approved invoice.
- The system must require wallet connection before payment.
- The system must check payer registration state before payment.
- The system must support payer registration inline.
- The system must show fee estimate before the payer signs.
- The system must create a receiver-claimable UTXO to the vendor.
- The system must record a payment intent and tx signature after submission.
- The system must handle refresh/reopen during payment confirmation without duplicating records.

### 11.4 Claims

- The system must provide a claim inbox for the vendor.
- The system must scan claimable UTXOs client-side using the Umbra indexer.
- The system must persist claim scan cursor client-side by org, wallet, cluster, and mint.
- The system must allow single or batch claim.
- The system must support relayer-backed claim into ETA.
- The system must deduplicate already-recorded or already-claimed UTXOs.
- The system must allow manual rescan.

### 11.5 Private Balance

- The system must display current encrypted USDC balance client-side.
- The system must display pending inbound invoice value not yet claimed.
- The system must display recent claim and withdrawal activity.
- The system must display freshness and last-updated indicators.

### 11.6 Settlement

- The system must allow withdrawal from encrypted balance to a public USDC token account.
- The system must validate destination token account compatibility.
- The system must preview fees and resulting amount.
- The system must record settlement metadata for audit.

### 11.7 Disclosure

- The system must allow disclosure scoped by invoice or date range.
- The system must support generation of a disclosure session with expiry.
- The system must show irreversible warnings before any export of non-revocable viewing material.
- The system must support report package generation for accountant review.
- The system must support recording issuance and revocation state for compliance grants where used.
- The system must support a read-only disclosure portal.

### 11.8 Audit and Reporting

- The system must maintain a redacted audit log of key actions.
- The system must show invoice-to-payment reconciliation status.
- The system must allow filtering by invoice status, payment state, and disclosure history.

## 12. Non-Functional Requirements

- Desktop-first responsive web application.
- Production-quality visual polish suitable for a hackathon demo.
- Full TypeScript coverage.
- No backend custody of wallet private keys or Umbra private viewing secrets.
- Explicit error and retry states for every wallet or network-dependent action.
- Target median page load under 2 seconds on broadband after warm cache.
- Target interactive readiness under 3 seconds for dashboard routes after auth.
- Proving and chain-dependent flows must remain responsive and never freeze the UI thread.
- The app must degrade gracefully when the relayer or indexer is slow.

## 13. Information Architecture

Primary navigation groups:

- Dashboard
- Invoices
- Claims
- Balances
- Settlements
- Disclosures
- Settings

Secondary concepts:

- Counterparties
- Audit events
- Organization readiness

Navigation rules:

- Unauthenticated org users land on `/`.
- First-time org users are routed to `/onboarding`.
- Authenticated and ready users default to `/dashboard`.
- External payers use `/checkout/[publicInvoiceToken]`.
- External auditors use `/disclosures/[shareId]`.

## 14. Page-by-Page UX Specification

### `/`

- User role: unauthenticated org user or returning user
- Purpose: app-first entry and session gateway
- Primary actions: connect wallet, continue to onboarding, resume session
- Modules: brand header, concise value panel, readiness explainer, wallet connect card
- State variants:
  - disconnected
  - connected no session
  - active session redirecting
- Empty/loading/error/success:
  - loading session skeleton
  - wallet error toast
  - successful session redirect
- Wallet and onchain interaction:
  - wallet connect only
- Responsive behavior:
  - single-column on mobile
  - centered split panel on desktop
- Demo significance:
  - establishes this is a product UI, not a marketing site

### `/onboarding`

- User role: owner
- Purpose: create org and complete Umbra readiness
- Primary actions: create org, run registration check, complete registration
- Modules: stepper, org form, readiness card, mint support panel, fee explainer
- State variants:
  - no org
  - org created not registered
  - registration in progress
  - ready
- Empty/loading/error/success:
  - initial empty wizard
  - registration spinner with progress text
  - retry block for failed registration
  - success summary with next-step CTA
- Wallet and onchain interaction:
  - registration state query
  - registration transaction
- Responsive behavior:
  - stacked stepper on narrow screens
  - two-column layout on desktop
- Demo significance:
  - shows required sponsor preflight and UX maturity

### `/dashboard`

- User role: owner, finance operator, reviewer
- Purpose: business overview across invoices, claims, balances, and disclosures
- Primary actions: create invoice, scan claims, refresh balance, open disclosure wizard
- Modules: KPI rail, readiness banner, recent invoices table, claim summary, private balance tile, activity feed
- State variants:
  - ready with data
  - ready no invoices
  - data stale
  - partial sync
- Empty/loading/error/success:
  - first-use empty state driving to invoice creation
  - loading skeleton cards
  - warning banner for stale chain state
  - success toast after refresh
- Wallet and onchain interaction:
  - optional balance refresh
  - optional manual claim scan trigger
- Responsive behavior:
  - stacked KPI cards on tablet/mobile
  - two-row analytics grid on desktop
- Demo significance:
  - gives judges immediate product completeness signal

### `/invoices`

- User role: owner, finance operator, reviewer
- Purpose: list and filter invoices
- Primary actions: new invoice, filter, search, open invoice
- Modules: filter bar, invoices table, status chips, counterparty facets
- State variants:
  - empty
  - populated
  - filtered no result
- Empty/loading/error/success:
  - create-first-invoice empty state
  - table skeleton
  - query error with retry
- Wallet and onchain interaction:
  - none
- Responsive behavior:
  - condensed card list on mobile
  - full table on desktop
- Demo significance:
  - reinforces real billing workflow shape

### `/invoices/new`

- User role: owner, finance operator
- Purpose: create invoice draft
- Primary actions: save draft, approve and generate link
- Modules: invoice header form, line item editor, totals summary, privacy explainer, approval sidebar
- State variants:
  - editing draft
  - validation error
  - saving
  - approved
- Empty/loading/error/success:
  - default blank invoice form
  - inline field errors
  - save spinner
  - generated link confirmation
- Wallet and onchain interaction:
  - optional readiness recheck before approval
- Responsive behavior:
  - form-first single column on narrow screens
  - editor plus sticky summary on desktop
- Demo significance:
  - demonstrates offchain business logic paired with private onchain settlement

### `/invoices/[invoiceId]`

- User role: owner, finance operator, reviewer
- Purpose: inspect invoice, payment state, and disclosure readiness
- Primary actions: edit draft, copy checkout link, void invoice, open payment intent, generate disclosure
- Modules: invoice details panel, payment timeline, checkout link card, reconciliation card, disclosure entrypoint
- State variants:
  - draft
  - approved/open
  - payment submitted
  - paid unclaimed
  - claimed private
  - void
- Empty/loading/error/success:
  - skeleton
  - not-found state
  - success toasts for copied link and status updates
- Wallet and onchain interaction:
  - none directly, except optional readiness checks
- Responsive behavior:
  - stacked detail cards on smaller screens
  - two-column details and timeline on desktop
- Demo significance:
  - ties offchain invoice data to private settlement evidence

### `/checkout/[publicInvoiceToken]`

- User role: external payer
- Purpose: public invoice payment flow
- Primary actions: connect wallet, register if needed, review fees, pay invoice
- Modules: invoice summary, wallet card, registration gate, fee breakdown, proving sheet, confirmation panel
- State variants:
  - public read-only
  - wallet disconnected
  - wallet connected not registered
  - registration pending
  - ready to pay
  - signing
  - confirming
  - success
  - expired/void invoice
- Empty/loading/error/success:
  - loading summary
  - expired token state
  - payment failure drawer with retry guidance
  - success receipt with tx reference
- Wallet and onchain interaction:
  - payer registration query
  - payer registration tx if needed
  - receiver-claimable UTXO creation
- Responsive behavior:
  - single-column flow optimized for laptop and mobile browser
  - sticky fee summary on desktop
- Demo significance:
  - centerpiece flow for sponsor integration and judge comprehension

### `/claims`

- User role: owner, finance operator
- Purpose: discover and claim incoming private payments
- Primary actions: scan, select claims, batch claim, inspect unmatched claims
- Modules: scan banner, claim table, selection toolbar, unmatched warning panel, cursor status chip
- State variants:
  - never scanned
  - scanning
  - no claims found
  - claims found
  - claiming
  - partial claim failure
- Empty/loading/error/success:
  - instructional empty state
  - progress state with discovered count
  - error banner for indexer lag
  - success summary after claim batch
- Wallet and onchain interaction:
  - indexer scan
  - claim tx signing
  - relayer-backed claim submission
- Responsive behavior:
  - compact claim cards on mobile
  - dense selectable table on desktop
- Demo significance:
  - visually proves the Umbra-specific private settlement workflow

### `/balances`

- User role: owner, finance operator, reviewer
- Purpose: show private balance health and pending value
- Primary actions: refresh encrypted balance, inspect recent private activity
- Modules: encrypted balance card, pending claims card, freshness badge, activity timeline
- State variants:
  - loading balance
  - current
  - stale
  - unable to refresh
- Empty/loading/error/success:
  - skeleton
  - stale indicator with manual refresh
  - error card with retry
- Wallet and onchain interaction:
  - encrypted balance query
- Responsive behavior:
  - metric stack on mobile
  - summary plus timeline split on desktop
- Demo significance:
  - demonstrates private treasury aggregation after claims

### `/settlements`

- User role: owner, finance operator
- Purpose: move funds from encrypted balance to a public token account
- Primary actions: choose destination, preview fees, withdraw
- Modules: destination selector, availability card, fee preview, settlement history table
- State variants:
  - insufficient balance
  - ready
  - signing
  - confirming
  - success
- Empty/loading/error/success:
  - no-balance empty state
  - loading spinner for quote
  - retry state on failed withdrawal
  - success receipt
- Wallet and onchain interaction:
  - balance query
  - withdrawal tx
- Responsive behavior:
  - stacked form on mobile
  - form plus history split on desktop
- Demo significance:
  - closes the loop from private receivable to usable treasury funds

### `/disclosures`

- User role: owner, finance operator, reviewer
- Purpose: create and manage disclosure sessions
- Primary actions: create disclosure, view history, revoke revocable session artifacts
- Modules: disclosure wizard, scope selector, artifact list, warning panel, disclosure history table
- State variants:
  - none created
  - draft wizard
  - irreversible warning acknowledged
  - created
  - revoked
  - consumed
- Empty/loading/error/success:
  - educational empty state
  - artifact generation progress
  - failed generation with recovery instructions
  - created share link confirmation
- Wallet and onchain interaction:
  - optional client-side key export or grant creation
- Responsive behavior:
  - wizard stacked on mobile
  - wizard plus history columns on desktop
- Demo significance:
  - directly addresses the track’s compliance and audit angle

### `/disclosures/[shareId]`

- User role: external auditor
- Purpose: read-only disclosure portal
- Primary actions: review report, download artifact package
- Modules: disclosure summary, invoice list, settlement references, artifact download card, expiry banner
- State variants:
  - active
  - expired
  - revoked
  - consumed
- Empty/loading/error/success:
  - invalid-link state
  - portal loading skeleton
  - expired banner
- Wallet and onchain interaction:
  - none in default MVP portal
- Responsive behavior:
  - single-column readable document layout
  - sticky summary sidebar on desktop
- Demo significance:
  - shows selective transparency without pretending to expose more than the docs support

### `/settings`

- User role: owner, finance operator, reviewer
- Purpose: org settings, members, treasury wallet, privacy preferences
- Primary actions: manage members, update display settings, view readiness, rotate public invoice token salts
- Modules: org profile card, member table, readiness panel, security card, cluster display
- State variants:
  - viewer restricted
  - editable
- Empty/loading/error/success:
  - loading skeleton
  - member invite success toast
  - settings save error toast
- Wallet and onchain interaction:
  - optional readiness recheck
- Responsive behavior:
  - stacked settings sections on mobile
  - two-column admin layout on desktop
- Demo significance:
  - completes enterprise-like product shape

## 15. Design System and Glassmorphism UI Spec

### Design Principles

- Serious financial software first, visual novelty second.
- Private actions must feel deliberate and trustworthy.
- High information density without clutter.
- All chain-dependent actions must expose state clearly.
- Warnings around irreversible disclosure must be impossible to miss.

### Visual Direction

- Dark glass foundation with restrained blur
- Crisp typography
- Thin luminous borders
- Cyan-teal privacy accent with muted emerald for success
- Amber for caution and coral for destructive states

### Color Tokens

- Background base: `#0B1020`
- Background elevated: `#121A2D`
- Glass fill strong: `rgba(18, 26, 45, 0.72)`
- Glass fill soft: `rgba(18, 26, 45, 0.56)`
- Border subtle: `rgba(255, 255, 255, 0.10)`
- Border focus: `rgba(90, 196, 255, 0.55)`
- Text primary: `#F4F7FB`
- Text secondary: `#AAB4C8`
- Text muted: `#7C879D`
- Accent primary: `#5AC4FF`
- Accent secondary: `#2FE0B5`
- Success: `#36D399`
- Warning: `#F5B74F`
- Danger: `#FF6B6B`

### Typography

- Primary UI font: `Manrope`
- Numeric and technical data font: `IBM Plex Mono`
- Heading style: medium-to-semibold, tight but readable
- Body style: normal tracking, no negative letter spacing

### Spacing, Radius, Border, and Blur

- Base spacing scale: 4, 8, 12, 16, 24, 32, 40
- Radius:
  - cards: 8px
  - inputs: 8px
  - drawers and modals: 8px
- Border:
  - 1px subtle luminous stroke
- Blur:
  - standard glass panel: 20px backdrop blur
  - modal emphasis: 28px backdrop blur
- Shadow:
  - low elevation: `0 8px 24px rgba(0,0,0,0.28)`
  - high elevation: `0 20px 48px rgba(0,0,0,0.36)`

### Interaction States

- default
- hover
- focus-visible
- active
- selected
- disabled
- loading
- success
- error
- stale
- irreversible-warning

### Motion

- Page transitions: 180ms to 220ms opacity and translate
- Card hover: subtle lift, never bouncy
- Loading skeleton shimmer: low contrast only
- Proving and relayer states: progress timeline animation, not infinite spinner only
- Respect `prefers-reduced-motion`

### Component Inventory

- `AppShell`
- `GlassPanel`
- `MetricTile`
- `StatusBadge`
- `WalletStateCard`
- `ReadinessBanner`
- `SectionToolbar`
- `DataTable`
- `TimelineRail`
- `FeeBreakdownCard`
- `ProvingProgressSheet`
- `ClaimSelectionTable`
- `DisclosureWizard`
- `DisclosureWarningModal`
- `AuditFeed`
- `EmptyStatePanel`
- `ChainFreshnessChip`
- `TxReceiptDrawer`

### Required Global UI States

- wallet disconnected
- wallet connected but not registered
- registration pending
- proving in progress
- signature requested
- transaction pending
- relayer pending
- indexer lag
- no claimable UTXOs
- claimable UTXOs found
- encrypted balance stale
- disclosure issued
- disclosure revoked
- disclosure consumed
- refresh needed

## 16. Frontend Architecture

### Framework

- Next.js App Router
- TypeScript
- Tailwind CSS
- Radix-based primitives via shadcn/ui

### Frontend Structure

- route groups for public, authenticated app, and disclosure portal
- feature-based modules for invoices, claims, balances, disclosures, and Umbra integration
- client components only where wallet, proving, or chain access is required
- server components for fast shell rendering of non-sensitive app data

### Client Responsibilities

- wallet connection
- auth signature
- Umbra readiness queries
- registration execution
- proof generation worker usage where required
- UTXO discovery
- claim execution
- encrypted balance querying
- disclosure artifact generation

### Frontend State Rules

- no private keys in React state snapshots beyond runtime wallet provider usage
- no exact private balances persisted to server by default
- local persisted scan cursors in IndexedDB
- ephemeral progress state in Zustand
- server-sourced business data in TanStack Query

## 17. Backend Architecture

### Application Style

- single Next.js application
- route handlers for business APIs
- Postgres for durable app data
- Prisma ORM

### Backend Responsibilities

- organization and membership persistence
- invoice CRUD and lifecycle rules
- public checkout token issuance and validation
- payment intent creation and reconciliation metadata
- audit logging
- disclosure session management
- encrypted artifact storage metadata

### Backend Non-Responsibilities

- no private key custody
- no server-side claim scanning
- no server-side generic decryption of private balances
- no server-side automatic Umbra actions on behalf of users

### Background Work

MVP avoids heavy infrastructure. Background behavior is limited to:

- polling chain confirmation for known submitted tx signatures
- housekeeping of expired disclosure sessions
- optional recalculation of invoice reconciliation summaries

These can run through lightweight scheduled jobs or route-triggered maintenance.

## 18. Database Schema and Data Model

### `organizations`

- `id`
- `name`
- `slug`
- `primary_mint` fixed to `USDC` in MVP
- `operational_wallet_address`
- `umbra_registered_at`
- `created_by_membership_id`
- `created_at`
- `updated_at`

### `organization_memberships`

- `id`
- `organization_id`
- `wallet_address`
- `role` enum `OWNER | FINANCE_OPERATOR | REVIEWER`
- `status` enum `ACTIVE | PENDING | REMOVED`
- `created_at`

### `counterparties`

- `id`
- `organization_id`
- `display_name`
- `default_payer_wallet_address` nullable
- `contact_email` nullable
- `notes` nullable
- `created_at`

### `invoices`

- `id`
- `organization_id`
- `counterparty_id` nullable
- `invoice_number`
- `title`
- `status` enum `DRAFT | APPROVED | OPEN | PAYMENT_SUBMITTED | PAID_UNCLAIMED | CLAIMED_PRIVATE | VOID | EXPIRED`
- `currency_mint` fixed to `USDC`
- `subtotal_minor`
- `memo` nullable
- `internal_note` nullable
- `due_at`
- `approved_at` nullable
- `public_invoice_token_hash` nullable
- `public_invoice_token_expires_at` nullable
- `created_by_membership_id`
- `updated_by_membership_id`
- `created_at`
- `updated_at`

### `invoice_line_items`

- `id`
- `invoice_id`
- `description`
- `quantity`
- `unit_amount_minor`
- `line_total_minor`
- `sort_order`

### `payment_intents`

- `id`
- `invoice_id`
- `payer_wallet_address` nullable until checkout begins
- `status` enum `CREATED | CHECKOUT_STARTED | REGISTRATION_REQUIRED | READY | TX_SUBMITTED | TX_CONFIRMED | UTXO_DISCOVERABLE | FAILED | ABANDONED`
- `amount_minor`
- `fee_quote_json`
- `idempotency_key`
- `create_utxo_tx_signature` nullable
- `expected_utxo_ref` nullable
- `cluster`
- `expires_at`
- `created_at`
- `updated_at`

### `umbra_transactions`

- `id`
- `organization_id`
- `invoice_id` nullable
- `payment_intent_id` nullable
- `actor_wallet_address`
- `flow_type` enum `REGISTER | CREATE_RECEIVER_CLAIMABLE | CLAIM_TO_ETA | WITHDRAW | DISCLOSURE_GRANT | DISCLOSURE_REVOKE | VIEWING_EXPORT`
- `tx_signature`
- `slot` nullable
- `mint`
- `amount_minor` nullable
- `used_relayer` boolean
- `status` enum `SUBMITTED | CONFIRMED | FAILED | UNKNOWN`
- `metadata_json`
- `created_at`

### `claim_events`

- `id`
- `organization_id`
- `invoice_id` nullable
- `source_utxo_ref`
- `mint`
- `amount_minor` nullable
- `discovered_at`
- `claimed_at` nullable
- `claim_tx_signature` nullable
- `status` enum `DISCOVERED | CLAIM_SUBMITTED | CLAIMED | FAILED | DUPLICATE`
- `created_at`

### `encrypted_balance_snapshot_metadata`

- `id`
- `organization_id`
- `wallet_address`
- `mint`
- `fetched_at`
- `source_kind` enum `CLIENT_REFRESH | POST_CLAIM | POST_WITHDRAW`
- `freshness_status` enum `CURRENT | STALE | ERROR`
- `client_hash` nullable

Exact decrypted balance values remain client-side by default. The server does not persist exact private balances in MVP.

### `disclosure_sessions`

- `id`
- `organization_id`
- `scope_type` enum `INVOICE | DATE_RANGE | BALANCE_POINT`
- `scope_json`
- `share_id`
- `passcode_hash` nullable
- `status` enum `ACTIVE | REVOKED | EXPIRED | CONSUMED`
- `artifact_storage_key` nullable
- `artifact_kind` enum `REPORT_ONLY | REPORT_PLUS_VIEWING_ARTIFACTS`
- `created_by_membership_id`
- `expires_at`
- `created_at`
- `revoked_at` nullable
- `consumed_at` nullable

### `audit_logs`

- `id`
- `organization_id`
- `actor_membership_id` nullable
- `actor_wallet_address` nullable
- `event_type`
- `subject_type`
- `subject_id`
- `severity` enum `INFO | WARN | ERROR | SECURITY`
- `payload_redacted_json`
- `created_at`

## 19. API Contracts

### Auth

`POST /api/auth/nonce`
- request: `walletAddress`
- response: `nonce`
- auth: none
- notes: one-time nonce, short TTL

`POST /api/auth/verify`
- request: `walletAddress`, `signature`, `nonce`
- response: session payload with memberships
- auth: wallet signature

### Organizations

`POST /api/orgs`
- request: `name`, `slug`, `operationalWalletAddress`
- response: org summary
- auth: owner wallet session

`GET /api/orgs/:orgId/readiness`
- response: registration status, supported mint status, cluster, capability flags
- auth: org member

### Invoices

`POST /api/invoices`
- request: invoice draft payload
- response: invoice summary
- auth: owner or finance operator

`PATCH /api/invoices/:invoiceId`
- request: draft updates
- response: updated invoice
- auth: owner or finance operator
- validation: only allowed while `DRAFT`

`POST /api/invoices/:invoiceId/approve`
- request: none or optional expiration override
- response: checkout link payload
- auth: owner or finance operator
- validation: org must be ready; invoice must be valid; only one active public token

`POST /api/invoices/:invoiceId/void`
- auth: owner or finance operator
- validation: disallowed after successful payment submission

### Public Checkout

`GET /api/public/invoices/:publicInvoiceToken`
- response: sanitized invoice summary
- auth: none
- failure cases: invalid, expired, void

`POST /api/public/invoices/:publicInvoiceToken/payment-intents`
- request: `payerWalletAddress`, `idempotencyKey`
- response: intent id, quote, readiness requirements
- auth: none
- notes: idempotent by invoice plus wallet plus key

`POST /api/payment-intents/:paymentIntentId/confirm`
- request: `createUtxoTxSignature`, `expectedUtxoRef`, `clientQuoteHash`
- response: confirmed payment intent summary
- auth: wallet-bound checkout session
- failure cases: stale quote, duplicate confirm, invoice no longer payable

### Claims

`POST /api/claims/discoveries`
- request: array of discovered claim references and cursor metadata
- response: normalized claim rows
- auth: org member
- notes: no secrets uploaded

`POST /api/claims/:claimEventId/confirm`
- request: `claimTxSignature`, `status`
- response: updated claim event
- auth: owner or finance operator

### Balances

`POST /api/balances/snapshots`
- request: redacted snapshot metadata
- response: stored metadata row
- auth: org member

### Settlements

`POST /api/settlements/withdrawals`
- request: `invoiceContextIds` optional, `destinationTokenAccount`, `withdrawTxSignature`, `amountMinor`
- response: settlement record summary
- auth: owner or finance operator

### Disclosures

`POST /api/disclosures`
- request: scope, artifact kind, expiry, optional passcode
- response: disclosure session summary
- auth: owner or finance operator

`POST /api/disclosures/:disclosureSessionId/artifact`
- request: encrypted artifact metadata after client generation
- response: share url
- auth: owner or finance operator

`POST /api/disclosures/:disclosureSessionId/revoke`
- response: updated disclosure session
- auth: owner or finance operator

`GET /api/public/disclosures/:shareId`
- response: read-only disclosure metadata and artifact access status
- auth: share token and optional passcode

### Contract Rules

- All mutating endpoints require Zod validation.
- All org-scoped endpoints require membership checks.
- Payment intent creation and confirmation must be idempotent.
- Public tokens are stored hashed, never in plaintext after issuance.
- Wallet-driven chain actions happen client-side; APIs only validate and persist metadata.

## 20. Authentication and Authorization

### Authentication

- Primary auth is wallet-based sign-in with nonce challenge.
- Session is stored in secure HTTP-only cookie.
- External invoice viewers do not need a session until payment starts.
- External auditors use a time-bound disclosure link plus optional passcode.

### Authorization

- Org routes enforce membership and role.
- Only `OWNER` and `FINANCE_OPERATOR` can mutate invoices, claims, settlements, and disclosures.
- `REVIEWER` is read-only.
- Public checkout access is restricted to active invoice token.
- Disclosure portal access is restricted to active share id and passcode rules.

## 21. State Management Strategy

### Server State

- TanStack Query for invoices, org readiness, audit logs, claim rows, disclosure sessions

### Local UI State

- Zustand for:
  - wallet UX status
  - checkout flow state
  - proving state
  - modal and sheet state

### Persistent Client State

- IndexedDB for:
  - claim scan cursors
  - discovered UTXO references
  - last known balance freshness metadata

### State Separation Rule

- offchain business state is server-backed
- private chain state is client-derived
- session UX state is local

## 22. Validation Rules

- Organization slug must be unique and URL-safe.
- Invoice currency is `USDC` only in MVP.
- Invoice subtotal must equal sum of line items.
- Invoice amount minimum is `25 USDC` equivalent in minor units for MVP.
- Due date must be today or later.
- Invoice cannot be approved if org registration is incomplete.
- One invoice can have only one active public token in MVP.
- Checkout token must be active and not expired.
- Payment intent quote must be fresh when confirmed.
- Claim confirmation cannot be recorded twice for the same UTXO reference.
- Withdrawal destination must be a valid USDC token account on the configured cluster.
- Disclosure expiry maximum is 30 days in MVP.
- Report packages with non-revocable viewing artifacts require explicit irreversible confirmation.

## 23. Error Handling Strategy

### Wallet Errors

- If wallet connect fails, keep page usable and show inline retry.
- If signature is rejected, return to prior state with no data loss.

### Registration Errors

- If registration fails, keep the user on readiness step with clear retry action.
- If registration status is uncertain after submission, poll until resolved or timed out.

### Checkout Errors

- If payment quote expires, regenerate quote and ask for re-confirmation.
- If chain submission succeeds but API persistence fails, allow user to submit tx signature manually on reload and reconcile.
- If invoice becomes invalid during checkout, stop payment and show final state.

### Claim Errors

- If scan fails due to indexer delay, preserve cursor and allow manual retry.
- If a claim is already spent or duplicate, mark it as duplicate and hide it from payable totals.
- If relayer status is uncertain, move claim row to `UNKNOWN` and poll confirmation before allowing retry.

### Disclosure Errors

- If artifact generation fails client-side, do not create a share link.
- If grant revocation is requested after artifact export, mark the session revoked but preserve audit record that exported material may remain externally usable.

## 24. Edge Cases and Failure Recovery

- Payer refreshes during checkout after tx submission:
  - recover by reading local pending intent and polling confirmation
- Invoice paid twice from two tabs:
  - first successful intent wins; second intent is blocked at confirmation if invoice is no longer payable
- Vendor never scans claims after payment:
  - invoice remains `PAID_UNCLAIMED`, dashboard shows pending inbound value
- Claim discovered but no matching invoice:
  - show as unmatched incoming claim with manual note capability
- Relayer unavailable:
  - surface maintenance warning and disable batch claim until recovery
- Indexer lag:
  - show "payment confirmed, waiting for indexer visibility" state
- Withdrawal submitted but app closes:
  - recover from stored tx signature on next load
- Disclosure link leaked:
  - owner can revoke portal access; already downloaded artifacts remain subject to original disclosure risk warning
- Reviewer role opens chain-action page:
  - render read-only mode with no CTA that triggers wallet transactions

## 25. Umbra SDK Integration Plan

### Required Integration Areas

- registration status checking
- registration execution
- private state query
- receiver-claimable UTXO creation for invoice payment
- client-side claimable UTXO scanning through indexer integration
- relayer-backed claims into ETA
- ETA balance queries
- ETA withdrawal to public token account
- scoped viewing artifact generation and compliance grant management where supported

### Integration Boundaries

- All secret-bearing Umbra operations happen client-side.
- Backend stores references, statuses, and redacted metadata only.
- The app wraps Umbra SDK calls in a dedicated adapter layer so the rest of the product stays type-safe and testable.

### UX Implications

- Proving and chain actions are treated as first-class UX states.
- Readiness checks run before any action that would otherwise fail late.
- The product never claims more privacy than the chosen documented flow provides.

## 26. Security and Privacy Model

### Security Model

- No backend private key custody.
- Wallet auth with nonce challenge and secure cookies.
- Hashed public invoice tokens.
- Time-bound disclosure links.
- Encryption at rest for stored disclosure artifacts.
- CSRF protection on authenticated mutation endpoints.

### Privacy Model

- Offchain invoice metadata remains private to org users and scoped disclosure recipients.
- Onchain settlement uses Umbra to reduce recipient exposure and private-balance leakage.
- The main MVP rail does not fully hide payer outflow amount, so the UI and docs must state that clearly.
- Exact decrypted ETA balances stay client-side by default.
- Non-revocable viewing materials are guarded by explicit warnings and narrow scopes.

### Disclosure Safety Rules

- Date ranges default to the shortest practical scope.
- Invoice-level disclosure is preferred over broad month-wide disclosure when possible.
- Viewing artifact export requires irreversible consent step.
- Revocation UI explains the real limits of revocation after data has been shared.

## 27. Performance Considerations

- Use code-splitting so wallet and Umbra modules load only where needed.
- Run proof-heavy work in a Web Worker when applicable.
- Avoid blocking render thread during scan and proof tasks.
- Cache business queries with sensible stale times.
- Paginate invoice lists and disclosure history.
- Batch claim confirmations to reduce UI churn.
- Defer non-essential dashboard panels until primary metrics render.

## 28. Accessibility Requirements

- WCAG 2.1 AA contrast targets
- full keyboard navigation
- visible focus states on all interactive elements
- screen-reader labels on wallet, claim, and disclosure controls
- reduced motion support
- no critical information conveyed by color alone
- modal and drawer focus trapping
- semantic table markup for invoices and claims on desktop

## 29. Logging, Observability, and Audit Events

### Server Logging

- request id
- user role
- organization id
- endpoint
- result status
- latency

### Client Telemetry

- registration duration
- proof duration
- quote generation duration
- indexer scan duration
- relayer submission duration

Telemetry must never include:

- private keys
- viewing keys
- exact private balances
- raw disclosure artifacts

### Audit Events

- org created
- readiness checked
- registration completed
- invoice drafted
- invoice approved
- checkout link generated
- payment intent created
- payment tx recorded
- claim discovered
- claim completed
- balance snapshot metadata stored
- withdrawal recorded
- disclosure created
- disclosure revoked

## 30. File and Folder Structure

```text
StealthBooks/
  SPEC.md
  README.md
  .env.example
  package.json
  prisma/
    schema.prisma
  public/
  src/
    app/
      (public)/
        page.tsx
        checkout/[publicInvoiceToken]/page.tsx
        disclosures/[shareId]/page.tsx
      (app)/
        onboarding/page.tsx
        dashboard/page.tsx
        invoices/page.tsx
        invoices/new/page.tsx
        invoices/[invoiceId]/page.tsx
        claims/page.tsx
        balances/page.tsx
        settlements/page.tsx
        disclosures/page.tsx
        settings/page.tsx
      api/
    components/
      ui/
      layout/
      billing/
      claims/
      balances/
      disclosures/
    features/
      auth/
      orgs/
      invoices/
      checkout/
      claims/
      balances/
      settlements/
      disclosures/
      audit/
      umbra/
    lib/
      env/
      db/
      auth/
      validation/
      formatting/
    server/
      services/
      repositories/
      policies/
    workers/
      prover/
  tests/
    unit/
    integration/
    e2e/
```

## 31. Module Breakdown

- `auth`: wallet nonce and session handling
- `orgs`: org creation, readiness, memberships
- `invoices`: invoice CRUD, numbering, approval, token issuance
- `checkout`: public invoice flow, quotes, payment intent lifecycle
- `claims`: client scan coordination, claim recording, unmatched handling
- `balances`: private balance summaries and freshness metadata
- `settlements`: withdrawal flow and history
- `disclosures`: disclosure session lifecycle and artifact metadata
- `audit`: redacted audit events and event feed
- `umbra`: SDK adapter, typed request helpers, flow guards

## 32. Testing Strategy

### Unit Tests

- schema validation
- invoice status transitions
- fee quote formatting
- disclosure scope validation
- role authorization policies

### Integration Tests

- auth nonce flow
- org readiness checks
- invoice approval and token issuance
- payment intent idempotency
- disclosure portal access rules

### End-to-End Tests

- onboarding path
- invoice draft to public checkout
- successful public checkout recording
- client claim confirmation recording
- withdrawal recording
- disclosure generation and portal access

### Network Strategy

- automated tests use mock or devnet-safe integration boundaries
- demo environment may use devnet or mainnet-beta with low-value USDC depending operational readiness

## 33. Deployment Assumptions

- frontend and backend deployed as one Next.js application
- Postgres hosted service
- object storage for encrypted disclosure artifacts
- devnet used during development
- final demo can run on devnet by default, with optional mainnet-beta proof clip if team confirms stable funding and wallets
- no custom Solana program deployment required

## 34. Acceptance Criteria by Major Feature

### Organization and Readiness

- A new owner can create an org and see exact readiness blockers before invoice publication.
- Invoice approval is blocked until required registration is complete.

### Invoices

- A finance operator can create, edit, approve, and share a USDC invoice without touching chain state.
- Approved invoice produces a working public checkout token.

### Checkout

- A payer can open the link, connect wallet, complete registration if needed, review fees, and submit payment.
- Successful payment creates a recorded Umbra-linked payment intent and moves invoice to `PAID_UNCLAIMED`.

### Claims

- A vendor can scan, find, and claim at least one incoming private payment into ETA.
- Claimed invoice updates to `CLAIMED_PRIVATE`.

### Balances

- Vendor sees refreshed encrypted balance and pending inbound value states.

### Settlements

- Vendor can withdraw from ETA to a public USDC token account and record the event.

### Disclosures

- Operator can generate a time-bound disclosure session with scoped artifact package.
- External reviewer can open read-only portal and access only the intended package.

### Audit and Reconciliation

- Every major user action leaves a redacted audit event.
- Invoice detail page shows the linked payment and claim lifecycle clearly.

## 35. Demo Script for Judges

Target length: under 5 minutes.

1. Show dashboard with zero public wallet exposure for receivables workflow.
2. Open onboarding and show Umbra readiness check.
3. Create and approve a USDC invoice.
4. Open public checkout link in a second browser context.
5. Connect payer wallet, pass registration preflight, show fee breakdown, submit payment.
6. Return to vendor app and show invoice moved to `PAID_UNCLAIMED`.
7. Open claims inbox, scan, find claimable UTXO, and claim it into encrypted balance.
8. Show private balance dashboard refreshed.
9. Show settlement withdrawal flow preview.
10. Generate invoice-scoped disclosure package and open the read-only auditor portal.

Demo fallback assets:

- pre-funded wallets
- pre-created second invoice
- recorded backup clip for slow chain or relayer conditions

## 36. Submission Readiness Checklist

- Public GitHub repository
- Clear `README.md` with:
  - problem statement
  - target users
  - how Umbra SDK is used
  - build and run instructions
  - deployed frontend link
  - cluster configuration
- `SPEC.md` committed
- `.env.example` committed with exact required variables
- demo video under 5 minutes
- screenshots or short GIFs for key flows
- explicit explanation of privacy guarantees and limitations
- no unsupported claims about automated auditor decryption

## 37. Assumptions

- USDC is the only settlement mint in MVP.
- One operational wallet performs private treasury actions for a given org during the demo.
- Exact private balances are not persisted on the backend.
- Client devices can perform required proof-related tasks with acceptable latency.
- Disclosure packages can include exported artifacts only within the safety limits described by Umbra docs.
- No custom Solana program is needed.

## 38. Open Questions That Can Be Deferred Without Blocking Build

- Should the final recorded demo use devnet only or include a short mainnet-beta proof point?
- Should disclosure links always require a passcode, or only for packages that include viewing artifacts?
- Should invoice attachments be included in MVP or deferred?
- Should unmatched claim rows support manual invoice linking in MVP, or remain read-only exceptions?

## 39. Build Order / Implementation Phases

### Phase 1: Foundation

- project setup
- design system
- auth
- org model
- readiness screen

### Phase 2: Billing Core

- invoices
- counterparties
- public invoice token flow

### Phase 3: Umbra Payment Flow

- checkout page
- payer registration preflight
- payment intent recording
- tx reconciliation

### Phase 4: Claims and Balance

- client-side scan
- claim inbox
- relayer-backed claim recording
- private balance dashboard

### Phase 5: Settlement and Disclosure

- withdrawal flow
- disclosure session generation
- read-only disclosure portal

### Phase 6: Hardening and Demo

- audit log polish
- loading and error states
- accessibility pass
- E2E demo rehearsal
- README, `.env.example`, and submission assets
