import type { UsageResponse, UsageSummary } from "../types.ts"

/**
 * Get the current authenticated username
 */
export async function getUsername(): Promise<string | null> {
  try {
    const proc = Bun.spawn(["gh", "api", "user", "--jq", ".login"], {
      stdout: "pipe",
      stderr: "pipe",
    })
    
    const stdout = await new Response(proc.stdout).text()
    const exitCode = await proc.exited
    
    if (exitCode !== 0) {
      return null
    }
    
    return stdout.trim()
  } catch {
    return null
  }
}

/**
 * Fetch usage data from GitHub API
 */
export async function fetchUsage(username: string): Promise<UsageResponse | null> {
  try {
    const proc = Bun.spawn(
      ["gh", "api", `users/${username}/settings/billing/premium_request/usage`],
      {
        stdout: "pipe",
        stderr: "pipe",
      }
    )
    
    const stdout = await new Response(proc.stdout).text()
    const exitCode = await proc.exited
    
    if (exitCode !== 0) {
      return null
    }
    
    return JSON.parse(stdout) as UsageResponse
  } catch {
    return null
  }
}

/**
 * Parse usage response into a summary
 */
export function parseUsageSummary(response: UsageResponse): UsageSummary {
  let totalRequests = 0
  let grossAmount = 0
  let discountAmount = 0
  let netAmount = 0
  
  for (const item of response.usageItems) {
    totalRequests += item.grossQuantity
    grossAmount += item.grossAmount
    discountAmount += item.discountAmount
    netAmount += item.netAmount
  }
  
  // Sort items by grossQuantity descending
  const sortedItems = [...response.usageItems].sort(
    (a, b) => b.grossQuantity - a.grossQuantity
  )
  
  return {
    user: response.user,
    year: response.timePeriod.year,
    month: response.timePeriod.month,
    totalRequests: Math.round(totalRequests),
    grossAmount,
    discountAmount,
    netAmount,
    items: sortedItems,
  }
}

/**
 * Fetch and parse usage data
 */
export async function getUsageSummary(username: string): Promise<UsageSummary | null> {
  const response = await fetchUsage(username)
  if (!response) return null
  return parseUsageSummary(response)
}
