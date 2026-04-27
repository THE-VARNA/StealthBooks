"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ClaimActionButtonProps {
  claimId: string;
  status: string;
}

export function ClaimActionButton({ claimId, status }: ClaimActionButtonProps) {
  const [isClaiming, setIsClaiming] = React.useState(false);
  const router = useRouter();

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      // Simulate the ZK proof generation and relayer submission
      await new Promise((r) => setTimeout(r, 2500));
      
      const res = await fetch(`/api/claims/${claimId}/claim`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to claim");
      
      router.refresh();
    } catch (err) {
      alert("Claim failed. Please check your wallet connection.");
    } finally {
      setIsClaiming(false);
    }
  };

  if (status === "CLAIMED") {
    return (
      <div className="flex items-center gap-1.5 text-[#10b981] text-xs font-medium">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Claimed
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 border-[#22d3ee] text-[#22d3ee] hover:bg-[rgba(34,211,238,0.1)]"
      onClick={handleClaim}
      disabled={isClaiming || status === "CLAIM_SUBMITTED"}
      loading={isClaiming}
    >
      {isClaiming ? "Claiming..." : status === "CLAIM_SUBMITTED" ? "In Progress" : "Claim into Private Balance"}
    </Button>
  );
}
