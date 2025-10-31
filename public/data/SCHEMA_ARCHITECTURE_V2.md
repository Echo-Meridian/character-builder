# Sidonia Power System - Schema Architecture v2.0

**Last Updated:** 2025-10-30
**Status:** ✅ Complete and Verified

---

## Design Philosophy

**"Build additions, not integrations"**

- **Universal Base**: Contains ONLY what is truly universal across all lineages
- **Lineage Extensions**: Add lineage-specific structure without breaking base
- **Flat Data with References**: Powers stored flat for easy querying; UI builds hierarchy from metadata
- **Future-Proof**: Advancement systems can be added later as separate files that reference powers by ID

---

## Universal Base Schema

### What Goes in the Base (`sidonia-power-base.json`)

These fields exist for **every power in every lineage**:

```json
{
  "id": "string",                    // Unique identifier (kebab-case)
  "name": "string",                  // Display name
  "type": "string",                  // Power category (augment, move, ability, etc.)
  "category": "string",              // Subcategory (organizational only)
  "tags": ["string"],                // Searchable keywords
  "metadata": {
    "source": "string",              // Source document
    "page": "integer",               // Page number (optional)
    "version": "string"              // Schema version
  },
  "description": {
    "short": "string",               // Brief mechanical summary
    "player": "string",              // Flavor text for players
    "gm": "string | null",           // GM-only information (optional)
    "flaw": "string | null"          // Drawback text (optional)
  },
  "effects": [                       // Array of structured mechanical effects
    {
      "type": "enum",                // Effect category
      "description": "string",       // Human-readable explanation
      // Additional fields depend on effect type
    }
  ],
  "flaws": [                         // Array of structured drawbacks (optional)
    {
      "trigger": "string",           // What activates this flaw
      "effect": "string",            // What happens
      "description": "string"        // Human-readable explanation
    }
  ]
}
```

### Universal Effect Types

These 10 effect types work across ALL lineages:

1. **armor_bonus** - AV/PV protection
2. **damage_bonus** - Weapon damage modifications
3. **skill_bonus** - Roll bonuses
4. **attribute_bonus** - Stat modifications
5. **movement_modifier** - Speed, climbing, flying
6. **special_sense** - Enhanced perception
7. **healing** - Health/Stun restoration
8. **resistance** - Immunity or damage reduction
9. **tier_of_effect** - Magnitude modifiers
10. **custom** - Unique mechanics not fitting standard types

---

## The Five Lineage Systems

### Summary Table

| Lineage | Structure | Selection Model | Cost System | Data Format |
|---------|-----------|-----------------|-------------|-------------|
| **Chimera** | Tiered (1-3) | Choose power, choose tier | MP + Corruption | Powers with nested tiers |
| **NeoSapiens** | Tiered (1-3) | Choose augment, choose quality | Slots + Corruption | Powers with nested tiers |
| **Sorcerers** | Flat | Learn moves by sphere | None (learned) | Flat list by sphere |
| **Espers** | Directed Hierarchy | Choose archetype, evolve paths | None (evolution) | Flat with parent references |
| **Mentalists** | Two-Step Selection | Choose polarity, choose scope | None (selection) | Flat with grantedBy metadata |
| **Automata** | Selection Bundle | Choose chassis+branch+quality | None (built-in) | Flat filtered by selection |

---

## 1. Chimera - Tiered Power System

### Schema: `chimera-power-extension.json`

**Key Principle:** Powers have 1-3 tiers. Players can buy ANY tier directly without prerequisites.

**Structure:**
```json
{
  "id": "armored-hide",
  "name": "Armored Hide",
  "lineage": "chimera",
  "type": "augment",
  "category": "Primal Manifestations",
  "tags": ["defensive", "armor"],
  "metadata": { "source": "Sidonia-Chimera.docx", "version": "1.0" },
  "tiers": {
    "tier1": {
      "id": "armored-hide-tier1",
      "name": "Patchwork Plating",
      "tier": 1,
      "mutationPoints": 2,
      "permanentCorruption": 1,
      "description": { /* base format */ },
      "effects": [ /* armor_bonus */ ],
      "flaws": [ /* microfracture flaw */ ]
    },
    "tier2": { /* improved version */ },
    "tier3": { /* premium version */ }
  }
}
```

