'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PokemonCard } from './PokemonCard';
import { Pokemon, PokemonTeam, TeamPokemon } from '@/types/pokemon';
import { pokeApiService } from '@/services/pokeapi';
import { TeamStorageService } from '@/utils/teamStorage';
import { Search, Filter, Grid, List, Shuffle, Loader2, Users, Plus } from 'lucide-react';

interface PokedexViewerProps {
  onAddToTeam?: (pokemon: Pokemon) => void;
  onViewDetails?: (pokemon: Pokemon) => void;
}

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const GENERATIONS = [
  { value: 'generation-i', label: 'Gen I (Kanto)' },
  { value: 'generation-ii', label: 'Gen II (Johto)' },
  { value: 'generation-iii', label: 'Gen III (Hoenn)' },
  { value: 'generation-iv', label: 'Gen IV (Sinnoh)' },
  { value: 'generation-v', label: 'Gen V (Unova)' },
  { value: 'generation-vi', label: 'Gen VI (Kalos)' },
  { value: 'generation-vii', label: 'Gen VII (Alola)' },
  { value: 'generation-viii', label: 'Gen VIII (Galar)' },
  { value: 'generation-ix', label: 'Gen IX (Paldea)' }
];

export const PokedexViewer: React.FC<PokedexViewerProps> = ({
  onAddToTeam,
  onViewDetails
}) => {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'hp' | 'attack' | 'defense' | 'speed'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Team management states
  const [teams, setTeams] = useState<PokemonTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<PokemonTeam | null>(null);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  
  const itemsPerPage = 20;

  // Load initial Pokemon data
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true);
        const allPokemon = await pokeApiService.getAllPokemon(151); // Start with Gen 1
        setPokemon(allPokemon);
      } catch (error) {
        console.error('Error loading Pokemon:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, []);

  // Load teams on component mount
  useEffect(() => {
    const loadedTeams = TeamStorageService.getTeams();
    setTeams(loadedTeams);
    if (loadedTeams.length > 0 && !selectedTeam) {
      setSelectedTeam(loadedTeams[0]);
    }
  }, []);

  // Function to add Pokemon to selected team
  const addPokemonToTeam = async (pokemon: Pokemon) => {
    if (!selectedTeam) {
      alert('Por favor, selecione um time primeiro!');
      return;
    }
    
    try {
      // Get basic moves for the Pokemon
      const basicMoves = ['tackle', 'quick-attack'];
      
      // Add type-specific move based on primary type
      const primaryType = pokemon.types[0]?.type.name;
      if (primaryType) {
        const typeMove = getTypeSpecificMove(primaryType);
        if (typeMove) {
          basicMoves.push(typeMove);
        }
      }
      
      // Add a fourth move
      basicMoves.push('body-slam');
      
      const teamPokemon: TeamPokemon = {
        pokemon,
        nickname: pokemon.name,
        level: 50,
        moves: basicMoves
      };
      
      const updatedTeam = TeamStorageService.addPokemonToTeam(selectedTeam, teamPokemon);
      setSelectedTeam(updatedTeam);
      
      const updatedTeams = TeamStorageService.getTeams();
      setTeams(updatedTeams);
      
      alert(`${pokemon.name} foi adicionado ao time ${selectedTeam.name}!`);
    } catch (error) {
      console.error('Error adding Pokémon to team:', error);
      alert(error instanceof Error ? error.message : 'Falha ao adicionar Pokémon ao time');
    }
  };

  // Helper function to get type-specific moves
  const getTypeSpecificMove = (type: string): string | null => {
    const typeMoves: Record<string, string> = {
      fire: 'ember',
      water: 'water-gun',
      grass: 'vine-whip',
      electric: 'thunder-shock',
      psychic: 'confusion',
      ice: 'ice-beam',
      dragon: 'dragon-rage',
      dark: 'bite',
      fighting: 'karate-chop',
      poison: 'poison-sting',
      ground: 'mud-slap',
      flying: 'gust',
      bug: 'bug-bite',
      rock: 'rock-throw',
      ghost: 'lick',
      steel: 'metal-claw',
      fairy: 'fairy-wind'
    };
    
    return typeMoves[type] || null;
  };

  // Function to create a new team
  const createNewTeam = () => {
    const teamName = prompt('Digite o nome do novo time:');
    if (teamName && teamName.trim()) {
      const newTeam = TeamStorageService.createTeam(teamName.trim());
      TeamStorageService.saveTeam(newTeam);
      const updatedTeams = TeamStorageService.getTeams();
      setTeams(updatedTeams);
      setSelectedTeam(newTeam);
    }
  };

  // Search and filter logic
  const filteredPokemon = useMemo(() => {
    let filtered = [...pokemon];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.id.toString().includes(query)
      );
    }

    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p =>
        p.types.some(type => selectedTypes.includes(type.type.name))
      );
    }

    // Apply generation filter (simplified - would need more complex logic for actual generations)
    if (selectedGeneration && selectedGeneration !== 'all') {
      // For demo, we'll filter by ID ranges
      const genRanges: Record<string, [number, number]> = {
        'generation-i': [1, 151],
        'generation-ii': [152, 251],
        'generation-iii': [252, 386],
        'generation-iv': [387, 493],
        'generation-v': [494, 649],
        'generation-vi': [650, 721],
        'generation-vii': [722, 809],
        'generation-viii': [810, 905],
        'generation-ix': [906, 1010]
      };
      
      const [min, max] = genRanges[selectedGeneration] || [1, 1010];
      filtered = filtered.filter(p => p.id >= min && p.id <= max);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          aValue = pokeApiService.getStatByName(a, sortBy);
          bValue = pokeApiService.getStatByName(b, sortBy);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [pokemon, searchQuery, selectedTypes, selectedGeneration, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
  const paginatedPokemon = filteredPokemon.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setCurrentPage(1);
  };

  const handleRandomPokemon = async () => {
    try {
      setLoading(true);
      const randomPokemon = await pokeApiService.getRandomPokemon(20);
      setPokemon(randomPokemon);
      setSearchQuery('');
      setSelectedTypes([]);
      setSelectedGeneration('');
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading random Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedGeneration('all');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Pokédex...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Pokédex
        </h1>
        <p className="text-muted-foreground">
          Discover and explore the world of Pokémon
        </p>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search Pokémon by name or ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* Team Selector */}
              <Select
                value={selectedTeam?.id || ''}
                onValueChange={(value) => {
                  const team = teams.find(t => t.id === value);
                  setSelectedTeam(team || null);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Selecionar Time" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} ({team.pokemon.length}/6)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={createNewTeam}
                title="Criar Novo Time"
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRandomPokemon}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Random
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="border-t space-y-4">
                {/* Type Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Types</label>
                  <div className="flex flex-wrap gap-2">
                    {POKEMON_TYPES.map((type, index) => (
                      <Badge
                        key={`filter-${type}-${index}`}
                        variant={selectedTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        style={{
                          backgroundColor: selectedTypes.includes(type) 
                            ? pokeApiService.getTypeColor(type) 
                            : undefined,
                          color: selectedTypes.includes(type) ? 'white' : undefined
                        }}
                        onClick={() => handleTypeToggle(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Generation Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Generation</label>
                    <Select value={selectedGeneration} onValueChange={setSelectedGeneration}>
                      <SelectTrigger>
                        <SelectValue placeholder="All generations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All generations</SelectItem>
                        {GENERATIONS.map((gen) => (
                          <SelectItem key={gen.value} value={gen.value}>
                            {gen.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort by</label>
                    <Select value={sortBy} onValueChange={(value: 'id' | 'name' | 'hp' | 'attack' | 'defense' | 'speed') => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">ID</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="hp">HP</SelectItem>
                        <SelectItem value="attack">Attack</SelectItem>
                        <SelectItem value="defense">Defense</SelectItem>
                        <SelectItem value="speed">Speed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Order</label>
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    {filteredPokemon.length} Pokémon found
                  </p>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Pokemon Grid */}
      <motion.div
        className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
            : 'grid-cols-1 md:grid-cols-2'
        }`}
        layout
      >
        <AnimatePresence mode="popLayout">
          {paginatedPokemon.map((pokemon) => (
            <motion.div
              key={pokemon.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <PokemonCard
                pokemon={pokemon}
                onAddToTeam={addPokemonToTeam}
                onViewDetails={onViewDetails}
                showAddButton={true}
                className={viewMode === 'list' ? 'h-full' : ''}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};