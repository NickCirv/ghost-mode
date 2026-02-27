#!/usr/bin/env bash
# Ghost: Secret Scanner
# Whispers when hardcoded credentials are detected

FILE="$1"
[[ -z "$FILE" ]] && exit 0
[[ ! -f "$FILE" ]] && exit 0

PATTERNS=(
  "password\s*=\s*['\"][^'\"]{4,}"
  "api[_-]?key\s*=\s*['\"][^'\"]{8,}"
  "secret\s*=\s*['\"][^'\"]{8,}"
  "token\s*=\s*['\"][^'\"]{8,}"
  "sk-[a-zA-Z0-9]{20,}"
  "AKIA[0-9A-Z]{16}"
  "ghp_[a-zA-Z0-9]{36}"
)

for PATTERN in "${PATTERNS[@]}"; do
  MATCH=$(grep -inE "$PATTERN" "$FILE" 2>/dev/null | grep -v "process\.env\|getenv\|os\.environ\|\.env" | head -1)
  if [[ -n "$MATCH" ]]; then
    LINENUM=$(echo "$MATCH" | cut -d: -f1)
    echo "👻 That looks like a hardcoded secret on line $LINENUM. Use an env var instead?" >&2
    break
  fi
done

exit 0