**Lineage-Specific Fields:**
- `tiers` (object) - tier1, tier2, tier3 (tier1 required, others optional)
- `mutationPoints` (integer) - MP cost for this tier
- `permanentCorruption` (integer) - Corruption cost for this tier

**UI Presentation Rules:**

1. **Display:** Show power name + short description
2. **Expansion:** Click to expand shows all tier options
3. **Selection:** Radio buttons for tier1/tier2/tier3 (mutually exclusive)
4. **Info:** Each tier shows:
   - Tier name (e.g., "Patchwork Plating")
   - Cost (e.g., "2 MP, 1 Corruption")
   - Effects summary
   - Flaws (if any)
5. **Validation:** Cannot select multiple tiers of same power

**Example UI Flow:**
```
[+] Armored Hide
    "Natural armor protection"

    When expanded:

    ( ) Tier 1: Patchwork Plating
        Cost: 2 MP, 1 Corruption
        Effect: AV 0, PV 1
        Flaw: Take 1 Stun when wounded

    ( ) Tier 2: Segmented Carapace
        Cost: 2 MP, 2 Corruption
        Effect: AV 1, PV 2
        Flaw: None

    ( ) Tier 3: Living Fortress
        Cost: 3 MP, 3 Corruption
        Effect: AV 2, PV 3
        Flaw: None
```

---

## 2. NeoSapiens - Quality Tier System

### Schema: `neosapien-power-extension.json` (v2.0 - UPDATED)

**Key Principle:** Like Chimera, but tiers represent quality levels (street/corporate/military). Players can buy ANY quality directly.

**Structure:**
```json
{
  "id": "muscle-weave",
  "name": "Muscle Weave",
  "lineage": "neosapien",
  "type": "augment",
  "category": "Physical Enhancement",
  "tags": ["strength", "physique"],
  "metadata": { "source": "Sidonia-Neo-Sapiens.docx", "version": "1.0" },
  "tiers": {
    "tier1": {
      "id": "muscle-weave-street",
      "name": "Frankenstein Grafts",
      "tier": 1,
      "augmentTier": "street",
      "slots": 1,
      "permanentCorruption": 1,
      "description": { /* street quality description */ },
      "effects": [ /* tier_of_effect +1 */ ],
      "flaws": [ /* violent spasms on crit fail */ ]
    },
    "tier2": { "augmentTier": "corporate", /* clean, no flaws */ },
    "tier3": { "augmentTier": "military", /* premium quality */ }
  }
}
```

**Lineage-Specific Fields:**
- `tiers` (object) - tier1, tier2, tier3
- `augmentTier` (enum) - "street", "corporate", "military"
- `slots` (integer) - Augmentation slots consumed
- `permanentCorruption` (integer) - Corruption cost
- `synergyBonus` (object, optional) - Package bonuses
- `installationRequirements` (object, optional) - Prerequisites

**UI Presentation Rules:**

1. **Display:** Show augment name + short description (NOT "Physical Mods" - use the actual augment name!)
2. **Expansion:** Click to expand shows quality options
3. **Selection:** Radio buttons for Street/Corporate/Military (mutually exclusive)
4. **Info:** Each quality shows:
   - Quality name (e.g., "Frankenstein Grafts")
   - Cost (e.g., "1 Slot, 1 Corruption")
   - Effects summary
   - Flaws (if any, common on street tier)
5. **Validation:**
   - Cannot select multiple qualities of same augment
   - Check total slot consumption against available slots
   - Synergy bonuses display when relevant augments selected

**Example UI Flow:**
```
[+] Muscle Weave
    "Enhances strength-based rolls"

    When expanded:

    ( ) Street: Frankenstein Grafts
        Cost: 1 Slot, 1 Corruption
        Effect: +1 ToE on Strength rolls
        Flaw: Violent spasms on crit fail

    ( ) Corporate: Cultured Muscle Latticework
        Cost: 2 Slots, 2 Corruption
        Effect: +1 ToE on Strength rolls
        Flaw: None

    ( ) Military: Military-Grade Myomer
        Cost: 3 Slots, 3 Corruption
        Effect: +2 ToE on Strength rolls
        Flaw: None
        Synergy: Part of "Bruiser Build" package
```

