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
  Zap,
  Shield
} from 'lucide-react';
import { PokedexViewer } from '@/components/PokedexViewer';
import { TeamBuilder } from '@/components/TeamBuilder';
import { AITeamAnalyzer } from '@/components/AITeamAnalyzer';
import { BattleArena } from '@/components/BattleArena';

export default function Home() {
  const [activeTab, setActiveTab] = useState('pokedex');

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PokéDex Pro
                </h1>
                <p className="text-sm text-gray-500">Modern Pokémon Management</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Powered by AI</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="pokedex" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Pokédex</span>
              </TabsTrigger>
              <TabsTrigger value="team-builder" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Team Builder</span>
              </TabsTrigger>
              <TabsTrigger value="ai-analyzer" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">AI Analyzer</span>
              </TabsTrigger>
              <TabsTrigger value="battle" className="flex items-center gap-2">
                <Swords className="w-4 h-4" />
                <span className="hidden sm:inline">Battle</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Tab Contents */}
          <TabsContent value="pokedex" className="mt-6">
            <motion.div
              key="pokedex"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Search className="w-6 h-6 text-blue-500" />
                    <h2 className="text-2xl font-bold">Pokédex Explorer</h2>
                    <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Discover & Explore</span>
                    </div>
                  </div>
                  <PokedexViewer />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="team-builder" className="mt-6">
            <motion.div
              key="team-builder"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="w-6 h-6 text-green-500" />
                    <h2 className="text-2xl font-bold">Team Builder</h2>
                    <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Build & Manage</span>
                    </div>
                  </div>
                  <TeamBuilder />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="ai-analyzer" className="mt-6">
            <motion.div
              key="ai-analyzer"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-6 h-6 text-purple-500" />
                    <h2 className="text-2xl font-bold">AI Team Analyzer</h2>
                    <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span>AI Powered</span>
                    </div>
                  </div>
                  <AITeamAnalyzer />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="battle" className="mt-6">
            <motion.div
              key="battle"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Swords className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-bold">Battle Arena</h2>
                    <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>Battle & Compete</span>
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
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <Search className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Explore</h3>
              <p className="text-sm opacity-90">Discover all Pokémon</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Build</h3>
              <p className="text-sm opacity-90">Create dream teams</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Analyze</h3>
              <p className="text-sm opacity-90">AI-powered insights</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <Swords className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Battle</h3>
              <p className="text-sm opacity-90">Test your teams</p>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-gray-700">PokéDex Pro</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              A modern Pokémon management application powered by AI
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <span>Built with Next.js & TypeScript</span>
              <span>•</span>
              <span>Powered by PokéAPI</span>
              <span>•</span>
              <span>AI by Google Gemini</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
