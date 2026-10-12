#!/usr/bin/env node
// Ghost: console.log whisper (PostToolUse, Edit|Write|MultiEdit)
//
// After Claude edits or writes a JS/TS file, whisper if console.log calls
// are present. Never blocks: always exits 0.

import { basename, extname } from 'node:path'
import { readPayload, editedFilePath, readTextFile, whisper, stayQuiet } from './lib.mjs'

const JS_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts'])

const payload = readPayload()
const filePath = editedFilePath(payload)
if (!filePath) stayQuiet()
if (!JS_EXTENSIONS.has(extname(filePath))) stayQuiet()

// Test files log on purpose often enough that whispering is noise.
if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(basename(filePath))) stayQuiet()

const text = readTextFile(filePath)
if (!text) stayQuiet()

const hits = []
const lines = text.split('\n')
for (let i = 0; i < lines.length && hits.length < 3; i++) {
  if (/console\.log\s*\(/.test(lines[i])) hits.push(i + 1)
}

if (hits.length === 0) stayQuiet()

const name = basename(filePath)
const where = hits.length === 1 ? `line ${hits[0]}` : `lines ${hits.join(', ')}`
whisper(
  `ghost-mode: console.log left in ${name} (${where}). Remember to remove before commit.`,
  `ghost-mode console.log whisper: ${filePath} contains console.log at ${where}. ` +
    'If these are leftover debug statements, remove them. This is a warning only; the edit was not blocked.'
)
