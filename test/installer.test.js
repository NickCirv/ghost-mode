// Installer round-trip: install writes the real hook contract into
// .claude/settings.json, uninstall removes only ghost entries, and legacy
// v1.x entries (the `_ghost`-marked env-var hooks) are cleaned on upgrade.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { install, uninstall, isInstalled } from '../src/installer.js'

function freshDir() {
  return mkdtempSync(join(tmpdir(), 'ghost-mode-install-'))
}

function readSettings(cwd) {
  return JSON.parse(readFileSync(join(cwd, '.claude', 'settings.json'), 'utf8'))
}

test('install (balanced) writes two PostToolUse whisper hooks', async () => {
  const cwd = freshDir()
  await install('balanced', cwd)
  const settings = readSettings(cwd)

  const post = settings.hooks.PostToolUse
  assert.equal(post.length, 2)
  for (const entry of post) {
    assert.equal(entry.matcher, 'Edit|Write|MultiEdit')
    assert.equal(entry.hooks[0].type, 'command')
    assert.match(entry.hooks[0].command, /^node ".*-whisper\.mjs"$/)
  }
  assert.ok(isInstalled(cwd))
})

test('install (aggressive) includes the type-error whisper', async () => {
  const cwd = freshDir()
  await install('aggressive', cwd)
  const commands = readSettings(cwd).hooks.PostToolUse.map((e) => e.hooks[0].command)
  assert.equal(commands.length, 3)
  assert.ok(commands.some((c) => c.includes('type-error-whisper.mjs')))
})

test('install is idempotent: re-running does not duplicate hooks', async () => {
  const cwd = freshDir()
  await install('balanced', cwd)
  await install('balanced', cwd)
  assert.equal(readSettings(cwd).hooks.PostToolUse.length, 2)
})

test('install preserves unrelated user hooks', async () => {
  const cwd = freshDir()
  mkdirSync(join(cwd, '.claude'), { recursive: true })
  const userHook = {
    matcher: 'Bash',
    hooks: [{ type: 'command', command: 'echo user-owned' }],
  }
  writeFileSync(
    join(cwd, '.claude', 'settings.json'),
    JSON.stringify({ hooks: { PostToolUse: [userHook] } })
  )
  await install('subtle', cwd)
  const post = readSettings(cwd).hooks.PostToolUse
  assert.equal(post.length, 2)
  assert.equal(post[0].hooks[0].command, 'echo user-owned')
})

test('upgrade removes legacy v1.x env-var hooks', async () => {
  const cwd = freshDir()
  mkdirSync(join(cwd, '.claude'), { recursive: true })
  const legacy = {
    matcher: 'Edit|Write|MultiEdit',
    hooks: [
      {
        type: 'command',
        command:
          'bash "/x/ghost-mode/src/scripts/console-log-check.sh" "$CLAUDE_TOOL_INPUT_FILE_PATH" 2>/dev/null || true',
      },
    ],
    _ghost: 'ghost-console-log',
  }
  writeFileSync(
    join(cwd, '.claude', 'settings.json'),
    JSON.stringify({ hooks: { PostToolUse: [legacy], PreToolUse: [legacy] } })
  )
  await install('balanced', cwd)
  const settings = readSettings(cwd)
  assert.equal(settings.hooks.PreToolUse, undefined)
  const commands = settings.hooks.PostToolUse.map((e) => e.hooks[0].command)
  assert.equal(commands.length, 2)
  assert.ok(commands.every((c) => !c.includes('CLAUDE_TOOL_INPUT')))
})

test('uninstall removes ghost hooks and leaves user hooks', async () => {
  const cwd = freshDir()
  mkdirSync(join(cwd, '.claude'), { recursive: true })
  const userHook = {
    matcher: 'Bash',
    hooks: [{ type: 'command', command: 'echo user-owned' }],
  }
  writeFileSync(
    join(cwd, '.claude', 'settings.json'),
    JSON.stringify({ hooks: { PostToolUse: [userHook] } })
  )
  await install('balanced', cwd)
  await uninstall(cwd)
  const settings = readSettings(cwd)
  assert.deepEqual(settings.hooks.PostToolUse, [userHook])
  assert.ok(!isInstalled(cwd))
})
