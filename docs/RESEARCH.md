# ghost-mode — research record

## Revision and scope

- Repository: [NickCirv/ghost-mode](https://github.com/NickCirv/ghost-mode)
- Commit: `a3f33122bdfa8ad617753b9f8b7a0348fdfe690c`
- Tree: `da3e93b12807492f422f5300f259f476768ad6cf`
- Captured: 14 of 14 eligible text files (all eligible text files).
- Recursive tree truncated: `False`.
- Runtime verification: **unverified**; no repository code, installation or test command was executed.

The captured file inventory is broader than the semantic review. Authoring inspected package metadata, entrypoint/argument handling and implementation paths relevant to the claims below, plus test declarations. This is documentation research, not a line-by-line security audit. Generated/binary artifacts, lockfiles and file types outside the acquisition filter were not inspected.

## Claim and evidence

| Claim | Pinned evidence | Status |
| --- | --- | --- |
| Runtime requirement and executable mapping | [package.json](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/package.json) | verified in manifest; installation unverified |
| Install local Claude Code hook scripts for selected editing and shell-command checks. | [implementation](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/bin/ghost.js) | partially verified by static implementation review |
| Operational limits and side effects | [implementation](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/bin/ghost.js) and source map in [reference](REFERENCE.md) | partially verified; runtime unverified |
| Test command definition | [package.json](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/package.json) | verified as a declaration only |

## Findings carried into the rewrite

These are scripted checks, not an autonomous AI reviewer. The captured status implementation looks for matcher ghost-mode while generated hook matchers use tool names, so status can under-report an installation. Inspect settings directly when troubleshooting.

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

## Documentation inventory and disposition

| Existing document | Disposition |
| --- | --- |
| [README.md](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/README.md) | Rewritten overview; historical copy remains at this pinned URL. |

New supporting documents: `docs/REFERENCE.md` and `docs/RESEARCH.md`. No original source or protected legal/security file was changed.

## Protected-file evidence

- `LICENSE` SHA-256 `8edf13ba2a2e443fa49e42493414f6952a4a14b6c407983a7c95162ab37f6265`.

## Remaining verification

Clean installation, useful-command execution, malformed input, side-effect boundaries, platform compatibility and end-to-end tests remain unverified. Package-registry availability and live API destinations were not checked. No performance, customer-adoption, compliance or production-readiness claim is made.

## Captured evidence index

- [LICENSE](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/LICENSE) · blob `481c289c06c96c07330f8c7dedd847c5c07ca384`.
- [README.md](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/README.md) · blob `fb9991eaec42e90d8a80b48246a9d72db85835dc`.
- [package.json](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/package.json) · blob `4db3afc4f661d619eeab62ae66c00c0553c070ba`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/.github/workflows/ci.yml) · blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [bin/ghost.js](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/bin/ghost.js) · blob `73dc7bfbd293de1a27d6b7edae07dd23c6021fe4`.
- [src/hooks.js](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/src/hooks.js) · blob `75152bd30510b0bf80a37210b79fbffed01b7905`.
- [src/index.js](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/src/index.js) · blob `a5b1679d8b1ea7922d2c5f2f62dde9c24bbe15ba`.
- [src/installer.js](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/src/installer.js) · blob `412dcbe4cb3404377496d22f76c59b3df609f486`.
- [src/scripts/console-log-check.sh](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/src/scripts/console-log-check.sh) · blob `bd38ccd5dd90f3d4786255629df7cf0ab046ef26`.
- [src/scripts/dangerous-command-check.sh](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/src/scripts/dangerous-command-check.sh) · blob `8c9af194c7a013c98065d53ebd8684ad732332ef`.
- [src/scripts/secret-scan.sh](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/src/scripts/secret-scan.sh) · blob `304e588b8dfd23478bd82aea8fdc256b35f05640`.
- [src/scripts/type-check.sh](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/src/scripts/type-check.sh) · blob `619ea996f343870993a363eccfa35b193693bd42`.
- [src/scripts/unused-import-check.sh](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/src/scripts/unused-import-check.sh) · blob `9251c85c925a9e824eeb626e012c5e4c43b76ee7`.
- [test/smoke.test.js](https://github.com/NickCirv/ghost-mode/blob/a3f33122bdfa8ad617753b9f8b7a0348fdfe690c/test/smoke.test.js) · blob `0036c7f447f6113d68a9e48e71a2559cdc7bd69d`.

## Tree files outside the captured text set

These paths were mapped but their contents were not acquired in this research pass:

- `.gitignore`
- `banner.svg`
- `package-lock.json`
