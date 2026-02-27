#!/usr/bin/env bash
# Ghost: Console Log Watcher
# Whispers when console.log is found in JS/TS files

FILE="$1"
[[ -z "$FILE" ]] && exit 0
[[ ! -f "$FILE" ]] && exit 0
[[ "$FILE" != *.js && "$FILE" != *.ts && "$FILE" != *.jsx && "$FILE" != *.tsx ]] && exit 0

MATCH=$(grep -n "console\.log" "$FILE" 2>/dev/null | head -3)
[[ -z "$MATCH" ]] && exit 0

while IFS= read -r line; do
  LINENUM=$(echo "$line" | cut -d: -f1)
  echo "👻 Psst... console.log on line $LINENUM. Remember to remove before commit." >&2
done <<< "$MATCH"

exit 0
