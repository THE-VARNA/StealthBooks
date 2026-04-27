# StealthBooks

**Privacy-native B2B billing on Solana — built on Umbra Privacy.**

StealthBooks lets crypto-native businesses issue USDC invoices, receive payment through Umbra's zero-knowledge mixer, aggregate receivables into private encrypted balances, and selectively disclose records to auditors — without exposing counterparties, payment amounts, or treasury behavior on the public ledger.

> Built for the [Umbra Privacy side track](https://superteam.fun/earn/listing/umbra-side-track).

---

## Architecture Overview

```
Payer (public ATA)
   │
   ▼  getPublicBalanceToReceiverClaimableUtxoCreatorFunction
Umbra Mixer UTXO (publicReceived bucket)
   │
   ▼  getClaimableUtxoScannerFunction → result.publicReceived
Vendor scans & discovers UTXO (IDB cursor, client-side only)
   │
   ▼  getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction
Vendor's Encrypted Token Account (ETA)
   │
   ▼  Selective disclosure (report package, share link, passcode)
Auditor receives scoped invoice export
```

### Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 App Router (React 19) |
| Language | TypeScript 5.8 (strict) |
| Database | PostgreSQL + Prisma 6.8 |
| Auth | iron-session + Ed25519 wallet signatures |
| State | Zustand (auth) + TanStack Query (server state) |
| Privacy | Umbra SDK 2.0.3 (ZK provers, UTXO scanner, claimer) |
| Wallets | Phantom + Solflare (wallet-adapter-react) |
| Styling | Tailwind CSS + glassmorphism design system |

---

## Privacy Model

| What is private? | Mechanism |
|---|---|
| Vendor receiving address | Umbra mixer routes to ETA |
| Payment amount (from chain) | UTXO encryption |
| Counterparty identity | No public mapping |
| Treasury balance | ETA queried client-side only |
| Invoice details | Never logged on-chain |
| Scan cursor | IndexedDB only, never sent to server |

> **Payer outflow is visible.** The payer's USDC debit from their public ATA is an observable on-chain event. Privacy applies to the destination and vendor treasury.

---

## Key Design Decisions

### Payment Rail
`getPublicBalanceToReceiverClaimableUtxoCreatorFunction` — creates receiver-claimable UTXOs funded from the payer's public balance. The vendor scans `result.publicReceived` (not `result.received`) for incoming payments.

### Readiness Check
The server caches `umbraRegisteredAt` for display only. **Authoritative readiness** comes from `getUserAccountQuerierFunction` on the client, checking:
- `isUserAccountX25519KeyRegistered`
- `isUserCommitmentRegistered`
- `isActiveForAnonymousUsage`

### Checkout Token
A one-time HMAC-SHA256 token (raw token returned once, only hash stored). Payers access invoices via `/checkout/[publicToken]` — no auth required.

### Claim Scan
IDB cursors (`wallet:cluster:treeIndex`) prevent rescanning from genesis on every page load. The server receives only `insertionIndex` + `amountMinor` for invoice matching — balances are never sent.

### Disclosure
Report packages (invoice exports) generated from scoped DB queries. No live X25519 key grants. Share links are time-limited and immediately revocable.

---

## Setup

### 1. Prerequisites
- Node.js ≥ 20
- PostgreSQL (or Neon serverless)
- Solana wallet (Phantom or Solflare)

### 2. Install
```bash
git clone <repo>
cd StealthBooks
npm install
```

### 3. Environment
```bash
cp .env.example .env.local
```

Fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | ≥32 char random secret (`openssl rand -base64 32`) |
| `INVOICE_TOKEN_SALT` | ≥8 char HMAC salt for checkout tokens |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint (QuikNode, Helius, etc.) |
| `NEXT_PUBLIC_UMBRA_INDEXER_URL` | Umbra indexer (default in .env.example) |
| `NEXT_PUBLIC_UMBRA_RELAYER_URL` | Umbra relayer (default in .env.example) |
| `NEXT_PUBLIC_USDC_MINT` | USDC mint address (default EPjFWdd5…) |
| `NEXT_PUBLIC_APP_URL` | Base URL (http://localhost:3000 for dev) |

### 4. Database
```bash
npx prisma generate
npx prisma db push        # dev
# or
npx prisma migrate deploy  # production
```

### 5. Dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Flow

1. **Connect wallet** → sign-in nonce → session established
2. **Create org** → complete Umbra registration (3-step on-chain)
3. **Create invoice** → add line items → approve → share checkout link
4. **Payer visits checkout** → connects wallet → Umbra UTXO created
5. **Vendor scans claims** → `publicReceived` bucket → discovered UTXOs matched to invoices
6. **Claim to ETA** → ZK proof generated → relayer submits tx → balance increases
7. **View private balance** → ETA queried client-side only
8. **Withdraw (optional)** → ETA → public ATA (observable on-chain, warned in UI)
9. **Create disclosure** → scoped share link with passcode → auditor views report

---

## Project Structure

```
src/
├── app/
│   ├── (app)/               # Authenticated pages (AppShell layout)
│   │   ├── dashboard/
│   │   ├── invoices/        # List, new, [invoiceId]
│   │   ├── claims/          # UTXO scan + claim inbox
│   │   ├── balances/        # Private ETA balance
│   │   ├── settlements/     # Withdrawal to public
│   │   ├── disclosures/     # Selective disclosure
│   │   └── settings/        # Org + Umbra registration
│   ├── checkout/[token]/    # Public payer checkout (no auth)
│   ├── api/
│   │   ├── auth/            # nonce, verify
│   │   ├── orgs/[orgId]/    # invoices, readiness, balances, settlements, disclosures
│   │   ├── claims/          # discoveries, [claimEventId]/confirm
│   │   ├── payment-intents/ # [id]/confirm
│   │   └── public/          # invoices/[token], payment-intents
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # Button, Input, Badge, Dialog, Tabs, etc.
│   └── layout/              # AppShell, GlassPanel, MetricTile, StatusBadge, etc.
├── features/
│   ├── auth/                # useWalletAuth (Zustand)
│   ├── claims/              # useClaimScan, useClaimBatch
│   ├── orgs/                # useOrgReadiness
│   └── umbra/               # client, provers, fees
├── lib/
│   ├── auth/session.ts      # iron-session config
│   ├── db/index.ts          # Prisma singleton
│   ├── env/index.ts         # Zod env validation
│   ├── formatting/          # USDC, date, address utils
│   ├── idb/scanCursors.ts   # IDB cursor persistence
│   └── validation/schemas.ts # All Zod API schemas
└── prisma/schema.prisma     # 11 tables, full state machines
```

---

## Umbra SDK Reference

- SDK: [@umbra-privacy/sdk@2.0.3](https://sdk.umbraprivacy.com/)
- Quickstart: https://sdk.umbraprivacy.com/quickstart
- Creating UTXOs: https://sdk.umbraprivacy.com/sdk/mixer/creating-utxos
- Fetching UTXOs: https://sdk.umbraprivacy.com/sdk/mixer/fetching-utxos
- Registration: https://sdk.umbraprivacy.com/sdk/registration
- Query: https://sdk.umbraprivacy.com/sdk/query
- Pricing: https://sdk.umbraprivacy.com/pricing

---

## License

MIT — see [LICENSE](./LICENSE).
