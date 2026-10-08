#!/usr/bin/env bash
# Stop hook: when Claude finishes a turn and code has changed since the last green run,
# run lint, typecheck and tests. On failure, block the stop and hand the errors back to Claude.
# See "Definition of done" in CLAUDE.md for the review that follows a green run.
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$ROOT" || exit 0
STAMP=".claude/.last-green-check"

input="$(cat)"
# Claude is already continuing because of this hook: do not loop forever.
if [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)" = "true" ]; then
  exit 0
fi

# Fingerprint of everything that can change the result: tracked changes and untracked files.
fingerprint="$(
  {
    git diff HEAD -- src package.json pnpm-lock.yaml tsconfig.json eslint.config.mjs vitest.config.mts next.config.ts 2>/dev/null
    git ls-files --others --exclude-standard -- src | while read -r f; do printf '%s\n' "$f"; cat "$f"; done
  } | shasum | cut -d' ' -f1
)"
empty="$(printf '' | shasum | cut -d' ' -f1)"

# Nothing changed, or nothing changed since the last green run: skip.
if [ "$fingerprint" = "$empty" ] || [ "$fingerprint" = "$(cat "$STAMP" 2>/dev/null)" ]; then
  exit 0
fi

log="$(mktemp)"
failed=""
for step in lint typecheck test; do
  if ! pnpm -s "$step" >>"$log" 2>&1; then failed="$step"; break; fi
done

if [ -n "$failed" ]; then
  reason="pnpm $failed failed. Fix it, then finish the Definition of done in CLAUDE.md. Last output:
$(tail -n 40 "$log")"
  rm -f "$log"
  jq -n --arg r "$reason" '{decision: "block", reason: $r}'
  exit 0
fi

rm -f "$log"
printf '%s' "$fingerprint" > "$STAMP"
jq -n '{systemMessage: "Stop hook: lint, typecheck and tests passed."}'
exit 0
