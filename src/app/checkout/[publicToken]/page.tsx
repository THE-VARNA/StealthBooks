import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Pay Invoice | StealthBooks",
  description: "Complete your private USDC payment through Umbra's zero-knowledge infrastructure.",
};

interface PageProps {
  params: Promise<{ publicToken: string }>;
}

// Server component: fetch invoice data, then pass to client component
export default async function CheckoutPage({ params }: PageProps) {
  const { publicToken } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/public/invoices/${publicToken}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Invoice not found" }));
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-heading-2 text-[hsl(var(--brand-error))] mb-2">Invoice unavailable</p>
          <p className="text-body-sm text-[hsl(var(--text-secondary))]">{data.error}</p>
        </div>
      </div>
    );
  }

  const { invoice } = await res.json();

  return <CheckoutClient invoice={invoice} publicToken={publicToken} />;
}
