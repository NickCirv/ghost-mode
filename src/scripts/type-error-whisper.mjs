#!/usr/bin/env node
// Ghost: TypeScript error whisper (PostToolUse, Edit|Write|MultiEdit)
//
// After Claude edits or writes a .ts/.tsx/.mts/.cts file, run the project's
// own tsc (never a network npx fetch) against the nearest tsconfig.json and
// whisper the first few errors. Never blocks: always exits 0.
//
// Stays quiet when the project has no tsconfig.json or no locally installed
// TypeScript. See the README section on what these hooks cannot see.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { readPayload, editedFilePath, whisper, stayQuiet } from './lib.mjs'

const TS_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts'])
const MAX_WALK_UP = 10

function findUp(startDir, relative) {
  let dir = startDir
  for (let i = 0; i < MAX_WALK_UP; i++) {
    const candidate = join(dir, relative)
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

const payload = readPayload()
const filePath = editedFilePath(payload)
if (!filePath) stayQuiet()
if (!TS_EXTENSIONS.has(extname(filePath))) stayQuiet()
if (!existsSync(filePath)) stayQuiet()

const tsconfig = findUp(dirname(filePath), 'tsconfig.json')
if (!tsconfig) stayQuiet()

const tsc = findUp(dirname(tsconfig), join('node_modules', '.bin', 'tsc'))
if (!tsc) stayQuiet()

const result = spawnSync(tsc, ['--noEmit', '--pretty', 'false', '--project', tsconfig], {
  encoding: 'utf8',
  timeout: 60_000,
})

// Crash, timeout, or clean compile: nothing to whisper about.
if (result.error || result.status === 0) stayQuiet()

const errors = `${result.stdout || ''}\n${result.stderr || ''}`
  .split('\n')
  .filter((line) => /error TS\d+/.test(line))
  .slice(0, 3)

if (errors.length === 0) stayQuiet()

const name = basename(filePath)
whisper(
  `ghost-mode: tsc reports errors after editing ${name}: ${errors.join(' | ')}`,
  `ghost-mode type whisper: after the edit to ${filePath}, \`tsc --noEmit --project ${tsconfig}\` failed. ` +
    `First errors: ${errors.join(' | ')}. ` +
    'Note: tsc checks the whole project, so some errors may predate this edit. ' +
    'This is a warning only; the edit was not blocked.'
)
