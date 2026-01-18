/**
 * Get the number of days in a given month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Get the current day of the month (1-31)
 */
export function getCurrentDay(): number {
  return new Date().getDate()
}

/**
 * Get current year and month
 */
export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // JavaScript months are 0-indexed
  }
}

/**
 * Predict end-of-month usage based on current usage pattern
 * Uses linear extrapolation from current usage
 */
export function predictMonthlyUsage(
  currentUsage: number,
  currentDay: number,
  daysInMonth: number
): number {
  if (currentDay <= 0) return currentUsage
  const dailyAverage = currentUsage / currentDay
  return Math.round(dailyAverage * daysInMonth)
}

/**
 * Calculate predicted overage cost
 * @param predictedUsage - Predicted total usage for the month
 * @param quota - Monthly quota limit
 * @param pricePerRequest - Price per premium request (default $0.04)
 */
export function predictOverageCost(
  predictedUsage: number,
  quota: number,
  pricePerRequest: number = 0.04
): number {
  const overage = Math.max(0, predictedUsage - quota)
  return overage * pricePerRequest
}

/**
 * Get usage status level based on percentage
 */
export function getUsageLevel(percent: number): "normal" | "warning" | "critical" {
  if (percent >= 90) return "critical"
  if (percent >= 70) return "warning"
  return "normal"
}
