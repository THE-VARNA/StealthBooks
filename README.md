# StealthBooks

**Privacy-native B2B billing on Solana — built on Umbra Privacy.**

StealthBooks lets crypto-native businesses issue USDC invoices, receive payment through Umbra's zero-knowledge mixer, aggregate receivables into private encrypted balances, and selectively disclose records to auditors — without exposing counterparties, payment amounts, or treasury behavior on the public ledger.

> Built for the [Umbra Privacy (Encrypt) side track](https://superteam.fun/earn/listing/umbra-side-track).

---

## The Problem & Target Audience

**The Problem:** Crypto-native businesses, DAOs, and freelancers currently face a critical privacy issue: receiving payments on public ledgers like Solana exposes their entire treasury, client list, and revenue streams to anyone with a block explorer. This leads to severe information asymmetry, where competitors can spy on your cash flow and counterparties can see your balance before negotiations.

**Target Users:** Web3 development agencies, B2B SaaS companies operating on Solana, DAOs paying contributors, and independent contractors.

**Use Cases:**
- Issuing professional B2B invoices for services rendered without exposing the client's identity or payment amounts to the public.
- Aggregating business revenue into a private, encrypted treasury.
- Providing scoped, time-limited financial reports (Selective Disclosures) to auditors, investors, or tax professionals without giving them full view of the organization's entire wallet history.

---

## How StealthBooks Utilizes Umbra Privacy (Encrypt)

StealthBooks deeply integrates the **Umbra SDK 2.0 (Encrypt)** to bring true zero-knowledge privacy to Solana B2B payments:

- **Private Settlement:** When a payer settles an invoice via a secure checkout link, the funds are routed through Umbra's `publicBalanceToReceiverClaimableUtxoCreatorFunction`. The payment lands as a completely anonymous UTXO in the `publicReceived` bucket.
- **Client-Side Scanning:** StealthBooks uses Umbra's `getClaimableUtxoScannerFunction` entirely within the browser. Sensitive wallet scanning cursors are stored locally in IndexedDB and never touch our servers, ensuring complete privacy.
- **Encrypted Token Accounts (ETA):** Vendors claim their discovered payments directly into an Encrypted Token Account using the `getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction`. The treasury balance is strictly client-side decrypted and entirely invisible on-chain.
- **Zero-Knowledge Proofs:** All claims are backed by ZK proofs generated in the browser and submitted via the Umbra relayer, cryptographically obfuscating the link between the payer and the receiver.

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
| Styling | Tailwind CSS + custom Glassmorphism design system |

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

## Instructions: Build, Test, and Run

### 1. Prerequisites
- Node.js ≥ 20
- PostgreSQL database (Local or Neon Serverless)
- Solana wallet (Phantom or Solflare) configured for **Devnet**

### 2. Install
Clone the repository and install dependencies:
```bash
git clone <repo>
cd StealthBooks
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env.local
```

Fill in the required variables in `.env.local`:
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (pooler URL if using Neon) |
| `DIRECT_URL` | Direct connection string for Prisma migrations (if using Neon) |
| `SESSION_SECRET` | ≥32 char random secret (`openssl rand -base64 32`) |
| `INVOICE_TOKEN_SALT` | ≥8 char HMAC salt for checkout tokens |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana Devnet RPC endpoint |
| `NEXT_PUBLIC_UMBRA_INDEXER_URL` | Umbra indexer (default provided in .env.example) |
| `NEXT_PUBLIC_UMBRA_RELAYER_URL` | Umbra relayer (default provided in .env.example) |
| `NEXT_PUBLIC_USDC_MINT` | USDC Devnet mint address (default provided) |
| `NEXT_PUBLIC_APP_URL` | Base URL (http://localhost:3000 for local dev) |

### 4. Database Setup
Generate the Prisma client and push the schema to your database:
```bash
npx prisma generate
npx prisma db push
```
*(Note: If deploying to production, use `npx prisma migrate deploy` instead of `db push`)*

### 5. Run the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Application Demo Flow

To test the application end-to-end, follow this flow:

1. **Sign In:** Connect your Phantom/Solflare wallet to authenticate and establish a secure session.
2. **Onboarding:** Create your organization. Navigate to Settings to complete the **Umbra Registration** (a 3-step on-chain process to register your X25519 encryption key).
3. **Issue Invoice:** Go to Invoices, create a new USDC invoice with line items, approve it, and copy the private checkout link.
4. **Payer Checkout:** Open the checkout link in an incognito window or different browser profile. Connect a *different* wallet (representing the payer), and pay the invoice. The funds will be routed anonymously through Umbra.
5. **Scan & Claim:** Return to your vendor account, go to the Claims Inbox, and click **Scan Now**. The app will scan your `publicReceived` bucket client-side, discover the UTXO, and allow you to claim it to your Encrypted Token Account (ETA).
6. **Private Balance:** Navigate to Private Balance to view your decrypted ETA treasury balance securely within your browser.
7. **Selective Disclosure:** Go to Disclosures to generate a scoped, passcode-protected share link of your invoice history to share with an auditor.

---

## License

MIT — see [LICENSE](./LICENSE).
