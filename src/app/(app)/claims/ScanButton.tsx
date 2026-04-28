"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function ScanButton({ orgId }: { orgId: string }) {
  const [isScanning, setIsScanning] = React.useState(false);
  const router = useRouter();

  const handleScan = async () => {
    setIsScanning(true);
    
    try {
      // Simulate the chain scan delay
      await new Promise(r => setTimeout(r, 2000));
      
      const res = await fetch(`/api/orgs/${orgId}/claims/scan`, { method: "POST" });
      await res.json();
      
      router.refresh();
    } catch (err) {
      console.error("Scan failed.", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Button 
      id="claims-scan-btn" 
      size="md" 
      onClick={handleScan} 
      disabled={isScanning} 
      loading={isScanning}
    >
      {!isScanning && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
      {isScanning ? "Scanning Chain..." : "Scan Now"}
    </Button>
  );
}
