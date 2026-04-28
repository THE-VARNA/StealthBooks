import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DisclosureClient } from "./DisclosureClient";

export default async function DisclosurePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const session = await db.disclosureSession.findUnique({
    where: { shareId },
    include: {
      organization: {
        select: { name: true },
      },
    },
  });

  if (!session || session.status === "REVOKED") {
    notFound();
  }

  // Check expiry
  if (new Date() > session.expiresAt) {
    notFound(); // or a custom expired page
  }

  const dbInvoices = await db.invoice.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, invoiceNumber: true, totalMinor: true }
  });

  const initialData = {
    label: session.label,
    orgName: session.organization.name,
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    scope: session.scope as { kinds: string[] },
    invoices: dbInvoices.map(inv => ({
      date: inv.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      id: inv.invoiceNumber,
      amountMinor: inv.totalMinor.toString()
    }))
  };

  // Record access in audit log
  await db.auditLog.create({
    data: {
      orgId: session.orgId,
      action: "DISCLOSURE_ACCESSED",
      subjectId: session.id,
      subjectType: "disclosure",
    }
  });

  return <DisclosureClient shareId={shareId} initialData={initialData} />;
}
