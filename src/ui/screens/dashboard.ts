import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core"
import { THEME, type UsageSummary, type Config } from "../../types.ts"
import { formatCurrency, formatNumber, getMonthName } from "../../utils/format.ts"
import {
  predictMonthlyUsage,
  predictOverageCost,
  getDaysInMonth,
  getCurrentDay,
} from "../../utils/prediction.ts"
import { ProgressBarComponent } from "../components/progressBar.ts"
import { ChartComponent } from "../components/chart.ts"

export interface DashboardScreenOptions {
  usage: UsageSummary
  config: Config
  onRefresh: () => void
  onSettings: () => void
}

export class DashboardScreen {
  private renderer: CliRenderer
  private container: BoxRenderable
  private progressBar: ProgressBarComponent | null = null
  private chart: ChartComponent | null = null

  constructor(renderer: CliRenderer, options: DashboardScreenOptions) {
    this.renderer = renderer
    const { usage, config } = options

    // Main container
    this.container = new BoxRenderable(renderer, {
      id: "dashboard-screen",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      backgroundColor: THEME.bg,
      padding: 1,
    })

    this.createUI(usage, config)
    renderer.root.add(this.container)
  }

  private createUI(usage: UsageSummary, config: Config) {
    const { quota } = config
    const monthName = getMonthName(usage.month)

    // Header
    const headerBox = new BoxRenderable(this.renderer, {
      id: "dashboard-header",
      width: "100%",
      flexDirection: "column",
      alignItems: "center",
      padding: 1,
      border: ["top", "left", "right", "bottom"],
      borderStyle: "rounded",
      borderColor: THEME.blue,
      backgroundColor: THEME.bgDark,
    })

    const title = new TextRenderable(this.renderer, {
      id: "dashboard-title",
      content: `GitHub Copilot Usage - ${monthName} ${usage.year}`,
      fg: THEME.blue,
    })

    const userText = new TextRenderable(this.renderer, {
      id: "dashboard-user",
      content: `User: ${usage.user}`,
      fg: THEME.fgMuted,
    })

    headerBox.add(title)
    headerBox.add(userText)
    this.container.add(headerBox)

    // Spacer
    this.container.add(new BoxRenderable(this.renderer, { id: "spacer-1", height: 1 }))

    // Progress section
    const progressSection = new BoxRenderable(this.renderer, {
      id: "progress-section",
      width: "100%",
      flexDirection: "column",
      padding: 1,
      border: ["top", "left", "right", "bottom"],
      borderStyle: "rounded",
      borderColor: THEME.border,
      backgroundColor: THEME.bgDark,
    })

    this.progressBar = new ProgressBarComponent(this.renderer, {
      used: usage.totalRequests,
      quota: quota,
      width: 50,
    })

    progressSection.add(this.progressBar.getContainer())
    this.container.add(progressSection)

    // Spacer
    this.container.add(new BoxRenderable(this.renderer, { id: "spacer-2", height: 1 }))

    // Chart section
    const chartSection = new BoxRenderable(this.renderer, {
      id: "chart-section",
      width: "100%",
      flexDirection: "column",
      padding: 1,
      border: ["top", "left", "right", "bottom"],
      borderStyle: "rounded",
      borderColor: THEME.border,
      backgroundColor: THEME.bgDark,
    })

    this.chart = new ChartComponent(this.renderer, {
      items: usage.items,
      maxRows: 6,
      barWidth: 35,
    })

    chartSection.add(this.chart.getContainer())
    this.container.add(chartSection)

    // Spacer
    this.container.add(new BoxRenderable(this.renderer, { id: "spacer-3", height: 1 }))

    // Summary and prediction section (side by side)
    const bottomSection = new BoxRenderable(this.renderer, {
      id: "bottom-section",
      width: "100%",
      flexDirection: "row",
      gap: 2,
    })

    // Costs summary
    const costsBox = new BoxRenderable(this.renderer, {
      id: "costs-box",
      flexGrow: 1,
      flexDirection: "column",
      padding: 1,
      border: ["top", "left", "right", "bottom"],
      borderStyle: "rounded",
      borderColor: THEME.border,
      backgroundColor: THEME.bgDark,
    })

    const costsTitle = new TextRenderable(this.renderer, {
      id: "costs-title",
      content: "Costs",
      fg: THEME.fgMuted,
    })

    const costsSeparator = new TextRenderable(this.renderer, {
      id: "costs-separator",
      content: "─".repeat(25),
      fg: THEME.border,
    })

    const grossLine = new TextRenderable(this.renderer, {
      id: "costs-gross",
      content: `Gross Amount:   ${formatCurrency(usage.grossAmount)}`,
      fg: THEME.fg,
    })

    const discountLine = new TextRenderable(this.renderer, {
      id: "costs-discount",
      content: `Discount:      -${formatCurrency(usage.discountAmount)}`,
      fg: THEME.green,
    })

    const netLine = new TextRenderable(this.renderer, {
      id: "costs-net",
      content: `Net Amount:     ${formatCurrency(usage.netAmount)}`,
      fg: usage.netAmount > 0 ? THEME.yellow : THEME.green,
    })

    costsBox.add(costsTitle)
    costsBox.add(costsSeparator)
    costsBox.add(grossLine)
    costsBox.add(discountLine)
    costsBox.add(netLine)

    // Prediction box
    const predictionBox = new BoxRenderable(this.renderer, {
      id: "prediction-box",
      flexGrow: 1,
      flexDirection: "column",
      padding: 1,
      border: ["top", "left", "right", "bottom"],
      borderStyle: "rounded",
      borderColor: THEME.border,
      backgroundColor: THEME.bgDark,
    })

    const predictionTitle = new TextRenderable(this.renderer, {
      id: "prediction-title",
      content: "Prediction",
      fg: THEME.fgMuted,
    })

    const predictionSeparator = new TextRenderable(this.renderer, {
      id: "prediction-separator",
      content: "─".repeat(25),
      fg: THEME.border,
    })

    // Calculate prediction
    const currentDay = getCurrentDay()
    const daysInMonth = getDaysInMonth(usage.year, usage.month)
    const predictedUsage = predictMonthlyUsage(usage.totalRequests, currentDay, daysInMonth)
    const predictedOverage = predictOverageCost(predictedUsage, quota)

    const predictionLine = new TextRenderable(this.renderer, {
      id: "prediction-usage",
      content: `End of month:   ~${formatNumber(predictedUsage)} reqs`,
      fg: predictedUsage > quota ? THEME.yellow : THEME.fg,
    })

    const overageLine = new TextRenderable(this.renderer, {
      id: "prediction-overage",
      content: `Overage cost:    ${formatCurrency(predictedOverage)}`,
      fg: predictedOverage > 0 ? THEME.red : THEME.green,
    })

    const daysLine = new TextRenderable(this.renderer, {
      id: "prediction-days",
      content: `Day ${currentDay} of ${daysInMonth}`,
      fg: THEME.fgMuted,
    })

    predictionBox.add(predictionTitle)
    predictionBox.add(predictionSeparator)
    predictionBox.add(predictionLine)
    predictionBox.add(overageLine)
    predictionBox.add(daysLine)

    bottomSection.add(costsBox)
    bottomSection.add(predictionBox)
    this.container.add(bottomSection)

    // Spacer
    this.container.add(new BoxRenderable(this.renderer, { id: "spacer-4", height: 1 }))

    // Footer with keybindings
    const footer = new BoxRenderable(this.renderer, {
      id: "dashboard-footer",
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      padding: 1,
      border: ["top", "left", "right", "bottom"],
      borderStyle: "rounded",
      borderColor: THEME.border,
      backgroundColor: THEME.bgDark,
    })

    const keybindings = new TextRenderable(this.renderer, {
      id: "footer-keybindings",
      content: "[r] Refresh   [s] Settings   [q] Quit",
      fg: THEME.fgMuted,
    })

    footer.add(keybindings)
    this.container.add(footer)
  }

  public destroy() {
    this.container.destroyRecursively()
  }
}
