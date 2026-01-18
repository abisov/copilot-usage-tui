import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core"
import { THEME, type UsageItem } from "../../types.ts"
import { formatCurrency, formatNumber, padLeft, padRight, truncate } from "../../utils/format.ts"

export interface TableOptions {
  items: UsageItem[]
  maxRows?: number
}

export class TableComponent {
  private renderer: CliRenderer
  private container: BoxRenderable

  // Column widths
  private readonly COL_MODEL = 22
  private readonly COL_REQUESTS = 10
  private readonly COL_COST = 12

  constructor(renderer: CliRenderer, options: TableOptions) {
    this.renderer = renderer
    const { items, maxRows = 10 } = options

    this.container = new BoxRenderable(renderer, {
      id: "table-container",
      flexDirection: "column",
      width: "100%",
    })

    this.createTable(items, maxRows)
  }

  private createTable(items: UsageItem[], maxRows: number) {
    // Header
    const headerRow = new BoxRenderable(this.renderer, {
      id: "table-header",
      flexDirection: "row",
    })

    const headerModel = new TextRenderable(this.renderer, {
      id: "header-model",
      content: padRight("Model", this.COL_MODEL),
      fg: THEME.fgMuted,
    })

    const headerRequests = new TextRenderable(this.renderer, {
      id: "header-requests",
      content: padLeft("Requests", this.COL_REQUESTS),
      fg: THEME.fgMuted,
    })

    const headerCost = new TextRenderable(this.renderer, {
      id: "header-cost",
      content: padLeft("Cost", this.COL_COST),
      fg: THEME.fgMuted,
    })

    headerRow.add(headerModel)
    headerRow.add(headerRequests)
    headerRow.add(headerCost)
    this.container.add(headerRow)

    // Separator
    const separator = new TextRenderable(this.renderer, {
      id: "table-separator",
      content: "─".repeat(this.COL_MODEL + this.COL_REQUESTS + this.COL_COST),
      fg: THEME.border,
    })
    this.container.add(separator)

    // Data rows
    const displayItems = items.slice(0, maxRows)
    
    for (let i = 0; i < displayItems.length; i++) {
      const item = displayItems[i]
      const row = this.createRow(item, i)
      this.container.add(row)
    }

    // Show "and X more..." if truncated
    if (items.length > maxRows) {
      const moreText = new TextRenderable(this.renderer, {
        id: "table-more",
        content: `  ... and ${items.length - maxRows} more`,
        fg: THEME.fgMuted,
      })
      this.container.add(moreText)
    }
  }

  private createRow(item: UsageItem, index: number): BoxRenderable {
    const row = new BoxRenderable(this.renderer, {
      id: `table-row-${index}`,
      flexDirection: "row",
    })

    // Model name (truncate if too long)
    const modelName = truncate(item.model, this.COL_MODEL - 2)
    const modelText = new TextRenderable(this.renderer, {
      id: `row-${index}-model`,
      content: padRight(modelName, this.COL_MODEL),
      fg: THEME.fg,
    })

    // Request count
    const requestsText = new TextRenderable(this.renderer, {
      id: `row-${index}-requests`,
      content: padLeft(formatNumber(item.grossQuantity), this.COL_REQUESTS),
      fg: THEME.cyan,
    })

    // Cost
    const costText = new TextRenderable(this.renderer, {
      id: `row-${index}-cost`,
      content: padLeft(formatCurrency(item.grossAmount), this.COL_COST),
      fg: THEME.green,
    })

    row.add(modelText)
    row.add(requestsText)
    row.add(costText)

    return row
  }

  public getContainer(): BoxRenderable {
    return this.container
  }

  public destroy() {
    this.container.destroyRecursively()
  }
}
