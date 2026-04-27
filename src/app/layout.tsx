import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StealthBooks — Private B2B Billing on Solana",
    template: "%s | StealthBooks",
  },
  description:
    "Privacy-native accounts receivable for crypto-native businesses. Issue invoices, receive payment through Umbra's privacy infrastructure, and disclose selectively.",
  keywords: ["Solana", "privacy", "billing", "B2B", "accounts receivable", "Umbra", "USDC", "encrypted"],
  openGraph: {
    title: "StealthBooks — Private B2B Billing on Solana",
    description: "Issue invoices, receive private payments, and settle with selective disclosure.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-dvh antialiased"
        style={{
          background: "rgb(5,7,18)",
          color: "rgb(248,250,252)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
