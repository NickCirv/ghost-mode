#!/usr/bin/env bash
# Ghost: TypeScript Type Watcher
# Whispers when tsc finds type errors after a TS file edit

FILE="$1"
[[ -z "$FILE" ]] && exit 0
[[ ! -f "$FILE" ]] && exit 0
[[ "$FILE" != *.ts && "$FILE" != *.tsx ]] && exit 0

# Only run if tsconfig.json exists in the project
DIR=$(dirname "$FILE")
TSCONFIG=$(find "$DIR" -maxdepth 3 -name "tsconfig.json" 2>/dev/null | head -1)
[[ -z "$TSCONFIG" ]] && exit 0

OUTPUT=$(npx tsc --noEmit --project "$TSCONFIG" 2>&1 | grep "error TS" | head -3)
[[ -z "$OUTPUT" ]] && exit 0

while IFS= read -r line; do
  echo "👻 Type error: $line" >&2
done <<< "$OUTPUT"

exit 0
