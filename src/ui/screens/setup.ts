import {
  BoxRenderable,
  TextRenderable,
  SelectRenderable,
  InputRenderable,
  type CliRenderer,
  type KeyEvent,
  SelectRenderableEvents,
  InputRenderableEvents,
} from "@opentui/core"
import { THEME, PLAN_OPTIONS, type Config } from "../../types.ts"
import { saveConfig } from "../../config/config.ts"
import { formatNumber } from "../../utils/format.ts"

export interface SetupScreenOptions {
  onComplete: (config: Config) => void
}

export class SetupScreen {
  private renderer: CliRenderer
  private container: BoxRenderable
  private select: SelectRenderable | null = null
  private customInput: InputRenderable | null = null
  private onComplete: (config: Config) => void
  private showingCustomInput = false

  constructor(renderer: CliRenderer, options: SetupScreenOptions) {
    this.renderer = renderer
    this.onComplete = options.onComplete

    // Main container
    this.container = new BoxRenderable(renderer, {
      id: "setup-screen",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: THEME.bg,
    })

    this.createUI()
    renderer.root.add(this.container)
  }

  private createUI() {
    // Title box
    const titleBox = new BoxRenderable(this.renderer, {
      id: "setup-title-box",
      width: 60,
      flexDirection: "column",
      alignItems: "center",
      padding: 1,
      border: ["top", "left", "right"],
      borderStyle: "rounded",
      borderColor: THEME.blue,
      backgroundColor: THEME.bgDark,
    })

    const title = new TextRenderable(this.renderer, {
      id: "setup-title",
      content: "Copilot Usage Setup",
      fg: THEME.blue,
    })

    titleBox.add(title)

    // Content box
    const contentBox = new BoxRenderable(this.renderer, {
      id: "setup-content-box",
      width: 60,
      flexDirection: "column",
      padding: 2,
      border: ["bottom", "left", "right"],
      borderStyle: "rounded",
      borderColor: THEME.border,
      backgroundColor: THEME.bgDark,
    })

    const description = new TextRenderable(this.renderer, {
      id: "setup-description",
      content: "Select your Copilot plan to set your monthly\npremium request quota:",
      fg: THEME.fg,
    })

    const spacer = new BoxRenderable(this.renderer, {
      id: "setup-spacer",
      height: 1,
    })

    // Plan options for select
    const selectOptions = PLAN_OPTIONS.map((plan) => ({
      name: plan.name,
      label: `${plan.label.padEnd(12)} ${plan.description}`,
    }))

    this.select = new SelectRenderable(this.renderer, {
      id: "setup-select",
      options: selectOptions,
      width: 50,
      height: PLAN_OPTIONS.length + 2,
      selectedColor: THEME.blue,
      unselectedColor: THEME.fgMuted,
    })

    // Custom input (hidden initially)
    this.customInput = new InputRenderable(this.renderer, {
      id: "setup-custom-input",
      placeholder: "Enter custom quota (e.g., 500)",
      width: 40,
      fg: THEME.fg,
      visible: false,
    })

    const hint = new TextRenderable(this.renderer, {
      id: "setup-hint",
      content: "Use ↑/↓ to navigate, Enter to select",
      fg: THEME.fgMuted,
    })

    contentBox.add(description)
    contentBox.add(spacer)
    contentBox.add(this.select)
    contentBox.add(this.customInput)
    contentBox.add(new BoxRenderable(this.renderer, { id: "hint-spacer", height: 1 }))
    contentBox.add(hint)

    this.container.add(titleBox)
    this.container.add(contentBox)

    // Handle selection
    this.select.on(SelectRenderableEvents.ITEM_SELECTED, (_index, option) => {
      const plan = PLAN_OPTIONS.find((p) => p.name === option.name)
      if (!plan) return

      if (plan.name === "custom") {
        this.showCustomInput()
      } else {
        this.savePlan(plan.name, plan.quota)
      }
    })

    // Handle custom input
    this.customInput.on(InputRenderableEvents.CHANGE, (value) => {
      const quota = parseInt(value, 10)
      if (!isNaN(quota) && quota > 0) {
        this.savePlan("custom", quota)
      }
    })

    this.select.focus()
  }

  private showCustomInput() {
    if (this.select && this.customInput) {
      this.showingCustomInput = true
      this.select.visible = false
      this.customInput.visible = true
      this.customInput.focus()
    }
  }

  private async savePlan(planName: string, quota: number) {
    const config: Config = { plan: planName, quota }
    await saveConfig(config)
    this.onComplete(config)
  }

  public handleKey(event: KeyEvent) {
    if (this.showingCustomInput && event.name === "escape") {
      // Go back to plan selection
      this.showingCustomInput = false
      if (this.customInput) {
        this.customInput.visible = false
        this.customInput.content = ""
      }
      if (this.select) {
        this.select.visible = true
        this.select.focus()
      }
      event.preventDefault()
    }
  }

  public destroy() {
    this.container.destroyRecursively()
  }
}
