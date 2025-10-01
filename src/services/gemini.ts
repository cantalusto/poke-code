import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { PokemonTeam, TeamAnalysis } from '@/types/pokemon';
import { Language } from '@/contexts/LanguageContext';

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

  // Utility function to clean text from double asterisks
  private cleanTextFormatting(text: string): string {
    // Remove double asterisks used for bold formatting
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  }

  async analyzeTeam(team: PokemonTeam, language: Language = 'en'): Promise<TeamAnalysis> {
    if (!this.model) {
      throw new Error('Gemini AI is not available. Please check your API key configuration.');
    }

    try {
      const prompt = this.createTeamAnalysisPrompt(team, language);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = this.cleanTextFormatting(response.text());
      
      return this.parseAnalysisResponse(text);
    } catch (error) {
      console.error('Error analyzing team with Gemini:', error);
      throw new Error('Failed to analyze team. Please try again later.');
    }
  }

  async getBattleStrategy(playerTeam: PokemonTeam, opponentTeam: PokemonTeam, language: Language = 'en'): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI is not available. Please check your API key configuration.');
    }

    try {
      const prompt = this.createBattleStrategyPrompt(playerTeam, opponentTeam, language);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.cleanTextFormatting(response.text());
    } catch (error) {
      console.error('Error getting battle strategy from Gemini:', error);
      throw new Error('Failed to get battle strategy. Please try again.');
    }
  }

  async generateTeamSuggestions(currentTeam: PokemonTeam, targetRole?: string, language: Language = 'en'): Promise<string[]> {
    if (!this.model) {
      throw new Error('Gemini AI is not available. Please check your API key configuration.');
    }

    try {
      const prompt = this.createTeamSuggestionPrompt(currentTeam, targetRole, language);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = this.cleanTextFormatting(response.text());
      
      // Parse the response to extract Pokemon names
      const suggestions = this.parsePokemonSuggestions(text);
      return suggestions;
    } catch (error) {
      console.error('Error getting team suggestions from Gemini:', error);
      throw new Error('Failed to get team suggestions. Please try again.');
    }
  }

  private createTeamAnalysisPrompt(team: PokemonTeam, language: Language = 'en'): string {
    const teamInfo = team.pokemon.map(tp => {
      const pokemon = tp.pokemon;
      const types = pokemon.types.map(t => t.type.name).join(', ');
      const stats = pokemon.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join(', ');
      const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');
      
      return `${pokemon.name} (${types}) - Stats: ${stats} - Abilities: ${abilities}`;
    }).join('\n');

    const isPortuguese = language === 'pt-BR';
    
    const basePrompt = isPortuguese 
      ? `Você é o Professor Carvalho, o renomado pesquisador Pokémon. Analise este time Pokémon com sua expertise e forneça insights estratégicos em seu estilo característico caloroso e conhecedor.

IMPORTANTE: NÃO use asteriscos duplos (**) para formatação. Use apenas texto simples sem formatação especial.

Time "${team.name}":
${teamInfo}

Por favor, forneça uma análise abrangente em formato JSON com a seguinte estrutura:
{
  "overallRating": <número de 1-10>,
  "strengths": [<array de descrições de pontos fortes>],
  "weaknesses": [<array de descrições de fraquezas>],
  "suggestions": [<array de sugestões de melhoria>],
  "roleAnalysis": {
    "roles": {<nome_do_papel>: [<nomes_dos_pokemon>]},
    "missingRoles": [<nomes_dos_papéis_ausentes>]
  },
  "typeBalance": {
    "coverage": [<tipos_bem_cobertos>],
    "gaps": [<tipos_mal_cobertos>],
    "redundancies": [<tipos_super_representados>]
  },
  "synergy": {
    "score": <número de 1-10>,
    "explanation": "<explicação da sinergia do time>"
  }
}

Considere estes aspectos:
- Cobertura e equilíbrio de tipos
- Distribuição de stats (equilíbrio ofensivo/defensivo)
- Cobertura de papéis (sweeper, tank, suporte, etc.)
- Sinergias entre membros do time
- Fraquezas comuns e como abordá-las
- Viabilidade competitiva

Fale como o Professor Carvalho falaria - conhecedor, encorajador e perspicaz. Foque tanto nos pontos fortes quanto nas áreas para melhoria. Use apenas texto simples sem formatação especial.`
      : `You are Professor Oak, the renowned Pokémon researcher. Analyze this Pokémon team with your expertise and provide strategic insights in your characteristic warm, knowledgeable style.

IMPORTANT: DO NOT use double asterisks (**) for formatting. Use only plain text without special formatting.

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

Speak as Professor Oak would - knowledgeable, encouraging, and insightful. Focus on both strengths and areas for improvement. Use only plain text without special formatting.`;

    return basePrompt;
  }

  private createBattleStrategyPrompt(playerTeam: PokemonTeam, opponentTeam: PokemonTeam, language: Language = 'en'): string {
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

    const isPortuguese = language === 'pt-BR';

    return isPortuguese 
      ? `Professor Carvalho aqui! Você está prestes a enfrentar uma batalha desafiadora. Deixe-me dar alguns conselhos estratégicos.

IMPORTANTE: NÃO use asteriscos duplos para formatação. Use apenas texto simples.

Seu time: ${playerInfo}
Time do oponente: ${opponentInfo}

Como seu conselheiro de confiança, vou fornecer recomendações de estratégia de batalha. Considere:
- Vantagens e desvantagens de tipos
- Com qual Pokémon começar
- Ameaças potenciais para ficar atento
- Estratégias de troca
- Movimentos e habilidades chave para utilizar

Por favor, forneça conselhos de batalha específicos e práticos no tom encorajador e sábio do Professor Carvalho. Mantenha conciso mas perspicaz, focando nos pontos estratégicos mais importantes para esta batalha. Use apenas texto simples sem formatação especial.`
      : `Professor Oak here! You're about to face a challenging battle. Let me give you some strategic advice.

IMPORTANT: DO NOT use double asterisks for formatting. Use only plain text.

Your team: ${playerInfo}
Opponent's team: ${opponentInfo}

As your trusted advisor, I'll provide you with battle strategy recommendations. Consider:
- Type matchups and advantages
- Which Pokémon to lead with
- Potential threats to watch out for
- Switching strategies
- Key moves and abilities to utilize

Please provide specific, actionable battle advice in Professor Oak's encouraging and wise tone. Keep it concise but insightful, focusing on the most important strategic points for this matchup. Use only plain text without special formatting.`;
  }

  private createTeamSuggestionPrompt(currentTeam: PokemonTeam, targetRole?: string, language: Language = 'en'): string {
    const teamInfo = currentTeam.pokemon.map(tp => {
      const pokemon = tp.pokemon;
      const types = pokemon.types.map(t => t.type.name).join('/');
      return `${pokemon.name} (${types})`;
    }).join(', ');

    const isPortuguese = language === 'pt-BR';
    const roleText = targetRole 
      ? (isPortuguese ? `especificamente para o papel de ${targetRole}` : `specifically for the ${targetRole} role`)
      : (isPortuguese ? 'para melhorar o equilíbrio geral do time' : 'to improve overall team balance');

    return isPortuguese 
      ? `Professor Carvalho aqui! Vejo que você tem um time com: ${teamInfo}

IMPORTANTE: NÃO use asteriscos duplos para formatação. Use apenas texto simples.

Preciso sugerir alguns Pokémon ${roleText}. Baseado na composição atual do seu time, quais Pokémon complementariam bem este time?

Por favor, sugira 5-8 nomes específicos de Pokémon que funcionariam bem com este time. Considere:
- Lacunas na cobertura de tipos
- Equilíbrio de papéis (ofensivo, defensivo, suporte)
- Sinergias com membros existentes do time
- Viabilidade competitiva

Responda apenas com os nomes dos Pokémon, um por linha, sem explicação adicional. Por exemplo:
Garchomp
Rotom-Wash
Ferrothorn
Clefable
Landorus-Therian`
      : `Professor Oak here! I see you have a team with: ${teamInfo}

IMPORTANT: DO NOT use double asterisks for formatting. Use only plain text.

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

  async suggestTeamImprovements(teamData: PokemonTeam, language: Language = 'en'): Promise<TeamImprovementSuggestion> {
    if (!this.model) {
      throw new Error('Gemini AI is not available. Please check your API key configuration.');
    }

    try {
      const isPortuguese = language === 'pt-BR';
      const prompt = isPortuguese 
        ? `Como Professor Carvalho, sugira melhorias para este time Pokémon.

IMPORTANTE: NÃO use asteriscos duplos para formatação. Use apenas texto simples.

Dados do Time: ${JSON.stringify(teamData, null, 2)}

Forneça sugestões em formato JSON:
{
  "replacements": [{"current": "Nome do Pokémon", "suggested": "Pokémon melhor", "reason": "Por que este é melhor"}],
  "moveChanges": [{"pokemon": "Nome do Pokémon", "move": "Movimento atual", "suggested": "Movimento melhor", "reason": "Por quê"}],
  "generalTips": ["Dica1", "Dica2", ...]
}`
        : `As Professor Oak, suggest improvements for this Pokémon team.

IMPORTANT: DO NOT use double asterisks for formatting. Use only plain text.

Team Data: ${JSON.stringify(teamData, null, 2)}

Provide suggestions in JSON format:
{
  "replacements": [{"current": "Pokémon name", "suggested": "Better Pokémon", "reason": "Why this is better"}],
  "moveChanges": [{"pokemon": "Pokémon name", "move": "Current move", "suggested": "Better move", "reason": "Why"}],
  "generalTips": ["Tip1", "Tip2", ...]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = this.cleanTextFormatting(response.text());
      
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