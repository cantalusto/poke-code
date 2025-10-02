import { 
  BattlePokemon, 
  BattleMove, 
  BattleState, 
  BattleLogEntry, 
  BattleAction, 
  AITrainer, 
  Pokemon, 
  TeamPokemon,
  TypeEffectiveness 
} from '@/types/pokemon';

// Type effectiveness chart (simplified version)
const TYPE_EFFECTIVENESS: TypeEffectiveness = {
  normal: { fighting: 2, ghost: 0 },
  fire: { fire: 0.5, water: 2, grass: 0.5, ice: 0.5, ground: 2, rock: 2, bug: 0.5, steel: 0.5, fairy: 0.5 },
  water: { fire: 0.5, water: 0.5, grass: 2, electric: 2, ice: 0.5, steel: 0.5 },
  electric: { water: 0.5, grass: 0.5, ground: 2, flying: 0.5, electric: 0.5, steel: 0.5 },
  grass: { fire: 2, water: 0.5, grass: 0.5, poison: 2, ground: 0.5, flying: 2, bug: 2, rock: 0.5, ice: 2, steel: 0.5 },
  ice: { fire: 2, water: 0.5, grass: 0.5, fighting: 2, rock: 2, steel: 2, ice: 0.5 },
  fighting: { normal: 0.5, flying: 2, poison: 0.5, psychic: 2, bug: 0.5, rock: 0.5, ghost: 0, dark: 0.5, steel: 0.5, fairy: 2 },
  poison: { grass: 0.5, fighting: 0.5, poison: 0.5, ground: 2, psychic: 2, bug: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 0.5 },
  ground: { fire: 0.5, water: 2, grass: 2, electric: 0, poison: 0.5, flying: 0, rock: 0.5, ice: 2, steel: 0.5 },
  flying: { electric: 2, grass: 0.5, ground: 0, fighting: 0.5, bug: 0.5, rock: 2, ice: 2, steel: 0.5 },
  psychic: { fighting: 0.5, poison: 0.5, psychic: 0.5, bug: 2, ghost: 2, dark: 2, steel: 0.5 },
  bug: { fire: 2, grass: 0.5, fighting: 0.5, poison: 0.5, flying: 2, psychic: 0.5, rock: 2, ghost: 0.5, dark: 0.5, steel: 0.5 },
  rock: { normal: 0.5, fire: 0.5, water: 2, grass: 2, fighting: 2, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, steel: 2 },
  ghost: { normal: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 2, steel: 0.5 },
  dragon: { fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5, ice: 2, dragon: 2, fairy: 2 },
  dark: { fighting: 2, poison: 0.5, psychic: 0, bug: 2, ghost: 0.5, dark: 0.5, fairy: 2, steel: 0.5 },
  steel: { normal: 0.5, fire: 2, grass: 0.5, fighting: 2, poison: 0, ground: 2, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, ghost: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5, ice: 0.5 },
  fairy: { fire: 0.5, fighting: 0.5, poison: 2, bug: 0.5, dragon: 0, dark: 0.5, steel: 2 }
};

