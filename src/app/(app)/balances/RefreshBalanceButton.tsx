"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshBalanceButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Add a tiny artificial delay so the user sees the spinner and knows it did something
    await new Promise((r) => setTimeout(r, 600));
    router.refresh();
    setIsRefreshing(false);
  };

  return (
    <Button 
      id="balances-refresh-btn" 
      variant="outline" 
      size="md" 
      onClick={handleRefresh}
      disabled={isRefreshing}
      loading={isRefreshing}
    >
      {!isRefreshing && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </Button>
  );
}
