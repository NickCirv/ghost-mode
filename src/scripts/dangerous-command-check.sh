#!/usr/bin/env bash
# Ghost: Dangerous Command Watcher
# Whispers before risky bash commands execute

CMD="$1"
[[ -z "$CMD" ]] && exit 0

DANGEROUS_PATTERNS=(
  "rm -rf"
  "rm -fr"
  "DROP TABLE"
  "DROP DATABASE"
  "TRUNCATE TABLE"
  "git push --force"
  "git push -f"
  "chmod 777"
  "mkfs\."
  "> /dev/sd"
)

for PATTERN in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$CMD" | grep -qiE "$PATTERN"; then
    echo "👻 That command looks dangerous (matched: $PATTERN). Double-check the target?" >&2
    break
  fi
done

exit 0