// Predefined AI trainers with strong teams
export const AI_TRAINERS: AITrainer[] = [
  {
    id: 'champion-red',
    name: 'champion_red', // Translation key
    difficulty: 'legendary',
    avatar: 'https://art.pixilart.com/a6d87953f082.gif',
    team: [
      { name: 'pikachu', level: 81 },
      { name: 'charizard', level: 77 },
      { name: 'venusaur', level: 77 },
      { name: 'blastoise', level: 77 },
      { name: 'lapras', level: 75 },
      { name: 'snorlax', level: 75 }
    ],
    strategy: 'aggressive',
    description: 'champion_red_description' // Translation key
  },
  {
    id: 'lance',
    name: 'elite_four_lance', // Translation key
    difficulty: 'hard',
    avatar: 'https://pa1.aminoapps.com/6291/b1a3964d1c52c3bb1a8e4ccb31dda92413494d03_00.gif',
    team: [
      { name: 'dragonite', level: 62 },
      { name: 'dragonite', level: 64 },
      { name: 'aerodactyl', level: 60 },
      { name: 'gyarados', level: 58 },
      { name: 'charizard', level: 60 },
      { name: 'dragonite', level: 66 }
    ],
    strategy: 'defensive',
    description: 'elite_four_lance_description' // Translation key
  },
  {
    id: 'brock',
    name: 'gym_leader_brock', // Translation key
    difficulty: 'easy',
    avatar: 'https://fc06.deviantart.net/fs70/f/2014/105/d/a/tppfr_brock_animbig_by_bhaumat-d7emwmk.gif',
    team: [
      { name: 'geodude', level: 12 },
      { name: 'onix', level: 14 }
    ],
    strategy: 'balanced',
    description: 'gym_leader_brock_description' // Translation key
  },
  {
    id: 'blue',
    name: 'rival_blue', // Translation key
    difficulty: 'medium',
    avatar: 'https://i.imgur.com/tv4cHR1.gif',
    team: [
      { name: 'pidgeot', level: 56 },
      { name: 'rhydon', level: 56 },
      { name: 'gyarados', level: 58 },
      { name: 'arcanine', level: 58 },
      { name: 'tyranitar', level: 58 },
      { name: 'venusaur', level: 60 }
    ],
    strategy: 'aggressive',
    description: 'rival_blue_description' // Translation key
  }
];

export class BattleEngine {
  private battleState: BattleState;
  private battleLog: BattleLogEntry[] = [];

  constructor() {
    this.battleState = this.createInitialBattleState();
  }

  private createInitialBattleState(): BattleState {
    return {
      playerTeam: [],
      opponentTeam: [],
      currentPlayerPokemon: null,
      currentOpponentPokemon: null,
      turn: 1,
      phase: 'setup',
      winner: null,
      playerAction: null,
      opponentAction: null
    };
  }

  // Initialize battle with teams
  initializeBattle(playerTeam: TeamPokemon[], opponentTeam: TeamPokemon[] | AITrainer): BattleState {
    let opponent: TeamPokemon[];
    
    if ('team' in opponentTeam) {
      // AI Trainer
      opponent = opponentTeam.team.map(aiPokemon => ({
        pokemon: { name: aiPokemon.name } as Pokemon, // Will be loaded later
        nickname: aiPokemon.name,
        level: aiPokemon.level,
        moves: [
          { name: 'tackle' },
          { name: 'quick-attack' },
          { name: 'body-slam' },
          { name: 'double-edge' }
        ]
      }));
    } else {
      opponent = opponentTeam;
    }

    this.battleState = {
      playerTeam: playerTeam.map(tp => this.createBattlePokemon(tp)),
      opponentTeam: opponent.map(tp => this.createBattlePokemon(tp)),
      currentPlayerPokemon: null,
      currentOpponentPokemon: null,
      turn: 1,
      phase: 'pokemon-selection',
      winner: null,
      playerAction: null,
      opponentAction: null
    };

    // Set initial active Pokémon
    this.battleState.currentPlayerPokemon = this.battleState.playerTeam.find(p => !p.fainted) || null;
    this.battleState.currentOpponentPokemon = this.battleState.opponentTeam.find(p => !p.fainted) || null;

    // Set battle phase to battle if we have valid Pokémon
    if (this.battleState.currentPlayerPokemon && this.battleState.currentOpponentPokemon) {
      this.battleState.phase = 'battle';
    }

    this.battleLog = [];
    this.addLogEntry('battle-start', 'The battle begins!');

    return this.battleState;
  }

