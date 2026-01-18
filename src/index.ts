import { App } from "./ui/app.ts"

async function main() {
  try {
    await App.create()
  } catch (error) {
    console.error("Failed to start application:", error)
    process.exit(1)
  }
}

main()
