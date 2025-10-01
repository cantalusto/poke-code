import { Pokemon, PokemonListResponse, PokemonSpecies, SearchParams } from '@/types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

class PokeAPIService {
  private async fetchWithCache<T>(url: string): Promise<T> {
    const cached = cache.get(url);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data as T;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      cache.set(url, { data, timestamp: now });
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  async getPokemon(idOrName: string | number): Promise<Pokemon> {
    const url = `${BASE_URL}/pokemon/${idOrName}`;
    return this.fetchWithCache<Pokemon>(url);
  }

  async getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
    const url = `${BASE_URL}/pokemon-species/${idOrName}`;
    return this.fetchWithCache<PokemonSpecies>(url);
  }

  async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
    const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    return this.fetchWithCache<PokemonListResponse>(url);
  }

  async getAllPokemon(limit: number = 1010): Promise<Pokemon[]> {
    const cacheKey = `all-pokemon-${limit}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data as Pokemon[];
    }

    try {
      const listResponse = await this.getPokemonList(limit, 0);
      const pokemonPromises = listResponse.results.map(async (pokemon) => {
        const id = this.extractIdFromUrl(pokemon.url);
        return this.getPokemon(id);
      });

      const allPokemon = await Promise.all(pokemonPromises);
      cache.set(cacheKey, { data: allPokemon, timestamp: now });
      return allPokemon;
    } catch (error) {
      console.error('Error fetching all Pokemon:', error);
      throw error;
    }
  }

  async searchPokemon(query: string): Promise<Pokemon[]>;
  async searchPokemon(params: SearchParams): Promise<{ pokemon: Pokemon[]; total: number }>;
  async searchPokemon(queryOrParams: string | SearchParams): Promise<Pokemon[] | { pokemon: Pokemon[]; total: number }> {
    // Handle string query overload
    if (typeof queryOrParams === 'string') {
      const params: SearchParams = {
        query: queryOrParams,
        filters: { types: [], generation: [] },
        sortBy: 'id',
        sortOrder: 'asc',
        page: 1,
        limit: 20
      };
      const result = await this.searchPokemon(params);
      return result.pokemon;
    }
    
    const params = queryOrParams;
    try {
      // For demo purposes, we'll fetch all Pokemon and filter client-side
      // In a production app, you'd want server-side filtering
      const allPokemon = await this.getAllPokemon();
      
      let filteredPokemon = allPokemon;

      // Apply name search
      if (params.query) {
        const query = params.query.toLowerCase();
        filteredPokemon = filteredPokemon.filter(pokemon =>
          pokemon.name.toLowerCase().includes(query) ||
          pokemon.id.toString().includes(query)
        );
      }

      // Apply type filters
      if (params.filters.types.length > 0) {
        filteredPokemon = filteredPokemon.filter(pokemon =>
          pokemon.types.some(type =>
            params.filters.types.includes(type.type.name)
          )
        );
      }

      // Apply stat filters
      if (params.filters.minStats || params.filters.maxStats) {
        filteredPokemon = filteredPokemon.filter(pokemon => {
          const stats = this.getStatValues(pokemon);
          
          if (params.filters.minStats) {
            for (const [statName, minValue] of Object.entries(params.filters.minStats)) {
              if (minValue !== undefined && stats[statName as keyof typeof stats] < minValue) {
                return false;
              }
            }
          }
          
          if (params.filters.maxStats) {
            for (const [statName, maxValue] of Object.entries(params.filters.maxStats)) {
              if (maxValue !== undefined && stats[statName as keyof typeof stats] > maxValue) {
                return false;
              }
            }
          }
          
          return true;
        });
      }

      // Apply sorting
      filteredPokemon.sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (params.sortBy) {
          case 'id':
            aValue = a.id;
            bValue = b.id;
            break;
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          default:
            const aStats = this.getStatValues(a);
            const bStats = this.getStatValues(b);
            aValue = aStats[params.sortBy as keyof typeof aStats];
            bValue = bStats[params.sortBy as keyof typeof bStats];
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return params.sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return params.sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });

      // Apply pagination
      const startIndex = (params.page - 1) * params.limit;
      const endIndex = startIndex + params.limit;
      const paginatedPokemon = filteredPokemon.slice(startIndex, endIndex);

      return {
        pokemon: paginatedPokemon,
        total: filteredPokemon.length
      };
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      throw error;
    }
  }

  async getRandomPokemon(count: number = 1): Promise<Pokemon[]> {
    try {
      const randomIds = Array.from({ length: count }, () => 
        Math.floor(Math.random() * 1010) + 1
      );
      
      const pokemonPromises = randomIds.map(id => this.getPokemon(id));
      return Promise.all(pokemonPromises);
    } catch (error) {
      console.error('Error fetching random Pokemon:', error);
      throw error;
    }
  }

  async getPokemonByType(typeName: string): Promise<Pokemon[]> {
    try {
      const url = `${BASE_URL}/type/${typeName}`;
      const typeData = await this.fetchWithCache<{ pokemon: { pokemon: { url: string } }[] }>(url);
      
      const pokemonPromises = typeData.pokemon.map(async (entry: { pokemon: { url: string } }) => {
        const id = this.extractIdFromUrl(entry.pokemon.url);
        return this.getPokemon(id);
      });

      return Promise.all(pokemonPromises);
    } catch (error) {
      console.error(`Error fetching Pokemon by type ${typeName}:`, error);
      throw error;
    }
  }

  async getPokemonByGeneration(generation: string): Promise<Pokemon[]> {
    try {
      const url = `${BASE_URL}/generation/${generation}`;
      const generationData = await this.fetchWithCache<{ pokemon_species: { url: string }[] }>(url);
      
      const pokemonPromises = generationData.pokemon_species.map(async (species: { url: string }) => {
        const id = this.extractIdFromUrl(species.url);
        return this.getPokemon(id);
      });

      return Promise.all(pokemonPromises);
    } catch (error) {
      console.error(`Error fetching Pokemon by generation ${generation}:`, error);
      throw error;
    }
  }

  // Utility methods
  private extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  private getStatValues(pokemon: Pokemon) {
    const statMap: Record<string, number> = {};
    
    pokemon.stats.forEach(stat => {
      const statName = stat.stat.name.replace('-', '');
      switch (statName) {
        case 'hp':
          statMap.hp = stat.base_stat;
          break;
        case 'attack':
          statMap.attack = stat.base_stat;
          break;
        case 'defense':
          statMap.defense = stat.base_stat;
          break;
        case 'specialattack':
          statMap.specialAttack = stat.base_stat;
          break;
        case 'specialdefense':
          statMap.specialDefense = stat.base_stat;
          break;
        case 'speed':
          statMap.speed = stat.base_stat;
          break;
      }
    });

    return statMap;
  }

  getStatByName(pokemon: Pokemon, statName: string): number {
    const stat = pokemon.stats.find(s => s.stat.name === statName);
    return stat ? stat.base_stat : 0;
  }

  getPokemonImageUrl(pokemon: Pokemon, variant: 'default' | 'shiny' | 'artwork' = 'default'): string {
    switch (variant) {
      case 'shiny':
        return pokemon.sprites.front_shiny || pokemon.sprites.front_default || '';
      case 'artwork':
        return pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default || '';
      default:
        return pokemon.sprites.front_default || '';
    }
  }

  getTypeColor(typeName: string): string {
    const typeColors: Record<string, string> = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };

    return typeColors[typeName] || '#68A090'; // Default color
  }

  // Clear cache method for testing or manual refresh
  clearCache(): void {
    cache.clear();
  }
}

export const pokeApiService = new PokeAPIService();