**IMPORTANT:** Categories like "Physical Mods", "Neural Mods" are organizational only - they have NO mechanical significance. They're just folders to help organize the data.

---

## 3. Sorcerers - Sphere & Moves System

### Schema: `sorcerer-power-extension.json`

**Key Principle:** Flat structure. Powers are organized by sphere. No purchase cost - moves are learned.

**Structure:**
```json
{
  "id": "create-fire",
  "name": "Create Fire",
  "lineage": "sorcerer",
  "type": "move",
  "sphere": "Fire",
  "sphereTier": "primary",
  "moveType": "move",
  "rollStat": "Intellect",
  "category": "Fire Sphere",
  "tags": ["fire", "combat", "utility"],
  "metadata": { "source": "Sidonia-Sorcerers.docx", "version": "1.0" },
  "description": {
    "short": "Conjure flames from thin air",
    "player": "You speak the ancient formula and will fire into existence..."
  },
  "outcomes": {
    "12": "Perfect flame - shaped exactly as desired",
    "10+": "Create fire as intended",
    "7-9": "Fire created but wild - cost or complication",
    "6-": "Fire fizzles or explodes unpredictably",
    "2": "Critical failure - catastrophic backfire"
  },
  "castingTime": "action",
  "range": "sight",
  "duration": "sustained",
  "components": {
    "verbal": true,
    "material": false,
    "focus": false
  },
  "effects": [ /* custom effect */ ]
}
```

**Lineage-Specific Fields:**
- `sphere` (string) - Which sphere (Fire, Water, Mind, etc.)
- `sphereTier` (enum) - "primary" or "secondary"
- `moveType` (enum) - "move" or "ritual"
- `rollStat` (string) - Attribute to roll
- `dpCost` (integer, optional) - Dissonance Pool cost
- `outcomes` (object) - PbtA-style results (12, 10+, 7-9, 6-, 2)
- `castingTime` (enum) - How long to cast
- `range` (string) - Effective range
- `duration` (string) - How long effects last
- `components` (object) - What's required to cast

**UI Presentation Rules:**

1. **Display:** Group by sphere, then by primary/secondary
2. **Selection:** Checkboxes (not radio buttons) - can learn multiple moves
3. **Info:** Each move shows:
   - Move name
   - Roll stat (e.g., "Roll + Intellect")
   - Outcome summary
   - Casting details (time, range, duration)
4. **Validation:**
   - Priority determines how many spheres and moves available
   - Check sphere limits (Primary vs Secondary)
5. **Future:** Outcomes improve with advancement (not in MVP)

**Example UI Flow:**
```
Fire Sphere (Primary)
  ☐ Create Fire
      Roll + Intellect
      10+: Create fire as intended
      7-9: Fire wild, costs 1 DP or 1 Stun
      6-: Fire fizzles or explodes

  ☐ Fireball
      Roll + Intellect
      10+: Deal 3 Wound damage to target
      7-9: Deal 2 Wound, gain 1 DP
      6-: Backfire, take 1 Wound yourself
```

---

## 4. Espers - Directed Evolution Hierarchy

### Schema: `esper-power-extension.json` (v2.0 - UPDATED)

**Key Principle:** Directed hierarchy with choices at each evolution stage. Data is FLAT with parent references. UI builds tree from metadata.

**Structure:**
```json
{
  "id": "flash-step",
  "name": "Flash Step",
  "lineage": "esper",
  "archetype": "sentinel",
  "path": "sentinel.dragoon",
  "evolutionStage": 1,
  "moveType": "move",
  "rollStat": "Presence",
  "parentAbility": "battle-cognition",
  "isBaseArchetype": false,
  "isMentalist": false,
  "isSelectionPoint": false,
  "type": "move",
  "category": "Combat Moves",
  "tags": ["movement", "combat", "sentinel-path"],
  "metadata": { "source": "Sidonia-Espers.docx", "version": "1.0" },
  "description": {
    "short": "Instant teleportation through combat space",
    "player": "Reality bends as you step through space itself..."
  },
  "outcomes": {
    "10+": "Move anywhere in sight without provoking attacks",
    "7-9": "Move as desired but take 1 Stun or 1 DP",
    "6-": "Teleport fails or goes wrong"
  },
  "effects": [ /* movement_modifier */ ]
}
```

