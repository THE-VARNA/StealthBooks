"use client";

import { Settings, Shield, Users } from "lucide-react";
import { SectionToolbar } from "@/components/layout/SectionToolbar";
import { GlassPanel } from "@/components/layout/GlassPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionToolbar title="Settings" description="Manage your organization and privacy preferences" />

      <Tabs defaultValue="org">
        <TabsList>
          <TabsTrigger value="org" id="settings-tab-org">Organization</TabsTrigger>
          <TabsTrigger value="privacy" id="settings-tab-privacy">Privacy</TabsTrigger>
          <TabsTrigger value="members" id="settings-tab-members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="org">
          <GlassPanel padding="lg" className="max-w-xl">
            <h2 className="text-heading-2 mb-5 flex items-center gap-2" style={{ color: "rgb(248,250,252)" }}>
              <Settings className="h-4 w-4" style={{ color: "#6366f1" }} />
              Organization
            </h2>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <Input id="settings-org-name" label="Organization Name" placeholder="Acme Corp" />
              <Input id="settings-org-slug" label="Slug" placeholder="acme-corp" hint="Used in disclosure share URLs" />
              <Button id="settings-org-save" type="submit" size="md" disabled>Save Changes</Button>
            </form>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="flex flex-col gap-5 max-w-xl">
            <GlassPanel padding="lg" glow="cyan">
              <h2 className="text-heading-2 mb-4 flex items-center gap-2" style={{ color: "rgb(248,250,252)" }}>
                <Shield className="h-4 w-4" style={{ color: "#22d3ee" }} />
                Umbra Registration
              </h2>
              <p className="text-body-sm mb-4" style={{ color: "rgb(148,163,184)" }}>
                Registration is a one-time, idempotent 3-step process performed on-chain. It must be completed before your organization can receive private USDC payments.
              </p>
              <div className="flex flex-col gap-3 mb-5">
                {[
                  { step: "1", label: "Register user commitment", done: false },
                  { step: "2", label: "Register X25519 encryption key", done: false },
                  { step: "3", label: "Activate for anonymous usage", done: false },
                ].map(({ step, label, done }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background: done ? "#10b981" : "rgba(20,24,54,0.8)",
                        color: done ? "#fff" : "rgb(71,85,105)",
                        border: done ? "none" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {done ? "✓" : step}
                    </div>
                    <span className="text-body-sm" style={{ color: "rgb(248,250,252)" }}>{label}</span>
                    <Badge variant={done ? "success" : "muted"} className="ml-auto">{done ? "Done" : "Pending"}</Badge>
                  </div>
                ))}
              </div>
              <Button id="settings-register-umbra-btn" size="md" variant="accent">Begin Registration</Button>
            </GlassPanel>

            <GlassPanel padding="lg">
              <h2 className="text-heading-2 mb-4" style={{ color: "rgb(248,250,252)" }}>Scanner Cursors</h2>
              <p className="text-body-sm mb-4" style={{ color: "rgb(148,163,184)" }}>
                Scanning cursors track the last scanned UTXO insertion index per tree. They are stored in this browser only and are never sent to the server.
              </p>
              <Button id="settings-reset-cursors-btn" variant="destructive" size="sm">Reset Scan Cursors (Full Rescan)</Button>
            </GlassPanel>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <GlassPanel padding="lg" className="max-w-xl">
            <h2 className="text-heading-2 mb-4 flex items-center gap-2" style={{ color: "rgb(248,250,252)" }}>
              <Users className="h-4 w-4" style={{ color: "#6366f1" }} />
              Members
            </h2>
            <p className="text-body-sm mb-5" style={{ color: "rgb(148,163,184)" }}>
              Invite team members by Solana wallet address. Roles: Owner (full access), Finance Operator (can create/approve invoices), Reviewer (read-only).
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <Input id="settings-invite-wallet" label="Wallet Address" placeholder="Solana public key" />
              <Input id="settings-invite-role" label="Role" placeholder="FINANCE_OPERATOR" hint="OWNER | FINANCE_OPERATOR | REVIEWER" />
              <Button id="settings-invite-btn" type="submit" size="md" disabled>Invite Member</Button>
            </form>
            <Separator className="my-5" />
            <p className="text-body-sm" style={{ color: "rgb(71,85,105)" }}>No members yet.</p>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
