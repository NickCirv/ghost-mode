![Banner](banner.svg)

# ghost-mode

> 👻 An invisible AI pair programmer

Ghost Mode installs silent watchers into your Claude Code workflow. They don't interrupt. They don't block. They just... whisper when you need it.

## Quick Start

```bash
# Install the ghost
npx ghost-mode install

# That's it. Keep coding. You won't see Ghost Mode...
# ...until it has something to say.
```

## What Ghost Does

Ghost watches silently. When it notices something, it whispers:

```
👻 Psst... console.log on line 47. Remember to remove before commit.
👻 'useEffect' on line 3 looks unused. Safe to remove?
👻 Type error: 'string' is not assignable to type 'number'
👻 That looks like a hardcoded secret on line 15. Use an env var instead?
👻 That command looks dangerous (matched: rm -rf). Double-check the target?
```

## Ghost Sensitivity

```bash
# Aggressive: whispers about everything
npx ghost-mode config aggressive

# Balanced (default): security + errors only
npx ghost-mode config balanced

# Subtle: only critical security issues
npx ghost-mode config subtle
```

## What Ghost Watches

| Ghost | Watches For | When |
|-------|------------|------|
| Console Ghost | console.log in JS/TS | After file edits |
| Type Ghost | TypeScript errors | After .ts/.tsx edits |
| Import Ghost | Unused imports | After file edits |
| Secret Ghost | Hardcoded credentials | After file edits |
| Danger Ghost | Risky commands | Before bash execution |

## Ghost Rules

1. Ghosts **never block** — they only suggest
2. Ghosts **never modify** your code — you decide
3. Ghosts are **silent** when everything is fine
4. Ghosts **disappear** when you uninstall

```bash
# Check if ghost is watching
npx ghost-mode status

# Remove the ghost
npx ghost-mode uninstall
```

## Requirements
- Claude Code (hooks feature)
- Node.js 18+

## Related
- [fix-it-felix](https://github.com/NickCirv/fix-it-felix) — Self-healing CI
- [ai-code-roast](https://github.com/NickCirv/ai-code-roast) — Brutal code reviews

## License
MIT — NickCirv
