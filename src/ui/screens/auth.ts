import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core"
import { THEME, type AuthStatus } from "../../types.ts"
import { getAuthInstructions } from "../../api/auth.ts"

export interface AuthScreenOptions {
  authStatus: AuthStatus
  onRetry: () => void
}

export class AuthScreen {
  private renderer: CliRenderer
  private container: BoxRenderable

  constructor(renderer: CliRenderer, options: AuthScreenOptions) {
    this.renderer = renderer

    // Main container
    this.container = new BoxRenderable(renderer, {
      id: "auth-screen",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: THEME.bg,
    })

    this.createUI(options.authStatus)
    renderer.root.add(this.container)
  }

  private createUI(authStatus: AuthStatus) {
    // Title box
    const titleBox = new BoxRenderable(this.renderer, {
      id: "auth-title-box",
      width: 60,
      flexDirection: "column",
      alignItems: "center",
      padding: 1,
      border: ["top", "left", "right"],
      borderStyle: "rounded",
      borderColor: THEME.yellow,
      backgroundColor: THEME.bgDark,
    })

    const title = new TextRenderable(this.renderer, {
      id: "auth-title",
      content: "Authentication Required",
      fg: THEME.yellow,
    })

    titleBox.add(title)

    // Content box
    const contentBox = new BoxRenderable(this.renderer, {
      id: "auth-content-box",
      width: 60,
      flexDirection: "column",
      padding: 2,
      border: ["bottom", "left", "right"],
      borderStyle: "rounded",
      borderColor: THEME.border,
      backgroundColor: THEME.bgDark,
    })

    // Get instructions based on auth status
    const instructions = getAuthInstructions(authStatus)

    for (let i = 0; i < instructions.length; i++) {
      const line = instructions[i]
      const isCommand = line.startsWith("  ")
      
      const text = new TextRenderable(this.renderer, {
        id: `auth-instruction-${i}`,
        content: line || " ",
        fg: isCommand ? THEME.cyan : THEME.fg,
      })
      contentBox.add(text)
    }

    // Spacer
    const spacer = new BoxRenderable(this.renderer, {
      id: "auth-spacer",
      height: 2,
    })
    contentBox.add(spacer)

    // Keybindings hint
    const hint = new TextRenderable(this.renderer, {
      id: "auth-hint",
      content: "[r] Retry   [q] Quit",
      fg: THEME.fgMuted,
    })
    contentBox.add(hint)

    this.container.add(titleBox)
    this.container.add(contentBox)
  }

  public destroy() {
    this.container.destroyRecursively()
  }
}
