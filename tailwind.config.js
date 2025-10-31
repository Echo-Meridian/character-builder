/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette - Art Deco Metals
        'sidonia-gold': '#d4af37',      // Primary accent - menus, borders, highlights
        'sidonia-brass': '#b8860b',     // Secondary accent - muted gold
        'sidonia-copper': '#b87333',    // Tertiary accent - warm metal

        // Background Colors - Deep Noir Blacks
        'sidonia-black': '#0a0908',     // Deep black background
        'sidonia-dark': '#0f0d0a',      // Card backgrounds
        'sidonia-coal': '#1a0e00',      // Darker elements

        // Corruption Colors - The Wyrm's Touch
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
        'display': ['Limelight', 'serif'],        // Large headers, titles
        'accent': ['Old Standard TT', 'serif'],   // Section headers, accents
        'body': ['Newsreader', 'serif'],          // Body text, readable
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
        'flicker': 'flicker 10s infinite',
        'distort': 'distort 5s infinite',
      },

      keyframes: {
        corruptionGlow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '95%': { opacity: '0.95' },
        },
        distort: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(2px)' },
        },
      },
    },
  },
  plugins: [],
}
