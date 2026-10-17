#!/bin/bash
#
# Build the app and publish a GitHub release for it.
#
#   - version comes from dist/webClientVersion.json (copied from src/webClientVersion.json by the prod build)
#   - tag and release title are v{VERSION}; dist-{VERSION}.zip is attached as a release asset
#   - release notes are the matching CHANGELOG.md section (falls back to GitHub generated notes)
#
# Usage: scripts/release.sh [--dry-run] [--draft] [--yes]
#   --dry-run  build and zip, run all checks, but do not create the release (checks that would stop a real
#              release on branch/clean tree/pushed state only warn)
#   --draft    create the release as a draft so it can be inspected before publishing
#   --yes      skip the confirmation prompt

set -euo pipefail

cd "$(dirname "$0")/.."

DRY_RUN=false
DRAFT=false
ASSUME_YES=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --draft) DRAFT=true ;;
    --yes) ASSUME_YES=true ;;
    *) echo "unknown option: $arg" >&2; echo "usage: $0 [--dry-run] [--draft] [--yes]" >&2; exit 2 ;;
  esac
done

NOTES_FILE=""
trap '[ -n "$NOTES_FILE" ] && rm -f "$NOTES_FILE"' EXIT

fail() { echo "ERROR: $*" >&2; exit 1; }
warn() { echo "WARNING: $*" >&2; }

# A problem that blocks a real release but only warns during a dry run.
blocker() {
  if $DRY_RUN; then warn "$* (would stop a real release)"; else fail "$*"; fi
}

# Print -1, 0 or 1 as version $1 is older than, equal to, or newer than $2.  Numeric, per component, with missing
# components treated as 0 (so 1.1.2 == 1.1.2.0 and 1.1.10.0 > 1.1.9.0).
version_cmp() {
  local IFS=.
  local -a a=($1) b=($2)
  local i x y
  for i in 0 1 2 3; do
    x=$((10#${a[i]:-0}))
    y=$((10#${b[i]:-0}))
    if [ "$x" -gt "$y" ]; then echo 1; return; fi
    if [ "$x" -lt "$y" ]; then echo -1; return; fi
  done
  echo 0
}

VERSION_RE='^[0-9]+(\.[0-9]+){2,3}$'

# ---- preflight ----

for tool in gh jq zip npm git; do
  command -v "$tool" >/dev/null || fail "required tool not found: $tool"
done
gh auth status >/dev/null 2>&1 || fail "gh is not authenticated (run: gh auth login)"

branch=$(git branch --show-current)
[ "$branch" = "master" ] || blocker "not on master (on '$branch')"

[ -z "$(git status --porcelain)" ] || blocker "working tree is not clean"

git fetch --quiet origin master --tags
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/master 2>/dev/null)" ]; then
  blocker "HEAD is not the same commit as origin/master (push or pull first); the release tags the remote commit"
fi

# ---- build ----

echo "building ..."
npm run build >/dev/null || fail "build failed (run 'npm run build' to see why)"

# ---- version checks ----

VERSION=$(jq -r .version dist/webClientVersion.json)
TAG="v$VERSION"

[[ "$VERSION" =~ $VERSION_RE ]] || fail "dist/webClientVersion.json version '$VERSION' is not a dotted numeric version"

SRC_VERSION=$(jq -r .version src/webClientVersion.json)
[ "$VERSION" = "$SRC_VERSION" ] || fail "dist version ($VERSION) differs from src/webClientVersion.json ($SRC_VERSION)"

if git ls-remote --exit-code --tags origin "refs/tags/$TAG" >/dev/null 2>&1 || git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  fail "tag $TAG already exists"
fi
if gh release view "$TAG" >/dev/null 2>&1; then
  fail "a release for $TAG already exists"
fi

# must be strictly newer than the latest published release ...
LATEST_RELEASE=$(gh release list --exclude-drafts --exclude-pre-releases --limit 1 --json tagName --jq '.[0].tagName // empty')
LATEST_RELEASE=${LATEST_RELEASE#v}
if [ -n "$LATEST_RELEASE" ]; then
  [ "$(version_cmp "$VERSION" "$LATEST_RELEASE")" = "1" ] ||
    fail "version $VERSION is not newer than the latest release $LATEST_RELEASE"
fi

# ... and than any existing v* tag, even one that never got a release
HIGHEST_TAG=""
while read -r ref; do
  t=${ref##*/v}
  [[ "$t" =~ $VERSION_RE ]] || continue
  if [ -z "$HIGHEST_TAG" ] || [ "$(version_cmp "$t" "$HIGHEST_TAG")" = "1" ]; then HIGHEST_TAG=$t; fi
done < <(git ls-remote --tags origin 'refs/tags/v*' | awk '{print $2}' | grep -v '\^{}$' || true)
if [ -n "$HIGHEST_TAG" ]; then
  [ "$(version_cmp "$VERSION" "$HIGHEST_TAG")" = "1" ] ||
    fail "version $VERSION is not newer than existing tag v$HIGHEST_TAG"
fi

# ---- package ----

ZIP="dist-$VERSION.zip"
rm -f "$ZIP"
(cd dist && zip -qr "../$ZIP" . -x 'nina-web-client.zip' -x '*.DS_Store')

# ---- release notes ----

NOTES_FILE=$(mktemp)
awk -v v="$VERSION" '
  /^## / { if (found) exit; split($0, p, " "); if (p[2] == v) { found = 1; next } }
  found { print }
' CHANGELOG.md | sed -e :a -e '/^[[:space:]]*$/{$d;N;ba' -e '}' | sed '/./,$!d' > "$NOTES_FILE"

NOTES_ARGS=(--notes-file "$NOTES_FILE")
if [ -s "$NOTES_FILE" ]; then
  NOTES_SOURCE="CHANGELOG.md section $VERSION"
else
  warn "no CHANGELOG.md section for $VERSION; using GitHub generated release notes"
  NOTES_ARGS=(--generate-notes)
  NOTES_SOURCE="GitHub generated"
fi

# ---- confirm and publish ----

echo
echo "  version : $VERSION  (latest release: ${LATEST_RELEASE:-none})"
echo "  tag     : $TAG at $(git rev-parse --short HEAD)"
echo "  title   : $TAG"
echo "  asset   : $ZIP ($(du -h "$ZIP" | cut -f1))"
echo "  notes   : $NOTES_SOURCE"
[ -s "$NOTES_FILE" ] && sed 's/^/            /' "$NOTES_FILE"
$DRAFT && echo "  draft   : yes"
echo

if $DRY_RUN; then
  echo "dry run: not creating a release"
  exit 0
fi

if ! $ASSUME_YES; then
  read -r -p "create release $TAG? [y/N] " answer
  [[ "$answer" =~ ^[Yy]$ ]] || { echo "aborted"; exit 1; }
fi

EXTRA=()
$DRAFT && EXTRA+=(--draft)

gh release create "$TAG" "$ZIP" --title "$TAG" --target "$(git rev-parse HEAD)" "${NOTES_ARGS[@]}" ${EXTRA[@]+"${EXTRA[@]}"}
git fetch --quiet --tags
