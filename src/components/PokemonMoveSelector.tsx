'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Zap, Shield, Heart, Info } from 'lucide-react';
import { Pokemon, TeamPokemonMove, MoveDetails } from '@/types/pokemon';
import { pokeApiService } from '@/services/pokeapi';
import { useLanguage } from '@/contexts/LanguageContext';

interface PokemonMoveSelectorProps {
  pokemon: Pokemon;
  currentMoves: TeamPokemonMove[];
  selectedMoves: string[];
  onMovesChange: (moves: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PokemonMoveSelector({
  pokemon,
  currentMoves,
  selectedMoves,
  onMovesChange,
  isOpen,
  onClose
}: PokemonMoveSelectorProps) {
  const { t } = useLanguage();
  const [availableMoves, setAvailableMoves] = useState<TeamPokemonMove[]>([]);
  const [moveDetails, setMoveDetails] = useState<Record<string, MoveDetails>>({});
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<string[]>([]);
  const [tempSelectedMoves, setTempSelectedMoves] = useState<string[]>(selectedMoves);

  useEffect(() => {
    if (isOpen && pokemon) {
      loadPokemonMoves();
    }
  }, [isOpen, pokemon]);

  useEffect(() => {
    setTempSelectedMoves(selectedMoves);
  }, [selectedMoves]);

  const loadPokemonMoves = async () => {
    setLoading(true);
    try {
      const moves = await pokeApiService.getPokemonMoves(pokemon);
      setAvailableMoves(moves);
    } catch (error) {
      console.error('Error loading Pokemon moves:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoveDetails = async (moveName: string) => {
    if (moveDetails[moveName] || loadingDetails.includes(moveName)) return;

    setLoadingDetails(prev => [...prev, moveName]);
    try {
      const details = await pokeApiService.getMoveDetails(moveName);
      setMoveDetails(prev => ({ ...prev, [moveName]: details }));
    } catch (error) {
      console.error(`Error loading details for move ${moveName}:`, error);
    } finally {
      setLoadingDetails(prev => prev.filter(name => name !== moveName));
    }
  };

  const handleMoveToggle = (moveName: string, checked: boolean) => {
    if (checked && tempSelectedMoves.length >= 4) {
      return; // Maximum 4 moves
    }

    const newSelectedMoves = checked
      ? [...tempSelectedMoves, moveName]
      : tempSelectedMoves.filter(name => name !== moveName);

    setTempSelectedMoves(newSelectedMoves);
  };

  const handleSave = () => {
    onMovesChange(tempSelectedMoves);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedMoves(selectedMoves);
    onClose();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-200',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-green-400',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-800',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300'
    };
    return colors[type] || 'bg-gray-400';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical':
        return <Zap className="w-4 h-4" />;
      case 'special':
        return <Heart className="w-4 h-4" />;
      case 'status':
        return <Shield className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{t('select_moves_for')} {pokemon.name}</span>
            <Badge variant="outline">
              {tempSelectedMoves.length}/4 {t('selected')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">{t('loading_moves')}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid gap-2">
                {availableMoves.map((move) => {
                  const isSelected = tempSelectedMoves.includes(move.name);
                  const details = moveDetails[move.name];
                  const isLoadingDetails = loadingDetails.includes(move.name);

                  return (
                    <motion.div
                      key={move.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`
                        border rounded-lg p-3 cursor-pointer transition-all
                        ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
                        hover:border-blue-300 dark:hover:border-blue-600
                      `}
                      onClick={() => {
                        if (!details && !isLoadingDetails) {
                          loadMoveDetails(move.name);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleMoveToggle(move.name, checked as boolean)
                          }
                          disabled={!isSelected && tempSelectedMoves.length >= 4}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium capitalize">
                              {move.name.replace('-', ' ')}
                            </h4>
                            {isLoadingDetails && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                          </div>

                          {details && (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  className={`${getTypeColor(details.type.name)} text-white`}
                                >
                                  {details.type.name}
                                </Badge>
                                <Badge variant="outline" className="flex items-center space-x-1">
                                  {getCategoryIcon(details.damage_class.name)}
                                  <span>{details.damage_class.name}</span>
                                </Badge>
                                {details.power && (
                                  <Badge variant="secondary">
                                    {t('power')}: {details.power}
                                  </Badge>
                                )}
                                {details.accuracy && (
                                  <Badge variant="secondary">
                                    {t('accuracy')}: {details.accuracy}%
                                  </Badge>
                                )}
                                <Badge variant="secondary">
                                  PP: {details.pp}
                                </Badge>
                              </div>
                              
                              {details.effect_entries.length > 0 && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {details.effect_entries.find(entry => entry.language.name === 'en')?.short_effect || 
                                   details.effect_entries[0]?.short_effect}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('click_move_details')}
              </p>
              <div className="space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave}>
                  {t('save_moves')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}