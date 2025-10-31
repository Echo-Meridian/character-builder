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
    tagline: 'The Pinnacle of Human Potential',
    summary:
      'Humanity unbound by natural limitations. Through masterful bio-artistry and flesh-grafting, the Red Sentinels\' Forge Program creates living weapons and paragons of human potential. To receive Forge augments is to transcend the flesh—an opportunity for those with the right connections or deep pockets to become more.',
    priorityImpacts: {
      A: 'Nine augmentation slots; enough to rebuild your body and soul with top-tier Forge miracles.',
      B: 'Seven slots; you are an elite prototype with room to grow.',
      C: 'Six slots; respectable upgrades with compromises lingering beneath the chrome.',
      D: 'Four slots; hand-me-down mods and a favor owed to the Syndicate.',
      E: 'Two slots; scrap work that barely keeps you alive.'
    },
    narrativeHook:
      'More than human, huh? That\'s the sales pitch. The Forge Program sells transcendence, but what they\'re really building are better soldiers. Priority A or B gets you that top-tier military hardware. Below that? You\'re getting street-level junk or corporate knock-offs. Every product has a warranty that\'s shorter than you think.',
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
    tagline: 'The Architect of Reality',
    summary:
      'Supreme intellectual discipline. Through grueling study and flawless memorization, Sorcerers petition the Aether to reshape the world. Not a gift, but an achievement earned through tireless dedication. They see the elegant, immutable mathematics of existence, and possess the will to solve its most challenging equations.',
    priorityImpacts: {
      A: 'Primary + 2 Secondary spheres, five total moves etched into your soul.',
      B: 'Primary + Secondary pairing with four rote moves; the classic cabal initiate.',
      C: 'Choose one Primary or two Secondary spheres, three moves scrawled in desperate ink.',
      D: 'One secondary sphere and two moves; a dabbler who still owes their mentor.',
      E: 'One secondary sphere, one move, hope you can bluff the rest.'
    },
    narrativeHook:
      'Architects of Reality... right. They\'re librarians, kid. The most dangerous kind. They spend their whole lives learning a language that can set the air on fire. One wrong thought, one slip of the tongue, and that \'elegant equation\' goes catastrophically sideways. Never trust a person whose main occupational hazard is accidentally turning their breakfast into a pile of spiders.',
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
    tagline: 'The Natural Talent',
    summary:
      'The Esper\'s connection to the Aether is an innate biological fact. Their abilities emerge from a unique, mutated organ within their brain that resonates with the psycho-reactive field around us. Their power is intuitive, emotional, and deeply personal. They do not calculate; they feel. A natural channel for the world\'s hidden energies.',
    priorityImpacts: {
      A: 'Esper Mentalist hybrid — access to both archetype trees from session one.',
      B: 'Esper Prodigy template. Two evolutionary steps unlocked before play.',
      C: 'Mentalist-only channel with powerful focus but brittle sanity.',
      D: 'Gifted Esper who can evolve once with training.',
      E: 'Base Esper template; raw talent that still sputters.'
    },
    narrativeHook:
      'A \'living conduit\' is a nice way of saying \'a walking fuse box.\' Their power is tied to their gut, which means a bad mood can sour the milk and a really bad day can buckle the walls. They\'re powerful, no doubt, but they\'re also unpredictable. Trusting an Esper is trusting a lightning storm to miss your house.',
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
    tagline: 'The Unstable Genome',
    summary:
      'The most potent expression of humanity\'s unstable genome. Possessing non-human traits, they represent life\'s chaotic and tenacious will to survive. From those who can pass as human with minor mutations (the "Kimmie"), to those whose altered forms are part of their daily identity, to the overtly alien (the "Under-Kin"), the Chimera embodies a vast spectrum of biological diversity.',
    priorityImpacts: {
      A: 'Seven mutation points. Become the chimera the wards whisper about.',
      B: 'Five points. The change is obvious, but you can still pass after midnight.',
      C: 'Four points. Enough to gain an edge while keeping a human silhouette.',
      D: 'Three points. Side-effects and stigma follow closely.',
      E: 'Two points. Tattoos of corruption hidden beneath borrowed coats.'
    },
    narrativeHook:
      'Here\'s the only thing you need to know about being a Chimera: this city will judge you by how well you can hide what you are. If you can pass for human, you\'re a Kimmie, living a lie. If you can\'t, you\'re just another freak trying to get by. Their \'resilience\' is just a pretty word for being too damn stubborn to die in a world that wishes they\'d just go away.',
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
    tagline: 'The Ghosts of Yesterday',
    summary:
      'Marvels of a bygone Imperial age, their crystalline consciousnesses representing a unique form of sentient life. After centuries of dormancy, they are being reactivated to once again serve Sidonia in an era of rebuilding. Each Automata is a living repository of history, their minds—shaped by a millennium of silent, dream-like evolution or ceaseless labor—offering a perspective wholly alien to our own.',
    priorityImpacts: {
      A: 'Imperial chassis with Overseer/Soldier branches unlocked and sovereign protocols.',
      B: 'Advanced military shell; twin branches with limited imperial overrides.',
      C: 'Baseline chassis with soldier safeguards still intact.',
      D: 'Advanced worker frame engineered for hazardous labor.',
      E: 'Basic worker frame, easily replaced… and easily overlooked.'
    },
    narrativeHook:
      'A \'new dawn\' of partnership? We\'re digging up old tools because we\'re too lazy to make new ones. These things went to sleep a thousand years ago. Nobody knows what a millennium of dreaming does to a mind, machine or otherwise. Are they the same loyal servants that got shelved? Or are they something new? Something broken? Everyone\'s trying to figure out if they\'re people or property, and my gut tells me that answer\'s gonna come the hard way.',
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
