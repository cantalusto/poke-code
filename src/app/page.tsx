'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Users, 
  Brain, 
  Swords, 
  Sparkles,
  Heart,
  Shield,
  Zap
} from 'lucide-react';
import { PokedexViewer } from '@/components/PokedexViewer';
import { TeamBuilder } from '@/components/TeamBuilder';
import { AITeamAnalyzer } from '@/components/AITeamAnalyzer';
import { BattleArena } from '@/components/BattleArena';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState('pokedex');
  const { t } = useLanguage();

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-2 sm:gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center relative">
                {/* Pokeball SVG */}
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  {/* Top half */}
                  <path 
                    d="M12 2C17.52 2 22 6.48 22 12H14C14 10.9 13.1 10 12 10C10.9 10 10 10.9 10 12H2C2 6.48 6.48 2 12 2Z" 
                    fill="currentColor"
                  />
                  {/* Bottom half */}
                  <path 
                    d="M2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12H14C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12H2Z" 
                    fill="currentColor" 
                    fillOpacity="0.7"
                  />
                  {/* Center circle */}
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="2" 
                    fill="currentColor"
                    stroke="white" 
                    strokeWidth="1"
                  />
                  {/* Center line */}
                  <line 
                    x1="2" 
                    y1="12" 
                    x2="22" 
                    y2="12" 
                    stroke="white" 
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-red-600">
                  {t('pokemon_goat')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{t('tagline')}</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-2 sm:gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
                <Heart className="w-4 h-4 text-red-500" />
                {t('made_with_love')}
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-fit lg:grid-cols-4 bg-muted/50 backdrop-blur-sm border border-border mx-auto gap-1 sm:gap-0">
              <TabsTrigger value="pokedex" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('pokedex')}</span>
                <span className="sm:hidden">Pokédex</span>
              </TabsTrigger>
              <TabsTrigger value="team-builder" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('team_builder')}</span>
                <span className="sm:hidden">Team</span>
              </TabsTrigger>
              <TabsTrigger value="ai-analyzer" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('ai_analyzer')}</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="battle" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Swords className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('battle_arena')}</span>
                <span className="sm:hidden">Battle</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Tab Contents */}
          <TabsContent value="pokedex" className="mt-4 px-1 sm:px-4">
            <motion.div
              key="pokedex"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-background border-0 shadow-[0_35px_60px_-12px_rgba(0,0,0,0.25),0_20px_25px_-5px_rgba(0,0,0,0.15)]">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-black">{t('pokedex_explorer')}</h2>
                    <div className="ml-auto hidden sm:flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      {t('discover_and_explore')}
                    </div>
                  </div>
                  <PokedexViewer />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="team-builder" className="mt-4 px-1 sm:px-4">
            <motion.div
              key="team-builder"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-background border-0 shadow-[0_35px_60px_-12px_rgba(0,0,0,0.25),0_20px_25px_-5px_rgba(0,0,0,0.15)]">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-black">{t('team_builder')}</h2>
                    <div className="ml-auto hidden sm:flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      {t('build_your_team')}
                    </div>
                  </div>
                  <TeamBuilder />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="ai-analyzer" className="mt-4 px-1 sm:px-4">
            <motion.div
              key="ai-analyzer"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-background border-0 shadow-[0_35px_60px_-12px_rgba(0,0,0,0.25),0_20px_25px_-5px_rgba(0,0,0,0.15)]">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-black">{t('ai_analyzer')}</h2>
                    <div className="ml-auto hidden sm:flex items-center gap-2 text-sm text-gray-500">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      {t('analyze_with_ai')}
                    </div>
                  </div>
                  <AITeamAnalyzer />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="battle" className="mt-4 px-1 sm:px-4">
            <motion.div
              key="battle"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-background border-0 shadow-[0_35px_60px_-12px_rgba(0,0,0,0.25),0_20px_25px_-5px_rgba(0,0,0,0.15)]">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-black">{t('battle_arena')}</h2>
                    <div className="ml-auto hidden sm:flex items-center gap-2 text-sm text-gray-500">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      {t('battle_with_team')}
                    </div>
                  </div>
                  <BattleArena />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <motion.div 
          className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 px-2 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-3 sm:p-4 text-center">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
              <p className="text-sm sm:text-lg font-bold opacity-100">{t('discover_pokemon')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-100 text-gray-800 border-0 shadow-[0_35px_60px_-12px_rgba(0,0,0,0.35),0_20px_25px_-5px_rgba(0,0,0,0.2)]">
            <CardContent className="p-3 sm:p-4 text-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-700" />
              <p className="text-sm sm:text-lg font-bold opacity-100">{t('build_your_team')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-3 sm:p-4 text-center">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
              <p className="text-sm sm:text-lg font-bold opacity-100">{t('analyze_with_ai')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-100 text-gray-800 border-0 shadow-[0_35px_60px_-12px_rgba(0,0,0,0.35),0_20px_25px_-5px_rgba(0,0,0,0.2)]">
            <CardContent className="p-3 sm:p-4 text-center">
              <Swords className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-700" />
              <p className="text-sm sm:text-lg font-bold opacity-100">{t('battle_with_team')}</p>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-sm border-t border-border mt-8 sm:mt-16">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              <span className="text-red-600 font-semibold text-sm sm:text-base">Poke-Code</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4 px-4">
              {t('app_description')}
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-6 text-xs text-gray-400 flex-wrap">
              <span>{t('built_with')}</span>
              <span>•</span>
              <span>{t('powered_by_pokeapi')}</span>
              <span>•</span>
              <span>{t('ai_by_gemini')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
