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

// The three whisper hooks, cheapest first. All are PostToolUse hooks on file
// edits: they read the hook payload Claude Code pipes to stdin (tool_name,
// tool_input.file_path, hook_event_name) and warn via JSON systemMessage on
// exit 0. None of them ever exits 2, so nothing is ever blocked.
export const GHOST_SCRIPTS = [
  'secret-whisper.mjs',
  'console-log-whisper.mjs',
  'type-error-whisper.mjs',
]

// Hooks active per mode. type-error runs a full `tsc --noEmit` on every TS
// edit, so it is reserved for aggressive mode.
const HOOK_MODES = {
  subtle: ['secret-whisper.mjs'],
  balanced: ['secret-whisper.mjs', 'console-log-whisper.mjs'],
  aggressive: ['secret-whisper.mjs', 'console-log-whisper.mjs', 'type-error-whisper.mjs'],
}

// Identifies a hook entry this tool owns, in any version's format, so
// install/uninstall/status stay idempotent across upgrades. Old releases
// (pre-2.0) registered *.sh scripts with a $CLAUDE_TOOL_INPUT_* env var
// contract that Claude Code never provided; they are matched here so an
// upgrade removes them.
const GHOST_COMMAND = /ghost-mode[\\/](src[\\/])?scripts[\\/][\w-]+\.(mjs|sh)/

export function isGhostEntry(entry) {
  if (!entry || typeof entry !== 'object') return false
  if (entry._ghost) return true // legacy marker from v1.x installs
  const hooks = Array.isArray(entry.hooks) ? entry.hooks : []
  return hooks.some((h) => typeof h?.command === 'string' && GHOST_COMMAND.test(h.command))
}

export function buildHooks(mode) {
  const active = HOOK_MODES[mode] || HOOK_MODES['balanced']

  // Matcher filters on tool_name. Edit covers in-place edits, Write covers
  // new files, MultiEdit kept for older Claude Code versions.
  const postToolUse = active.map((script) => ({
    matcher: 'Edit|Write|MultiEdit',
    hooks: [
      {
        type: 'command',
        command: `node "${scriptPath(script)}"`,
      },
    ],
  }))

  return { postToolUse }
}
