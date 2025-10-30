# Sidonia Character Builder - Style Guide

## Design Philosophy
"Art Deco meets Analog Horror" - Clean geometric patterns that degrade with corruption. The interface should feel like official Republic documentation that's been touched by the Wyrm's influence.

## Core Visual Language

### Design Principles
1. **Geometric Hierarchy**: Use Art Deco angles and borders to create clear visual hierarchy
2. **Functional Elegance**: Every element should be both beautiful and usable
3. **Corruption States**: Elements can reflect character corruption level through visual degradation
4. **Responsive First**: Must work on all devices without losing the aesthetic

## Color System

### Tailwind Config Extension
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary Palette
        'sidonia-gold': '#d4af37',      // Primary accent - menus, borders, highlights
        'sidonia-brass': '#b8860b',     // Secondary accent - muted gold
        'sidonia-copper': '#b87333',    // Tertiary accent - warm metal
        
        // Background Colors
        'sidonia-black': '#0a0908',     // Deep black background
        'sidonia-dark': '#0f0d0a',      // Card backgrounds
        'sidonia-coal': '#1a0e00',      // Darker elements
        
        // Corruption Colors
        'corruption-red': '#8b0000',    // Active corruption
        'corruption-dark': '#4a0000',   // Permanent corruption
        'corruption-green': '#00ff00',  // Wyrm's influence (use sparingly)
        
        // Lineage-Specific Accents
        'lineage-neosapien': '#708090', // Slate gray
        'lineage-sorcerer': '#9370db',  // Medium purple
        'lineage-chimera': '#228b22',   // Forest green
        'lineage-automata': '#cd853f',  // Peru/brass
        'lineage-esper': '#add8e6',     // Light steel blue
        
        // Utility Colors
        'sidonia-text': '#f5f5dc',      // Beige text for readability
        'sidonia-muted': '#8b8680',     // Muted gray text
      },
      
      fontFamily: {
        'display': ['Bebas Neue', 'sans-serif'],  // Headers, titles
        'body': ['Oswald', 'sans-serif'],         // Body text
        'mono': ['Courier New', 'monospace'],     // Data, numbers
      },
      
      spacing: {
        'deco-xs': '5px',
        'deco-sm': '10px',
        'deco-md': '20px',
        'deco-lg': '30px',
        'deco-xl': '40px',
      },
      
      borderWidth: {
        '3': '3px',
      },
      
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'corruption-glow': 'corruptionGlow 2s ease-in-out infinite',
      },
      
      keyframes: {
        corruptionGlow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' },
        }
      }
    }
  }
}
```

## Component Patterns

### Base Button Component
```tsx
// components/DecoButton.tsx
interface DecoButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  lineage?: 'neosapien' | 'sorcerer' | 'chimera' | 'automata' | 'esper'
  corrupted?: boolean
}

// Tailwind Classes
const buttonBase = `
  relative font-display tracking-wider uppercase
  transition-all duration-300 
  border-2 
  hover:shadow-lg hover:shadow-sidonia-gold/20
  active:scale-95
  disabled:opacity-50 disabled:cursor-not-allowed
  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:to-transparent
  before:opacity-0 hover:before:opacity-10
`

const buttonVariants = {
  primary: `
    bg-sidonia-black border-sidonia-gold text-sidonia-gold
    hover:bg-sidonia-gold/10
  `,
  secondary: `
    bg-sidonia-dark border-sidonia-brass text-sidonia-brass
    hover:bg-sidonia-brass/10
  `,
  danger: `
    bg-sidonia-black border-corruption-red text-corruption-red
    hover:bg-corruption-red/10
  `,
  ghost: `
    bg-transparent border-transparent text-sidonia-text
    hover:border-sidonia-gold/50
  `
}

const buttonSizes = {
  sm: 'px-deco-sm py-1 text-sm',
  md: 'px-deco-md py-2 text-base',
  lg: 'px-deco-lg py-3 text-lg'
}

// Clip-path for Art Deco angles (add via CSS)
const clipPath = 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)'
```

### Card Container Pattern
```tsx
// components/DecoCard.tsx
const cardBase = `
  relative
  bg-sidonia-dark 
  border-2 border-sidonia-gold/30
  p-deco-md
  overflow-hidden
  
  // Corner decorations
  before:absolute before:top-0 before:left-0
  before:w-deco-md before:h-deco-md
  before:border-t-2 before:border-l-2
  before:border-sidonia-gold
  
  after:absolute after:bottom-0 after:right-0
  after:w-deco-md after:h-deco-md
  after:border-b-2 after:border-r-2
  after:border-sidonia-gold
`