**Lineage-Specific Fields:**
- `archetype` (enum) - Base archetype (sentinel, summoner, weaver, median, linker)
- `path` (string) - Dot-notation path (e.g., "sentinel.dragoon.lancer")
- `evolutionStage` (integer) - 0 = base, 1 = first evolution, 2 = second evolution
- `moveType` (enum) - "move" (active) or "augment" (passive)
- `rollStat` (string) - For active moves
- `parentAbility` (string) - ID of prerequisite ability
- `isBaseArchetype` (boolean) - True for starting choices
- `isMentalist` (boolean) - True for Mentalist powers
- `isSelectionPoint` (boolean) - True if this presents a choice
- `outcomes` (object) - PbtA-style results

**Evolution Flow:**
```
Esper (choice) → Sentinel (base archetype, evolutionStage: 0)
    ↓
Choose evolution (isSelectionPoint: true) → Dragoon | Battle Saint | Juggernaut (evolutionStage: 1)
    ↓
Choose evolution (isSelectionPoint: true) → Lancer | Phase Warrior | etc. (evolutionStage: 2)
```

**UI Presentation Rules:**

1. **Display:** Tree structure built from `path` and `parentAbility`
2. **Base Selection:** Radio buttons for initial archetype (Sentinel, Summoner, Weaver, Median, Linker)
3. **Evolution:** At each stage, radio buttons for available evolution choices
4. **Powers:** Each evolution grants specific powers (augments + moves)
5. **Info:** Each power shows:
   - Power name + type (Move/Augment)
   - Prerequisites (what you need to unlock it)
   - Effects/outcomes
6. **Validation:**
   - Check evolution stage limits based on Priority
   - Ensure prerequisites met (parentAbility)

**Example UI Flow:**
```
Choose Esper Archetype:
  ( ) Sentinel - Combat specialist
  ( ) Summoner - Entity control
  ( ) Weaver - Reality manipulation
  ( ) Median - Balance/healing
  ( ) Linker - Connection/networking

[User selects Sentinel]

Sentinel Powers (Base):
  • Battle Cognition (Augment)
  • Aetheric Defense (Augment)
  • Aetheric Overclock (Move)

Evolution Available (Priority B allows 2 steps):
  ( ) Dragoon - Mobile striker
  ( ) Battle Saint - Weapon master
  ( ) Juggernaut - Tank

[User selects Battle Saint]

Battle Saint Powers (Evolution 1):
  • Weapon Bond (Augment)
  • Perfect Strike (Move)

Evolution Available (Stage 2):
  ( ) Gun Saint - Ranged specialist
  ( ) Sword Saint - Melee master
  ( ) Weapon Saint - Versatile combatant
```

---

## 5. Mentalists - Two-Step Selection System

### Schema: `esper-power-extension.json` (same as Espers, uses `isMentalist: true`)

**Key Principle:** Choose Polarity → Choose Scope → Powers granted by combinations.

**Structure:**
```json
{
  "id": "empath-all-receivers",
  "name": "All Receivers (Empath)",
  "lineage": "esper",
  "archetype": "empath",
  "path": "empath.receiver_all",
  "evolutionStage": 0,
  "moveType": "augment",
  "isMentalist": true,
  "mentalistPolarity": "receiver",
  "grantedBy": "polarity_receiver",
  "type": "augment",
  "category": "Mentalist Powers",
  "tags": ["mentalist", "empath", "receiver"],
  "metadata": { "source": "Sidonia-Espers.docx", "version": "1.0" },
  "description": {
    "short": "Passively sense emotions of nearby people",
    "player": "You feel the emotional currents around you like a sixth sense..."
  },
  "effects": [ /* special_sense */ ]
}
```

