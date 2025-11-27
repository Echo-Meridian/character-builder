#!/bin/bash

# Try to find Chrome executable
CHROME_BIN=""
if command -v google-chrome &> /dev/null; then
    CHROME_BIN="google-chrome"
elif command -v google-chrome-stable &> /dev/null; then
    CHROME_BIN="google-chrome-stable"
elif command -v chromium-browser &> /dev/null; then
    CHROME_BIN="chromium-browser"
elif command -v chromium &> /dev/null; then
    CHROME_BIN="chromium"
fi

if [ -z "$CHROME_BIN" ]; then
    echo "Error: Could not find Google Chrome or Chromium installation."
    echo "Please install Chrome or update this script with the correct path."
    exit 1
fi

echo "Launching $CHROME_BIN with WebGPU flags..."

# NOTE: Uncomment one of the following blocks to try different configurations.

# OPTION 1: Minimal (Try this first)
# Relies on Chrome's default backend detection.
#"$CHROME_BIN" \
#  --enable-unsafe-webgpu \
#  --enable-features=Vulkan \
#  http://localhost:5173/ai

# OPTION 2: Force Vulkan (Recommended for Linux if supported)
# "$CHROME_BIN" \
#   --enable-unsafe-webgpu \
#   --ozone-platform=x11 \
#   --use-angle=vulkan \
#   --enable-features=Vulkan,VulkanFromANGLE \
#   http://localhost:5173/ai

# OPTION 3: Force OpenGL (Use if Vulkan fails)
 "$CHROME_BIN" \
   --enable-unsafe-webgpu \
   --use-angle=gl \
   http://localhost:5173/ai