// For sections with headers
const sectionHeader = `
  font-display text-2xl tracking-[0.2em] uppercase
  text-sidonia-gold text-center
  mb-deco-sm
  relative
  
  // Underline decoration
  after:content-['']
  after:absolute after:bottom-0 after:left-1/2
  after:transform after:-translate-x-1/2
  after:w-16 after:h-px
  after:bg-sidonia-gold
`
```

### Health/Corruption Boxes
```tsx
// components/HealthBox.tsx
const healthBox = `
  w-4 h-4
  border border-sidonia-gold
  transition-all duration-300
  cursor-pointer
  
  // Healthy state
  hover:bg-sidonia-gold/30
  
  // Damaged state (add class conditionally)
  data-[damaged=true]:bg-corruption-red
  data-[damaged=true]:border-corruption-dark
  data-[damaged=true]:relative
  data-[damaged=true]:after:absolute
  data-[damaged=true]:after:inset-0
  data-[damaged=true]:after:bg-[url('crack-pattern.svg')]
`

const corruptionBox = `
  w-3 h-5
  border border-corruption-red/50
  transition-all duration-500
  
  // Permanent corruption
  data-[permanent=true]:bg-corruption-dark
  data-[permanent=true]:border-corruption-red
  
  // Temporary corruption
  data-[temporary=true]:bg-corruption-red
  data-[temporary=true]:animate-corruption-glow
  data-[temporary=true]:shadow-sm
  data-[temporary=true]:shadow-corruption-red/50
`
```

### Form Elements
```tsx
// Input fields
const inputBase = `
  bg-sidonia-black
  border border-sidonia-gold/50
  text-sidonia-text
  px-deco-sm py-2
  font-body
  placeholder:text-sidonia-muted
  focus:border-sidonia-gold
  focus:outline-none
  focus:ring-1 focus:ring-sidonia-gold/20
  transition-all duration-300
`

// Select dropdowns
const selectBase = `
  ${inputBase}
  appearance-none
  bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23d4af37"%3e%3cpath d="M7 10l5 5 5-5z"/%3e%3c/svg%3e')]
  bg-[length:24px] bg-[position:right_0.5rem_center] bg-no-repeat
  pr-10
`
```

### Layout Patterns

#### Main Container
```tsx
const mainContainer = `
  min-h-screen
  bg-sidonia-black
  text-sidonia-text
  relative
  
  // Subtle background pattern (optional)
  before:absolute before:inset-0
  before:bg-[url('art-deco-pattern.svg')]
  before:opacity-5
  before:pointer-events-none
`
```

#### Grid Layouts
```tsx
// Responsive grid for stats/attributes
const statsGrid = `
  grid 
  grid-cols-2 md:grid-cols-3 lg:grid-cols-5
  gap-deco-sm
`

// Character sheet main layout
const sheetLayout = `
  grid
  grid-cols-1 lg:grid-cols-3
  gap-deco-md
  max-w-7xl mx-auto
`
```

### Typography Scale
```css
/* Add to your global CSS */
.text-display-lg {
  @apply font-display text-5xl tracking-wider uppercase;
}

.text-display-md {
  @apply font-display text-3xl tracking-wider uppercase;
}

.text-display-sm {
  @apply font-display text-xl tracking-wide uppercase;
}

.text-body-lg {
  @apply font-body text-lg;
}

.text-body {
  @apply font-body text-base;
}

.text-body-sm {
  @apply font-body text-sm;
}

.text-label {
  @apply font-body text-xs uppercase tracking-widest text-sidonia-muted;
}
```

## Interactive States

### Hover Effects
- Buttons: Subtle background fill + glow shadow
- Cards: Border brightens from 30% to 60% opacity
- Interactive elements: Scale up slightly (1.02) or add gold glow

### Active/Selected States
- Add `ring-2 ring-sidonia-gold` for selected items
- Background becomes `sidonia-gold/20` for active selections
- Text brightens to full `sidonia-gold` or `sidonia-text`

### Disabled States
- Reduce opacity to 50%
- Remove hover effects
- Change cursor to `not-allowed`

## Corruption Effects

As corruption increases, gradually apply these classes:

### Low Corruption (0-30%)
```css
.corruption-low {
  /* Subtle hints */
  --border-flicker: 0%;
}
```

### Medium Corruption (31-70%)
```css
.corruption-medium {
  /* Occasional glitches */
  animation: flicker 10s infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  95% { opacity: 0.95; }
}
```

### High Corruption (71%+)
```css
.corruption-high {
  /* Visible decay */
  filter: contrast(1.1) saturate(0.9);
  animation: distort 5s infinite;
}

