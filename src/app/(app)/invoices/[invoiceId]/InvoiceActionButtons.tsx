"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCheckoutStore } from "./checkoutStore";

interface InvoiceActionButtonsProps {
  invoiceId: string;
  orgId: string;
  canApprove: boolean;
  canVoid: boolean;
}

export function InvoiceActionButtons({
  invoiceId,
  orgId,
  canApprove,
  canVoid,
}: InvoiceActionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<"approve" | "void" | null>(null);
  const setCheckoutUrl = useCheckoutStore((state) => state.setCheckoutUrl);

  const handleAction = async (action: "approve" | "void") => {
    setLoading(action);
    try {
      const res = await fetch(`/api/orgs/${orgId}/invoices/${invoiceId}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Action failed");
      }
      if (action === "approve") {
        const data = await res.json();
        if (data.checkoutUrl) {
          setCheckoutUrl(data.checkoutUrl);
        }
      }
      router.refresh(); // Refresh the server component to load new status
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} invoice.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {canVoid && (
        <Button
          id={`inv-${invoiceId}-void`}
          variant="destructive"
          size="sm"
          onClick={() => handleAction("void")}
          disabled={loading !== null}
          loading={loading === "void"}
        >
          <XCircle className="h-4 w-4" aria-hidden="true" /> Void
        </Button>
      )}
      {canApprove && (
        <Button
          id={`inv-${invoiceId}-approve`}
          size="sm"
          variant="accent"
          onClick={() => handleAction("approve")}
          disabled={loading !== null}
          loading={loading === "approve"}
        >
          <CheckCircle className="h-4 w-4" aria-hidden="true" /> Approve & Generate Link
        </Button>
      )}
    </>
  );
}