**Lineage-Specific Fields (Mentalist):**
- `isMentalist` (boolean) - True
- `mentalistPolarity` (enum) - "receiver", "influencer", "instanced", "persistent"
- `mentalistScope` (enum) - "targeted", "aural", "discrete", "systemic"
- `grantedBy` (string) - What selection unlocks this ("polarity_receiver", "scope_targeted", "targeted_receiver")

**Selection Flow:**
```
1. Choose Mentalist Archetype (Empath, Mesmer, Siren, Dreamer, Meta-Mind)
2. Choose Polarity:
   - Receiver (pull/introverted) → Grants "All Receivers" power
   - Influencer (push/extroverted) → Grants "All Influencers" power
   (Meta-Minds: Instanced vs Persistent)
3. Choose Scope:
   - Targeted (individual)
   - Aural (group/area)
   (Meta-Minds: Discrete vs Systemic)
4. Receive combination power(s):
   - If multiple powers for this combo, player selects one
   - Example: Empath Targeted+Receiver may have 2 options → choose one
```

**UI Presentation Rules:**

1. **Display:** Two-stage selection wizard
2. **Step 1 - Archetype:** Radio buttons for Empath, Mesmer, Siren, Dreamer, Meta-Mind
3. **Step 2 - Polarity:** Radio buttons for Receiver/Influencer (or Instanced/Persistent for Meta-Mind)
   - Shows power granted by this choice
4. **Step 3 - Scope:** Radio buttons for Targeted/Aural (or Discrete/Systemic for Meta-Mind)
5. **Step 4 - Combination:** If multiple powers available, radio buttons to choose one
6. **Info:** Show what each selection unlocks as you go
7. **Validation:**
   - Priority C allows "1 additional" power after base selection
   - Track selections to ensure valid combinations

**Example UI Flow:**
```
Choose Mentalist Archetype:
  ( ) Empath - Emotion reading/manipulation
  ( ) Mesmer - Direct mind control
  ( ) Siren - Group influence
  ( ) Dreamer - Subconscious access
  ( ) Meta-Mind - Cognitive enhancement

[User selects Empath]

Choose Polarity:
  ( ) Receiver (Pull/Introverted)
      Grants: All Receivers - Sense emotions passively
  ( ) Influencer (Push/Extroverted)
      Grants: All Influencers - Project emotions outward

[User selects Receiver]

Choose Scope:
  ( ) Targeted (Individual)
  ( ) Aural (Group/Area)

[User selects Targeted]

Targeted + Receiver Powers:
  ( ) Read Emotion (targeted individual reading)
  ( ) Empathic Link (establish lasting connection)

[User selects Read Emotion]

Final Powers for Empath (Receiver, Targeted):
  ✓ All Receivers (passive emotion sensing)
  ✓ Read Emotion (targeted reading)
```

---

## 6. Automata - Selection Bundle System

### Schema: `automata-power-extension.json` (v2.0 - UPDATED)

**Key Principle:** Choose chassis + branch + quality = receive ALL matching powers automatically. No progression, static selection.

**Structure:**
```json
{
  "id": "overseer-administrator-basic-data-relay",
  "name": "Data Relay",
  "lineage": "automata",
  "chassis": "overseer",
  "branch": "administrator",
  "augmentLevel": "basic",
  "cost": null,
  "isGeneralPower": false,
  "moveType": "augment",
  "type": "augment",
  "category": "Overseer Chassis",
  "tags": ["overseer", "administrator", "communication"],
  "metadata": { "source": "Sidonia-Automata.docx", "version": "1.0" },
  "description": {
    "short": "Share information with nearby allies",
    "player": "Your data relay systems allow instant tactical communication..."
  },
  "effects": [ /* custom communication effect */ ]
}
```

**Lineage-Specific Fields:**
- `chassis` (enum) - "worker", "soldier", "overseer"
- `branch` (string) - Specialization (administrator, guardian, laborer, etc.)
- `augmentLevel` (enum) - "general", "basic", "advanced", "imperial"
- `isGeneralPower` (boolean) - True if all branches of this chassis get it
- `cost` (integer/null) - For future mods (most are null/free)
- `moveType` (enum) - "move" or "augment"
- `hasVariants` (boolean) - If power has multiple model options
- `variantOptions` (array) - Model choices if hasVariants is true

