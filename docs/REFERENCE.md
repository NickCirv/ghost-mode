# ghost-mode — command reference

[Overview](../README.md) · [Research record](RESEARCH.md)

Describes version 2.0.0. Commands below were executed on this revision; the committed test suite (25 tests) exercises the hooks and the installer round-trip.

## Workflow

`install` writes PostToolUse whisper hooks into the current project's `.claude/settings.json`. Each hook is a standalone Node script that reads the Claude Code hook payload from stdin and warns via exit-0 JSON output, per the [official hooks reference](https://code.claude.com/docs/en/hooks). Installation and config commands rewrite project settings; unrelated hooks are preserved and ghost entries from any prior version are replaced.

```bash
node bin/ghost.js status
```

## Commands and controls

| Control | Behavior |
| --- | --- |
| `status` | Report whether ghost hooks (current or legacy format) exist in `./.claude/settings.json` |
| `install --mode MODE` | Write hooks for aggressive, balanced or subtle mode |
| `config MODE` | Update mode and reinstall hooks |
| `uninstall` | Remove ghost entries only |

## Modes

| Mode | Hooks installed |
| --- | --- |
| `subtle` | secret-whisper |
| `balanced` (default) | secret-whisper, console-log-whisper |
| `aggressive` | secret-whisper, console-log-whisper, type-error-whisper |

## Interpretation and side effects

These are scripted regex and compiler checks, not an autonomous AI reviewer. Every hook exits 0 unconditionally; warnings arrive as `systemMessage` (shown to the user) plus `hookSpecificOutput.additionalContext` (handed to Claude). Hooks are registered by absolute path into the clone, so re-run `install` if the clone moves. See the README section "What these hooks can and cannot see" for scope limits.

## Implementation reference

- [package.json](../package.json)
- [bin/ghost.js](../bin/ghost.js)
- [src/hooks.js](../src/hooks.js) and [src/installer.js](../src/installer.js)
- [src/scripts/](../src/scripts/) (the three whisper hooks and shared lib)
- [test/hooks.test.js](../test/hooks.test.js) (integration harness)
