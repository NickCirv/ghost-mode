#!/usr/bin/env bash
# Ghost: Unused Import Watcher
# Whispers when imports are found that aren't referenced in the file body

FILE="$1"
[[ -z "$FILE" ]] && exit 0
[[ ! -f "$FILE" ]] && exit 0
[[ "$FILE" != *.js && "$FILE" != *.ts && "$FILE" != *.jsx && "$FILE" != *.tsx ]] && exit 0

IMPORTS=$(grep -n "^import " "$FILE" 2>/dev/null)
[[ -z "$IMPORTS" ]] && exit 0

FOUND=0
while IFS= read -r line; do
  LINENUM=$(echo "$line" | cut -d: -f1)
  IMPORT_LINE=$(echo "$line" | cut -d: -f2-)

  # Extract imported names (handles: import X, import { X }, import { X, Y })
  NAMES=$(echo "$IMPORT_LINE" | grep -oP '(?<=\{)[^}]+(?=\})' | tr ',' '\n' | tr -d ' ' | grep -v '^$')
  if [[ -z "$NAMES" ]]; then
    NAMES=$(echo "$IMPORT_LINE" | grep -oP 'import\s+(\w+)' | awk '{print $2}')
  fi

  while IFS= read -r name; do
    [[ -z "$name" ]] && continue
    USES=$(grep -c "$name" "$FILE" 2>/dev/null || echo 0)
    # 1 = only the import line itself
    if [[ "$USES" -le 1 ]]; then
      echo "👻 '${name}' on line $LINENUM looks unused. Safe to remove?" >&2
      FOUND=1
    fi
  done <<< "$NAMES"
done <<< "$IMPORTS"

exit 0
