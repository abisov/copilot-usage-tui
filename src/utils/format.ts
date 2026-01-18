/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/**
 * Format a number with commas as thousand separators
 */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US")
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Calculate percentage with bounds checking
 */
export function calculatePercent(used: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, (used / total) * 100)
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  return months[month - 1] || "Unknown"
}

/**
 * Pad a string to a fixed width (right-aligned for numbers)
 */
export function padLeft(str: string, width: number): string {
  return str.padStart(width)
}

/**
 * Pad a string to a fixed width (left-aligned for text)
 */
export function padRight(str: string, width: number): string {
  return str.padEnd(width)
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + "…"
}
