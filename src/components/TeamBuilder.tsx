'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Users, 
  BarChart3, 
  Shield, 
  Sword,
  Heart,
  Zap,
  Search,
  X
} from 'lucide-react';
import { Pokemon, PokemonTeam, TeamPokemon, TeamStats } from '@/types/pokemon';
import { TeamStorageService } from '@/utils/teamStorage';
import { pokeApiService } from '@/services/pokeapi';
import { PokemonCard } from './PokemonCard';
import { PokemonMoveSelector } from './PokemonMoveSelector';
import { PokemonLevelSelector } from './PokemonLevelSelector';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface TeamBuilderProps {
  className?: string;
}

export function TeamBuilder({ className }: TeamBuilderProps) {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [teams, setTeams] = useState<PokemonTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<PokemonTeam | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPokemonSelector, setShowPokemonSelector] = useState(false);

  // New state for move and level selectors
  const [showMoveSelector, setShowMoveSelector] = useState(false);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);

  // Load teams on component mount
  useEffect(() => {
    const loadedTeams = TeamStorageService.getTeams();
    setTeams(loadedTeams);
    if (loadedTeams.length > 0 && !selectedTeam) {
      setSelectedTeam(loadedTeams[0]);
    }
  }, [selectedTeam]);

  // Update team stats when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      const stats = TeamStorageService.calculateTeamStats(selectedTeam);
      setTeamStats(stats);
    } else {
      setTeamStats(null);
    }
  }, [selectedTeam]);

  const createNewTeam = () => {
    if (!newTeamName.trim()) return;
    
    const newTeam = TeamStorageService.createTeam(newTeamName.trim());
    TeamStorageService.saveTeam(newTeam);
    
    const updatedTeams = TeamStorageService.getTeams();
    setTeams(updatedTeams);
    setSelectedTeam(newTeam);
    setNewTeamName('');
  };

  const deleteTeam = (teamId: string) => {
    TeamStorageService.deleteTeam(teamId);
    const updatedTeams = TeamStorageService.getTeams();
    setTeams(updatedTeams);
    
    if (selectedTeam?.id === teamId) {
      setSelectedTeam(updatedTeams.length > 0 ? updatedTeams[0] : null);
    }
  };

  const searchPokemon = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await pokeApiService.searchPokemon(searchQuery.trim());
      setSearchResults(results.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error('Error searching Pokémon:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addPokemonToTeam = async (pokemon: Pokemon) => {
    if (!selectedTeam) return;
    
    try {
      // Get available moves for the Pokemon
      const availableMoves = await pokeApiService.getPokemonMoves(pokemon);
      
      // Select first 4 moves as default
      const defaultMoves = availableMoves.slice(0, 4);
      
      const teamPokemon: TeamPokemon = {
        pokemon,
        nickname: pokemon.name,
        level: 50,
        moves: defaultMoves,
        selectedMoves: defaultMoves.map(move => move.name)
      };
      
      const updatedTeam = TeamStorageService.addPokemonToTeam(selectedTeam, teamPokemon);
      setSelectedTeam(updatedTeam);
      
      const updatedTeams = TeamStorageService.getTeams();
      setTeams(updatedTeams);
      
      setShowPokemonSelector(false);
      setSearchQuery('');
      setSearchResults([]);
      
      // Show success toast instead of alert
      addToast({
        type: 'success',
        title: t('pokemon_added'),
        description: `${pokemon.name} ${t('added_to_team')} ${selectedTeam.name}!`
      });
    } catch (error) {
      console.error('Error adding Pokémon to team:', error);
      addToast({
        type: 'error',
        title: t('error'),
        description: error instanceof Error ? error.message : t('failed_add_pokemon_team')
      });
    }
  };

  const handleEditMoves = (pokemonIndex: number) => {
    setSelectedPokemonIndex(pokemonIndex);
    setShowMoveSelector(true);
  };

  const handleEditLevel = (pokemonIndex: number) => {
    setSelectedPokemonIndex(pokemonIndex);
    setShowLevelSelector(true);
  };

  const handleMovesChange = (moves: string[]) => {
    if (!selectedTeam || selectedPokemonIndex === null) return;
    
    const updatedTeam = { ...selectedTeam };
    updatedTeam.pokemon[selectedPokemonIndex].selectedMoves = moves;
    
    TeamStorageService.saveTeam(updatedTeam);
    setSelectedTeam(updatedTeam);
    
    const updatedTeams = TeamStorageService.getTeams();
    setTeams(updatedTeams);
    
    addToast({
      type: 'success',
      title: t('moves_updated'),
      description: t('pokemon_moves_updated_successfully')
    });
  };

  const handleLevelChange = (level: number) => {
    if (!selectedTeam || selectedPokemonIndex === null) return;
    
    const updatedTeam = { ...selectedTeam };
    updatedTeam.pokemon[selectedPokemonIndex].level = level;
    
    TeamStorageService.saveTeam(updatedTeam);
    setSelectedTeam(updatedTeam);
    
    const updatedTeams = TeamStorageService.getTeams();
    setTeams(updatedTeams);
    
    addToast({
      type: 'success',
      title: t('level_updated'),
      description: `${t('pokemon_level_updated_to')} ${level}!`
    });
  };

  const removePokemonFromTeam = (index: number) => {
    if (!selectedTeam) return;
    
    try {
      const updatedTeam = TeamStorageService.removePokemonFromTeam(selectedTeam, index);
      setSelectedTeam(updatedTeam);
      
      const updatedTeams = TeamStorageService.getTeams();
      setTeams(updatedTeams);
    } catch (error) {
      console.error('Error removing Pokémon from team:', error);
    }
  };

  const exportTeam = () => {
    if (!selectedTeam) return;
    
    const teamData = TeamStorageService.exportTeam(selectedTeam);
    const blob = new Blob([teamData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTeam.name.replace(/\s+/g, '_')}_team.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importTeam = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const teamData = e.target?.result as string;
        const importedTeam = TeamStorageService.importTeam(teamData);
        TeamStorageService.saveTeam(importedTeam);
        
        const updatedTeams = TeamStorageService.getTeams();
        setTeams(updatedTeams);
        setSelectedTeam(importedTeam);
      } catch (error) {
        console.error('Error importing team:', error);
        alert(t('failed_import_team'));
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const getStatColor = (statName: string) => {
    const colors: Record<string, string> = {
      hp: 'text-red-500',
      attack: 'text-orange-500',
      defense: 'text-blue-500',
      specialAttack: 'text-purple-500',
      specialDefense: 'text-green-500',
      speed: 'text-yellow-500'
    };
    return colors[statName] || 'text-gray-500';
  };

  const getStatIcon = (statName: string) => {
    const icons: Record<string, React.ReactNode> = {
      hp: <Heart className="w-4 h-4" />,
      attack: <Sword className="w-4 h-4" />,
      defense: <Shield className="w-4 h-4" />,
      specialAttack: <Zap className="w-4 h-4" />,
      specialDefense: <Shield className="w-4 h-4" />,
      speed: <Zap className="w-4 h-4" />
    };
    return icons[statName] || <BarChart3 className="w-4 h-4" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">        
        <div className="flex items-center gap-2">
          <Button onClick={exportTeam} disabled={!selectedTeam} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('export')}
          </Button>
          
          <label>
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {t('import')}
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importTeam}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Team Management */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('teams')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create New Team */}
              <div className="flex gap-2">
                <Input
                  placeholder={t('team_name')}
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createNewTeam()}
                />
                <Button onClick={createNewTeam} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Team List */}
              <div className="space-y-2">
                {teams.map((team) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTeam?.id === team.id
                        ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {team.pokemon.length}/6 {t('pokemon')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTeam(team.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2">
          {selectedTeam ? (
            <Tabs defaultValue="pokemon" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pokemon">{t('pokemon')}</TabsTrigger>
                <TabsTrigger value="stats">{t('stats')}</TabsTrigger>
              </TabsList>

              <TabsContent value="pokemon" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedTeam.name}</CardTitle>
                      <Dialog open={showPokemonSelector} onOpenChange={setShowPokemonSelector}>
                        <DialogTrigger asChild>
                          <Button disabled={selectedTeam.pokemon.length >= 6}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('add_pokemon')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{t('add_pokemon_to_team')}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Input
                                placeholder={t('search_pokemon')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && searchPokemon()}
                              />
                              <Button onClick={searchPokemon} disabled={isSearching}>
                                <Search className="w-4 h-4" />
                              </Button>
                            </div>

                            {isSearching && (
                              <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-2 text-gray-500">{t('searching')}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                              {searchResults.map((pokemon) => (
                                <motion.div
                                  key={`search-${pokemon.id}`}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="cursor-pointer"
                                  onClick={() => addPokemonToTeam(pokemon)}
                                >
                                  <PokemonCard pokemon={pokemon} />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <AnimatePresence>
                        {selectedTeam.pokemon.map((teamPokemon, index) => (
                          <motion.div
                            key={`${teamPokemon.pokemon.id}-${index}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative group"
                          >
                            <PokemonCard pokemon={teamPokemon.pokemon} />
                            
                            {/* Action buttons */}
                            <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="text-xs px-2 py-1 h-auto"
                                onClick={() => handleEditMoves(index)}
                                title={t('edit_moves')}
                              >
                                <Zap className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="text-xs px-2 py-1 h-auto"
                                onClick={() => handleEditLevel(index)}
                                title={t('edit_level')}
                              >
                                <BarChart3 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="text-xs px-2 py-1 h-auto"
                                onClick={() => removePokemonFromTeam(index)}
                                title={t('remove_pokemon')}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            {/* Level and moves info */}
                            <div className="absolute bottom-2 left-2 space-y-1">
                              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                                Lv. {teamPokemon.level}
                              </div>
                              {teamPokemon.selectedMoves && teamPokemon.selectedMoves.length > 0 && (
                                <div className="bg-blue-600/70 text-white px-2 py-1 rounded text-xs">
                                  {teamPokemon.selectedMoves.length}/4 {t('moves')}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Empty slots */}
                      {Array.from({ length: 6 - selectedTeam.pokemon.length }).map((_, index) => (
                        <motion.div
                          key={`empty-slot-${selectedTeam.pokemon.length}-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setShowPokemonSelector(true)}
                        >
                          <Plus className="w-8 h-8 text-muted-foreground" />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                {teamStats && (
                  <div className="grid grid-cols-1 gap-4">
                    {/* Average Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          {t('average_stats')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {Object.entries(teamStats.averageStats).map(([statName, value], index) => {
                          // Map stat names to translation keys
                          const statTranslationMap: { [key: string]: string } = {
                            'hp': 'hp',
                            'attack': 'attack',
                            'defense': 'defense',
                            'specialAttack': 'special_attack',
                            'specialDefense': 'special_defense',
                            'speed': 'speed'
                          };
                          
                          const translationKey = statTranslationMap[statName] || statName;
                          
                          return (
                            <div key={`team-stat-${statName}-${index}`} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={getStatColor(statName)}>
                                  {getStatIcon(statName)}
                                </span>
                                <span className="capitalize">
                                  {t(translationKey)}
                                </span>
                              </div>
                              <span className="font-mono font-medium">{value}</span>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    {/* Type Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('type_distribution')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(teamStats.typeDistribution).map(([type, count], index) => (
                            <Badge
                              key={`type-dist-${type}-${index}`}
                              variant="secondary"
                              className="text-white border-0 font-semibold"
                              style={{
                                backgroundColor: pokeApiService.getTypeColor(type),
                                boxShadow: `0 2px 8px ${pokeApiService.getTypeColor(type)}40`
                              }}
                            >
                              {t(type)} ({count})
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Weaknesses */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-600">{t('team_weaknesses')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {teamStats.weaknesses.length > 0 ? (
                            teamStats.weaknesses.map((weakness, index) => (
                              <Badge
                                key={`weakness-${weakness}-${index}`}
                                variant="destructive"
                                className="text-white border-0 font-semibold"
                                style={{
                                  backgroundColor: pokeApiService.getTypeColor(weakness),
                                  boxShadow: `0 2px 8px ${pokeApiService.getTypeColor(weakness)}40`
                                }}
                              >
                                {t(weakness)}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">{t('no_major_weaknesses')}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Resistances */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600">{t('team_resistances')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {teamStats.resistances.length > 0 ? (
                            teamStats.resistances.map((resistance, index) => (
                              <Badge
                                key={`resistance-${resistance}-${index}`}
                                variant="secondary"
                                className="text-white border-0 font-semibold"
                                style={{
                                  backgroundColor: pokeApiService.getTypeColor(resistance),
                                  boxShadow: `0 2px 8px ${pokeApiService.getTypeColor(resistance)}40`
                                }}
                              >
                                {t(resistance)}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">{t('no_major_resistances')}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_team_selected')}</h3>
                  <p className="text-gray-500">{t('create_or_select_team')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Move Selector Dialog */}
      {selectedPokemonIndex !== null && selectedTeam && (
        <PokemonMoveSelector
          pokemon={selectedTeam.pokemon[selectedPokemonIndex].pokemon}
          currentMoves={selectedTeam.pokemon[selectedPokemonIndex].moves}
          selectedMoves={selectedTeam.pokemon[selectedPokemonIndex].selectedMoves || []}
          onMovesChange={handleMovesChange}
          isOpen={showMoveSelector}
          onClose={() => {
            setShowMoveSelector(false);
            setSelectedPokemonIndex(null);
          }}
        />
      )}

      {/* Level Selector Dialog */}
      {selectedPokemonIndex !== null && selectedTeam && (
        <PokemonLevelSelector
          pokemon={selectedTeam.pokemon[selectedPokemonIndex].pokemon}
          currentLevel={selectedTeam.pokemon[selectedPokemonIndex].level}
          onLevelChange={handleLevelChange}
          isOpen={showLevelSelector}
          onClose={() => {
            setShowLevelSelector(false);
            setSelectedPokemonIndex(null);
          }}
        />
      )}
    </div>
  );
}