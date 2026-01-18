# copilot-usage-tui

A terminal UI for viewing your GitHub Copilot premium request usage.

[![npm version](https://img.shields.io/npm/v/copilot-usage-tui.svg)](https://www.npmjs.com/package/copilot-usage-tui)
![Tokyo Night themed](https://img.shields.io/badge/theme-Tokyo%20Night-7aa2f7)

## Features

- View your monthly premium request usage with a visual progress bar
- Model breakdown chart showing usage across different AI models
- Cost summary (gross, discount, net)
- End-of-month usage prediction with overage cost estimation
- Interactive plan/quota setup on first run
- Manual refresh with `r` key

## Requirements

- [Bun](https://bun.sh/) runtime
- [GitHub CLI](https://cli.github.com/) (`gh`) authenticated with the `user` scope

## Installation

### Quick run (no install)

```bash
bunx copilot-usage-tui
```

### Install globally

```bash
bun install -g copilot-usage-tui
```

Then run:

```bash
copilot-usage-tui
```

### From source

```bash
git clone https://github.com/abisov/copilot-usage-tui.git
cd copilot-usage-tui
bun install
bun run start
```

## Setup

Ensure your GitHub CLI has the required `user` scope:

```bash
gh auth refresh -h github.com -s user
```

## Usage

On first run, you'll be prompted to select your Copilot plan to set your monthly quota.

### Keybindings

| Key | Action |
|-----|--------|
| `r` | Refresh usage data |
| `s` | Open settings (change plan) |
| `q` | Quit |

## Configuration

Config is stored at `~/.copilot-usage.json` and contains your selected plan and quota.

## How it works

Uses an undocumented GitHub billing API endpoint accessed via the `gh` CLI:
```
gh api users/{username}/settings/billing/premium_request/usage
```

## License

MIT
