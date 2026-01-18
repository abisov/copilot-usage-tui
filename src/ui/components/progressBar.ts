import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core"
import { THEME } from "../../types.ts"
import { formatNumber, formatPercent } from "../../utils/format.ts"
import { getUsageLevel } from "../../utils/prediction.ts"

export interface ProgressBarOptions {
  used: number
  quota: number
  width?: number
}

export class ProgressBarComponent {
  private renderer: CliRenderer
  private container: BoxRenderable
  private labelText: TextRenderable
  private barContainer: BoxRenderable
  private barFilled: TextRenderable
  private barEmpty: TextRenderable

  constructor(renderer: CliRenderer, options: ProgressBarOptions) {
    this.renderer = renderer

    const { used, quota, width = 50 } = options
    const percent = quota > 0 ? (used / quota) * 100 : 0
    const level = getUsageLevel(percent)

    // Get color based on usage level
    const barColor = this.getBarColor(level)

    // Container
    this.container = new BoxRenderable(renderer, {
      id: "progress-container",
      flexDirection: "column",
      width: "100%",
      gap: 0,
    })

    // Label: "Premium Requests: 710 / 1,500 (47.3%)"
    this.labelText = new TextRenderable(renderer, {
      id: "progress-label",
      content: `Premium Requests: ${formatNumber(used)} / ${formatNumber(quota)} (${formatPercent(percent)})`,
      fg: THEME.fg,
    })

    // Bar container
    this.barContainer = new BoxRenderable(renderer, {
      id: "progress-bar-container",
      flexDirection: "row",
      width: width,
    })

    // Calculate bar segments
    const filledWidth = Math.round((percent / 100) * width)
    const emptyWidth = width - filledWidth

    // Filled portion
    this.barFilled = new TextRenderable(renderer, {
      id: "progress-bar-filled",
      content: "█".repeat(Math.max(0, filledWidth)),
      fg: barColor,
    })

    // Empty portion
    this.barEmpty = new TextRenderable(renderer, {
      id: "progress-bar-empty",
      content: "░".repeat(Math.max(0, emptyWidth)),
      fg: THEME.border,
    })

    this.barContainer.add(this.barFilled)
    this.barContainer.add(this.barEmpty)

    this.container.add(this.labelText)
    this.container.add(this.barContainer)
  }

  private getBarColor(level: "normal" | "warning" | "critical"): string {
    switch (level) {
      case "critical":
        return THEME.red
      case "warning":
        return THEME.yellow
      default:
        return THEME.blue
    }
  }

  public update(used: number, quota: number, width: number = 50) {
    const percent = quota > 0 ? (used / quota) * 100 : 0
    const level = getUsageLevel(percent)
    const barColor = this.getBarColor(level)

    this.labelText.content = `Premium Requests: ${formatNumber(used)} / ${formatNumber(quota)} (${formatPercent(percent)})`

    const filledWidth = Math.round((percent / 100) * width)
    const emptyWidth = width - filledWidth

    this.barFilled.content = "█".repeat(Math.max(0, filledWidth))
    this.barFilled.fg = barColor
    this.barEmpty.content = "░".repeat(Math.max(0, emptyWidth))
  }

  public getContainer(): BoxRenderable {
    return this.container
  }

  public destroy() {
    this.container.destroyRecursively()
  }
}
