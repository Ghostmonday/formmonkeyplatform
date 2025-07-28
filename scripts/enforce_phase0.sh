#!/bin/bash
echo "🔒 Phase 0 Enforcement Script Active"
echo "Checking for unauthorized file modifications..."

# List of allowed paths
ALLOWED_PATHS=("packages/types" "AGENT_STATUS.md" "agents")

# Get list of modified files
MODIFIED=$(git status --porcelain | awk '{print $2}')

for file in $MODIFIED; do
  allowed=false
  for path in "${ALLOWED_PATHS[@]}"; do
    if [[ $file == $path* ]]; then
      allowed=true
      break
    fi
  done

  if [ "$allowed" = false ]; then
    echo "❌ Unauthorized modification detected: $file"
    echo "Only types, agents, and AGENT_STATUS.md may be modified in Phase 0."
    exit 1
  fi
done

echo "✅ All modifications are within scope. Proceed."
