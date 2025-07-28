#!/bin/bash
# Clean up development artifacts
echo "🧹 Cleaning Python cache files..."
find . -type d -name "__pycache__" -delete
find . -name "*.pyc" -delete
find . -name "*.pyo" -delete

echo "🧹 Cleaning Node.js artifacts..."
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

echo "🧹 Cleaning temporary files..."
find . -name "*.tmp" -delete
find . -name "*.temp" -delete
find . -name "*~" -delete

echo "✅ Cleanup complete!"
