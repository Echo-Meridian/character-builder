# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a character builder for Sidonia, a noir tabletop RPG where corruption is a core mechanic and every power has a price. The application is a React + TypeScript SPA using Vite, Zustand for state management, and React Router for navigation.

## Common Development Commands

```bash
# Development server (runs on port 5173)
npm run dev

# Type check and build
npm run build

# Lint TypeScript/TSX files
npm run lint

# Preview production build
npm run preview
```

## Core Architecture

### State Management (Zustand)

**`src/state/characterStore.ts`** - Central store using Zustand with persistence middleware
- Manages multiple character builds with activation/archival
- Stage-based progression: priorities → lineage → resources → background → skills → attributes → narrative
- Complex nested state with helper functions like `withActive()` for safe mutations
- **IMPORTANT**: Always use `ensureLineagePowersArray()` when working with lineage powers to prevent corrupted save data from breaking the UI
- Version 6 migration system handles legacy attribute names (grit/guile/gravitas → physique/intellect/presence)

### Data Architecture

**`src/data/DataContext.tsx`** - React context providing global data access
- Loads all JSON data files asynchronously on app mount
- Status tracking: 'idle' → 'loading' → 'ready' | 'error'
- Use `useCharacterData()` hook to access loaded data

**`src/data/dataService.ts`** - Data loading orchestration
- Fetches from `/data/*.json` files in public directory
- Special handling: Esper lineage merges with Mentalist data
- Power schemas and power sets loaded separately per lineage
- Design docs fetched as markdown from `/content/*.md`

**Key data files**:
- `public/data/backgrounds.json` - Background professions with priority tiers
- `public/data/Sidonia-Skills.Json` - Skills organized by discipline
- `public/data/resources-system.json` - Resource point budgets by priority
- `public/data/powers-*.json` - Lineage-specific power trees
- `public/data/Sidonia-Powers-Schema-*.Json` - Validation schemas for powers

### Priority System

The core mechanic: players assign A-E priorities to five categories (lineage, resources, background, skills, attributes). Each rank is unique - assigning a new rank to a category automatically clears it from the previous category.

**Priority impacts** (examples from lineage-architecture.md):
- **Lineage A**: 9 augment slots (NeoSapien), 7 mutation points (Chimera), Primary+2 Secondary spheres (Sorcery)
- **Lineage E**: 2 augment slots (NeoSapien), 2 mutation points (Chimera), 1 Secondary sphere + 1 move (Sorcery)

### Lineage System

Each lineage has unique power selection mechanics:

**NeoSapien**: Slot-based augmentations (Tier 1-3), each with corruption cost
**Sorcery**: Sphere + Move system (Primary/Secondary spheres, rote moves)
**Esper**: Tree-based evolution with depth limits by priority (A=3, B=2, C=2, D=1, E=0)
- Special logic: Esper/Mentalist hybrid at Priority A
- `toggleLineagePower()` in characterStore handles complex tree validation
**Chimera**: Mutation point budget (Tier 1=1pt, Tier 2=2pt, Tier 3=3pt)
**Automata**: Chassis-based (Imperial/Advanced/Basic, Soldier/Overseer/Worker branches)

**CRITICAL**: Lineage power flow (src/state/characterStore.ts:587-660) includes hardened validation to prevent corrupted selections from bricking toggle logic. Always filter invalid entries before processing.

### Resources System

Four resource types with complex calculation rules (see Sidonia Resources System.md):
- **Contacts**: specialization + reach (1-5) + influence (1-5)
- **Retainers**: specialization + competence (1-5) + loyalty (1-5)
- **Properties**: tenure type + zoning + ward + specialization
- **Goods**: specialization + quality (1-5)

Each priority rank has: total points, max quality, max combined, and free specializations.

### Component Organization

**Pages** (`src/pages/`):
- `LandingPage.tsx` - Entry point
- `BuilderPage.tsx` - Main character creation flow
- `ManagementPage.tsx` - Character list management
- `GmPortalPage.tsx` - GM view with hidden mechanics

**Stages** (`src/components/builder/stages/`):
- Each stage component corresponds to a CharacterStage enum value
- `LineageStage.tsx` - Lineage selection with GM reveal toggle for hidden mechanics
- `ResourcesStage.tsx` - Resource allocation with point budget tracking
- Priority, Background, Skills, Attributes, Narrative stages

**Common patterns**:
- All stage components receive priority mapping and stage-specific data
- `StageNavigation.tsx` validates stage completion before allowing progression
- `CharacterProfileCard.tsx` shows live character summary across all stages

### Design Philosophy (from Sidonia Design Philosophy.md)

**Not D&D**: 3 attributes only, no classes/levels, combat is deadly and discouraged, social/investigation focus

**Key themes**:
- Noir: everyone serves someone, information is currency
- Corruption: every power has a price (tracked but not fully explained to players)
- Trade-offs: priority system forces meaningful choices, no perfect builds
- Different UI per lineage (not just re-skins)
- GM mode hides true underpinnings and hidden machinations

### Analytics

`src/utils/analytics.ts` - Lightweight event tracking
- No external dependencies (currently no-op implementation)
- Track key user actions: priority.assigned, lineage.selected, skills.rating_set, etc.
- DO NOT remove analytics.track() calls - infrastructure for future telemetry

### Styling

- TailwindCSS for utility classes
- Per-stage CSS modules (e.g., `lineage-stage.css`) for complex layouts
- Lineage aesthetic system: each lineage has accent color, glow gradient, texture radial gradient
- Dark theme throughout (noir aesthetic)

## Working with This Codebase

### Adding a New Lineage Power

1. Update the JSON file in `public/data/powers-{lineage}.json`
2. Ensure schema matches `public/data/Sidonia-Powers-Schema-{lineage}.Json`
3. If adding new power kind, update `LineagePowerKind` union in `src/state/characterStore.ts`
4. Add validation logic to `toggleLineagePower()` if power has special constraints

### Modifying Character State

Always use the store actions from `useCharacterStore()`. Never mutate state directly. The `withActive()` helper ensures safe updates with timestamp tracking.

### Esper Evolution Trees

Espers have complex parent-child relationships with depth limits. When toggling:
- Removing an archetype clears all descendants in that tree
- Removing a branch clears all children in that path
- Depth validation prevents selecting nodes beyond priority-based limit
- Priority C blocks base espers but allows mentalists

### Data File Changes

Files in `public/data/` and `dist/data/` mirror each other. Build process copies from public to dist. When modifying JSON:
1. Edit files in `public/data/`
2. Run build to sync to `dist/data/`
3. Restart dev server if data doesn't hot-reload

### Git Workflow

Main branch not detected (check remote). Current branch: `001-build-a-character`

Notable staged changes show Mentalist power files were deleted (consolidated into Esper system).
