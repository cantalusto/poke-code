'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Swords, 
  Zap, 
  RotateCcw, 
  Play, 
  Volume2,
  VolumeX,
  Trophy,
  Skull
} from 'lucide-react';
import { 
  BattleState, 
  BattleAction, 
  BattleLogEntry, 
  AITrainer, 
  PokemonTeam, 
  BattlePokemon,
  Pokemon,
  TeamPokemon
} from '@/types/pokemon';
import { BattleEngine, AI_TRAINERS } from '@/utils/battleEngine';
import { TeamStorageService } from '@/utils/teamStorage';
import { pokeApiService } from '@/services/pokeapi';
import { useLanguage } from '../contexts/LanguageContext';

interface BattleArenaProps {
  className?: string;
}

export function BattleArena({ className }: BattleArenaProps) {
  const { t } = useLanguage();
  const [battleEngine] = useState(() => new BattleEngine());
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<PokemonTeam | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<AITrainer | null>(null);
  const [playerTeams, setPlayerTeams] = useState<PokemonTeam[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showOpponentTeam, setShowOpponentTeam] = useState(false);
  const [viewingTrainer, setViewingTrainer] = useState<AITrainer | null>(null);
  const [showBattleSetup, setShowBattleSetup] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  // Load player teams on component mount
  useEffect(() => {
    const teams = TeamStorageService.getTeams().filter(team => team.pokemon.length > 0);
    setPlayerTeams(teams);
    if (teams.length > 0) {
      setSelectedTeam(teams[0]);
    }
  }, []);

  // Auto-scroll battle log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  const startBattle = async () => {
    if (!selectedTeam || !selectedTrainer) return;

    setIsAnimating(true);
    // Don't hide battle setup until we have the battle state ready

    try {
      // Load opponent Pokémon data
      const opponentTeamWithData = await Promise.all(
        selectedTrainer.team.map(async (aiPokemon) => {
          try {
            const pokemon = await pokeApiService.getPokemon(aiPokemon.name);
            return {
              pokemon,
              nickname: pokemon.name,
              level: aiPokemon.level,
              moves: [
                { name: 'tackle' },
                { name: 'quick-attack' },
                { name: 'body-slam' },
                { name: 'double-edge' }
              ]
            };
          } catch (error) {
            console.error(`Failed to load ${aiPokemon.name}:`, error);
            // Return a fallback Pokémon with basic moves
            return {
              pokemon: {
                id: 1,
                name: aiPokemon.name,
                height: 10,
                weight: 100,
                base_experience: 100,
                species: { name: aiPokemon.name, url: '' },
                types: [{ type: { name: 'normal' } }],
                stats: [
                  { stat: { name: 'hp' }, base_stat: 100 },
                  { stat: { name: 'attack' }, base_stat: 50 },
                  { stat: { name: 'defense' }, base_stat: 50 },
                  { stat: { name: 'special-attack' }, base_stat: 50 },
                  { stat: { name: 'special-defense' }, base_stat: 50 },
                  { stat: { name: 'speed' }, base_stat: 50 }
                ],
                sprites: { front_default: null, back_default: null },
                abilities: [],
                moves: [
                  { move: { name: 'tackle', url: '' } },
                  { move: { name: 'quick-attack', url: '' } },
                  { move: { name: 'body-slam', url: '' } },
                  { move: { name: 'double-edge', url: '' } }
                ]
              } as unknown as Pokemon,
              nickname: aiPokemon.name,
              level: aiPokemon.level,
              moves: [
                { name: 'tackle' },
                { name: 'quick-attack' },
                { name: 'body-slam' },
                { name: 'double-edge' }
              ]
            };
          }
        })
      );

      // Ensure all team pokemon have moves property
      const teamWithMoves: TeamPokemon[] = selectedTeam.pokemon.map(teamPokemon => ({
        ...teamPokemon,
        moves: teamPokemon.moves || [
          { name: 'tackle' },
          { name: 'quick-attack' },
          { name: 'body-slam' },
          { name: 'double-edge' }
        ]
      }));

      const initialState = battleEngine.initializeBattle(teamWithMoves, opponentTeamWithData);
      setBattleState(initialState);
      setBattleLog(battleEngine.getBattleLog());
      
      // Only hide battle setup after everything is loaded and ready
      setShowBattleSetup(false);
    } catch (error) {
      console.error('Failed to start battle:', error);
    } finally {
      setIsAnimating(false);
    }
  };

  const executeAction = (action: BattleAction) => {
    if (!battleState || isAnimating) return;

    setIsAnimating(true);

    setTimeout(() => {
      const newState = battleEngine.processTurn(action);
      setBattleState(newState);
      setBattleLog(battleEngine.getBattleLog());
      setIsAnimating(false);
    }, 1000);
  };

  const resetBattle = () => {
    battleEngine.reset();
    setBattleState(null);
    setBattleLog([]);
    setShowBattleSetup(true);
  };

  const getHpPercentage = (pokemon: BattlePokemon): number => {
    return (pokemon.currentHp / pokemon.maxHp) * 100;
  };



  const renderPokemonSprite = (pokemon: BattlePokemon, isPlayer: boolean) => {
    const spriteUrl = isPlayer 
      ? pokemon.pokemon.sprites.back_default 
      : pokemon.pokemon.sprites.front_default;

    return (
      <motion.div
        key={`${pokemon.pokemon.id}-${isPlayer ? 'player' : 'opponent'}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: pokemon.fainted ? 0.5 : 1, 
          opacity: pokemon.fainted ? 0.3 : 1,
          y: isAnimating ? (isPlayer ? 10 : -10) : 0
        }}
        transition={{ duration: 0.5 }}
        className={`relative ${pokemon.fainted ? 'grayscale' : ''}`}
      >
        {spriteUrl ? (
          <Image
            src={spriteUrl!}
            alt={pokemon.nickname || pokemon.pokemon.name}
            width={128}
            height={128}
            className="w-32 h-32 object-contain"
          />
        ) : (
          <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground text-sm">{pokemon.nickname || pokemon.pokemon.name}</span>
          </div>
        )}
        
        {pokemon.fainted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Skull className="w-8 h-8 text-red-500" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderBattleSetup = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="w-6 h-6 text-red-500" />
          {t('battle_setup')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('select_your_team')}</label>
          <Select value={selectedTeam?.id || ''} onValueChange={(value) => {
            const team = playerTeams.find(t => t.id === value);
            setSelectedTeam(team || null);
          }}>
            <SelectTrigger>
                <SelectValue placeholder={t('choose_a_team')} />
              </SelectTrigger>
            <SelectContent>
              {playerTeams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name} ({team.pokemon.length}/6 Pokémon)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trainer Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('select_opponent')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {AI_TRAINERS.map((trainer) => (
              <motion.div
                key={trainer.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTrainer?.id === trainer.id
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-400'
                    : 'border-border hover:bg-muted'
                }`}
                onClick={() => setSelectedTrainer(trainer)}
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Trainer Avatar */}
                  {trainer.avatar && (
                    <div className="flex-shrink-0">
                      <Image 
                        src={trainer.avatar} 
                        alt={t(trainer.name)}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain rounded-lg border border-border"
                        onError={(e) => {
                          // Hide image if it fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Trainer Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{t(trainer.name)}</h3>
                      <Badge 
                        variant={
                          trainer.difficulty === 'easy' ? 'secondary' :
                          trainer.difficulty === 'medium' ? 'default' :
                          trainer.difficulty === 'hard' ? 'destructive' :
                          trainer.difficulty === 'legendary' ? 'destructive' : 'default'
                        }
                        className={
                          trainer.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800' :
                          trainer.difficulty === 'hard' ? 'bg-red-900 text-red-100 hover:bg-red-800' :
                          ''
                        }
                      >
                        {t(trainer.difficulty)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{t(trainer.description || '')}</p>
                    <Button variant="outline" size="sm" className="hover:bg-muted hover:text-foreground transition-colors" onClick={(e) => {
                      e.stopPropagation();
                      setViewingTrainer(trainer);
                      setShowOpponentTeam(true);
                    }}>
                       {t('view_team')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Opponent Team Modal */}
        <Dialog open={showOpponentTeam} onOpenChange={setShowOpponentTeam}>
          <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base">{t('team_of')} {t(viewingTrainer?.name || '')}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4">
              {viewingTrainer?.team?.map((pokemon, index) => {
                // Função para obter o ID do Pokémon baseado no nome
                const getPokemonId = (name: string): string => {
                  const pokemonIds: Record<string, string> = {
                  'pikachu': '25',
                  'charizard': '6',
                  'venusaur': '3',
                  'blastoise': '9',
                  'lapras': '131',
                  'snorlax': '143',
                  'dragonite': '149',
                  'aerodactyl': '142',
                  'gyarados': '130',
                  'geodude': '74',
                  'onix': '95',
                  'pidgeot': '18',
                  'rhydon': '112',
                  'arcanine': '59',
                  'tyranitar': '248'
                };
                  return pokemonIds[name] || '1'; // Fallback para Bulbasaur se não encontrar
                };

                const pokemonId = getPokemonId(pokemon.name);
                const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

                return (
                   <div key={`${viewingTrainer?.id}-team-${pokemon.name}-${index}`} className="border rounded-lg p-3 text-center">
                    <div className="mb-2">
                      <Image
                        src={imageUrl}
                        alt={pokemon.name}
                        width={96}
                        height={96}
                        className="mx-auto"
                        onError={(e) => {
                          // Fallback para uma imagem genérica se falhar
                          const target = e.target as HTMLImageElement;
                          target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png`;
                        }}
                      />
                    </div>
                    <h4 className="font-medium capitalize">{pokemon.name.replace('-', ' ')}</h4>
                    <p className="text-sm text-gray-500">{t('level')} {pokemon.level}</p>
                  </div>
                );
              }) || []}
            </div>
          </DialogContent>
        </Dialog>

        {/* Start Battle Button */}
        <Button
          onClick={startBattle}
          disabled={!selectedTeam || !selectedTrainer || selectedTeam.pokemon.length === 0}
          className="w-full"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          {t('start_battle')}
        </Button>

        {(!selectedTeam || selectedTeam.pokemon.length === 0) && (
          <p className="text-sm text-red-500 text-center">
            {t('create_team_first')}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderBattleInterface = () => {
    if (!battleState) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading_battle')}</p>
          </div>
        </div>
      );
    }

    const playerPokemon = battleState.currentPlayerPokemon;
    const opponentPokemon = battleState.currentOpponentPokemon;

    return (
      <div className="space-y-6">
        {/* Battle Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Battle Arena</h1>
            <Badge variant="outline">{t('turn')} {battleState.turn}</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={resetBattle}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('reset')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Battle Field */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Opponent Pokémon */}
                <div className="flex justify-end mb-4">
                  <div className="text-right">
                    {opponentPokemon && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <div>
                            <h3 className="font-medium">{opponentPokemon.nickname || opponentPokemon.pokemon.name}</h3>
                            <p className="text-sm text-gray-500">Lv. {opponentPokemon.level}</p>
                          </div>
                          <div className="flex gap-1">
                            {opponentPokemon.pokemon.types.map((type) => (
                  <Badge
                    key={`opponent-${type.type.name}`}
                    className="text-white text-xs border-0"
                    style={{
                      backgroundColor: pokeApiService.getTypeColor(type.type.name),
                    }}
                  >
                    {t(type.type.name)}
                  </Badge>
                ))}
                          </div>
                        </div>
                        <div className="w-48">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>HP</span>
                            <span>{opponentPokemon.currentHp}/{opponentPokemon.maxHp}</span>
                          </div>
                          <Progress
                            value={getHpPercentage(opponentPokemon)}
                            className="h-2 bg-gray-200 [&>div]:bg-green-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Battle Field */}
                <div className="relative h-64 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg mb-4 overflow-hidden">
                  {/* Background elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-green-200/20"></div>
                  
                  {/* Opponent Pokémon */}
                  <div className="absolute top-4 right-8">
                    {opponentPokemon && renderPokemonSprite(opponentPokemon, false)}
                  </div>

                  {/* Player Pokémon */}
                  <div className="absolute bottom-4 left-8">
                    {playerPokemon && renderPokemonSprite(playerPokemon, true)}
                  </div>

                  {/* Battle Effects */}
                  <AnimatePresence>
                    {isAnimating && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Player Pokémon Info */}
                <div className="flex justify-start">
                  <div className="text-left">
                    {playerPokemon && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {playerPokemon.pokemon.types.map((type) => (
                  <Badge
                    key={`player-${type.type.name}`}
                    className="text-white text-xs border-0"
                    style={{
                      backgroundColor: pokeApiService.getTypeColor(type.type.name),
                    }}
                  >
                    {t(type.type.name)}
                  </Badge>
                ))}
                          </div>
                          <div>
                            <h3 className="font-medium">{playerPokemon.nickname || playerPokemon.pokemon.name}</h3>
                            <p className="text-sm text-muted-foreground">Lv. {playerPokemon.level}</p>
                          </div>
                        </div>
                        <div className="w-48">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>HP</span>
                            <span>{playerPokemon.currentHp}/{playerPokemon.maxHp}</span>
                          </div>
                          <Progress
                            value={getHpPercentage(playerPokemon)}
                            className="h-2 bg-muted [&>div]:bg-green-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Battle Actions */}
            {battleState.phase === 'battle' && !battleState.winner && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">{t('choose_your_action')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Attack Moves */}
                    {playerPokemon && playerPokemon.moves.filter(m => m.pp > 0).map((move, index) => (
                      <Button
                        key={`player-move-${move.name}-${index}`}
                        variant="outline"
                        className="h-auto p-4 text-left hover:bg-black hover:text-white hover:border-black transition-colors duration-200"
                        disabled={isAnimating}
                        onClick={() => executeAction({ type: 'attack', moveIndex: move.name })}
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{move.name}</span>
                            <Badge className="text-white text-xs border-0" style={{
                              backgroundColor: pokeApiService.getTypeColor(move.type),
                            }}>
                              {move.type}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm hover:text-white">
                            <span>{t('power')}: {move.power || '—'}</span>
                            <span>{t('pp')}: {move.pp}/{move.maxPp}</span>
                          </div>
                        </div>
                      </Button>
                    ))}

                    {/* Switch Pokémon */}
                    {battleState.playerTeam.filter(p => !p.fainted && p !== playerPokemon).length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" className="h-auto p-4 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700" disabled={isAnimating}>
                            <div className="w-full text-center">
                              <RotateCcw className="w-5 h-5 mx-auto mb-1" />
                              <span>{t('switch_pokemon')}</span>
                            </div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t('choose_pokemon_to_switch')}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {battleState.playerTeam
                              .map((pokemon, index) => ({ pokemon, index }))
                              .filter(({ pokemon }) => pokemon !== playerPokemon && !pokemon.fainted)
                              .map(({ pokemon, index }) => (
                                <Button
                                  key={`switch-${pokemon.pokemon.id}-${index}`}
                                  variant="outline"
                                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted hover:text-foreground transition-colors"
                                  onClick={() => executeAction({ type: 'switch', pokemonIndex: index })}
                                >
                                  <div className="w-16 h-16 relative">
                                    <Image
                                      src={pokemon.pokemon.sprites.front_default || '/placeholder-pokemon.png'}
                                      alt={pokemon.nickname || pokemon.pokemon.name}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="text-center">
                                    <div className="font-medium">{pokemon.nickname || pokemon.pokemon.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {t('hp')}: {pokemon.currentHp}/{pokemon.maxHp}
                                    </div>
                                  </div>
                                </Button>
                              ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Battle End */}
            {battleState.winner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card className={`border-2 ${battleState.winner === 'player' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <CardContent className="text-center py-8">
                    <div className="mb-4">
                      {battleState.winner === 'player' ? (
                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                      ) : (
                        <Skull className="w-16 h-16 text-red-500 mx-auto" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      {battleState.winner === 'player' ? t('victory') : t('defeat')}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {battleState.winner === 'player' 
                        ? t('congratulations_won')
                        : t('better_luck_next_time')}
                    </p>
                    <Button onClick={resetBattle}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t('battle_again')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Battle Log */}
          <div className="lg:col-span-1">
            <Card className="h-96">
              <CardHeader>
                <CardTitle className="text-lg">{t('battle_log')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={logRef}
                  className="h-64 overflow-y-auto space-y-2 text-sm"
                >
                  <AnimatePresence>
                    {battleLog.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-2 rounded ${
                          entry.type === 'battle-start' ? 'bg-blue-100/50 dark:bg-blue-900/20' :
                          entry.type === 'battle-end' ? 'bg-purple-100/50 dark:bg-purple-900/20' :
                          entry.type === 'super-effective' ? 'bg-green-100/50 dark:bg-green-900/20' :
                          entry.type === 'not-very-effective' ? 'bg-yellow-100/50 dark:bg-yellow-900/20' :
                          entry.type === 'pokemon-fainted' ? 'bg-red-100/50 dark:bg-red-900/20' :
                          'bg-muted/50'
                        }`}
                      >
                        {entry.message}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {showBattleSetup ? renderBattleSetup() : renderBattleInterface()}
    </div>
  );
}