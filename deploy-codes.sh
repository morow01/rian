#!/bin/bash
# Deploy updated work codes to the TimeSheet app.
# Edit codes.xlsx first, then run this script.

cd "$(dirname "$0")"

echo "Converting codes.xlsx → codes.json..."
python3 update-codes.py || exit 1

echo ""
echo "Pushing to GitHub..."
git add codes.json
git commit -m "Update work codes" && git push && echo "" && echo "✓ Done! Changes will be live in ~1 minute."
