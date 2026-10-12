// Shared plumbing for ghost-mode hook scripts.
//
// Contract (verified against https://code.claude.com/docs/en/hooks):
// - Claude Code pipes a JSON payload to the hook's stdin. For tool events the
//   payload carries hook_event_name, tool_name, tool_input and cwd.
// - Exit 0 means "do not interfere". Any JSON object printed on stdout is
//   applied: `systemMessage` is shown to the user as a warning,
//   `hookSpecificOutput.additionalContext` is added to Claude's context.
// - Exit 2 on PreToolUse blocks the tool call. ghost-mode never exits 2:
//   every whisper is a warning, never a veto.
//
// Zero runtime dependencies on purpose: these scripts must run even when the
// host project never ran `npm install` for ghost-mode's CLI deps.

import { readFileSync, statSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit'])
const MAX_FILE_BYTES = 1024 * 1024

/** Read and parse the hook payload from stdin. Returns null on any failure. */
export function readPayload() {
  try {
    const raw = readFileSync(0, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Resolve the file a PostToolUse edit touched, or null when this event is
 * not an edit we can inspect. Never throws.
 */
export function editedFilePath(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (!EDIT_TOOLS.has(payload.tool_name)) return null
  const input = payload.tool_input || {}
  const target = input.file_path || input.notebook_path
  if (!target || typeof target !== 'string') return null
  const cwd = typeof payload.cwd === 'string' ? payload.cwd : process.cwd()
  return isAbsolute(target) ? target : resolve(cwd, target)
}

/**
 * Read a file for scanning. Returns null for missing, oversized, or
 * binary-looking files so scanners skip them silently.
 */
export function readTextFile(filePath) {
  try {
    const stats = statSync(filePath)
    if (!stats.isFile() || stats.size > MAX_FILE_BYTES) return null
    const text = readFileSync(filePath, 'utf8')
    if (text.includes('\u0000')) return null
    return text
  } catch {
    return null
  }
}

/**
 * Emit a non-blocking whisper and exit 0.
 * `userMessage` is shown to the user; `claudeContext` is handed to Claude so
 * it can act on the warning in the same turn.
 */
export function whisper(userMessage, claudeContext) {
  process.stdout.write(
    JSON.stringify({
      systemMessage: userMessage,
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: claudeContext,
      },
    }) + '\n'
  )
  process.exit(0)
}

/** Exit 0 with no output: the hook has nothing to say. */
export function stayQuiet() {
  process.exit(0)
}
