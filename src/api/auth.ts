import type { AuthStatus } from "../types.ts"

/**
 * Check if gh CLI is installed
 */
async function isGhInstalled(): Promise<boolean> {
  try {
    const proc = Bun.spawn(["which", "gh"], {
      stdout: "pipe",
      stderr: "pipe",
    })
    const exitCode = await proc.exited
    return exitCode === 0
  } catch {
    return false
  }
}

/**
 * Run gh auth status and parse the output
 */
async function getGhAuthStatus(): Promise<{
  authenticated: boolean
  hasUserScope: boolean
  username?: string
}> {
  try {
    const proc = Bun.spawn(["gh", "auth", "status"], {
      stdout: "pipe",
      stderr: "pipe",
    })
    
    // gh auth status outputs to stderr
    const stderr = await new Response(proc.stderr).text()
    const stdout = await new Response(proc.stdout).text()
    const output = stderr + stdout
    const exitCode = await proc.exited
    
    if (exitCode !== 0) {
      return { authenticated: false, hasUserScope: false }
    }
    
    // Parse username from "Logged in to github.com account USERNAME"
    const usernameMatch = output.match(/Logged in to github\.com account (\w+)/)
    const username = usernameMatch?.[1]
    
    // Check for 'user' scope in token scopes
    // Format: Token scopes: 'gist', 'read:org', 'repo', 'user', 'workflow'
    const scopesLine = output.match(/Token scopes:\s*(.+)/)
    const scopesStr = scopesLine?.[1] || ""
    // Extract all quoted scope names
    const scopeMatches = scopesStr.match(/'([^']+)'/g) || []
    const scopes = scopeMatches.map(s => s.replace(/'/g, ""))
    const hasUserScope = scopes.includes("user")
    
    return {
      authenticated: true,
      hasUserScope,
      username,
    }
  } catch {
    return { authenticated: false, hasUserScope: false }
  }
}

/**
 * Check full authentication status
 */
export async function checkAuth(): Promise<AuthStatus> {
  const ghInstalled = await isGhInstalled()
  
  if (!ghInstalled) {
    return {
      ghInstalled: false,
      authenticated: false,
      hasUserScope: false,
      error: "GitHub CLI (gh) is not installed",
    }
  }
  
  const { authenticated, hasUserScope, username } = await getGhAuthStatus()
  
  if (!authenticated) {
    return {
      ghInstalled: true,
      authenticated: false,
      hasUserScope: false,
      error: "Not authenticated with GitHub CLI",
    }
  }
  
  if (!hasUserScope) {
    return {
      ghInstalled: true,
      authenticated: true,
      hasUserScope: false,
      username,
      error: "Missing 'user' scope - run: gh auth refresh -s user",
    }
  }
  
  return {
    ghInstalled: true,
    authenticated: true,
    hasUserScope: true,
    username,
  }
}

/**
 * Get auth instructions for the user
 */
export function getAuthInstructions(status: AuthStatus): string[] {
  if (!status.ghInstalled) {
    return [
      "GitHub CLI is not installed.",
      "",
      "Install it from: https://cli.github.com/",
      "",
      "Or use Homebrew:",
      "  brew install gh",
    ]
  }
  
  if (!status.authenticated) {
    return [
      "GitHub CLI is not authenticated.",
      "",
      "Run this command in your terminal:",
      "  gh auth login",
      "",
      "Then press [r] to retry.",
    ]
  }
  
  if (!status.hasUserScope) {
    return [
      "GitHub CLI is missing the required 'user' scope.",
      "",
      "Run this command in your terminal:",
      "  gh auth refresh -h github.com -s user",
      "",
      "Then press [r] to retry.",
    ]
  }
  
  return ["Authentication successful!"]
}
