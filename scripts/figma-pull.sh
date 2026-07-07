#!/usr/bin/env bash
# Pull all frames from the WB Account Portal Figma file via the REST API.
# Works with view/read access (no Dev seat, no desktop app).
#
# Usage:
#   1) Create a Figma Personal Access Token (figma.com → Settings → Security →
#      Personal access tokens; scope: File content = read).
#   2) Put it in a gitignored file at repo root:  echo 'YOUR_TOKEN' > .figma-token
#      (or export FIGMA_TOKEN=...)
#   3) ./scripts/figma-pull.sh
#
# Output:
#   docs/figma/file.json        raw document (gitignored)
#   docs/figma/frames.tsv       page\tid\tname\tw\th
#   docs/figma/frames.md        human index (page, frame, size, node-id, export)
#   docs/figma/exports/*.png    per-frame renders
set -euo pipefail

FILE_KEY="${FIGMA_FILE_KEY:-IaDINDvZYnKMfT8nprQZUy}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SUBDIR="${FIGMA_SUBDIR:-}"
OUT="$ROOT/docs/figma${SUBDIR:+/$SUBDIR}"
EXPORTS="$OUT/exports"
FORMAT="${FIGMA_FORMAT:-png}"
SCALE="${FIGMA_SCALE:-2}"

TOKEN="${FIGMA_TOKEN:-}"
if [ -z "$TOKEN" ] && [ -f "$ROOT/.figma-token" ]; then
  TOKEN="$(tr -d ' \n\r' < "$ROOT/.figma-token")"
fi
if [ -z "$TOKEN" ]; then
  echo "ERROR: no Figma token. Set FIGMA_TOKEN or create $ROOT/.figma-token" >&2
  exit 1
fi

mkdir -p "$EXPORTS"

echo "→ Fetching file $FILE_KEY ..."
curl -s -H "X-Figma-Token: $TOKEN" "https://api.figma.com/v1/files/$FILE_KEY" -o "$OUT/file.json"
if jq -e '.err // .status == 403' "$OUT/file.json" >/dev/null 2>&1; then
  echo "ERROR: $(jq -r '.err // "request failed"' "$OUT/file.json")" >&2
  exit 1
fi
echo "  file: $(jq -r '.name' "$OUT/file.json")"

# Top-level frames per page (canvas → children of type FRAME/COMPONENT/SECTION)
jq -r '
  .document.children[]? as $page
  | $page.children[]?
  | select(.type=="FRAME" or .type=="COMPONENT" or .type=="COMPONENT_SET" or .type=="SECTION")
  | [ $page.name, .id, .name,
      ((.absoluteBoundingBox.width  // 0) | floor | tostring),
      ((.absoluteBoundingBox.height // 0) | floor | tostring) ] | @tsv
' "$OUT/file.json" > "$OUT/frames.tsv"

COUNT=$(wc -l < "$OUT/frames.tsv" | tr -d ' ')
echo "  frames: $COUNT"

# Markdown index
{
  echo "# Figma frames — $(jq -r '.name' "$OUT/file.json")"
  echo
  echo "Source: https://www.figma.com/design/$FILE_KEY"
  echo
  echo "| Page | Frame | Size (w×h) | node-id | Export |"
  echo "|---|---|---|---|---|"
  while IFS=$'\t' read -r page id name w h; do
    safe=$(printf '%s' "$name" | tr '/ ' '__' | tr -cd '[:alnum:]_-')
    idsafe=$(printf '%s' "$id" | tr ':' '-')
    printf '| %s | %s | %s×%s | `%s` | exports/%s-%s.%s |\n' "$page" "$name" "$w" "$h" "$id" "$safe" "$idsafe" "$FORMAT"
  done < "$OUT/frames.tsv"
} > "$OUT/frames.md"

# Render frames in chunks (image endpoint takes comma-separated ids)
echo "→ Requesting renders ($FORMAT @${SCALE}x) ..."
render_chunk() {
  local ids_csv="$1"; [ -z "$ids_csv" ] && return 0
  local resp; resp=$(curl -s -H "X-Figma-Token: $TOKEN" \
    "https://api.figma.com/v1/images/$FILE_KEY?ids=$ids_csv&format=$FORMAT&scale=$SCALE")
  printf '%s' "$resp" | jq -r '.images // {} | to_entries[] | [.key, .value] | @tsv' \
  | while IFS=$'\t' read -r id url; do
      [ "$url" = "null" ] || [ -z "$url" ] && continue
      name=$(awk -F'\t' -v id="$id" '$2==id{print $3; exit}' "$OUT/frames.tsv")
      safe=$(printf '%s' "$name" | tr '/ ' '__' | tr -cd '[:alnum:]_-')
      idsafe=$(printf '%s' "$id" | tr ':' '-')
      curl -s "$url" -o "$EXPORTS/${safe}-${idsafe}.${FORMAT}"
      echo "  ✓ ${safe}-${idsafe}.${FORMAT}"
    done
}
i=0; buf=""
while IFS=$'\t' read -r page id name w h; do
  buf="${buf:+$buf,}$id"; i=$((i+1))
  if [ $((i % 15)) -eq 0 ]; then render_chunk "$buf"; buf=""; fi
done < "$OUT/frames.tsv"
render_chunk "$buf"

echo "Done."
echo "  Index:   docs/figma/frames.md"
echo "  Renders: docs/figma/exports/"
