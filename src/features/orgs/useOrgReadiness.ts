"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/useWalletAuth";

interface ReadinessData {
  cluster: string;
  umbraRegisteredAtCache: string | null;
  supportedMint: string;
}

// The cached readiness data from the server (display only)
export function useOrgReadinessCache(orgId: string | null) {
  return useQuery<ReadinessData>({
    queryKey: ["org-readiness", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const res = await fetch(`/api/orgs/${orgId}/readiness`);
      if (!res.ok) throw new Error("Failed to fetch readiness");
      return res.json();
    },
    staleTime: 60_000, // 1 minute
  });
}

// Notify the server that the chain-derived readiness check passed
export function useMarkRegistered(orgId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/orgs/${orgId}/readiness`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to update readiness cache");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-readiness", orgId] });
    },
  });
}
