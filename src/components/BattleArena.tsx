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
  Pokemon
} from '@/types/pokemon';
import { BattleEngine, AI_TRAINERS } from '@/utils/battleEngine';
import { TeamStorageService } from '@/utils/teamStorage';
import { pokeApiService } from '@/services/pokeapi';

interface BattleArenaProps {
  className?: string;
}

export function BattleArena({ className }: BattleArenaProps) {
  const [battleEngine] = useState(() => new BattleEngine());
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<PokemonTeam | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<AITrainer | null>(null);
  const [playerTeams, setPlayerTeams] = useState<PokemonTeam[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
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
    setShowBattleSetup(false);

    try {
      // Load opponent Pokémon data
      const opponentTeamWithData = await Promise.all(
        selectedTrainer.team.map(async (aiPokemon) => {
          try {
            const pokemon = await pokeApiService.getPokemon(aiPokemon.name);
            return {
              pokemon,
              nickname: pokemon.name,
              level: aiPokemon.level
            };
          } catch (error) {
            console.error(`Failed to load ${aiPokemon.name}:`, error);
            // Return a fallback Pokémon
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
                moves: []
              } as unknown as Pokemon,
              nickname: aiPokemon.name,
              level: aiPokemon.level
            };
          }
        })
      );

      const initialState = battleEngine.initializeBattle(selectedTeam.pokemon, opponentTeamWithData);
      setBattleState(initialState);
      setBattleLog(battleEngine.getBattleLog());
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

  const getMoveTypeColor = (type: string): string => {
    return pokeApiService.getTypeColor(type);
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
          <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-sm">{pokemon.nickname}</span>
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
          Battle Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Your Team</label>
          <Select value={selectedTeam?.id || ''} onValueChange={(value) => {
            const team = playerTeams.find(t => t.id === value);
            setSelectedTeam(team || null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a team" />
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
          <label className="block text-sm font-medium mb-2">Select Opponent</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_TRAINERS.map((trainer) => (
              <motion.div
                key={trainer.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTrainer?.id === trainer.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTrainer(trainer)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{trainer.name}</h3>
                  <Badge variant={
                    trainer.difficulty === 'easy' ? 'secondary' :
                    trainer.difficulty === 'medium' ? 'default' :
                    trainer.difficulty === 'hard' ? 'destructive' : 'default'
                  }>
                    {trainer.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{trainer.description}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Team:</span>
                  {trainer.team.slice(0, 3).map((pokemon, index) => (
                    <Badge key={`${trainer.id}-${pokemon.name}-${index}`} variant="outline" className="text-xs">
                      {pokemon.name}
                    </Badge>
                  ))}
                  {trainer.team.length > 3 && (
                    <span className="text-xs text-gray-500">+{trainer.team.length - 3} more</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Start Battle Button */}
        <Button
          onClick={startBattle}
          disabled={!selectedTeam || !selectedTrainer || selectedTeam.pokemon.length === 0}
          className="w-full"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Battle
        </Button>

        {(!selectedTeam || selectedTeam.pokemon.length === 0) && (
          <p className="text-sm text-red-500 text-center">
            Please create a team with at least one Pokémon in the Team Builder first.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderBattleInterface = () => {
    if (!battleState) return null;

    const playerPokemon = battleState.currentPlayerPokemon;
    const opponentPokemon = battleState.currentOpponentPokemon;

    return (
      <div className="space-y-6">
        {/* Battle Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Battle Arena</h1>
            <Badge variant="outline">Turn {battleState.turn}</Badge>
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
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            <h3 className="font-medium">{opponentPokemon.nickname}</h3>
                            <p className="text-sm text-gray-500">Lv. {opponentPokemon.level}</p>
                          </div>
                          <div className="flex gap-1">
                            {opponentPokemon.pokemon.types.map((type) => (
                              <Badge
                                key={`opponent-${type.type.name}`}
                                className={`${getMoveTypeColor(type.type.name)} text-white text-xs`}
                              >
                                {type.type.name}
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
                            className="h-2"
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
                                className={`${getMoveTypeColor(type.type.name)} text-white text-xs`}
                              >
                                {type.type.name}
                              </Badge>
                            ))}
                          </div>
                          <div>
                            <h3 className="font-medium">{playerPokemon.nickname}</h3>
                            <p className="text-sm text-gray-500">Lv. {playerPokemon.level}</p>
                          </div>
                        </div>
                        <div className="w-48">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>HP</span>
                            <span>{playerPokemon.currentHp}/{playerPokemon.maxHp}</span>
                          </div>
                          <Progress
                            value={getHpPercentage(playerPokemon)}
                            className="h-2"
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
                  <CardTitle className="text-lg">Choose Your Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Attack Moves */}
                    {playerPokemon && playerPokemon.moves.filter(m => m.pp > 0).map((move, index) => (
                      <Button
                        key={`player-move-${move.name}-${index}`}
                        variant="outline"
                        className="h-auto p-4 text-left"
                        disabled={isAnimating}
                        onClick={() => executeAction({ type: 'attack', moveIndex: move.name })}
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{move.name}</span>
                            <Badge className={`${getMoveTypeColor(move.type)} text-white text-xs`}>
                              {move.type}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Power: {move.power || '—'}</span>
                            <span>PP: {move.pp}/{move.maxPp}</span>
                          </div>
                        </div>
                      </Button>
                    ))}

                    {/* Switch Pokémon */}
                    {battleState.playerTeam.filter(p => !p.fainted && p !== playerPokemon).length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" className="h-auto p-4" disabled={isAnimating}>
                            <div className="w-full text-center">
                              <RotateCcw className="w-5 h-5 mx-auto mb-1" />
                              <span>Switch Pokémon</span>
                            </div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Choose Pokémon to Switch</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4">
                            {battleState.playerTeam
                              .map((pokemon, index) => ({ pokemon, index }))
                              .filter(({ pokemon }) => pokemon !== playerPokemon && !pokemon.fainted)
                              .map(({ pokemon, index }) => (
                                <Button
                                  key={`switch-${pokemon.pokemon.id}-${index}`}
                                  variant="outline"
                                  className="h-auto p-4"
                                  onClick={() => executeAction({ type: 'switch', pokemonIndex: index })}
                                >
                                  <div className="text-center">
                                    <div className="font-medium">{pokemon.nickname}</div>
                                    <div className="text-sm text-gray-500">
                                      HP: {pokemon.currentHp}/{pokemon.maxHp}
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
                      {battleState.winner === 'player' ? 'Victory!' : 'Defeat!'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {battleState.winner === 'player' 
                        ? 'Congratulations! You won the battle!' 
                        : 'Better luck next time!'}
                    </p>
                    <Button onClick={resetBattle}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Battle Again
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
                <CardTitle className="text-lg">Battle Log</CardTitle>
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
                          entry.type === 'battle-start' ? 'bg-blue-100' :
                          entry.type === 'battle-end' ? 'bg-purple-100' :
                          entry.type === 'super-effective' ? 'bg-green-100' :
                          entry.type === 'not-very-effective' ? 'bg-yellow-100' :
                          entry.type === 'pokemon-fainted' ? 'bg-red-100' :
                          'bg-gray-50'
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