.corruption-high .border-sidonia-gold {
  border-color: theme('colors.corruption-red');
}
```

## Responsive Breakpoints

Use Tailwind's default breakpoints:
- Mobile: Default (< 640px)
- Tablet: `sm:` (640px+)
- Desktop: `lg:` (1024px+)
- Wide: `xl:` (1280px+)

Key principles:
- Stack elements vertically on mobile
- Show 2-3 columns on tablet
- Full layout on desktop
- Never hide critical information

## Component Library Structure

```
src/
  components/
    ui/
      DecoButton.tsx
      DecoCard.tsx
      DecoInput.tsx
      DecoSelect.tsx
      HealthTracker.tsx
      CorruptionMeter.tsx
    layout/
      PageHeader.tsx
      NavigationTabs.tsx
      CharacterSheet.tsx
    character/
      LineageSelector.tsx
      AttributeDisplay.tsx
      PowerCard.tsx
      AugmentPicker.tsx
```

## Implementation Notes

1. **Import the fonts** in your index.html:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;700&display=swap" rel="stylesheet">
```

2. **Custom utility classes** can be added via Tailwind's `@layer utilities`:
```css
@layer utilities {
  .clip-deco {
    clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
  }
  
  .text-shadow-gold {
    text-shadow: 0 0 10px theme('colors.sidonia-gold' / 50%);
  }
}
```

3. **State management** with Zustand should track:
- Current corruption level (affects UI theme)
- Selected lineage (affects color accents)
- Character data (for display)

4. **Performance considerations**:
- Minimize animation on mobile
- Use CSS transforms over position changes
- Lazy load heavy components

## Example Component

```tsx
// Full example of a styled component
import { clsx } from 'clsx'

interface CharacterNameProps {
  name: string
  lineage?: string
  corrupted?: boolean
}

export const CharacterName: React.FC<CharacterNameProps> = ({ 
  name, 
  lineage, 
  corrupted 
}) => {
  return (
    <div className={clsx(
      'relative p-deco-md',
      'bg-sidonia-dark border-2',
      'before:absolute before:top-0 before:left-0',
      'before:w-deco-sm before:h-deco-sm',
      'before:border-t-2 before:border-l-2',
      'after:absolute after:bottom-0 after:right-0',
      'after:w-deco-sm after:h-deco-sm',
      'after:border-b-2 after:border-r-2',
      lineage ? `border-lineage-${lineage}` : 'border-sidonia-gold',
      lineage ? `before:border-lineage-${lineage}` : 'before:border-sidonia-gold',
      lineage ? `after:border-lineage-${lineage}` : 'after:border-sidonia-gold',
      corrupted && 'animate-pulse'
    )}>
      <h1 className="font-display text-3xl tracking-wider uppercase text-center">
        {name}
      </h1>
      {lineage && (
        <p className="text-center text-sidonia-muted text-sm uppercase tracking-widest mt-2">
          {lineage}
        </p>
      )}
    </div>
  )
}
```

## Testing Checklist

- [ ] All text is readable on both light and dark backgrounds
- [ ] Interactive elements have visible hover/focus states
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Colors have sufficient contrast (WCAG AA minimum)
- [ ] Layout doesn't break at any viewport size
- [ ] Corruption effects are subtle enough to not impede usability

## Quick Reference

**Primary Classes:**
- Container: `bg-sidonia-black text-sidonia-text`
- Cards: `bg-sidonia-dark border-2 border-sidonia-gold/30`
- Headers: `font-display text-sidonia-gold uppercase tracking-wider`
- Buttons: `border-2 border-sidonia-gold hover:bg-sidonia-gold/10`
- Inputs: `bg-sidonia-black border-sidonia-gold/50 focus:border-sidonia-gold`

**Spacing:** Use `deco-*` values (5px, 10px, 20px, 30px, 40px) for consistency

**Remember:** Function first, then flavor. Every element should work before it looks good.