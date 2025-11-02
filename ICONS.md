# Icon System for Power Cards

## Overview
Icons will be used to replace text labels on power cards to make them more scannable and visually distinct.

## Icon Needs

### Power Type Icons
- **Augment** - For NeoSapien augmentations
- **Move** - For Sorcery/Esper moves
- **Mutation** - For Chimera mutations
- **Package** - For Automata packages

### Stage/Tier Icons
- **Stage 0, 1, 2, 3** - Simple numbers in circles for evolution stages
- **Tier I, II, III** - Roman numerals for augment/mutation tiers

## File Format & Location

### Recommended Format
**SVG (Scalable Vector Graphics)** - Best choice because:
- Scales perfectly at any size
- Small file size
- Can be colored with CSS
- Easy to inline in React components

### Alternative Formats
- **PNG** - If you prefer raster graphics (use 64x64px minimum, transparent background)
- **WebP** - Modern format with good compression

### File Location
Place icon files in:
```
/home/echo/Development/sidonia-ttrpg/character-builder/public/icons/
```

### Naming Convention
Use kebab-case names:
```
augment.svg
move.svg
mutation.svg
package.svg
stage-0.svg
stage-1.svg
stage-2.svg
stage-3.svg
tier-1.svg
tier-2.svg
tier-3.svg
```

## SVG Template

Here's a simple SVG template you can use (20x20px):

```svg
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Your icon artwork here -->
  <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
</svg>
```

**Important**: Use `fill="currentColor"` or `stroke="currentColor"` so the icon inherits the text color from CSS!

## Usage in Code

Once you create the icons, I'll integrate them like this:

```tsx
// Option 1: Inline SVG (best for styling)
<span className="badge badge--icon">
  <svg>...</svg>
  Augment
</span>

// Option 2: img tag
<span className="badge badge--icon">
  <img src="/icons/augment.svg" alt="" />
  Augment
</span>
```

## Design Tips

For Art Deco noir aesthetic:
- **Geometric shapes** - circles, triangles, hexagons
- **Clean lines** - avoid overly detailed designs
- **Metallic feel** - use the gold accent color (#d4af37)
- **Simple & bold** - must be readable at small sizes (16-20px)

## Next Steps

1. Create your icon designs (hand-drawn is fine!)
2. Convert to SVG (use tools like Inkscape, Illustrator, or online converters)
3. Save to `/public/icons/` directory
4. Let me know when ready and I'll integrate them into the power cards!
