<div align="center">

# ghost-mode

**Silent Claude Code hooks that whisper warnings — console.log, secrets, type errors — without ever blocking your flow**

[![license](https://img.shields.io/badge/license-MIT-blue?labelColor=0B0A09)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?labelColor=0B0A09)](https://nodejs.org)

</div>

## Install

```bash
npx github:NickCirv/ghost-mode install
```

## Usage

```bash
# Install ghost hooks into .claude/settings.json (default: balanced sensitivity)
npx github:NickCirv/ghost-mode install --mode balanced

# Check whether Ghost Mode is active in the current project
npx github:NickCirv/ghost-mode status

# Change sensitivity level
npx github:NickCirv/ghost-mode config aggressive

# Remove all ghost hooks
npx github:NickCirv/ghost-mode uninstall
```

| Flag | Description |
|------|-------------|
| `--mode <mode>` | Sensitivity on install: `aggressive` \| `balanced` (default) \| `subtle` |

## What it does

Ghost Mode installs five lightweight Claude Code hooks (`PostToolUse` + `PreToolUse`) that run pattern checks after every file edit or shell command. When a ghost spots something — a leftover `console.log`, a hardcoded secret, a TypeScript error, an unused import, or a dangerous command like `rm -rf` — it appends a one-line whisper to your Claude session. It never blocks, never modifies your code, and stays completely silent when everything is fine.

| Ghost | Watches For | Fires When |
|-------|------------|------------|
| Console Ghost | `console.log` in JS/TS files | After file edits |
| Type Ghost | TypeScript errors | After `.ts`/`.tsx` edits |
| Import Ghost | Unused imports | After file edits |
| Secret Ghost | Hardcoded credentials and API keys | After file edits |
| Danger Ghost | Risky shell commands (`rm -rf`, `DROP TABLE`) | Before bash execution |

Requires Claude Code with hooks support. No API key needed — Ghost Mode uses Claude Code's native hook system with no extra AI calls.

---
<sub>Node ≥18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
