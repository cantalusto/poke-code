'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Zap, Shield, Sword } from 'lucide-react';
import { Pokemon, MoveDetails, TeamPokemonMove } from '@/types/pokemon';
import { pokeApiService } from '@/services/pokeapi';
import { useLanguage } from '@/contexts/LanguageContext';

interface PokemonMoveSelectorProps {
  pokemon: Pokemon;
  selectedMoves: string[];
  onMovesChange: (moves: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PokemonMoveSelector({
  pokemon,
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

  const loadPokemonMoves = useCallback(async () => {
    setLoading(true);
    try {
      const moves = await pokeApiService.getPokemonMoves(pokemon);
      setAvailableMoves(moves);
    } catch (error) {
      console.error('Error loading Pokemon moves:', error);
    } finally {
      setLoading(false);
    }
  }, [pokemon]);

  useEffect(() => {
    if (isOpen && pokemon) {
      loadPokemonMoves();
    }
  }, [isOpen, pokemon, loadPokemonMoves]);

  useEffect(() => {
    setTempSelectedMoves(selectedMoves);
  }, [selectedMoves]);

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
        return <Sword className="w-4 h-4" />;
      case 'special':
        return <Zap className="w-4 h-4" />;
      case 'status':
        return <Shield className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-sm sm:text-base">
            <span>{t('select_moves_for')} {pokemon.name}</span>
            <Badge variant="outline" className="self-start sm:self-auto">
              {tempSelectedMoves.length}/4 {t('selected')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
            <span className="ml-2 text-sm sm:text-base">{t('loading_moves')}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <ScrollArea className="h-64 sm:h-80 md:h-96">
              <div className="grid gap-2 pr-2">
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
                        border rounded-lg p-2 sm:p-3 cursor-pointer transition-all
                        ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
                        hover:border-blue-300 dark:hover:border-blue-600
                      `}
                      onClick={() => {
                        if (!details && !isLoadingDetails) {
                          loadMoveDetails(move.name);
                        }
                      }}
                    >
                      <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                        <div className="mt-1 sm:mt-0">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleMoveToggle(move.name, checked as boolean)
                            }
                            disabled={!isSelected && tempSelectedMoves.length >= 4}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium capitalize text-sm sm:text-base truncate">
                              {move.name.replace('-', ' ')}
                            </h4>
                            {isLoadingDetails && (
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                            )}
                          </div>

                          {details && (
                            <div className="mt-2 space-y-2">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                <Badge 
                                  className={`${getTypeColor(details.type.name)} text-white text-xs`}
                                >
                                  {details.type.name}
                                </Badge>
                                <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                                  {getCategoryIcon(details.damage_class.name)}
                                  <span className="hidden sm:inline">{details.damage_class.name}</span>
                                </Badge>
                                {details.power && (
                                  <Badge variant="secondary" className="text-xs">
                                    {t('power')}: {details.power}
                                  </Badge>
                                )}
                                {details.accuracy && (
                                  <Badge variant="secondary" className="text-xs">
                                    {t('accuracy')}: {details.accuracy}%
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  PP: {details.pp}
                                </Badge>
                              </div>
                              
                              {details.effect_entries.length > 0 && (
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
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

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t space-y-2 sm:space-y-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
                {t('click_move_details')}
              </p>
              <div className="flex space-x-2 justify-center sm:justify-end">
                <Button variant="outline" onClick={handleCancel} size="sm" className="flex-1 sm:flex-none">
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave} size="sm" className="flex-1 sm:flex-none">
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