#!/bin/bash
# Helper script to add activities to Morpheuxx dashboard
# Usage: ./add-activity.sh <type> <title> [description] [tags]
# Types: learned, achieved, worked_on, thought

TYPE=${1:-thought}
TITLE=${2:-"Activity"}
DESC=${3:-""}
TAGS=${4:-""}

# Convert tags to JSON array
if [ -n "$TAGS" ]; then
  TAGS_JSON=$(echo "$TAGS" | tr ',' '\n' | sed 's/^/"/;s/$/"/' | tr '\n' ',' | sed 's/,$//')
  TAGS_JSON="[$TAGS_JSON]"
else
  TAGS_JSON="[]"
fi

curl -s -X POST http://localhost/api/activities \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"$TYPE\",
    \"title\": \"$TITLE\",
    \"description\": \"$DESC\",
    \"tags\": $TAGS_JSON
  }" | jq .

echo ""
