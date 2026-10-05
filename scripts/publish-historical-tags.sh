#!/usr/bin/env bash
# Publish the six original annotated tags with an authorized Git credential.
# Run without arguments to verify only; --push performs an atomic, non-forced push.
set -euo pipefail

mode="${1:---verify}"
if [[ "$mode" != "--verify" && "$mode" != "--push" ]]; then
  echo "Usage: bash scripts/publish-historical-tags.sh [--verify|--push]" >&2
  exit 2
fi

root="$(git rev-parse --show-toplevel)"
target="https://github.com/Vinsett07/vinsett-forge-ai.git"
tag_workspace="$(mktemp -d)"
trap 'rm -rf "$tag_workspace"' EXIT
git clone --quiet --bare "$root/history/recovered-v0.6.0.bundle" "$tag_workspace/history.git"
git -C "$tag_workspace/history.git" fsck --full

refspecs=()
while read -r name tag_sha commit_sha; do
  actual_tag="$(git -C "$tag_workspace/history.git" rev-parse "refs/tags/$name")"
  actual_commit="$(git -C "$tag_workspace/history.git" rev-parse "refs/tags/$name^{commit}")"
  if [[ "$actual_tag" != "$tag_sha" || "$actual_commit" != "$commit_sha" ]]; then
    echo "Historical tag verification failed: $name" >&2
    exit 1
  fi
  printf '%s %s\n' "$name" "$actual_commit"
  refspecs+=("refs/tags/$name:refs/tags/$name")
done <<'TAGS'
v0.1.0-foundation 654e98831899ed63712e289f3089560297d1b246 efe704b96bc9ee4b124675aeb19c23940fdc143e
v0.2.0-milestone2 5db2fbb01fb7dc3b811de000e843d6168ed05073 7511247d3b776f75e7ccdbe30a9622344aa76e21
v0.3.0-milestone3 3ae77b1fb849e1142d6c3f29af0822a610468f17 5c6912694a5ad86706f664c41bf504fed79651d6
v0.4.0-milestone4 1fe70230033868cbec0fd036b19dd89c8d1374a1 a3694e5b7e5dfa79548fe96d3f5b7996b6503804
v0.5.0-milestone5 f57824ff87ca3a41a7e4e0abcf8052a44f5d659a e5bcf6ef79a90d03aad2509e990ade74b3ea740b
v0.6.0-milestone6 42b33dd697f856897c68c3c39f8b6eefc8d658d3 d20ca94629f854579606c6f381f1f902e52e33b4
TAGS

if [[ "$mode" == "--push" ]]; then
  # GitHub rejects these historical workflow-bearing refs without workflow access.
  # Authenticate with that permission first; this script never changes permissions.
  git -C "$tag_workspace/history.git" push --atomic "$target" "${refspecs[@]}"
  git ls-remote --tags "$target" "refs/tags/v0.*"
else
  echo "All six original annotated tags verified. No remote changes made."
fi
