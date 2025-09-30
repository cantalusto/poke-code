import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { PokemonTeam, TeamAnalysis } from '@/types/pokemon';

interface TeamImprovementSuggestion {
  replacements: Array<{
    current: string;
    suggested: string;
    reason: string;
  }>;
  moveChanges: Array<{
    pokemon: string;
    move: string;
    suggested: string;
    reason: string;
  }>;
  generalTips: string[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null;
  private model: GenerativeModel | null;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY is not set in environment variables. AI features will be disabled.');
      this.genAI = null;
      this.model = null;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash' 
      });
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  async analyzeTeam(team: PokemonTeam): Promise<TeamAnalysis> {
    if (!this.model) {
      throw new Error('Gemini AI is not available. Please check your API key configuration.');
    }

    try {
      const prompt = this.createTeamAnalysisPrompt(team);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAnalysisResponse(text);
    } catch (error) {
      console.error('Error analyzing team with Gemini:', error);
      throw new Error('Failed to analyze team. Please try again later.');
    }
  }

  async getBattleStrategy(playerTeam: PokemonTeam, opponentTeam: PokemonTeam): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI is not available. Please check your API key configuration.');
    }

    try {
      const prompt = this.createBattleStrategyPrompt(playerTeam, opponentTeam);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('Error getting battle strategy from Gemini:', error);
      throw new Error('Failed to get battle strategy. Please try again.');
    }
  }

  async generateTeamSuggestions(currentTeam: PokemonTeam, targetRole?: string): Promise<string[]> {
    if (!this.model) {
      throw new Error('Gemini AI is not available. Please check your API key configuration.');
    }

    try {
      const prompt = this.createTeamSuggestionPrompt(currentTeam, targetRole);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response to extract Pokemon names
      const suggestions = this.parsePokemonSuggestions(text);
      return suggestions;
    } catch (error) {
      console.error('Error getting team suggestions from Gemini:', error);
      throw new Error('Failed to get team suggestions. Please try again.');
    }
  }

  private createTeamAnalysisPrompt(team: PokemonTeam): string {
    const teamInfo = team.pokemon.map(tp => {
      const pokemon = tp.pokemon;
      const types = pokemon.types.map(t => t.type.name).join(', ');
      const stats = pokemon.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join(', ');
      const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');
      
      return `${pokemon.name} (${types}) - Stats: ${stats} - Abilities: ${abilities}`;
    }).join('\n');

    return `You are Professor Oak, the renowned Pokémon researcher. Analyze this Pokémon team with your expertise and provide strategic insights in your characteristic warm, knowledgeable style.

Team "${team.name}":
${teamInfo}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "overallRating": <number from 1-10>,
  "strengths": [<array of strength descriptions>],
  "weaknesses": [<array of weakness descriptions>],
  "suggestions": [<array of improvement suggestions>],
  "roleAnalysis": {
    "roles": {<role_name>: [<pokemon_names>]},
    "missingRoles": [<missing_role_names>]
  },
  "typeBalance": {
    "coverage": [<well_covered_types>],
    "gaps": [<poorly_covered_types>],
    "redundancies": [<over_represented_types>]
  },
  "synergy": {
    "score": <number from 1-10>,
    "explanation": "<explanation of team synergy>"
  }
}

Consider these aspects:
- Type coverage and balance
- Stat distribution (offensive/defensive balance)
- Role coverage (sweeper, tank, support, etc.)
- Synergies between team members
- Common weaknesses and how to address them
- Competitive viability

Speak as Professor Oak would - knowledgeable, encouraging, and insightful. Focus on both strengths and areas for improvement.`;
  }

  private createBattleStrategyPrompt(playerTeam: PokemonTeam, opponentTeam: PokemonTeam): string {
    const playerInfo = playerTeam.pokemon.map(tp => {
      const pokemon = tp.pokemon;
      const types = pokemon.types.map(t => t.type.name).join('/');
      return `${pokemon.name} (${types})`;
    }).join(', ');

    const opponentInfo = opponentTeam.pokemon.map(tp => {
      const pokemon = tp.pokemon;
      const types = pokemon.types.map(t => t.type.name).join('/');
      return `${pokemon.name} (${types})`;
    }).join(', ');

    return `Professor Oak here! You're about to face a challenging battle. Let me give you some strategic advice.

Your team: ${playerInfo}
Opponent's team: ${opponentInfo}

As your trusted advisor, I'll provide you with battle strategy recommendations. Consider:
- Type matchups and advantages
- Which Pokémon to lead with
- Potential threats to watch out for
- Switching strategies
- Key moves and abilities to utilize

Please provide specific, actionable battle advice in Professor Oak's encouraging and wise tone. Keep it concise but insightful, focusing on the most important strategic points for this matchup.`;
  }

  private createTeamSuggestionPrompt(currentTeam: PokemonTeam, targetRole?: string): string {
    const teamInfo = currentTeam.pokemon.map(tp => {
      const pokemon = tp.pokemon;
      const types = pokemon.types.map(t => t.type.name).join('/');
      return `${pokemon.name} (${types})`;
    }).join(', ');

    const roleText = targetRole ? `specifically for the ${targetRole} role` : 'to improve overall team balance';

    return `Professor Oak here! I see you have a team with: ${teamInfo}

I need to suggest some Pokémon ${roleText}. Based on your current team composition, what Pokémon would complement this team well?

Please suggest 5-8 specific Pokémon names that would work well with this team. Consider:
- Type coverage gaps
- Role balance (offensive, defensive, support)
- Synergies with existing team members
- Competitive viability

Respond with just the Pokémon names, one per line, without additional explanation. For example:
Garchomp
Rotom-Wash
Ferrothorn
Clefable
Landorus-Therian`;
  }

  private parseAnalysisResponse(text: string): TeamAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Validate and return the parsed analysis
        return {
          overallRating: parsed.overallRating || 5,
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          suggestions: parsed.suggestions || [],
          roleAnalysis: {
            roles: parsed.roleAnalysis?.roles || {},
            missingRoles: parsed.roleAnalysis?.missingRoles || []
          },
          typeBalance: {
            coverage: parsed.typeBalance?.coverage || [],
            gaps: parsed.typeBalance?.gaps || [],
            redundancies: parsed.typeBalance?.redundancies || []
          },
          synergy: {
            score: parsed.synergy?.score || 5,
            explanation: parsed.synergy?.explanation || 'Team synergy analysis unavailable.'
          }
        };
      }
    } catch (error) {
      console.error('Error parsing analysis response:', error);
    }

    // Fallback analysis if parsing fails
    return {
      overallRating: 6,
      strengths: ['Diverse team composition'],
      weaknesses: ['Analysis temporarily unavailable'],
      suggestions: ['Consider reviewing type coverage and role balance'],
      roleAnalysis: {
        roles: {},
        missingRoles: []
      },
      typeBalance: {
        coverage: [],
        gaps: [],
        redundancies: []
      },
      synergy: {
        score: 6,
        explanation: 'Team analysis is temporarily unavailable. Please try again.'
      }
    };
  }

  private parsePokemonSuggestions(text: string): string[] {
    // Extract Pokemon names from the response
    const lines = text.split('\n').filter(line => line.trim());
    const suggestions: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and lines that look like explanations
      if (trimmed && !trimmed.includes(':') && !trimmed.includes('Professor') && !trimmed.includes('suggest')) {
        // Remove any leading numbers, bullets, or dashes
        const cleaned = trimmed.replace(/^[\d\-\*\•]\s*/, '').trim();
        if (cleaned && cleaned.length > 2) {
          suggestions.push(cleaned);
        }
      }
    }
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }

  async suggestTeamImprovements(teamData: PokemonTeam): Promise<TeamImprovementSuggestion> {
    if (!this.model) {
      throw new Error('Gemini AI is not available. Please check your API key configuration.');
    }

    try {
      const prompt = `As Professor Oak, suggest improvements for this Pokémon team.

Team Data: ${JSON.stringify(teamData, null, 2)}

Provide suggestions in JSON format:
{
  "replacements": [{"current": "Pokémon name", "suggested": "Better Pokémon", "reason": "Why this is better"}],
  "moveChanges": [{"pokemon": "Pokémon name", "move": "Current move", "suggested": "Better move", "reason": "Why"}],
  "generalTips": ["Tip1", "Tip2", ...]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseResponse(text);
    } catch (error) {
      console.error('Error suggesting team improvements:', error);
      throw new Error('Failed to suggest team improvements. Please try again later.');
    }
  }

  private parseResponse(text: string): TeamImprovementSuggestion {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing response:', error);
    }
    
    return {
      replacements: [],
      moveChanges: [],
      generalTips: ['Analysis temporarily unavailable. Please try again.']
    };
  }

  // Method to test the connection
  async testConnection(): Promise<boolean> {
    if (!this.model) {
      return false;
    }

    try {
      const result = await this.model.generateContent('Hello, are you working?');
      const response = await result.response;
      return response.text().length > 0;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const geminiService = new GeminiService();