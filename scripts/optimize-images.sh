#!/bin/bash

# Image Optimization Script for Mumtaz Health
# Uses macOS sips to resize and compress images
# Target: reduce images to max 400KB while maintaining quality

set -e

ASSETS_DIR="src/assets"
POSES_DIR="$ASSETS_DIR/poses"
MAX_WIDTH=1200
QUALITY=70

echo "🖼️  Mumtaz Health Image Optimization"
echo "===================================="
echo ""

# Function to optimize a single image
optimize_image() {
    local file="$1"
    local original_size=$(stat -f%z "$file" 2>/dev/null || echo 0)
    
    # Skip if already small enough (under 300KB)
    if [ "$original_size" -lt 307200 ]; then
        echo "  ✓ $(basename "$file") - already optimized ($(($original_size / 1024))KB)"
        return
    fi
    
    echo "  Processing $(basename "$file") ($(($original_size / 1024))KB)..."
    
    # Get current dimensions
    local width=$(sips -g pixelWidth "$file" | tail -1 | awk '{print $2}')
    
    # Resize if wider than MAX_WIDTH
    if [ "$width" -gt "$MAX_WIDTH" ]; then
        sips --resampleWidth $MAX_WIDTH "$file" >/dev/null 2>&1
    fi
    
    # For JPEG files, we can adjust quality (sips doesn't directly support quality, but resizing helps)
    # For further compression, consider using ImageMagick or a dedicated tool
    
    local new_size=$(stat -f%z "$file" 2>/dev/null || echo 0)
    local savings=$((($original_size - $new_size) * 100 / $original_size))
    
    echo "    → Reduced to $(($new_size / 1024))KB (${savings}% smaller)"
}

# Check if backup exists
if [ ! -d "$ASSETS_DIR.backup" ]; then
    echo "Creating backup of assets..."
    cp -r "$ASSETS_DIR" "$ASSETS_DIR.backup"
    echo "✓ Backup created at $ASSETS_DIR.backup"
    echo ""
fi

# Optimize poses directory
echo "📁 Optimizing poses directory..."
for file in "$POSES_DIR"/*.jpeg "$POSES_DIR"/*.jpg; do
    if [ -f "$file" ]; then
        optimize_image "$file"
    fi
done

echo ""
echo "📁 Optimizing main assets..."
for file in "$ASSETS_DIR"/*.jpeg "$ASSETS_DIR"/*.jpg; do
    if [ -f "$file" ]; then
        optimize_image "$file"
    fi
done

echo ""
echo "✅ Optimization complete!"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git diff --stat src/assets"
echo "  2. Run 'npm run build' to verify"
echo "  3. If satisfied, commit the optimized images"
echo "  4. To restore originals: rm -rf src/assets && mv src/assets.backup src/assets"
