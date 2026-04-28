import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

import { db } from "@/lib/db";
import crypto from "crypto";

export const metadata: Metadata = {
  title: "Pay Invoice | StealthBooks",
  description: "Complete your private USDC payment through Umbra's zero-knowledge infrastructure.",
};

interface PageProps {
  params: Promise<{ publicToken: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { publicToken } = await params;

  const tokenHash = crypto
    .createHmac("sha256", process.env.INVOICE_TOKEN_SALT ?? "default-salt")
    .update(publicToken)
    .digest("hex");

  const dbInvoice = await db.invoice.findFirst({
    where: { publicTokenHash: tokenHash },
    include: {
      lineItems: true,
      counterparty: { select: { displayName: true } },
      organization: { select: { name: true, cluster: true } },
    },
  });

  let error = null;

  if (!dbInvoice) {
    error = "Invoice not found";
  } else if (dbInvoice.status === "VOID" || dbInvoice.status === "EXPIRED") {
    error = "This invoice is no longer valid";
  } else if (dbInvoice.publicTokenExpiresAt && dbInvoice.publicTokenExpiresAt < new Date()) {
    await db.invoice.update({ where: { id: dbInvoice.id }, data: { status: "EXPIRED" } });
    error = "This invoice link has expired";
  } else if (dbInvoice.status === "CLAIMED_PRIVATE") {
    error = "This invoice has already been paid";
  }

  if (error || !dbInvoice) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-heading-2 text-[#ef4444] mb-2">Invoice unavailable</p>
          <p className="text-body-sm text-[rgb(148,163,184)]">{error}</p>
        </div>
      </div>
    );
  }

  const invoice = {
    id: dbInvoice.id,
    invoiceNumber: dbInvoice.invoiceNumber,
    status: dbInvoice.status,
    subtotalMinor: dbInvoice.subtotalMinor.toString(),
    protocolFeeMinor: dbInvoice.protocolFeeMinor.toString(),
    totalMinor: dbInvoice.totalMinor.toString(),
    mint: dbInvoice.mint,
    memo: dbInvoice.memo,
    dueDate: dbInvoice.dueDate,
    lineItems: dbInvoice.lineItems.map((li) => ({
      description: li.description,
      quantity: li.quantity.toNumber(),
      unitPrice: li.unitPrice.toString(),
      amountMinor: li.amountMinor.toString(),
    })),
    counterpartyName: dbInvoice.counterparty?.displayName ?? null,
    orgName: dbInvoice.organization.name,
    cluster: dbInvoice.organization.cluster,
  };

  return <CheckoutClient invoice={invoice} publicToken={publicToken} />;
}