**Priority Table:**
```
Priority A: Imperial Soldier OR Imperial Overseer
Priority B: Advanced Soldier OR Advanced Overseer
Priority C: Basic Soldier OR Basic Overseer
Priority D: Advanced Worker
Priority E: Basic Worker
```

**Power Stacking:**
```
Advanced Administrator Overseer receives:
  - ALL "general" Overseer powers (isGeneralPower: true, chassis: overseer)
  - ALL "basic" Administrator powers (branch: administrator, augmentLevel: basic)
  - ALL "advanced" Administrator powers (branch: administrator, augmentLevel: advanced)
```

**UI Presentation Rules:**

1. **Display:** Selection wizard showing available options based on Priority
2. **Step 1 - Chassis:** Radio buttons for available chassis (based on Priority)
3. **Step 2 - Branch:** Radio buttons for branches within selected chassis
4. **Step 3 - Preview:** Show ALL powers that will be granted
5. **Info:** Power list grouped by:
   - General chassis powers (all branches get these)
   - Basic branch powers
   - Advanced branch powers (if quality allows)
   - Imperial branch powers (if quality allows)
6. **Validation:**
   - Choice is final, no changes
   - Show total power count
   - Variants (rare): If power has multiple models, player chooses one

**Example UI Flow:**
```
Your Priority: B (Advanced Soldier or Advanced Overseer)

Choose Chassis:
  ( ) Advanced Soldier - Combat chassis
  ( ) Advanced Overseer - Command chassis

[User selects Advanced Overseer]

Choose Branch:
  ( ) Administrator - Coordination & data processing
  ( ) Advocate - Diplomacy & negotiation
  ( ) Scribe - Record-keeping & analysis

[User selects Administrator]

Advanced Administrator Overseer receives these powers automatically:

General Overseer Powers (all branches):
  • Optical Recording (Augment)
  • Mechanical Resilience (Augment)
  • Environmental Adaptation (Augment)

Administrator Basic:
  • Data Relay (Augment)
  • Priority Tasking (Move)

Administrator Advanced:
  • Multi-Mind Processor (Augment)
  • System Assessment (Move)
  • Command Protocol (Move)

Total: 8 powers granted

[ Confirm Selection ]
```

---

## Critical UI Rules (Prevents Integration Issues)

### 1. **Always Show the Power Name**

❌ **WRONG:** "Physical Mod" → expand → see options
✅ **RIGHT:** "Muscle Weave" → expand → see Street/Corporate/Military options

**Why:** Categories like "Physical Mods" are organizational only. Players need to see what they're actually choosing.

### 2. **Tier/Quality = Radio Buttons (Mutually Exclusive)**

For Chimera and NeoSapiens:
- Display as expandable power card
- Tiers shown as radio button group
- Can only select ONE tier per power
- Clearly show cost difference between tiers

### 3. **Flat Powers = Checkboxes or Automatic Grants**

- **Sorcerers:** Checkboxes (can learn multiple moves)
- **Espers/Mentalists:** Radio buttons at selection points, automatic grants after
- **Automata:** Automatic grants (show preview before confirming)

### 4. **Distinguish Esper vs Mentalist**

❌ **WRONG:** Mixing Esper and Mentalist powers in same list
✅ **RIGHT:** Separate sections with clear labels

```
Priority A allows both:

ESPER POWERS
  Choose archetype: (Sentinel/Summoner/Weaver/Median/Linker)
  [Esper evolution tree UI]

MENTALIST POWERS
  Choose archetype: (Empath/Mesmer/Siren/Dreamer/Meta-Mind)
  [Two-step selection UI]
```

### 5. **Short Descriptions Are Key**

Every power card should show:
1. **Power Name** (large, bold)
2. **Short Description** (1-2 sentence mechanical summary)
3. **Expand button** → Full details

**Good short description:** "Increases your Tier of Effect on all rolls using the Strength specialization."

