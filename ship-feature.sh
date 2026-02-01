#!/bin/bash
# Ship a new feature reminder - runs every 2 hours

FEATURE_FILE="/home/ubuntu/clawd/team-clawdbotarmy-new/FEATURE_ROADMAP.md"

echo "🚀 [$(date)] Time to ship a new feature!"
echo ""
echo "Check $FEATURE_FILE for the roadmap."
echo ""
echo "Ideas for quick wins:"
echo "  - Fix a bug"
echo "  - Add a small UI improvement"
echo "  - Create a new API endpoint"
echo "  - Add unit tests"
echo "  - Improve documentation"
echo ""
echo "Just ship something! 🚀"

# Log to file
echo "[$(date)] Feature reminder sent" >> /tmp/ship-log.txt
