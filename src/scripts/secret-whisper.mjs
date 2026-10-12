#!/usr/bin/env node
// Ghost: secret whisper (PostToolUse, Edit|Write|MultiEdit)
//
// After Claude edits or writes a file, scan that file for hardcoded
// credential patterns and whisper a warning. Never blocks: always exits 0.
// The matched value is never echoed back, only the line number and the
// pattern family, so the warning itself cannot leak the secret.

import { basename } from 'node:path'
import { readPayload, editedFilePath, readTextFile, whisper, stayQuiet } from './lib.mjs'

const PATTERNS = [
  { label: 'password assignment', re: /(password|passwd|pwd)\s*[:=]\s*['"][^'"]{4,}['"]/i },
  { label: 'API key assignment', re: /api[_-]?key\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { label: 'secret/token assignment', re: /(secret|token)\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { label: 'OpenAI-style key', re: /sk-[a-zA-Z0-9]{20,}/ },
  { label: 'AWS access key id', re: /AKIA[0-9A-Z]{16}/ },
  { label: 'GitHub personal access token', re: /ghp_[a-zA-Z0-9]{36}/ },
]

// Lines that reference the environment are the fix, not the problem.
const ENV_REFERENCE = /process\.env|import\.meta\.env|os\.environ|getenv\(|ENV\[/

const payload = readPayload()
const filePath = editedFilePath(payload)
if (!filePath) stayQuiet()

// .env.example and friends exist to show placeholder shapes.
if (/^\.env\.(example|sample|template)$/.test(basename(filePath))) stayQuiet()

const text = readTextFile(filePath)
if (!text) stayQuiet()

const findings = []
const lines = text.split('\n')
for (let i = 0; i < lines.length && findings.length < 3; i++) {
  const line = lines[i]
  if (ENV_REFERENCE.test(line)) continue
  for (const { label, re } of PATTERNS) {
    if (re.test(line)) {
      findings.push(`line ${i + 1}: looks like a ${label}`)
      break
    }
  }
}

if (findings.length === 0) stayQuiet()

const name = basename(filePath)
whisper(
  `ghost-mode: possible hardcoded secret in ${name} (${findings.join('; ')}). Use an env var instead?`,
  `ghost-mode secret whisper: ${filePath} may contain hardcoded credentials (${findings.join('; ')}). ` +
    'If these are real secrets, move them to environment variables before committing. ' +
    'This is a warning only; the edit was not blocked.'
)
