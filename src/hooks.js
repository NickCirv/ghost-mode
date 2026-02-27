import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dir = dirname(__filename)

const CONFIG_PATH = join(__dir, '..', '.ghost-config.json')

export function readConfig() {
  if (!existsSync(CONFIG_PATH)) return { mode: 'balanced' }
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
  } catch {
    return { mode: 'balanced' }
  }
}

export function writeConfig(cfg) {
  const current = readConfig()
  writeFileSync(CONFIG_PATH, JSON.stringify({ ...current, ...cfg }, null, 2))
}

function scriptPath(name) {
  return join(__dir, 'scripts', name)
}

// Hooks active per mode
const HOOK_MODES = {
  aggressive: ['console-log', 'type-error', 'import', 'security', 'dangerous-command'],
  balanced:   ['security', 'type-error', 'dangerous-command', 'console-log'],
  subtle:     ['security', 'dangerous-command'],
}

function makePostToolHook(id, matcher, command) {
  return {
    matcher,
    hooks: [
      {
        type: 'command',
        command,
      },
    ],
    // ghost identifier so we can remove cleanly
    _ghost: id,
  }
}

function makePreToolHook(id, matcher, command) {
  return {
    matcher,
    hooks: [
      {
        type: 'command',
        command,
      },
    ],
    _ghost: id,
  }
}

export function buildHooks(mode) {
  const active = HOOK_MODES[mode] || HOOK_MODES['balanced']
  const scriptsDir = scriptPath('')

  const postToolUse = []
  const preToolUse = []

  if (active.includes('console-log')) {
    postToolUse.push(
      makePostToolHook(
        'ghost-console-log',
        'Edit|Write|MultiEdit',
        `bash "${join(scriptsDir, 'console-log-check.sh')}" "$CLAUDE_TOOL_INPUT_FILE_PATH" 2>/dev/null || true`
      )
    )
  }

  if (active.includes('type-error')) {
    postToolUse.push(
      makePostToolHook(
        'ghost-type-error',
        'Edit|Write|MultiEdit',
        `bash "${join(scriptsDir, 'type-check.sh')}" "$CLAUDE_TOOL_INPUT_FILE_PATH" 2>/dev/null || true`
      )
    )
  }

  if (active.includes('import')) {
    postToolUse.push(
      makePostToolHook(
        'ghost-import',
        'Edit|Write|MultiEdit',
        `bash "${join(scriptsDir, 'unused-import-check.sh')}" "$CLAUDE_TOOL_INPUT_FILE_PATH" 2>/dev/null || true`
      )
    )
  }

  if (active.includes('security')) {
    postToolUse.push(
      makePostToolHook(
        'ghost-security',
        'Edit|Write|MultiEdit',
        `bash "${join(scriptsDir, 'secret-scan.sh')}" "$CLAUDE_TOOL_INPUT_FILE_PATH" 2>/dev/null || true`
      )
    )
  }

  if (active.includes('dangerous-command')) {
    preToolUse.push(
      makePreToolHook(
        'ghost-dangerous-command',
        'Bash',
        `bash "${join(scriptsDir, 'dangerous-command-check.sh')}" "$CLAUDE_TOOL_INPUT_COMMAND" 2>/dev/null || true`
      )
    )
  }

  return { postToolUse, preToolUse }
}
