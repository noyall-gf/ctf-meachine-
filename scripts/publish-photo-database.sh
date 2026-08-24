#!/usr/bin/env bash
set -e

echo "Checking uploaded profile photos..."
NODE_BIN="${NODE_BIN:-node}"
if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
    NODE_BIN=$(find . -maxdepth 2 -type f -path "*/bin/node" -print -quit)
fi
if [ -z "$NODE_BIN" ]; then
    echo "Node.js not found. Run setup.sh first."
    exit 1
fi

PHOTO_COUNT=$($NODE_BIN --input-type=module -e 'import Database from "better-sqlite3"; const db = new Database("./data/ctf.sqlite", { readonly: true }); const row = db.prepare("SELECT COUNT(*) AS count FROM user_profile_photos").get(); console.log(row.count); db.close();')

if [ "$PHOTO_COUNT" -eq 0 ]; then
    echo "No uploaded photos found in data/ctf.sqlite. Upload photos first."
    exit 1
fi

echo "Found $PHOTO_COUNT uploaded photo(s). Publishing database baseline..."
git add data/ctf.sqlite
git commit -m "Update shared database with uploaded profile photos"
git push origin main
echo "Published. New installations will receive these photos from GitHub."