  private createBattlePokemon(teamPokemon: TeamPokemon): BattlePokemon {
    const pokemon = teamPokemon.pokemon;
    const level = teamPokemon.level;

    // Calculate stats based on level (simplified formula)
    const baseHp = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 50;
    const baseAttack = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 50;
    const baseDefense = pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 50;
    const baseSpAttack = pokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 50;
    const baseSpDefense = pokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 50;
    const baseSpeed = pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat || 50;

    const maxHp = Math.floor(((2 * baseHp + 31) * level) / 100) + level + 10;
    const attack = Math.floor(((2 * baseAttack + 31) * level) / 100) + 5;
    const defense = Math.floor(((2 * baseDefense + 31) * level) / 100) + 5;
    const spAttack = Math.floor(((2 * baseSpAttack + 31) * level) / 100) + 5;
    const spDefense = Math.floor(((2 * baseSpDefense + 31) * level) / 100) + 5;
    const speed = Math.floor(((2 * baseSpeed + 31) * level) / 100) + 5;

    // Create moves - use team moves if available, otherwise use default moves
    let moves: BattleMove[] = [];
    
    if (teamPokemon.moves && teamPokemon.moves.length > 0) {
      // Convert team moves to battle moves
      moves = teamPokemon.moves.map(move => this.createBattleMoveFromName(move.name));
    } else {
      // Fallback to default moves
      moves = [
        {
          name: 'Tackle',
          type: 'normal',
          power: 40,
          accuracy: 100,
          pp: 35,
          maxPp: 35,
          currentPp: 35,
          category: 'physical'
        },
        {
          name: 'Quick Attack',
          type: 'normal',
          power: 40,
          accuracy: 100,
          pp: 30,
          maxPp: 30,
          currentPp: 30,
          category: 'physical',
          priority: 1
        }
      ];

      // Add type-specific moves
      const primaryType = pokemon.types[0]?.type.name;
      if (primaryType) {
        moves.push(this.getTypeMove(primaryType));
      }
    }

    return {
      id: `${teamPokemon.pokemon.id}-${level}-${Date.now()}`,
      pokemon: teamPokemon.pokemon,
      nickname: teamPokemon.nickname,
      level,
      currentHp: maxHp,
      maxHp,
      stats: {
        attack,
        defense,
        spAttack,
        spDefense,
        speed
      },
      moves,
      status: null,
      fainted: false
    };
  }

  // Helper method to create battle move from move name
  private createBattleMoveFromName(moveName: string): BattleMove {
    const moveData: Record<string, Partial<BattleMove>> = {
      'tackle': { name: 'Tackle', type: 'normal', power: 40, accuracy: 100, pp: 35, category: 'physical' },
      'quick-attack': { name: 'Quick Attack', type: 'normal', power: 40, accuracy: 100, pp: 30, category: 'physical', priority: 1 },
      'body-slam': { name: 'Body Slam', type: 'normal', power: 85, accuracy: 100, pp: 15, category: 'physical' },
      'double-edge': { name: 'Double-Edge', type: 'normal', power: 120, accuracy: 100, pp: 15, category: 'physical' },
      'ember': { name: 'Ember', type: 'fire', power: 40, accuracy: 100, pp: 25, category: 'special' },
      'water-gun': { name: 'Water Gun', type: 'water', power: 40, accuracy: 100, pp: 25, category: 'special' },
      'vine-whip': { name: 'Vine Whip', type: 'grass', power: 45, accuracy: 100, pp: 25, category: 'physical' },
      'thunder-shock': { name: 'Thunder Shock', type: 'electric', power: 40, accuracy: 100, pp: 30, category: 'special' },
      'confusion': { name: 'Confusion', type: 'psychic', power: 50, accuracy: 100, pp: 25, category: 'special' },
      'ice-beam': { name: 'Ice Beam', type: 'ice', power: 90, accuracy: 100, pp: 10, category: 'special' },
      'dragon-rage': { name: 'Dragon Rage', type: 'dragon', power: 40, accuracy: 100, pp: 10, category: 'special' },
      'bite': { name: 'Bite', type: 'dark', power: 60, accuracy: 100, pp: 25, category: 'physical' },
      'karate-chop': { name: 'Karate Chop', type: 'fighting', power: 50, accuracy: 100, pp: 25, category: 'physical' },
      'poison-sting': { name: 'Poison Sting', type: 'poison', power: 15, accuracy: 100, pp: 35, category: 'physical' },
      'mud-slap': { name: 'Mud-Slap', type: 'ground', power: 20, accuracy: 100, pp: 10, category: 'special' },
      'gust': { name: 'Gust', type: 'flying', power: 40, accuracy: 100, pp: 35, category: 'special' },
      'bug-bite': { name: 'Bug Bite', type: 'bug', power: 60, accuracy: 100, pp: 20, category: 'physical' },
      'rock-throw': { name: 'Rock Throw', type: 'rock', power: 50, accuracy: 90, pp: 15, category: 'physical' },
      'lick': { name: 'Lick', type: 'ghost', power: 30, accuracy: 100, pp: 30, category: 'physical' },
      'metal-claw': { name: 'Metal Claw', type: 'steel', power: 50, accuracy: 95, pp: 35, category: 'physical' },
      'fairy-wind': { name: 'Fairy Wind', type: 'fairy', power: 40, accuracy: 100, pp: 30, category: 'special' }
    };

    const move = moveData[moveName.toLowerCase()] || moveData['tackle'];
    
    return {
      name: move.name || 'Tackle',
      type: move.type || 'normal',
      power: move.power || 40,
      accuracy: move.accuracy || 100,
      pp: move.pp || 35,
      maxPp: move.pp || 35,
      currentPp: move.pp || 35,
      category: move.category || 'physical',
      priority: move.priority || 0
    };
  }