**Bad short description:** "A sophisticated augment that enhances muscle tissue through advanced biotechnology and neural integration systems..." (too long, too much flavor, not clear mechanically)

### 6. **Show Costs Clearly**

For Chimera:
```
Tier 1: 2 MP, 1 Corruption
Tier 2: 2 MP, 2 Corruption
Tier 3: 3 MP, 3 Corruption
```

For NeoSapiens:
```
Street: 1 Slot, 1 Corruption
Corporate: 2 Slots, 2 Corruption
Military: 3 Slots, 3 Corruption
```

### 7. **Flaws Highlighted**

If a tier/quality has flaws:
```
⚠️ Flaw: Violent spasms on critical failure - limb disabled for rest of scene
```

Use warning icon, different color, or expandable section.

---

## Data File Structure

```
/sidonia/
├── schemas/
│   ├── sidonia-power-base.json           ✅ Universal base
│   ├── chimera-power-extension.json      ✅ Tiered system
│   ├── neosapien-power-extension.json    ✅ Tiered system (v2.0 updated)
│   ├── sorcerer-power-extension.json     ✅ Flat sphere system
│   ├── esper-power-extension.json        ✅ Flat with references (v2.0 updated)
│   └── automata-power-extension.json     ✅ Selection bundle (v2.0 updated)
│
├── data/
│   ├── powers-chimera-v2.json            ✅ 32 powers, 79 tiers
│   ├── powers-neosapien-v3.json          ✅ 23 augments, tiered (RESTRUCTURED)
│   ├── powers-sorcerer-v2.json           ✅ Flat by sphere
│   ├── powers-esper-v2.json              ✅ Flat with parent refs
│   └── powers-automata-v2.json           ✅ Flat by chassis+branch
│
└── docs/
    ├── SCHEMA_ARCHITECTURE_V2.md         ✅ This document
    ├── BASE_SCHEMA_COMPLETE.md           📜 Historical
    └── ALL_EXTENSIONS_COMPLETE.md        📜 Historical
```

---

## Loading & Validating Data (For App Integration)

### Step 1: Load Schemas

```javascript
const baseSchema = require('./schemas/sidonia-power-base.json');
const chimeraExtension = require('./schemas/chimera-power-extension.json');
// ... load other extensions
```

### Step 2: Load Data

```javascript
const chimeraPowers = require('./data/powers-chimera-v2.json');
// Filter and validate against schema
```

### Step 3: Validate

- Check required fields exist
- Verify effect types are valid
- Ensure IDs are unique
- Check lineage-specific constraints

### Step 4: Query Examples

**Get all Tier 1 Chimera powers:**
```javascript
const tier1Powers = chimeraPowers.powers.filter(p => p.tiers.tier1);
```

**Get all Advanced Administrator Overseer powers:**
```javascript
const automataFilter = (chassis, branch, maxLevel) => {
  const levels = ['general', 'basic', 'advanced', 'imperial'];
  const maxIndex = levels.indexOf(maxLevel);

  return automataPowers.powers.filter(p =>
    p.chassis === chassis &&
    (p.isGeneralPower || p.branch === branch) &&
    levels.indexOf(p.augmentLevel) <= maxIndex
  );
};

const advancedAdmin = automataFilter('overseer', 'administrator', 'advanced');
```

**Build Esper evolution tree:**
```javascript
function buildTree(powers, parentId = null, stage = 0) {
  return powers
    .filter(p => p.parentAbility === parentId && p.evolutionStage === stage)
    .map(power => ({
      ...power,
      children: buildTree(powers, power.id, stage + 1)
    }));
}

const sentinelTree = buildTree(esperPowers.powers.filter(p => p.archetype === 'sentinel'));
```

---

## Future Expansion (Not in MVP)

### Advancement Systems

Create separate files that reference powers by ID:

```json
// advancement/sorcerer-advancement.json
{
  "lineage": "sorcerer",
  "advancementRules": {
    "outcomeImprovements": [
      {
        "moveId": "create-fire",
        "advancementLevel": "journeyman",
        "improvedOutcomes": {
          "10+": "Create larger fire (bonfire size) OR shaped precisely",
          "7-9": "Create fire without cost",
          "6-": "Fire fizzles, no damage"
        }
      }
    ]
  }
}
```

