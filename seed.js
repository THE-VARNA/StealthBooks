const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding StealthBooks database...');

  // Get the first organization (assuming demo environment has 1 main org)
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error('No organization found. Please login to the app first to create an organization.');
    process.exit(1);
  }

  const orgId = org.id;
  const ownerMembership = await prisma.organizationMembership.findFirst({ where: { orgId } });
  const walletAddress = ownerMembership ? ownerMembership.walletAddress : "UnknownWallet";

  console.log(`Found organization: ${org.name} (${orgId})`);

  // 1. Clean existing data (preserving Org and Memberships)
  console.log('Cleaning existing data...');
  await prisma.disclosureArtifact.deleteMany();
  await prisma.disclosureSession.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.claimEvent.deleteMany();
  await prisma.umbraTransaction.deleteMany();
  await prisma.paymentIntent.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.counterparty.deleteMany();

  // 2. Create Counterparties
  console.log('Creating counterparties...');
  const cp1 = await prisma.counterparty.create({
    data: {
      orgId,
      displayName: "Acme Corp",
      email: "billing@acme.example.com",
    }
  });

  const cp2 = await prisma.counterparty.create({
    data: {
      orgId,
      displayName: "Globex Corporation",
      email: "payables@globex.example.com",
    }
  });

  // 3. Create Invoices
  console.log('Creating invoices...');
  
  // Invoice 1: PAID and CLAIMED
  const inv1 = await prisma.invoice.create({
    data: {
      orgId,
      counterpartyId: cp1.id,
      invoiceNumber: "INV-2026-0001",
      status: "CLAIMED_PRIVATE",
      subtotalMinor: 5500000000n, // $5,500.00
      totalMinor: 5500000000n,
      memo: "Q1 Consulting Retainer",
      publicTokenHash: "paid_token_hash_1",
      lineItems: {
        create: [
          { description: "Strategic Consulting (Jan-Mar)", quantity: 1, unitPrice: 5500000000n, amountMinor: 5500000000n }
        ]
      }
    }
  });

  // Invoice 2: OPEN / PENDING PAYMENT
  const inv2 = await prisma.invoice.create({
    data: {
      orgId,
      counterpartyId: cp2.id,
      invoiceNumber: "INV-2026-0002",
      status: "OPEN",
      subtotalMinor: 12500000000n, // $12,500.00
      totalMinor: 12500000000n,
      memo: "Software Development - Milestone 2",
      publicTokenHash: "open_token_hash_2",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      lineItems: {
        create: [
          { description: "Frontend Development", quantity: 100, unitPrice: 100000000n, amountMinor: 10000000000n },
          { description: "UI/UX Design", quantity: 25, unitPrice: 100000000n, amountMinor: 2500000000n }
        ]
      }
    }
  });

  // Invoice 3: DRAFT
  const inv3 = await prisma.invoice.create({
    data: {
      orgId,
      counterpartyId: cp1.id,
      invoiceNumber: "INV-2026-0003",
      status: "DRAFT",
      subtotalMinor: 300000000n, // $300.00
      totalMinor: 300000000n,
      internalNotes: "Awaiting final hours review",
      lineItems: {
        create: [
          { description: "Server Maintenance", quantity: 2, unitPrice: 150000000n, amountMinor: 300000000n }
        ]
      }
    }
  });

  // 4. Create Claims for the PAID invoice
  console.log('Creating claims...');
  await prisma.claimEvent.create({
    data: {
      orgId,
      invoiceId: inv1.id,
      status: "CLAIMED",
      sourceUtxoRef: "seed_utxo_1",
      treeIndex: 0,
      insertionIndex: 1,
      amountMinor: 5500000000n,
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      claimTxSignature: "seed_claim_tx_sig",
      claimedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      discoveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  });

  // 5. Create Disclosures
  console.log('Creating disclosures...');
  const shareId = nanoid(24);
  await prisma.disclosureSession.create({
    data: {
      orgId,
      shareId,
      status: "ACTIVE",
      label: "Q1 Financial Audit",
      scope: {
        kinds: ["invoice_report", "reconciliation_summary"],
      },
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      createdBy: walletAddress,
    }
  });

  // 6. Create Audit Logs
  console.log('Creating audit logs...');
  const logs = [
    { action: "INVOICE_CREATED", subjectId: inv1.id, subjectType: "invoice", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { action: "INVOICE_CREATED", subjectId: inv2.id, subjectType: "invoice", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { action: "INVOICE_CREATED", subjectId: inv3.id, subjectType: "invoice", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { action: "PAYMENT_SUBMITTED", subjectId: inv1.id, subjectType: "invoice", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { action: "CLAIM_CONFIRMED", subjectId: inv1.id, subjectType: "invoice", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { action: "DISCLOSURE_CREATED", subjectType: "disclosure", createdAt: new Date(Date.now() - 5 * 60 * 1000) } // 5 mins ago
  ];

  for (const log of logs) {
    await prisma.auditLog.create({
      data: {
        orgId,
        actorWallet: walletAddress,
        action: log.action,
        subjectId: log.subjectId,
        subjectType: log.subjectType,
        createdAt: log.createdAt,
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
