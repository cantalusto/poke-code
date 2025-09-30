import { PokemonTeam, TeamPokemon, TeamStats } from '@/types/pokemon';

const TEAMS_STORAGE_KEY = 'pokemon-teams';

export class TeamStorageService {
  static getTeams(): PokemonTeam[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(TEAMS_STORAGE_KEY);
      if (!stored) return [];
      
      const teams = JSON.parse(stored);
      return teams.map((team: Omit<PokemonTeam, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }) => ({
        ...team,
        createdAt: new Date(team.createdAt),
        updatedAt: new Date(team.updatedAt)
      }));
    } catch {
      console.error('Error loading teams from localStorage');
      return [];
    }
  }

  static saveTeam(team: PokemonTeam): void {
    if (typeof window === 'undefined') return;
    
    try {
      const teams = this.getTeams();
      const existingIndex = teams.findIndex(t => t.id === team.id);
      
      const updatedTeam = {
        ...team,
        updatedAt: new Date()
      };
      
      if (existingIndex >= 0) {
        teams[existingIndex] = updatedTeam;
      } else {
        teams.push(updatedTeam);
      }
      
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    } catch {
      console.error('Error saving team to localStorage');
    }
  }

  static deleteTeam(teamId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const teams = this.getTeams();
      const filteredTeams = teams.filter(t => t.id !== teamId);
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(filteredTeams));
    } catch {
      console.error('Error deleting team from localStorage');
    }
  }

  static getTeam(teamId: string): PokemonTeam | null {
    const teams = this.getTeams();
    return teams.find(t => t.id === teamId) || null;
  }

  static createTeam(name: string): PokemonTeam {
    return {
      id: this.generateId(),
      name,
      pokemon: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static addPokemonToTeam(team: PokemonTeam, teamPokemon: TeamPokemon): PokemonTeam {
    if (team.pokemon.length >= 6) {
      throw new Error('Team is already full (6 Pokémon maximum)');
    }
    
    const updatedTeam = {
      ...team,
      pokemon: [...team.pokemon, teamPokemon],
      updatedAt: new Date()
    };
    
    this.saveTeam(updatedTeam);
    return updatedTeam;
  }

  static removePokemonFromTeam(team: PokemonTeam, index: number): PokemonTeam {
    if (index < 0 || index >= team.pokemon.length) {
      throw new Error('Invalid Pokémon index');
    }
    
    const updatedTeam = {
      ...team,
      pokemon: team.pokemon.filter((_, i) => i !== index),
      updatedAt: new Date()
    };
    
    this.saveTeam(updatedTeam);
    return updatedTeam;
  }

  static calculateTeamStats(team: PokemonTeam): TeamStats {
    if (team.pokemon.length === 0) {
      return {
        totalStats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
        averageStats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
        typeDistribution: {},
        weaknesses: [],
        resistances: []
      };
    }

    // Calculate total and average stats
    const totalStats = team.pokemon.reduce((acc, tp) => {
      const pokemon = tp.pokemon;
      pokemon.stats.forEach(stat => {
        const statName = this.mapStatName(stat.stat.name);
        if (statName) {
          acc[statName] += stat.base_stat;
        }
      });
      return acc;
    }, { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 });

    const averageStats = Object.fromEntries(
      Object.entries(totalStats).map(([key, value]) => [key, Math.round(value / team.pokemon.length)])
    ) as typeof totalStats;

    // Calculate type distribution
    const typeDistribution: Record<string, number> = {};
    team.pokemon.forEach(tp => {
      tp.pokemon.types.forEach(type => {
        typeDistribution[type.type.name] = (typeDistribution[type.type.name] || 0) + 1;
      });
    });

    // Calculate weaknesses and resistances (simplified)
    const weaknesses = this.calculateTeamWeaknesses(team);
    const resistances = this.calculateTeamResistances(team);

    return {
      totalStats,
      averageStats,
      typeDistribution,
      weaknesses,
      resistances
    };
  }

  private static mapStatName(statName: string): keyof TeamStats['totalStats'] | null {
    const mapping: Record<string, keyof TeamStats['totalStats']> = {
      'hp': 'hp',
      'attack': 'attack',
      'defense': 'defense',
      'special-attack': 'specialAttack',
      'special-defense': 'specialDefense',
      'speed': 'speed'
    };
    return mapping[statName] || null;
  }

  private static calculateTeamWeaknesses(team: PokemonTeam): string[] {
    // Simplified weakness calculation
    // In a real implementation, you'd use the full type effectiveness chart
    const typeWeaknesses: Record<string, string[]> = {
      'fire': ['water', 'ground', 'rock'],
      'water': ['electric', 'grass'],
      'grass': ['fire', 'ice', 'poison', 'flying', 'bug'],
      'electric': ['ground'],
      'psychic': ['bug', 'ghost', 'dark'],
      'ice': ['fire', 'fighting', 'rock', 'steel'],
      'dragon': ['ice', 'dragon', 'fairy'],
      'dark': ['fighting', 'bug', 'fairy'],
      'fighting': ['flying', 'psychic', 'fairy'],
      'poison': ['ground', 'psychic'],
      'ground': ['water', 'grass', 'ice'],
      'flying': ['electric', 'ice', 'rock'],
      'bug': ['fire', 'flying', 'rock'],
      'rock': ['water', 'grass', 'fighting', 'ground', 'steel'],
      'ghost': ['ghost', 'dark'],
      'steel': ['fire', 'fighting', 'ground'],
      'fairy': ['poison', 'steel'],
      'normal': ['fighting']
    };

    const teamTypes = new Set<string>();
    team.pokemon.forEach(tp => {
      tp.pokemon.types.forEach(type => {
        teamTypes.add(type.type.name);
      });
    });

    const weaknessCount: Record<string, number> = {};
    teamTypes.forEach(type => {
      const weaknesses = typeWeaknesses[type] || [];
      weaknesses.forEach(weakness => {
        weaknessCount[weakness] = (weaknessCount[weakness] || 0) + 1;
      });
    });

    // Return types that are weaknesses for multiple team members
    return Object.entries(weaknessCount)
      .filter(([, count]) => count >= 2)
      .map(([type]) => type);
  }

  private static calculateTeamResistances(team: PokemonTeam): string[] {
    // Simplified resistance calculation
    const typeResistances: Record<string, string[]> = {
      'fire': ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
      'water': ['fire', 'water', 'ice', 'steel'],
      'grass': ['water', 'electric', 'grass', 'ground'],
      'electric': ['flying', 'steel', 'electric'],
      'psychic': ['fighting', 'psychic'],
      'ice': ['ice'],
      'dragon': ['fire', 'water', 'electric', 'grass'],
      'dark': ['ghost', 'dark'],
      'fighting': ['rock', 'bug', 'dark'],
      'poison': ['fighting', 'poison', 'bug', 'grass', 'fairy'],
      'ground': ['poison', 'rock'],
      'flying': ['fighting', 'ground', 'bug', 'grass'],
      'bug': ['fighting', 'ground', 'grass'],
      'rock': ['normal', 'flying', 'poison', 'fire'],
      'ghost': ['poison', 'bug'],
      'steel': ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'],
      'fairy': ['fighting', 'bug', 'dark'],
      'normal': []
    };

    const teamTypes = new Set<string>();
    team.pokemon.forEach(tp => {
      tp.pokemon.types.forEach(type => {
        teamTypes.add(type.type.name);
      });
    });

    const resistanceCount: Record<string, number> = {};
    teamTypes.forEach(type => {
      const resistances = typeResistances[type] || [];
      resistances.forEach(resistance => {
        resistanceCount[resistance] = (resistanceCount[resistance] || 0) + 1;
      });
    });

    // Return types that are resisted by multiple team members
    return Object.entries(resistanceCount)
      .filter(([, count]) => count >= 2)
      .map(([type]) => type);
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Export/Import functionality
  static exportTeam(team: PokemonTeam): string {
    return JSON.stringify(team, null, 2);
  }

  static importTeam(teamData: string): PokemonTeam {
    try {
      const team = JSON.parse(teamData);
      return {
        ...team,
        id: this.generateId(), // Generate new ID to avoid conflicts
        createdAt: new Date(team.createdAt),
        updatedAt: new Date()
      };
    } catch {
      throw new Error('Invalid team data format');
    }
  }

  // Clear all teams (for testing/reset)
  static clearAllTeams(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TEAMS_STORAGE_KEY);
  }
}