### VTT Integration Hooks

```json
// vtt/chimera-automation.json
{
  "lineage": "chimera",
  "automationHooks": [
    {
      "powerId": "armored-hide-tier1",
      "onDamage": {
        "trigger": "wound_damage_received",
        "action": "applyArmor",
        "params": { "av": 0, "pv": 1 }
      },
      "onWound": {
        "trigger": "health_box_marked",
        "action": "applyStunDamage",
        "params": { "amount": 1, "description": "Microfracture flaw" }
      }
    }
  ]
}
```

---

## Benefits of This Architecture

### ✅ Consistency

- Chimera and NeoSapiens use same tiered pattern (radio buttons)
- Sorcerers, Espers, Automata use flat patterns (different UI flows)
- Clear distinction between progression (Espers) and selection (Automata)

### ✅ Clarity

- Each lineage's unique mechanics are explicit in schema
- UI presentation rules prevent integration confusion
- "General" powers vs branch-specific powers clearly marked

### ✅ Maintainability

- Universal mechanics = edit base only
- Lineage mechanics = edit extension only
- Data is flat for easy querying
- UI builds hierarchy from metadata

### ✅ No Painted Corners

- Advancement systems can be added without touching power data
- VTT hooks can be layered on as separate files
- Future lineages follow same pattern (base + extension)

---

## Troubleshooting Guide

### Issue: "Power Mod" appearing instead of power names

**Problem:** Using `category` field instead of `name` field
**Solution:** Display `power.name`, not `power.category`. Category is organizational only.

### Issue: NeoSapien augments not grouping by quality

**Problem:** Data was flat, treating each quality as separate power
**Solution:** Use `powers-neosapien-v3.json` which has tiered structure like Chimera

### Issue: Esper/Mentalist powers mixed together

**Problem:** Not filtering by `isMentalist` flag
**Solution:** Separate UI sections:
```javascript
const esperPowers = powers.filter(p => !p.isMentalist);
const mentalistPowers = powers.filter(p => p.isMentalist);
```

### Issue: Can't distinguish evolution choices from granted powers

**Problem:** Not using `isSelectionPoint` flag
**Solution:** Check flag to show radio buttons vs automatic grants:
```javascript
if (power.isSelectionPoint) {
  // Show radio buttons for evolution choice
} else {
  // Automatically grant this power
}
```

### Issue: Automata branch powers not showing

**Problem:** Filtering by `augmentLevel` only, not considering `branch`
**Solution:** Include both general powers AND branch-specific powers:
```javascript
const powers = automataPowers.filter(p =>
  p.chassis === selectedChassis &&
  (p.isGeneralPower || p.branch === selectedBranch) &&
  qualityLevelAllows(p.augmentLevel, selectedQuality)
);
```

---

## Summary of Changes from v1.0

### Schema Updates

1. **NeoSapiens:** Restructured from flat to tiered (matching Chimera pattern)
2. **Espers:** Added `isBaseArchetype`, `isMentalist`, `isSelectionPoint` flags
3. **Espers:** Added `mentalistPolarity`, `mentalistScope`, `grantedBy` for Mentalist system
4. **Automata:** Added `branch` field, `isGeneralPower` flag
5. **Automata:** Removed `children` array (no hierarchy), clarified selection-based system

### Data Updates

1. **NeoSapiens:** Converted from 69 flat entries to 23 tiered augments
2. **All:** Verified data matches updated schemas

### Documentation

1. **UI Rules:** Added explicit presentation guidelines for each lineage
2. **Examples:** Included detailed UI flow examples
3. **Troubleshooting:** Added common integration issues and solutions
4. **Queries:** Provided code examples for filtering and displaying powers

---

## Status: COMPLETE ✅

All schemas verified, data restructured where needed, and comprehensive UI guidelines provided. This document serves as the single source of truth for Sidonia power system integration.

**Next Steps:**
1. Use this document for app integration
2. Reference UI examples when building character builder
3. Consult troubleshooting section when issues arise
4. Expand with advancement systems (future, separate files)