  private getTypeMove(type: string): BattleMove {
    const typeMoves: Record<string, BattleMove> = {
      fire: {
        name: 'Ember',
        type: 'fire',
        power: 40,
        accuracy: 100,
        pp: 25,
        maxPp: 25,
        currentPp: 25,
        category: 'special'
      },
      water: {
        name: 'Water Gun',
        type: 'water',
        power: 40,
        accuracy: 100,
        pp: 25,
        maxPp: 25,
        currentPp: 25,
        category: 'special'
      },
      grass: {
        name: 'Vine Whip',
        type: 'grass',
        power: 45,
        accuracy: 100,
        pp: 25,
        maxPp: 25,
        currentPp: 25,
        category: 'physical'
      },
      electric: {
        name: 'Thunder Shock',
        type: 'electric',
        power: 40,
        accuracy: 100,
        pp: 30,
        maxPp: 30,
        currentPp: 30,
        category: 'special'
      }
    };

    return typeMoves[type] || {
      name: 'Struggle',
      type: 'normal',
      power: 50,
      accuracy: 100,
      pp: 1,
      maxPp: 1,
      currentPp: 1,
      category: 'physical'
    };
  }

  // Process a turn with player and opponent actions
  processTurn(playerAction: BattleAction, opponentAction?: BattleAction): BattleState {
    if (this.battleState.phase !== 'battle' && this.battleState.phase !== 'pokemon-selection') {
      return this.battleState;
    }

    // If no opponent action provided, generate AI action
    if (!opponentAction) {
      opponentAction = this.generateAIAction();
    }

    this.battleState.playerAction = playerAction;
    this.battleState.opponentAction = opponentAction;

    // Determine action order based on priority and speed
    const actionOrder = this.determineActionOrder(playerAction, opponentAction);

    // Execute actions in order
    for (const action of actionOrder) {
      if (this.battleState.winner) break; // Battle ended

      if (action.isPlayer) {
        this.executePlayerAction(playerAction);
      } else {
        this.executeOpponentAction(opponentAction);
      }
    }

    // Check for battle end conditions
    this.checkBattleEnd();

    // Increment turn
    this.battleState.turn++;
    this.battleState.phase = 'battle';

    return this.battleState;
  }

  private determineActionOrder(playerAction: BattleAction, opponentAction: BattleAction): Array<{isPlayer: boolean}> {
    const playerPokemon = this.battleState.currentPlayerPokemon;
    const opponentPokemon = this.battleState.currentOpponentPokemon;

    if (!playerPokemon || !opponentPokemon) {
      return [{ isPlayer: true }, { isPlayer: false }];
    }

    // Switch actions always go first
    if (playerAction.type === 'switch' && opponentAction.type !== 'switch') {
      return [{ isPlayer: true }, { isPlayer: false }];
    }
    if (opponentAction.type === 'switch' && playerAction.type !== 'switch') {
      return [{ isPlayer: false }, { isPlayer: true }];
    }

    // Both switching or both attacking - check priority and speed
    if (playerAction.type === 'attack' && opponentAction.type === 'attack') {
      const playerMove = playerPokemon.moves.find(m => m.name === playerAction.moveIndex);
      const opponentMove = opponentPokemon.moves.find(m => m.name === opponentAction.moveIndex);

      const playerPriority = playerMove?.priority || 0;
      const opponentPriority = opponentMove?.priority || 0;

      if (playerPriority > opponentPriority) {
        return [{ isPlayer: true }, { isPlayer: false }];
      }
      if (opponentPriority > playerPriority) {
        return [{ isPlayer: false }, { isPlayer: true }];
      }

      // Same priority - check speed
      if (playerPokemon.stats.speed >= opponentPokemon.stats.speed) {
        return [{ isPlayer: true }, { isPlayer: false }];
      } else {
        return [{ isPlayer: false }, { isPlayer: true }];
      }
    }

    // Default order
    return [{ isPlayer: true }, { isPlayer: false }];
  }

