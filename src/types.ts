// GitHub API Response Types

export interface UsageItem {
  product: string
  sku: string
  model: string
  unitType: string
  pricePerUnit: number
  grossQuantity: number
  grossAmount: number
  discountQuantity: number
  discountAmount: number
  netQuantity: number
  netAmount: number
}

export interface UsageResponse {
  timePeriod: {
    year: number
    month: number
  }
  user: string
  usageItems: UsageItem[]
}

// Aggregated usage data for display
export interface UsageSummary {
  user: string
  year: number
  month: number
  totalRequests: number
  grossAmount: number
  discountAmount: number
  netAmount: number
  items: UsageItem[]
}

// Config stored in ~/.copilot-usage.json
export interface Config {
  quota: number
  plan: string
}

// Copilot plan options
export interface PlanOption {
  name: string
  label: string
  quota: number
  description: string
}

export const PLAN_OPTIONS: PlanOption[] = [
  { name: "free", label: "Free", quota: 50, description: "50 requests/month" },
  { name: "pro", label: "Pro", quota: 300, description: "300 requests/month" },
  { name: "pro_plus", label: "Pro+", quota: 1500, description: "1,500 requests/month" },
  { name: "business", label: "Business", quota: 300, description: "300 requests/month" },
  { name: "enterprise", label: "Enterprise", quota: 1000, description: "1,000 requests/month" },
  { name: "custom", label: "Custom", quota: 0, description: "Enter custom value" },
]

// Application view states
export type ViewState = "loading" | "setup" | "auth" | "dashboard" | "settings"

// Auth status
export interface AuthStatus {
  ghInstalled: boolean
  authenticated: boolean
  hasUserScope: boolean
  username?: string
  error?: string
}

// Color theme (Tokyo Night)
export const THEME = {
  bg: "#1a1b26",
  bgDark: "#16161e",
  bgHighlight: "#292e42",
  border: "#3b4261",
  borderHighlight: "#545c7e",
  fg: "#c0caf5",
  fgDark: "#a9b1d6",
  fgMuted: "#565f89",
  blue: "#7aa2f7",
  cyan: "#7dcfff",
  green: "#9ece6a",
  yellow: "#e0af68",
  red: "#f7768e",
  magenta: "#bb9af7",
  orange: "#ff9e64",
} as const
