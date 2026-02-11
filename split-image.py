#!/usr/bin/env python3
"""
Image Splitter for Valentine Puzzle
Splits a square image into 9 tiles (3x3 grid)
"""

from PIL import Image
import os
from pathlib import Path

def split_image():
    # Define paths
    input_folder = Path("images/slide-puzzle")
    output_folder = Path("images")
    
    # Look for main_photo with common extensions
    extensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif']
    input_path = None
    
    for ext in extensions:
        candidate = input_folder / f"main_photo{ext}"
        if candidate.exists():
            input_path = candidate
            break
    
    if not input_path:
        print("❌ Error: Could not find main_photo in images/slide-puzzle/")
        print("   Supported formats: .png, .jpg, .jpeg, .bmp, .gif")
        return
    
    # Open the image
    try:
        img = Image.open(input_path)
        print(f"✓ Loaded image: {input_path}")
        print(f"  Size: {img.size}")
    except Exception as e:
        print(f"❌ Error loading image: {e}")
        return
    
    # Check if image is square
    width, height = img.size
    if width != height:
        print(f"⚠ Warning: Image is not square ({width}x{height})")
        print("  Proceeding anyway - tiles will be rectangular")
    
    # Calculate tile size
    tile_size = width // 3
    
    # Create tiles
    print(f"\nSplitting into 3x3 grid ({tile_size}x{tile_size} each)...")
    
    tile_count = 0
    for row in range(3):
        for col in range(3):
            # Calculate crop box
            left = col * tile_size
            top = row * tile_size
            right = left + tile_size
            bottom = top + tile_size
            
            # Crop and save tile
            tile = img.crop((left, top, right, bottom))
            tile_num = row * 3 + col + 1
            output_path = output_folder / f"tile-{tile_num}.png"
            tile.save(output_path)
            tile_count += 1
            print(f"  ✓ Saved tile-{tile_num}.png")
    
    # Also save the full image as full-image.png
    full_image_path = output_folder / "full-image.png"
    img.save(full_image_path)
    print(f"\n✓ Saved full image to {full_image_path}")
    
    print(f"\n✅ Success! Created {tile_count} tiles")
    print("   Ready for use in the puzzle!")

if __name__ == "__main__":
    # Ensure images/slide-puzzle folder exists
    os.makedirs("images/slide-puzzle", exist_ok=True)
    print("Valentine Puzzle Image Splitter\n")
    split_image()
