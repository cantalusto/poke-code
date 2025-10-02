// Pokémon API Types
export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  other: {
    'official-artwork': {
      front_default: string | null;
    };
    home: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: Array<{
    level_learned_at: number;
    move_learn_method: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }>;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: PokemonSprites;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  moves: PokemonMove[];
  species: {
    name: string;
    url: string;
  };
}

export interface PokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version: {
      name: string;
      url: string;
    };
  }>;
  generation: {
    name: string;
    url: string;
  };
  evolves_from_species: {
    name: string;
    url: string;
  } | null;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

// Team Builder Types
export interface TeamPokemon {
  pokemon: Pokemon;
  nickname?: string;
  level: number;
  moves: TeamPokemonMove[];
  selectedMoves?: string[]; // Up to 4 selected moves for battle
}

export interface PokemonTeam {
  id: string;
  name: string;
  pokemon: TeamPokemon[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamStats {
  totalStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  averageStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  typeDistribution: Record<string, number>;
  weaknesses: string[];
  resistances: string[];
}

// Battle System Types
export interface BattlePokemon {
  id: string;
  pokemon: Pokemon;
  nickname?: string;
  level: number;
  currentHp: number;
  maxHp: number;
  stats: {
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  moves: BattleMove[];
  status?: 'normal' | 'poisoned' | 'burned' | 'paralyzed' | 'frozen' | 'asleep' | null;
  fainted: boolean;
}

export interface BattleMove {
  name: string;
  power: number;
  accuracy: number;
  type: string;
  category: 'physical' | 'special' | 'status';
  pp: number;
  maxPp: number;
  currentPp: number;
  priority?: number;
}

export interface BattleState {
  id?: string;
  playerTeam: BattlePokemon[];
  opponentTeam: BattlePokemon[];
  currentPlayerPokemon: BattlePokemon | null;
  currentOpponentPokemon: BattlePokemon | null;
  turn: number;
  phase: 'setup' | 'pokemon-selection' | 'battle' | 'victory' | 'defeat' | 'ended';
  winner?: 'player' | 'opponent' | null;
  playerAction?: BattleAction | null;
  opponentAction?: BattleAction | null;
  battleLog?: BattleLogEntry[];
}

export interface BattleLogEntry {
  id: string;
  turn: number;
  message: string;
  type: 'move' | 'switch' | 'status' | 'damage' | 'heal' | 'faint' | 'victory' | 'battle-start' | 'battle-end' | 'super-effective' | 'not-very-effective' | 'pokemon-fainted' | 'move-failed' | 'move-missed' | 'move-used' | 'no-effect' | 'damage-dealt' | 'switch-failed' | 'pokemon-switched';
  timestamp: Date;
}

export interface BattleAction {
  type: 'attack' | 'switch' | 'item';
  moveIndex?: string | number;
  pokemonIndex?: number;
  switchIndex?: number;
  itemId?: string;
}

export interface AITrainer {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  team: Array<{
    name: string;
    level: number;
  }>;
  difficulty: 'easy' | 'medium' | 'hard' | 'champion' | 'legendary';
  strategy: 'aggressive' | 'defensive' | 'balanced' | 'random';
  description?: string;
}

// Type Effectiveness
export interface TypeEffectiveness {
  [attackingType: string]: {
    [defendingType: string]: number; // 0, 0.25, 0.5, 1, 2, 4
  };
}

// Search and Filter Types
export interface PokemonFilters {
  types: string[];
  generation: string[];
  minStats?: {
    hp?: number;
    attack?: number;
    defense?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed?: number;
  };
  maxStats?: {
    hp?: number;
    attack?: number;
    defense?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed?: number;
  };
}

export interface SearchParams {
  query: string;
  filters: PokemonFilters;
  sortBy: 'id' | 'name' | 'hp' | 'attack' | 'defense' | 'speed';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

// AI Analysis Types
export interface TeamAnalysis {
  overallRating: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  roleAnalysis: {
    roles: Record<string, string[]>; // role -> pokemon names
    missingRoles: string[];
  };
  typeBalance: {
    coverage: string[];
    gaps: string[];
    redundancies: string[];
  };
  synergy: {
    score: number;
    explanation: string;
  };
}

// Utility Types
export type PokemonStatName = 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';
export type PokemonTypeName = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' 
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' 
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export type Generation = 
  | 'generation-i' | 'generation-ii' | 'generation-iii' | 'generation-iv' 
  | 'generation-v' | 'generation-vi' | 'generation-vii' | 'generation-viii' | 'generation-ix';


export interface MoveDetails {
  id: number;
  name: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  type: {
    name: string;
    url: string;
  };
  damage_class: {
    name: 'physical' | 'special' | 'status';
    url: string;
  };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: {
      name: string;
      url: string;
    };
  }>;
  priority: number;
  target: {
    name: string;
    url: string;
  };
}

export interface TeamPokemonMove {
  name: string;
  details?: MoveDetails;
}