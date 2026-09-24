import { formatDistanceToNow, parseISO } from "date-fns"

/** Format paise to Indian rupee display: ₹1,23,456.00 */
export function formatRupees(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(rupees)
}

/** Format paise to short form: ₹1.2L, ₹45K */
export function formatRupeesShort(paise: number): string {
  const rupees = paise / 100
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`
  return `₹${rupees.toFixed(0)}`
}

/** Indian date format: 24 Sep 2026 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d)
}

/** Relative time: "2 hours ago", "3 days ago" */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}
