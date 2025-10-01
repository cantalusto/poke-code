'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  Users,
  Shield,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { PokemonTeam } from '@/types/pokemon';
import { TeamStorageService } from '@/utils/teamStorage';
import { geminiService } from '@/services/gemini';
import { useLanguage } from '@/contexts/LanguageContext';
import { pokeApiService } from '@/services/pokeapi';

interface AITeamAnalyzerProps {
  className?: string;
}

interface AnalysisResult {
  overallRating: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  roleAnalysis: {
    roles: Record<string, string[]>; // role -> pokemon names
    missingRoles: string[];
  };
  typeBalance: {
    coverage: string[];
    gaps: string[];
    redundancies: string[];
  };
  synergy: {
    score: number;
    explanation: string;
  };
}

export function AITeamAnalyzer({ className }: AITeamAnalyzerProps) {
  const { t } = useLanguage();
  const [teams, setTeams] = useState<PokemonTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<PokemonTeam | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load teams on component mount
  useEffect(() => {
    const loadedTeams = TeamStorageService.getTeams().filter(team => team.pokemon.length > 0);
    setTeams(loadedTeams);
    if (loadedTeams.length > 0 && !selectedTeam) {
      setSelectedTeam(loadedTeams[0]);
    }
  }, [selectedTeam]);

  const analyzeTeam = async () => {
    if (!selectedTeam || selectedTeam.pokemon.length === 0) {
      setError(t('select_team_with_pokemon'));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await geminiService.analyzeTeam(selectedTeam);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : t('failed_to_analyze_team');
      
      if (errorMessage.includes('not available') || errorMessage.includes('API key')) {
        setError(t('ai_analysis_unavailable'));
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 9) return 'text-green-600';
    if (rating >= 7) return 'text-blue-600';
    if (rating >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBadgeVariant = (rating: number) => {
    if (rating >= 9) return 'default';
    if (rating >= 7) return 'secondary';
    if (rating >= 5) return 'outline';
    return 'destructive';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('select_team_to_analyze')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedTeam?.id || ''} onValueChange={(value) => {
                const team = teams.find(t => t.id === value);
                setSelectedTeam(team || null);
                setAnalysis(null); // Clear previous analysis
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={t('choose_team_to_analyze')} />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} ({team.pokemon.length}/6 Pokémon)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={analyzeTeam}
              disabled={!selectedTeam || selectedTeam.pokemon.length === 0 || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  {t('analyze_team')}
                </>
              )}
            </Button>
          </div>

          {/* Team Preview */}
          {selectedTeam && (
            <div className="border rounded-lg p-4 bg-muted">
              <h3 className="font-medium mb-2">{selectedTeam.name}</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTeam.pokemon.map((tp, index) => (
                  <div key={`team-pokemon-${tp.pokemon.id}-${index}`} className="flex items-center gap-2 bg-background rounded px-2 py-1 text-sm">
                    <span className="font-medium">{tp.pokemon.name}</span>
                    <div className="flex gap-1">
                      {tp.pokemon.types.map((type, typeIndex) => (
                      <Badge
                        key={`team-${tp.pokemon.id}-${type.type.name}-${typeIndex}`}
                        variant="secondary"
                        className="text-xs text-white"
                        style={{
                          backgroundColor: pokeApiService.getTypeColor(type.type.name),
                          boxShadow: `0 2px 8px ${pokeApiService.getTypeColor(type.type.name)}40`
                        }}
                      >
                        {t(type.type.name)}
                      </Badge>
                    ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!selectedTeam && teams.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              {t('no_teams_available')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{t('analysis_failed')}</span>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={analyzeTeam}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('try_again')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Professor's Comment */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50/20 to-blue-50/20 dark:from-purple-900/20 dark:to-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                    👨‍🔬
                  </div>
                  {t('professor_oak_analysis')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-lg italic text-muted-foreground leading-relaxed">
                      &ldquo;{analysis.synergy.explanation}&rdquo;
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">
                      <span className={getRatingColor(analysis.overallRating)}>
                        {analysis.overallRating}/10
                      </span>
                    </div>
                    <Badge variant={getRatingBadgeVariant(analysis.overallRating)}>
                      {t('overall_rating')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    {t('team_strengths')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                      <motion.div
                        key={`strength-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    {t('areas_for_improvement')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.weaknesses.map((weakness, index) => (
                      <motion.div
                        key={`weakness-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{weakness}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Role Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t('team_roles')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">{t('current_roles')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analysis.roleAnalysis.roles).map(([role, pokemon], index) => (
                        <Badge key={`role-${role}-${index}`} variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {role}: {pokemon.join(', ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {analysis.roleAnalysis.missingRoles.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2">{t('missing_roles')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.roleAnalysis.missingRoles.map((role, index) => (
                          <Badge key={`missing-role-${role}-${index}`} variant="outline" className="border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Type Coverage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {t('type_coverage')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">{t('good_coverage')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.typeBalance.coverage.map((type, index) => (
                        <Badge 
                          key={`coverage-${type}-${index}`} 
                          variant="secondary" 
                          className="text-white"
                          style={{
                            backgroundColor: pokeApiService.getTypeColor(type),
                            boxShadow: `0 2px 8px ${pokeApiService.getTypeColor(type)}40`
                          }}
                        >
                          {t(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {analysis.typeBalance.gaps.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">{t('coverage_gaps')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.typeBalance.gaps.map((type, index) => (
                          <Badge 
                            key={`gap-${type}-${index}`} 
                            variant="outline" 
                            className="text-white border-2"
                            style={{
                              backgroundColor: pokeApiService.getTypeColor(type),
                              borderColor: pokeApiService.getTypeColor(type),
                              boxShadow: `0 2px 8px ${pokeApiService.getTypeColor(type)}40`
                            }}
                          >
                            {t(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Lightbulb className="w-5 h-5" />
                  {t('improvement_suggestions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.suggestions.map((suggestion, index) => (
                    <motion.div
                      key={`suggestion-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg"
                    >
                      <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                          {t('suggestion')} {index + 1}:
                        </span>
                        <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">{suggestion}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}