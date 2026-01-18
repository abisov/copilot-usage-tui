import {
  createCliRenderer,
  type CliRenderer,
  type KeyEvent,
} from "@opentui/core"
import type { ViewState, Config, UsageSummary, AuthStatus } from "../types.ts"
import { hasConfig, loadConfig } from "../config/config.ts"
import { checkAuth, runAuthRefresh, runAuthLogin } from "../api/auth.ts"
import { getUsageSummary, getUsername } from "../api/github.ts"
import { SetupScreen } from "./screens/setup.ts"
import { AuthScreen } from "./screens/auth.ts"
import { DashboardScreen } from "./screens/dashboard.ts"

export class App {
  private renderer: CliRenderer
  private currentView: ViewState = "loading"
  
  // Screens
  private setupScreen: SetupScreen | null = null
  private authScreen: AuthScreen | null = null
  private dashboardScreen: DashboardScreen | null = null
  
  // State
  private config: Config | null = null
  private authStatus: AuthStatus | null = null
  private usage: UsageSummary | null = null
  private username: string | null = null

  private constructor(renderer: CliRenderer) {
    this.renderer = renderer
  }

  static async create(): Promise<App> {
    const renderer = await createCliRenderer({
      exitOnCtrlC: true,
    })

    const app = new App(renderer)
    await app.initialize()
    return app
  }

  private async initialize() {
    // Setup keyboard handler
    this.renderer.keyInput.on("keypress", (event: KeyEvent) => {
      this.handleKeyPress(event)
    })

    // Check if config exists
    if (await hasConfig()) {
      this.config = await loadConfig()
    }

    if (!this.config) {
      // First run - show setup
      this.showSetup()
    } else {
      // Check auth
      await this.checkAuthAndProceed()
    }
  }

  private async checkAuthAndProceed() {
    this.authStatus = await checkAuth()

    if (!this.authStatus.hasUserScope) {
      this.showAuth()
    } else {
      await this.loadAndShowDashboard()
    }
  }

  private async loadAndShowDashboard() {
    // Get username if not cached
    if (!this.username) {
      this.username = await getUsername()
    }

    if (!this.username) {
      // Fallback to auth status username
      this.username = this.authStatus?.username || "unknown"
    }

    // Fetch usage data
    this.usage = await getUsageSummary(this.username)

    if (!this.usage) {
      // Handle error - for now just show auth screen
      this.authStatus = {
        ghInstalled: true,
        authenticated: true,
        hasUserScope: false,
        error: "Failed to fetch usage data. Check your authentication.",
      }
      this.showAuth()
      return
    }

    this.showDashboard()
  }

  private showSetup() {
    this.clearCurrentScreen()
    this.currentView = "setup"

    this.setupScreen = new SetupScreen(this.renderer, {
      onComplete: async (config) => {
        this.config = config
        await this.checkAuthAndProceed()
      },
    })
  }

  private showAuth() {
    this.clearCurrentScreen()
    this.currentView = "auth"

    if (!this.authStatus) {
      this.authStatus = {
        ghInstalled: false,
        authenticated: false,
        hasUserScope: false,
        error: "Unknown authentication state",
      }
    }

    this.authScreen = new AuthScreen(this.renderer, {
      authStatus: this.authStatus,
      onRetry: async () => {
        await this.checkAuthAndProceed()
      },
      onAuthenticate: async () => {
        await this.runInteractiveAuth()
      },
    })
  }

  private showDashboard() {
    this.clearCurrentScreen()
    this.currentView = "dashboard"

    if (!this.usage || !this.config) {
      return
    }

    this.dashboardScreen = new DashboardScreen(this.renderer, {
      usage: this.usage,
      config: this.config,
      onRefresh: async () => {
        await this.refresh()
      },
      onSettings: () => {
        this.showSetup()
      },
    })
  }

  private clearCurrentScreen() {
    if (this.setupScreen) {
      this.setupScreen.destroy()
      this.setupScreen = null
    }
    if (this.authScreen) {
      this.authScreen.destroy()
      this.authScreen = null
    }
    if (this.dashboardScreen) {
      this.dashboardScreen.destroy()
      this.dashboardScreen = null
    }
  }

  private async refresh() {
    if (this.username && this.config) {
      this.usage = await getUsageSummary(this.username)
      if (this.usage) {
        this.clearCurrentScreen()
        this.showDashboard()
      }
    }
  }

  private async runInteractiveAuth() {
    // Destroy the TUI to give control back to the terminal
    this.clearCurrentScreen()
    this.renderer.destroy()

    console.log("\n")

    // Run the appropriate auth command based on current status
    let success: boolean
    if (this.authStatus?.authenticated) {
      // Already authenticated, just need to add scope
      success = await runAuthRefresh()
    } else {
      // Need full login
      success = await runAuthLogin()
    }

    console.log("\n")
    if (success) {
      console.log("Authentication successful! Restarting...")
    } else {
      console.log("Authentication failed or was cancelled. Restarting...")
    }

    // Small delay to let user see the message
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Restart the app
    const newRenderer = await createCliRenderer({
      exitOnCtrlC: true,
    })
    this.renderer = newRenderer

    // Re-setup keyboard handler
    this.renderer.keyInput.on("keypress", (event: KeyEvent) => {
      this.handleKeyPress(event)
    })

    // Check auth again and proceed
    await this.checkAuthAndProceed()
  }

  private handleKeyPress(event: KeyEvent) {
    // Handle setup screen key events
    if (this.currentView === "setup" && this.setupScreen) {
      this.setupScreen.handleKey(event)
      return
    }

    // Global keybindings
    switch (event.name) {
      case "q":
        if (!event.ctrl) {
          this.renderer.destroy()
        }
        break

      case "r":
        if (this.currentView === "auth") {
          this.checkAuthAndProceed()
        } else if (this.currentView === "dashboard") {
          this.refresh()
        }
        break

      case "a":
        if (this.currentView === "auth") {
          this.runInteractiveAuth()
        }
        break

      case "s":
        if (this.currentView === "dashboard") {
          this.showSetup()
        }
        break
    }
  }

  public destroy() {
    this.clearCurrentScreen()
    this.renderer.destroy()
  }
}
