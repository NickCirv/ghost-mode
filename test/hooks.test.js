// Integration harness for the three whisper hooks.
//
// Each test pipes a fixture hook payload (the JSON Claude Code sends on
// stdin for PostToolUse events) through the real hook script as a child
// process, then asserts on exit code and stdout. This exercises the exact
// contract Claude Code uses: stdin JSON in, exit 0 + optional JSON out.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const scripts = join(root, 'src', 'scripts')

function runHook(script, payload) {
  const input = typeof payload === 'string' ? payload : JSON.stringify(payload)
  const result = spawnSync('node', [join(scripts, script)], {
    input,
    encoding: 'utf8',
    timeout: 90_000,
  })
  return result
}

function editPayload(filePath, tool = 'Edit') {
  return {
    session_id: 'test',
    hook_event_name: 'PostToolUse',
    tool_name: tool,
    tool_input: { file_path: filePath },
    tool_response: { type: 'tool_result' },
    cwd: root,
  }
}

function parseWhisper(result) {
  assert.equal(result.status, 0, `hook must exit 0, got ${result.status}: ${result.stderr}`)
  assert.ok(result.stdout.trim().length > 0, 'expected a whisper on stdout')
  const out = JSON.parse(result.stdout)
  assert.equal(typeof out.systemMessage, 'string')
  assert.equal(out.hookSpecificOutput.hookEventName, 'PostToolUse')
  assert.equal(typeof out.hookSpecificOutput.additionalContext, 'string')
  return out
}

function assertSilent(result) {
  assert.equal(result.status, 0, `hook must exit 0, got ${result.status}: ${result.stderr}`)
  assert.equal(result.stdout.trim(), '', 'expected no output')
}

const tmp = mkdtempSync(join(tmpdir(), 'ghost-mode-test-'))

// --- console-log-whisper -------------------------------------------------

test('console-log-whisper: whispers with line numbers on a dirty file', () => {
  const file = join(tmp, 'dirty.js')
  writeFileSync(file, 'const x = 1\nconsole.log(x)\nexport default x\n')
  const out = parseWhisper(runHook('console-log-whisper.mjs', editPayload(file)))
  assert.match(out.systemMessage, /console\.log/)
  assert.match(out.systemMessage, /line 2/)
})

test('console-log-whisper: silent on a clean file', () => {
  const file = join(tmp, 'clean.js')
  writeFileSync(file, 'export const x = 1\n')
  assertSilent(runHook('console-log-whisper.mjs', editPayload(file)))
})

test('console-log-whisper: silent on non-JS files', () => {
  const file = join(tmp, 'notes.md')
  writeFileSync(file, 'console.log in prose does not count\n')
  assertSilent(runHook('console-log-whisper.mjs', editPayload(file)))
})

test('console-log-whisper: silent on test files', () => {
  const file = join(tmp, 'thing.test.js')
  writeFileSync(file, 'console.log("tests may log")\n')
  assertSilent(runHook('console-log-whisper.mjs', editPayload(file)))
})

test('console-log-whisper: silent on non-edit tools', () => {
  const file = join(tmp, 'dirty.js')
  const payload = { ...editPayload(file), tool_name: 'Bash', tool_input: { command: 'ls' } }
  assertSilent(runHook('console-log-whisper.mjs', payload))
})

test('console-log-whisper: exit 0 on malformed stdin', () => {
  assertSilent(runHook('console-log-whisper.mjs', 'not json at all'))
})

test('console-log-whisper: exit 0 on empty stdin', () => {
  assertSilent(runHook('console-log-whisper.mjs', ''))
})

// --- secret-whisper ------------------------------------------------------

test('secret-whisper: whispers on a hardcoded password without echoing it', () => {
  const file = join(tmp, 'config.js')
  writeFileSync(file, "const password = 'hunter2-prod'\n")
  const out = parseWhisper(runHook('secret-whisper.mjs', editPayload(file)))
  assert.match(out.systemMessage, /secret/i)
  assert.match(out.systemMessage, /line 1/)
  assert.ok(!out.systemMessage.includes('hunter2'), 'whisper must not echo the secret value')
  assert.ok(!out.hookSpecificOutput.additionalContext.includes('hunter2'))
})

test('secret-whisper: whispers on an AWS-style access key id', () => {
  const file = join(tmp, 'deploy.sh')
  writeFileSync(file, 'export AWS_ID=AKIAIOSFODNN7EXAMPLE\n')
  const out = parseWhisper(runHook('secret-whisper.mjs', editPayload(file, 'Write')))
  assert.match(out.systemMessage, /AWS access key/i)
})

test('secret-whisper: silent when the value comes from the environment', () => {
  const file = join(tmp, 'env-config.js')
  writeFileSync(file, "const password = process.env.DB_PASSWORD ?? 'change-me-local'\n")
  assertSilent(runHook('secret-whisper.mjs', editPayload(file)))
})

test('secret-whisper: silent on .env.example placeholder files', () => {
  const file = join(tmp, '.env.example')
  writeFileSync(file, 'API_KEY="your-api-key-goes-here"\n')
  assertSilent(runHook('secret-whisper.mjs', editPayload(file)))
})

test('secret-whisper: silent on a clean file', () => {
  const file = join(tmp, 'clean-config.js')
  writeFileSync(file, 'export const retries = 3\n')
  assertSilent(runHook('secret-whisper.mjs', editPayload(file)))
})

test('secret-whisper: exit 0 when the file does not exist', () => {
  assertSilent(runHook('secret-whisper.mjs', editPayload(join(tmp, 'missing.js'))))
})

// --- type-error-whisper --------------------------------------------------

// Fixture lives inside the repo so the walk-up finds this repo's
// node_modules/.bin/tsc (typescript is a devDependency).
const tsFixture = join(root, 'test', '.tmp-ts-fixture')

function makeTsFixture(source) {
  rmSync(tsFixture, { recursive: true, force: true })
  mkdirSync(tsFixture, { recursive: true })
  writeFileSync(
    join(tsFixture, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { strict: true, noEmit: true }, include: ['*.ts'] })
  )
  const file = join(tsFixture, 'main.ts')
  writeFileSync(file, source)
  return file
}

test('type-error-whisper: whispers when tsc finds an error after an edit', () => {
  const file = makeTsFixture('const n: number = "not a number"\n')
  const out = parseWhisper(runHook('type-error-whisper.mjs', editPayload(file)))
  assert.match(out.systemMessage, /error TS/)
  rmSync(tsFixture, { recursive: true, force: true })
})

test('type-error-whisper: silent when the project compiles', () => {
  const file = makeTsFixture('export const n: number = 1\n')
  assertSilent(runHook('type-error-whisper.mjs', editPayload(file)))
  rmSync(tsFixture, { recursive: true, force: true })
})

test('type-error-whisper: silent for TS files with no tsconfig in reach', () => {
  const file = join(tmp, 'loose.ts')
  writeFileSync(file, 'const n: number = "wrong"\n')
  assertSilent(runHook('type-error-whisper.mjs', editPayload(file)))
})

test('type-error-whisper: silent for non-TS files', () => {
  const file = join(tmp, 'plain.js')
  writeFileSync(file, 'const n = 1\n')
  assertSilent(runHook('type-error-whisper.mjs', editPayload(file)))
})

test('type-error-whisper: exit 0 on malformed stdin', () => {
  assertSilent(runHook('type-error-whisper.mjs', '{broken'))
})
