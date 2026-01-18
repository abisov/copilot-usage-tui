import { homedir } from "os"
import { join } from "path"
import type { Config } from "../types.ts"

const CONFIG_FILE = join(homedir(), ".copilot-usage.json")

/**
 * Check if config file exists
 */
export async function hasConfig(): Promise<boolean> {
  try {
    const file = Bun.file(CONFIG_FILE)
    return await file.exists()
  } catch {
    return false
  }
}

/**
 * Load config from file
 */
export async function loadConfig(): Promise<Config | null> {
  try {
    const file = Bun.file(CONFIG_FILE)
    if (!(await file.exists())) {
      return null
    }
    const text = await file.text()
    const config = JSON.parse(text) as Config
    
    // Validate config
    if (typeof config.quota !== "number" || config.quota <= 0) {
      return null
    }
    if (typeof config.plan !== "string") {
      return null
    }
    
    return config
  } catch {
    return null
  }
}

/**
 * Save config to file
 */
export async function saveConfig(config: Config): Promise<void> {
  const text = JSON.stringify(config, null, 2)
  await Bun.write(CONFIG_FILE, text)
}

/**
 * Delete config file
 */
export async function deleteConfig(): Promise<void> {
  try {
    const { unlink } = await import("fs/promises")
    await unlink(CONFIG_FILE)
  } catch {
    // File might not exist, that's fine
  }
}

/**
 * Get config file path (for display purposes)
 */
export function getConfigPath(): string {
  return CONFIG_FILE
}
