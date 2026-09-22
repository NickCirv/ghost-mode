# ghost-mode — command reference

[Overview](../README.md) · [Research record](RESEARCH.md)

Describes revision `a3f33122bdfa8ad617753b9f8b7a0348fdfe690c`. Commands are source-inspected; no execution results are asserted.

## Workflow

Adds project .claude/settings.json hooks and supports install, uninstall, status and aggressive/balanced/subtle configurations. The bundled scripts check patterns such as console logging and secret-like text.

Installation and config commands rewrite project settings. Review the bundled shell scripts and existing hooks before enabling them.

```bash
node bin/ghost.js status
```

## Commands and controls

| Control | Behavior in the inspected implementation |
| --- | --- |
| `status` | Inspect installation through the existing status detector |
| `install --mode MODE` | Write hooks using aggressive, balanced or subtle mode |
| `config MODE` | Update mode and reinstall hooks |
| `uninstall` | Remove marked Ghost hooks |

## Interpretation and side effects

These are scripted checks, not an autonomous AI reviewer. The captured status implementation looks for matcher ghost-mode while generated hook matchers use tool names, so status can under-report an installation. Inspect settings directly when troubleshooting.

## Implementation reference

- [package.json](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/package.json)
- [bin/ghost.js](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/bin/ghost.js)
- [src/index.js](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/src/index.js)
- [test/smoke.test.js](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/test/smoke.test.js)