  private executePlayerAction(action: BattleAction): void {
    if (action.type === 'attack') {
      this.executeAttack(true, action.moveIndex as string);
    } else if (action.type === 'switch') {
      this.switchPokemon(true, action.pokemonIndex as number);
    }
  }

  private executeOpponentAction(action: BattleAction): void {
    if (action.type === 'attack') {
      this.executeAttack(false, action.moveIndex as string);
    } else if (action.type === 'switch') {
      this.switchPokemon(false, action.pokemonIndex as number);
    }
  }

  private executeAttack(isPlayer: boolean, moveName: string): void {
    const attacker = isPlayer ? this.battleState.currentPlayerPokemon : this.battleState.currentOpponentPokemon;
    const defender = isPlayer ? this.battleState.currentOpponentPokemon : this.battleState.currentPlayerPokemon;

    if (!attacker || !defender || attacker.fainted || defender.fainted) {
      return;
    }

    const move = attacker.moves.find(m => m.name === moveName);
    if (!move || move.pp <= 0) {
      this.addLogEntry('move-failed', `${attacker.nickname} has no PP left for ${moveName}!`);
      return;
    }

    // Reduce PP
    move.pp--;

    // Check accuracy
    const accuracyRoll = Math.random() * 100;
    if (accuracyRoll > move.accuracy) {
      this.addLogEntry('move-missed', `${attacker.nickname}'s ${move.name} missed!`);
      return;
    }

    // Calculate damage
    const damage = this.calculateDamage(attacker, defender, move);
    
    // Apply damage
    defender.currentHp = Math.max(0, defender.currentHp - damage);

    this.addLogEntry('move-used', `${attacker.nickname} used ${move.name}!`);
    
    if (damage > 0) {
      const effectiveness = this.getTypeEffectiveness(move.type, defender.pokemon.types.map(t => t.type.name));
      
      if (effectiveness > 1) {
        this.addLogEntry('super-effective', "It's super effective!");
      } else if (effectiveness < 1 && effectiveness > 0) {
        this.addLogEntry('not-very-effective', "It's not very effective...");
      } else if (effectiveness === 0) {
        this.addLogEntry('no-effect', "It had no effect!");
      }

      this.addLogEntry('damage-dealt', `${defender.nickname} took ${damage} damage!`);
    }

    // Check if defender fainted
    if (defender.currentHp <= 0) {
      defender.fainted = true;
      this.addLogEntry('pokemon-fainted', `${defender.nickname} fainted!`);
    }
  }

  private calculateDamage(attacker: BattlePokemon, defender: BattlePokemon, move: BattleMove): number {
    if (move.power === 0) return 0;

    // Get attack and defense stats based on move category
    const attack = move.category === 'physical' ? attacker.stats.attack : attacker.stats.spAttack;
    const defense = move.category === 'physical' ? defender.stats.defense : defender.stats.spDefense;

    // Base damage calculation
    const level = attacker.level;
    const power = move.power;
    
    // Damage formula (simplified version of Pokémon damage formula)
    let damage = Math.floor(((((2 * level / 5 + 2) * power * attack / defense) / 50) + 2));

    // Type effectiveness
    const effectiveness = this.getTypeEffectiveness(move.type, defender.pokemon.types.map(t => t.type.name));
    damage = Math.floor(damage * effectiveness);

    // STAB (Same Type Attack Bonus)
    const attackerTypes = attacker.pokemon.types.map(t => t.type.name);
    if (attackerTypes.includes(move.type)) {
      damage = Math.floor(damage * 1.5);
    }

    // Random factor (85-100%)
    const randomFactor = (Math.random() * 0.15) + 0.85;
    damage = Math.floor(damage * randomFactor);

    // Minimum damage
    return Math.max(1, damage);
  }

