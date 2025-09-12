#!/usr/bin/env bash
set -euo pipefail

: "${REMOTE_URL:?Please set REMOTE_URL=<git repo url> then run: REMOTE_URL=<url> ./scripts/git-setup.sh}"

git init
git add .
git commit -m "chore: initial commit"
git branch -M master
git checkout -b develop
git checkout -b feature/initial-ui

git remote add origin "$REMOTE_URL"
git push -u origin master
git push -u origin develop
git push -u origin feature/initial-ui

echo "Done. Use feature branches like: git checkout -b feature/your-change"