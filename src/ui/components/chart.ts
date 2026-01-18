import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core"
import { THEME, type UsageItem } from "../../types.ts"
import { formatNumber, padRight, truncate } from "../../utils/format.ts"

export interface ChartOptions {
  items: UsageItem[]
  maxRows?: number
  barWidth?: number
}

// Bar characters for different fill levels
const BAR_CHARS = ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"]

export class ChartComponent {
  private renderer: CliRenderer
  private container: BoxRenderable

  private readonly COL_MODEL = 20
  private readonly COL_COUNT = 6

  constructor(renderer: CliRenderer, options: ChartOptions) {
    this.renderer = renderer
    const { items, maxRows = 8, barWidth = 30 } = options

    this.container = new BoxRenderable(renderer, {
      id: "chart-container",
      flexDirection: "column",
      width: "100%",
    })

    this.createChart(items, maxRows, barWidth)
  }

  private createChart(items: UsageItem[], maxRows: number, barWidth: number) {
    // Title
    const title = new TextRenderable(this.renderer, {
      id: "chart-title",
      content: "Usage by Model",
      fg: THEME.fgMuted,
    })
    this.container.add(title)

    // Separator
    const separator = new TextRenderable(this.renderer, {
      id: "chart-separator",
      content: "─".repeat(this.COL_MODEL + barWidth + this.COL_COUNT + 2),
      fg: THEME.border,
    })
    this.container.add(separator)

    // Find max value for scaling
    const maxValue = items.length > 0 ? Math.max(...items.map(i => i.grossQuantity)) : 1

    // Display items
    const displayItems = items.slice(0, maxRows)
    
    // Color palette for different models
    const colors = [
      THEME.blue,
      THEME.cyan,
      THEME.green,
      THEME.magenta,
      THEME.yellow,
      THEME.orange,
      THEME.red,
      THEME.fgDark,
    ]

    for (let i = 0; i < displayItems.length; i++) {
      const item = displayItems[i]
      const row = this.createBarRow(item, i, maxValue, barWidth, colors[i % colors.length])
      this.container.add(row)
    }
  }

  private createBarRow(
    item: UsageItem,
    index: number,
    maxValue: number,
    barWidth: number,
    color: string
  ): BoxRenderable {
    const row = new BoxRenderable(this.renderer, {
      id: `chart-row-${index}`,
      flexDirection: "row",
    })

    // Model name
    const modelName = truncate(item.model, this.COL_MODEL - 2)
    const modelText = new TextRenderable(this.renderer, {
      id: `chart-${index}-model`,
      content: padRight(modelName, this.COL_MODEL),
      fg: THEME.fg,
    })

    // Calculate bar length
    const ratio = maxValue > 0 ? item.grossQuantity / maxValue : 0
    const fullBlocks = Math.floor(ratio * barWidth)
    const remainder = (ratio * barWidth) - fullBlocks
    const partialIndex = Math.floor(remainder * BAR_CHARS.length)

    let barStr = "█".repeat(fullBlocks)
    if (partialIndex > 0 && fullBlocks < barWidth) {
      barStr += BAR_CHARS[partialIndex - 1]
    }

    // Pad bar to fixed width
    barStr = barStr.padEnd(barWidth, " ")

    const barText = new TextRenderable(this.renderer, {
      id: `chart-${index}-bar`,
      content: barStr,
      fg: color,
    })

    // Request count
    const countText = new TextRenderable(this.renderer, {
      id: `chart-${index}-count`,
      content: " " + formatNumber(item.grossQuantity).padStart(this.COL_COUNT),
      fg: THEME.fgMuted,
    })

    row.add(modelText)
    row.add(barText)
    row.add(countText)

    return row
  }

  public getContainer(): BoxRenderable {
    return this.container
  }

  public destroy() {
    this.container.destroyRecursively()
  }
}
