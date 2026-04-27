import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StealthBooks — Private B2B Billing on Solana",
    template: "%s | StealthBooks",
  },
  description:
    "Privacy-native accounts receivable for crypto-native businesses. Issue invoices, receive payment through Umbra's privacy infrastructure, and disclose selectively.",
  keywords: [
    "Solana",
    "privacy",
    "billing",
    "B2B",
    "accounts receivable",
    "Umbra",
    "USDC",
    "encrypted",
  ],
  openGraph: {
    title: "StealthBooks — Private B2B Billing on Solana",
    description:
      "Issue invoices, receive private payments, and settle with selective disclosure.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-[hsl(var(--surface-base))] text-[hsl(var(--text-primary))] antialiased">
        {children}
      </body>
    </html>
  );
}
