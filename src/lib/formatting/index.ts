/** Format a USDC micro-unit amount (6 decimals) to a human-readable string */
export function formatUsdc(microUnits: bigint): string {
  const whole = microUnits / 1_000_000n;
  const frac = microUnits % 1_000_000n;
  const fracStr = frac.toString().padStart(6, "0").replace(/0+$/, "");
  return fracStr.length > 0 ? `${whole}.${fracStr}` : `${whole}`;
}

/** Format as currency string: "$1,234.56" */
export function formatUsdcCurrency(microUnits: bigint): string {
  const amount = Number(microUnits) / 1_000_000;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}

/** Parse a decimal string like "12.50" to USDC micro-units */
export function parseUsdc(value: string): bigint {
  const [whole, frac = ""] = value.split(".");
  const fracPadded = frac.slice(0, 6).padEnd(6, "0");
  return BigInt(whole) * 1_000_000n + BigInt(fracPadded);
}

/** Shorten a wallet address: "GsbwX...kRFkT" */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/** Format a date to "Apr 27, 2026" */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/** Format relative time: "2 hours ago" */
export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}
