'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pokemon } from '@/types/pokemon';
import { pokeApiService } from '@/services/pokeapi';
import { Plus, Info, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PokemonCardProps {
  pokemon: Pokemon;
  onAddToTeam?: (pokemon: Pokemon) => void;
  onViewDetails?: (pokemon: Pokemon) => void;
  showAddButton?: boolean;
  showShiny?: boolean;
  className?: string;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  onAddToTeam,
  onViewDetails,
  showAddButton = true,
  showShiny = false,
  className = ''
}) => {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShinyVariant, setShowShinyVariant] = useState(showShiny);

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const typeColor = pokeApiService.getTypeColor(primaryType);
  
  const imageUrl = showShinyVariant 
    ? pokeApiService.getPokemonImageUrl(pokemon, 'shiny')
    : pokeApiService.getPokemonImageUrl(pokemon, 'artwork');

  const stats = {
    hp: pokeApiService.getStatByName(pokemon, 'hp'),
    attack: pokeApiService.getStatByName(pokemon, 'attack'),
    defense: pokeApiService.getStatByName(pokemon, 'defense'),
    speed: pokeApiService.getStatByName(pokemon, 'speed')
  };

  const totalStats = Object.values(stats).reduce((sum, stat) => sum + stat, 0);

  const cardVariants = {
    initial: { scale: 1, rotateY: 0 },
    hover: { 
      scale: 1.05, 
      rotateY: 5,
      transition: { duration: 0.3, ease: "easeOut" as const }
    },
    tap: { scale: 0.95 }
  };

  const imageVariants = {
    initial: { opacity: 0, scale: 0.8 },
    loaded: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  const statBarVariants = {
    initial: { width: 0 },
    animate: (stat: number) => ({
      width: `${(stat / 255) * 100}%`,
      transition: { duration: 1, delay: 0.2, ease: "easeOut" as const }
    })
  };

  return (
    <motion.div
      className={`relative ${className}`}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className="overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl drop-shadow-lg"
        style={{ 
          borderColor: isHovered ? typeColor : 'transparent',
          background: `linear-gradient(135deg, ${typeColor}15 0%, transparent 50%)`
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold capitalize text-foreground">
                {pokemon.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                #{pokemon.id.toString().padStart(3, '0')}
              </p>
            </div>
            <div className="flex gap-1">
              {pokemon.types.map((type, index) => (
                <Badge
                  key={`card-${pokemon.id}-${type.type.name}-${index}`}
                  className="text-xs text-white border-0"
                  style={{
                    backgroundColor: pokeApiService.getTypeColor(type.type.name),
                  }}
                >
                  {t(type.type.name)}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pokemon Image */}
          <div className="relative flex justify-center items-center h-32">
            <motion.img
              src={imageUrl}
              alt={pokemon.name}
              className="max-h-full max-w-full object-contain"
              variants={imageVariants}
              initial="initial"
              animate={imageLoaded ? "loaded" : "initial"}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = pokeApiService.getPokemonImageUrl(pokemon, 'default');
              }}
            />
            
            {/* Shiny Toggle */}
            <motion.button
              className="absolute top-0 right-0 p-1 rounded-full bg-yellow-400 text-yellow-900 opacity-0 hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowShinyVariant(!showShinyVariant);
              }}
              animate={{ opacity: isHovered ? 1 : 0 }}
            >
              <Sparkles size={16} />
            </motion.button>
          </div>

          {/* Stats Preview */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('stats')}</span>
              <span>{t('total')}: {totalStats}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(stats).map(([statName, value], index) => (
                <div key={`card-${pokemon.id}-stat-${statName}-${index}`} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="capitalize">{statName}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: typeColor }}
                      variants={statBarVariants}
                      initial="initial"
                      animate="animate"
                      custom={value}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Abilities */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('abilities')}</p>
            <div className="flex flex-wrap gap-1">
              {pokemon.abilities.slice(0, 2).map((ability, index) => (
                <Badge
                  key={`card-${pokemon.id}-ability-${ability.ability.name}-${index}`}
                  variant="outline"
                  className="text-xs"
                >
                  {ability.ability.name.replace('-', ' ')}
                  {ability.is_hidden && ' (H)'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {showAddButton && onAddToTeam && (
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToTeam(pokemon);
                }}
                style={{ backgroundColor: typeColor }}
              >
                <Plus size={14} className="mr-1" />
                {t('add_to_team')}
              </Button>
            )}
            
            {onViewDetails && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(pokemon);
                }}
              >
                <Info size={14} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hover Effects */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          background: `radial-gradient(circle at center, ${typeColor}20 0%, transparent 70%)`,
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};