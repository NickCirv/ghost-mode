import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { buildHooks, writeConfig } from './hooks.js'

const SETTINGS_PATH = join(process.cwd(), '.claude', 'settings.json')
const CLAUDE_DIR = join(process.cwd(), '.claude')

function readSettings() {
  if (!existsSync(SETTINGS_PATH)) {
    return {}
  }
  try {
    return JSON.parse(readFileSync(SETTINGS_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function saveSettings(settings) {
  if (!existsSync(CLAUDE_DIR)) {
    mkdirSync(CLAUDE_DIR, { recursive: true })
  }
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

function stripGhostHooks(hookArray) {
  if (!Array.isArray(hookArray)) return []
  return hookArray.filter((h) => !h._ghost)
}

export async function install(mode = 'balanced') {
  writeConfig({ mode })

  const settings = readSettings()
  const { postToolUse, preToolUse } = buildHooks(mode)

  // Strip any existing ghost hooks before re-inserting
  const existingPost = stripGhostHooks(settings.hooks?.PostToolUse || [])
  const existingPre = stripGhostHooks(settings.hooks?.PreToolUse || [])

  settings.hooks = {
    ...(settings.hooks || {}),
    PostToolUse: [...existingPost, ...postToolUse],
    PreToolUse: [...existingPre, ...preToolUse],
  }

  saveSettings(settings)
}

export async function uninstall() {
  if (!existsSync(SETTINGS_PATH)) {
    return
  }

  const settings = readSettings()

  if (settings.hooks) {
    settings.hooks.PostToolUse = stripGhostHooks(settings.hooks.PostToolUse || [])
    settings.hooks.PreToolUse = stripGhostHooks(settings.hooks.PreToolUse || [])

    // Clean up empty arrays
    if (settings.hooks.PostToolUse.length === 0) delete settings.hooks.PostToolUse
    if (settings.hooks.PreToolUse.length === 0) delete settings.hooks.PreToolUse
    if (Object.keys(settings.hooks).length === 0) delete settings.hooks
  }

  saveSettings(settings)
}
