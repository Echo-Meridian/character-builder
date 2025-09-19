import type { LineageKey, PriorityRank } from './types';

export interface LineageDefinition {
  key: LineageKey;
  name: string;
  tagline: string;
  summary: string;
  priorityImpacts: Record<PriorityRank, string>;
  narrativeHook: string;
  gmWhisper: string;
  aesthetic: {
    accent: string;
    glow: string;
    texture: string;
  };
}

export const LINEAGE_DEFINITIONS: LineageDefinition[] = [
  {
    key: 'neosapien',
    name: 'NeoSapien',
    tagline: 'Engineered evolution for those who can pay the tithe.',
    summary:
      'The Forge Syndicates will rebuild you into the perfect instrument. Slots determine just how much metal, muscle, and lore they lace into your bones.',
    priorityImpacts: {
      A: 'Nine augmentation slots; enough to rebuild your body and soul with top-tier Forge miracles.',
      B: 'Seven slots; you are an elite prototype with room to grow.',
      C: 'Six slots; respectable upgrades with compromises lingering beneath the chrome.',
      D: 'Four slots; hand-me-down mods and a favor owed to the Syndicate.',
      E: 'Two slots; scrap work that barely keeps you alive.'
    },
    narrativeHook:
      'NeoSapiens look immaculate, but every graft is a debt. Each upgrade ties you tighter to the Forge Families who own the patent on your blood.',
    gmWhisper:
      'Every augmentation has a corruption drip. Track how many slots are filled to calibrate the player-facing warning meter.',
    aesthetic: {
      accent: '#87f5ff',
      glow: 'linear-gradient(135deg, rgba(120, 220, 255, 0.35), rgba(80, 140, 255, 0.2))',
      texture: 'radial-gradient(circle at 50% 10%, rgba(120, 220, 255, 0.2), transparent 60%)'
    }
  },
  {
    key: 'sorcery',
    name: 'Sorcerer',
    tagline: 'Scholar of the Veil, wielding codified miracles in whispers.',
    summary:
      'You read forbidden grimoires in the glow of dying streetlamps. Priorities determine how many spheres you command and how many moves you can safely inscribe.',
    priorityImpacts: {
      A: 'Primary + 2 Secondary spheres, five total moves etched into your soul.',
      B: 'Primary + Secondary pairing with four rote moves; the classic cabal initiate.',
      C: 'Choose one Primary or two Secondary spheres, three moves scrawled in desperate ink.',
      D: 'One secondary sphere and two moves; a dabbler who still owes their mentor.',
      E: 'One secondary sphere, one move, hope you can bluff the rest.'
    },
    narrativeHook:
      'Sorcerers hide sigils within noir newsprint and breathe equations of power. The more spheres you command, the more the city notices.',
    gmWhisper:
      'Each move should have a listed cost; use the assigned priority to determine how harsh to set complications.',
    aesthetic: {
      accent: '#ffb347',
      glow: 'linear-gradient(160deg, rgba(255, 190, 92, 0.35), rgba(255, 80, 60, 0.25))',
      texture: 'radial-gradient(circle at 70% 30%, rgba(255, 180, 90, 0.18), transparent 60%)'
    }
  },
  {
    key: 'esper',
    name: 'Esper',
    tagline: 'Innate psionics that turn thought into weaponry.',
    summary:
      'Gifted at birth or cursed in the womb, Espers bend the city with their minds. Priority sets how refined the template becomes.',
    priorityImpacts: {
      A: 'Esper Mentalist hybrid — access to both archetype trees from session one.',
      B: 'Esper Prodigy template. Two evolutionary steps unlocked before play.',
      C: 'Mentalist-only channel with powerful focus but brittle sanity.',
      D: 'Gifted Esper who can evolve once with training.',
      E: 'Base Esper template; raw talent that still sputters.'
    },
    narrativeHook:
      'Their dreams leak into waking life. Neon bleeds, strangers hear your thoughts, and the city clerk who stamped your ID can suddenly smell the aether.',
    gmWhisper:
      'Corruption spikes when Espers overclock. Use template level to gauge safe usage before fractures appear.',
    aesthetic: {
      accent: '#f78bff',
      glow: 'linear-gradient(120deg, rgba(255, 120, 220, 0.35), rgba(110, 90, 255, 0.25))',
      texture: 'radial-gradient(circle at 20% 80%, rgba(255, 120, 220, 0.2), transparent 55%)'
    }
  },
  {
    key: 'chimera',
    name: 'Chimera',
    tagline: 'Mutations granted by the city’s warring ecosystems.',
    summary:
      'You trade humanity for adaptation. Mutation points dictate how many horrors you can graft into your flesh.',
    priorityImpacts: {
      A: 'Seven mutation points. Become the chimera the wards whisper about.',
      B: 'Five points. The change is obvious, but you can still pass after midnight.',
      C: 'Four points. Enough to gain an edge while keeping a human silhouette.',
      D: 'Three points. Side-effects and stigma follow closely.',
      E: 'Two points. Tattoos of corruption hidden beneath borrowed coats.'
    },
    narrativeHook:
      'Chimeras owe fealty to ward totems and feral ecologies. The more points you spend, the more the wild claims you.',
    gmWhisper:
      'Mutation tiers should map to resource availability; track total points for corruption bleed-through.',
    aesthetic: {
      accent: '#7cff91',
      glow: 'linear-gradient(200deg, rgba(120, 255, 160, 0.35), rgba(40, 180, 120, 0.25))',
      texture: 'radial-gradient(circle at 15% 20%, rgba(120, 255, 160, 0.18), transparent 60%)'
    }
  },
  {
    key: 'automata',
    name: 'Automata',
    tagline: 'Synthetic souls housed in perfected shells.',
    summary:
      'You are a machine built for purpose. Priority sets the chassis quality and the branches unlocked.',
    priorityImpacts: {
      A: 'Imperial chassis with Overseer/Soldier branches unlocked and sovereign protocols.',
      B: 'Advanced military shell; twin branches with limited imperial overrides.',
      C: 'Baseline chassis with soldier safeguards still intact.',
      D: 'Advanced worker frame engineered for hazardous labor.',
      E: 'Basic worker frame, easily replaced… and easily overlooked.'
    },
    narrativeHook:
      'Automata can swap plating like trench coats. Memory scrubbing is compulsory after each refit.',
    gmWhisper:
      'Track how many branches the player exposes. GM mode should reveal firmware locks hidden from the player view.',
    aesthetic: {
      accent: '#5ad1ff',
      glow: 'linear-gradient(150deg, rgba(90, 210, 255, 0.35), rgba(40, 80, 200, 0.25))',
      texture: 'radial-gradient(circle at 80% 20%, rgba(90, 210, 255, 0.2), transparent 60%)'
    }
  }
];

export function getLineageDefinition(key: LineageKey | null) {
  if (!key) return null;
  return LINEAGE_DEFINITIONS.find((entry) => entry.key === key) ?? null;
}