  private getTypeEffectiveness(attackType: string, defenderTypes: string[]): number {
    let effectiveness = 1;

    for (const defenderType of defenderTypes) {
      const typeChart = TYPE_EFFECTIVENESS[attackType as keyof TypeEffectiveness];
      if (typeChart && defenderType in typeChart) {
        effectiveness *= typeChart[defenderType as keyof typeof typeChart] as number;
      }
    }

    return effectiveness;
  }

  private switchPokemon(isPlayer: boolean, pokemonIndex: number): void {
    const team = isPlayer ? this.battleState.playerTeam : this.battleState.opponentTeam;
    const newPokemon = team[pokemonIndex];

    if (!newPokemon || newPokemon.fainted) {
      this.addLogEntry('switch-failed', 'Cannot switch to a fainted Pokémon!');
      return;
    }

    if (isPlayer) {
      this.battleState.currentPlayerPokemon = newPokemon;
    } else {
      this.battleState.currentOpponentPokemon = newPokemon;
    }

    this.addLogEntry('pokemon-switched', `${newPokemon.nickname} was sent out!`);
  }

  private generateAIAction(): BattleAction {
    const opponentPokemon = this.battleState.currentOpponentPokemon;
    
    if (!opponentPokemon || opponentPokemon.fainted) {
      // Switch to next available Pokémon
      const availablePokemon = this.battleState.opponentTeam.findIndex(p => !p.fainted);
      if (availablePokemon !== -1) {
        return { type: 'switch', pokemonIndex: availablePokemon };
      }
    }

    // Simple AI: use a random available move
    if (opponentPokemon) {
      const availableMoves = opponentPokemon.moves.filter(m => m.pp > 0);
      if (availableMoves.length > 0) {
        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        return { type: 'attack', moveIndex: randomMove.name };
      }
    }

    // Fallback: struggle
    return { type: 'attack', moveIndex: 'Struggle' };
  }

  private checkBattleEnd(): void {
    const playerHasActivePokemon = this.battleState.playerTeam.some(p => !p.fainted);
    const opponentHasActivePokemon = this.battleState.opponentTeam.some(p => !p.fainted);

    if (!playerHasActivePokemon) {
      this.battleState.winner = 'opponent';
      this.battleState.phase = 'ended';
      this.addLogEntry('battle-end', 'You lost the battle!');
    } else if (!opponentHasActivePokemon) {
      this.battleState.winner = 'player';
      this.battleState.phase = 'ended';
      this.addLogEntry('battle-end', 'You won the battle!');
    }
  }

  private addLogEntry(type: BattleLogEntry['type'], message: string): void {
    this.battleLog.push({
      id: `log-${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date(),
      turn: this.battleState.turn
    });
  }

  // Public methods for accessing battle state
  getBattleState(): BattleState {
    return { ...this.battleState };
  }

  getBattleLog(): BattleLogEntry[] {
    return [...this.battleLog];
  }

  // Force switch when current Pokémon faints
  forceSwitchPokemon(isPlayer: boolean, pokemonIndex: number): BattleState {
    this.switchPokemon(isPlayer, pokemonIndex);
    return this.battleState;
  }

  // Get available actions for current state
  getAvailableActions(isPlayer: boolean): BattleAction[] {
    const actions: BattleAction[] = [];
    const currentPokemon = isPlayer ? this.battleState.currentPlayerPokemon : this.battleState.currentOpponentPokemon;
    const team = isPlayer ? this.battleState.playerTeam : this.battleState.opponentTeam;

    // Attack actions
    if (currentPokemon && !currentPokemon.fainted) {
      currentPokemon.moves.forEach(move => {
        if (move.pp > 0) {
          actions.push({ type: 'attack', moveIndex: move.name });
        }
      });
    }

    // Switch actions
    team.forEach((pokemon, index) => {
      if (!pokemon.fainted && pokemon !== currentPokemon) {
        actions.push({ type: 'switch', pokemonIndex: index });
      }
    });

    return actions;
  }

  // Reset battle engine
  reset(): void {
    this.battleState = this.createInitialBattleState();
    this.battleLog = [];
  }
}