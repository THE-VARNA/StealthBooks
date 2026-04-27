import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { createInvoiceSchema } from "@/lib/validation/schemas";
import { nanoid } from "nanoid";
import crypto from "crypto";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely serialize BigInt fields from Prisma to strings for JSON responses */
function serializeInvoice(inv: any) {
  return {
    ...inv,
    subtotalMinor: inv.subtotalMinor?.toString(),
    protocolFeeMinor: inv.protocolFeeMinor?.toString(),
    totalMinor: inv.totalMinor?.toString(),
    lineItems: inv.lineItems?.map((li: any) => ({
      ...li,
      unitPrice: li.unitPrice?.toString(),
      amountMinor: li.amountMinor?.toString(),
    })),
  };
}

/** USDC has 6 decimal places. Convert user-facing amount to micro-units. */
function toMicroUnits(usdcFloat: number): bigint {
  return BigInt(Math.round(usdcFloat * 1_000_000));
}

/** Compute protocol fee: floor(amount × 35 / 16_384) */
function computeProtocolFee(amountMinor: bigint): bigint {
  return (amountMinor * 35n) / 16_384n;
}

/** Generate sequential invoice number: SB-2026-000001 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.invoice.count({
    where: { invoiceNumber: { startsWith: `SB-${year}-` } },
  });
  return `SB-${year}-${String(count + 1).padStart(6, "0")}`;
}

// ─── POST /api/invoices ───────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );
    if (!session.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;

    // Check membership — OWNER or FINANCE_OPERATOR can create
    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership || membership.role === "REVIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { counterpartyId, lineItems, memo, internalNotes, dueDate } =
      parsed.data;

    // Compute totals
    const lineItemData = lineItems.map((li) => {
      const unitPriceMinor = toMicroUnits(li.unitPrice);
      const qty = BigInt(Math.round(li.quantity * 10_000));
      const amountMinor = (unitPriceMinor * qty) / 10_000n;
      return {
        description: li.description,
        quantity: li.quantity,
        unitPrice: unitPriceMinor,
        amountMinor,
      };
    });

    const subtotalMinor = lineItemData.reduce(
      (acc, li) => acc + li.amountMinor,
      0n
    );
    const protocolFeeMinor = computeProtocolFee(subtotalMinor);
    const totalMinor = subtotalMinor + protocolFeeMinor;
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await db.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          orgId,
          counterpartyId,
          invoiceNumber,
          subtotalMinor,
          protocolFeeMinor,
          totalMinor,
          memo,
          internalNotes,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          lineItems: {
            create: lineItemData,
          },
        },
        include: { lineItems: true },
      });
      await tx.auditLog.create({
        data: {
          orgId,
          action: "INVOICE_CREATED",
          actorWallet: session.walletAddress,
          subjectId: inv.id,
          subjectType: "invoice",
        },
      });
      return inv;
    });

    return NextResponse.json({ invoice: serializeInvoice(invoice) }, { status: 201 });
  } catch (err) {
    console.error("[invoices] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET /api/invoices ────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );
    if (!session.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;
    const membership = session.orgMemberships?.find((m) => m.orgId === orgId);
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);
    const cursor = searchParams.get("cursor") ?? undefined;

    const invoices = await db.invoice.findMany({
      where: { orgId, ...(status && { status: status as never }) },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: { lineItems: true, counterparty: { select: { displayName: true } } },
    });

    const hasMore = invoices.length > limit;
    const data = hasMore ? invoices.slice(0, -1) : invoices;
    const serializedData = data.map(serializeInvoice);
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return NextResponse.json({ invoices: serializedData, nextCursor });
  } catch (err) {
    console.error("[invoices] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
