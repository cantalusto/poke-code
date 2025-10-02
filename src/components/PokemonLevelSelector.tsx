'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { Pokemon } from '@/types/pokemon';
import { useLanguage } from '@/contexts/LanguageContext';

interface PokemonLevelSelectorProps {
  pokemon: Pokemon;
  currentLevel: number;
  onLevelChange: (level: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PokemonLevelSelector({
  pokemon,
  currentLevel,
  onLevelChange,
  isOpen,
  onClose
}: PokemonLevelSelectorProps) {
  const { t } = useLanguage();
  const [tempLevel, setTempLevel] = useState(currentLevel);

  const handleSave = () => {
    onLevelChange(tempLevel);
    onClose();
  };

  const handleCancel = () => {
    setTempLevel(currentLevel);
    onClose();
  };

  const calculateStatAtLevel = (baseStat: number, level: number) => {
    // Simplified stat calculation (actual formula is more complex)
    return Math.floor(((2 * baseStat * level) / 100) + level + 10);
  };

  const getStatName = (statName: string) => {
    const statNames: Record<string, string> = {
      'hp': 'HP',
      'attack': t('attack'),
      'defense': t('defense'),
      'special-attack': t('sp_attack'),
      'special-defense': t('sp_defense'),
      'speed': t('speed')
    };
    return statNames[statName] || statName;
  };

  const getStatColor = (statName: string) => {
    const colors: Record<string, string> = {
      'hp': 'bg-red-500',
      'attack': 'bg-orange-500',
      'defense': 'bg-blue-500',
      'special-attack': 'bg-purple-500',
      'special-defense': 'bg-green-500',
      'speed': 'bg-yellow-500'
    };
    return colors[statName] || 'bg-gray-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] w-[92vw] sm:max-w-2xl sm:w-full overflow-y-auto">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t('set_level_for')} {pokemon.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-6">
          {/* Level Selector */}
          <div className="space-y-2 sm:space-y-4">
            <Label className="text-sm sm:text-base font-medium">{t('pokemon_level')}</Label>
            
            <div className="space-y-2 sm:space-y-4">
              <Slider
                value={[tempLevel]}
                onValueChange={(value) => setTempLevel(value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="level-input" className="text-sm">{t('level')}:</Label>
                  <Input
                    id="level-input"
                    type="number"
                    min={1}
                    max={100}
                    value={tempLevel}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= 100) {
                        setTempLevel(value);
                      }
                    }}
                    className="w-16 sm:w-20 text-sm"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempLevel(50)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm px-2 py-1"
                  >
                    {t('level')} 50
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempLevel(100)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm px-2 py-1"
                  >
                    {t('level')} 100
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Preview */}
          <Card className="border-0 sm:border shadow-none sm:shadow-sm">
            <CardHeader className="pb-1 sm:pb-4 px-0 sm:px-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('stats_at_level')} {tempLevel}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0 sm:px-6">
              <div className="grid grid-cols-2 gap-1 sm:gap-4">
                {pokemon.stats.map((stat) => {
                  const currentStat = calculateStatAtLevel(stat.base_stat, currentLevel);
                  const newStat = calculateStatAtLevel(stat.base_stat, tempLevel);
                  const difference = newStat - currentStat;

                  return (
                    <motion.div
                      key={stat.stat.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-1.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${getStatColor(stat.stat.name)}`} />
                        <span className="font-medium text-xs sm:text-sm truncate">
                          {getStatName(stat.stat.name)}
                        </span>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm sm:text-lg">
                          {newStat}
                        </div>
                        {difference !== 0 && (
                          <div className={`text-xs ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {difference > 0 ? '+' : ''}{difference}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2 sm:pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} size="sm" className="w-full sm:w-auto">
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} size="sm" className="w-full sm:w-auto">
              {t('save_level')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}