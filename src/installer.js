import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { buildHooks, writeConfig, isGhostEntry } from './hooks.js'

function settingsPath(cwd = process.cwd()) {
  return join(cwd, '.claude', 'settings.json')
}

function readSettings(cwd) {
  const p = settingsPath(cwd)
  if (!existsSync(p)) {
    return {}
  }
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return {}
  }
}

function saveSettings(settings, cwd = process.cwd()) {
  const dir = join(cwd, '.claude')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(settingsPath(cwd), JSON.stringify(settings, null, 2))
}

function stripGhostHooks(hookArray) {
  if (!Array.isArray(hookArray)) return []
  return hookArray.filter((h) => !isGhostEntry(h))
}

export async function install(mode = 'balanced', cwd = process.cwd()) {
  writeConfig({ mode })

  const settings = readSettings(cwd)
  const { postToolUse } = buildHooks(mode)

  // Strip any existing ghost hooks (any version) before re-inserting
  const existingPost = stripGhostHooks(settings.hooks?.PostToolUse || [])
  const existingPre = stripGhostHooks(settings.hooks?.PreToolUse || [])

  settings.hooks = {
    ...(settings.hooks || {}),
    PostToolUse: [...existingPost, ...postToolUse],
  }
  // v1.x also wrote PreToolUse entries; keep only the non-ghost ones.
  if (existingPre.length > 0) {
    settings.hooks.PreToolUse = existingPre
  } else {
    delete settings.hooks.PreToolUse
  }

  saveSettings(settings, cwd)
}

export async function uninstall(cwd = process.cwd()) {
  if (!existsSync(settingsPath(cwd))) {
    return
  }

  const settings = readSettings(cwd)

  if (settings.hooks) {
    settings.hooks.PostToolUse = stripGhostHooks(settings.hooks.PostToolUse || [])
    settings.hooks.PreToolUse = stripGhostHooks(settings.hooks.PreToolUse || [])

    // Clean up empty arrays
    if (settings.hooks.PostToolUse.length === 0) delete settings.hooks.PostToolUse
    if (settings.hooks.PreToolUse.length === 0) delete settings.hooks.PreToolUse
    if (Object.keys(settings.hooks).length === 0) delete settings.hooks
  }

  saveSettings(settings, cwd)
}

export function isInstalled(cwd = process.cwd()) {
  if (!existsSync(settingsPath(cwd))) return false
  const settings = readSettings(cwd)
  const hooks = settings.hooks || {}
  return Object.values(hooks).some(
    (arr) => Array.isArray(arr) && arr.some((h) => isGhostEntry(h))
  )
}
