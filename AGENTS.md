# AGENTS.md

Guidelines for AI agents working on this codebase.

## Project Overview

A terminal UI (TUI) for viewing GitHub Copilot premium request usage. Built with Bun and @opentui/core.

## Tech Stack

- **Runtime**: Bun
- **TUI Framework**: @opentui/core (imperative API, not React)
- **Language**: TypeScript
- **Styling**: Tokyo Night color theme (defined in `src/types.ts`)

## Project Structure

```
src/
├── index.ts              # Entry point with shebang for bunx
├── types.ts              # TypeScript interfaces, THEME colors, PLAN_OPTIONS
├── api/
│   ├── auth.ts           # GitHub CLI auth detection and interactive auth
│   └── github.ts         # Fetch usage data via gh CLI
├── config/
│   └── config.ts         # Read/write ~/.copilot-usage.json
├── utils/
│   ├── format.ts         # Currency, number, percentage formatting
│   └── prediction.ts     # Monthly usage prediction, overage calculation
└── ui/
    ├── app.ts            # Main app controller (view switching, keyboard handling)
    ├── screens/
    │   ├── setup.ts      # First-run plan/quota selection
    │   ├── auth.ts       # Auth instructions screen
    │   └── dashboard.ts  # Main usage dashboard
    └── components/
        ├── progressBar.ts # Usage progress bar with color coding
        ├── table.ts       # Usage table component
        └── chart.ts       # Horizontal bar chart for model usage
```

## Key Patterns

### TUI Components

All UI components use @opentui/core's imperative API:
- `BoxRenderable` for layout containers
- `TextRenderable` for text content
- `SelectRenderable` for selection menus
- `InputRenderable` for text input

### State Management

- App state is managed in `src/ui/app.ts`
- Config is persisted to `~/.copilot-usage.json`
- Views: `loading`, `setup`, `auth`, `dashboard`

### External Dependencies

- Requires `gh` CLI to be installed and authenticated
- Uses undocumented GitHub billing API: `users/{username}/settings/billing/premium_request/usage`
- Requires `user` OAuth scope for the API to work

## Commit Conventions

Use semantic commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `chore:` - Build, tooling, dependencies
- `refactor:` - Code refactoring
- `test:` - Test changes

## Development Commands

```bash
bun install          # Install dependencies
bun run start        # Run the app
bun run dev          # Run with watch mode
npm publish          # Publish to npm (requires 2FA)
```

## Testing Changes

Since this is a TUI app, test by running `bun run start` and verifying:
1. Setup screen appears on first run (delete `~/.copilot-usage.json` to reset)
2. Auth screen appears if `gh` lacks `user` scope
3. Dashboard displays usage data correctly
4. Keybindings work: `r` (refresh), `s` (settings), `q` (quit), `a` (authenticate on auth screen)

## Important Notes

- The app uses Bun-specific APIs (`Bun.spawn`, `Bun.file`) - not compatible with Node.js
- Interactive auth temporarily destroys the TUI to let `gh` CLI handle stdin/stdout
- The GitHub billing API is undocumented and may change without notice
