'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'pt-BR';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'pokemon_goat': 'Poke-Code',
    'tagline': 'Code your perfect Pokémon team',
    'made_with_love': 'Made with Love',
    'pokedex': 'Pokédex',
    'team_builder': 'Team Builder',
    'battle_arena': 'Battle Arena',
    'ai_analyzer': 'AI Analyzer',
    'language': 'Language',

    // Homepage Cards
    'explore': 'Explore',
    'explore_description': 'Discover all Pokémon',
    'build': 'Build',
    'build_description': 'Create dream teams',
    'analyze': 'Analyze',
    'analyze_description': 'AI-powered insights',
    'battle': 'Battle',
    'battle_description': 'Test your teams',
    'battle_compete': 'Battle & Compete',

    // Section titles and descriptions
    'pokedex_explorer': 'Pokédex Explorer',
    'discover_and_explore': 'Discover & Explore',
    'build_your_team': 'Build Your Team',
    'analyze_with_ai': 'Analyze with AI',
    'battle_with_team': 'Battle with Team',
    'discover_pokemon': 'Discover Pokémon',

    // Footer
    'app_description': 'A modern Pokémon management application powered by AI',
    'built_with': 'Built with Next.js & TypeScript',
    'powered_by_pokeapi': 'Powered by PokéAPI',
    'ai_by_gemini': 'AI by Google Gemini',

    // Pokémon Types
    'normal': 'Normal',
    'fire': 'Fire',
    'water': 'Water',
    'electric': 'Electric',
    'grass': 'Grass',
    'ice': 'Ice',
    'fighting': 'Fighting',
    'poison': 'Poison',
    'ground': 'Ground',
    'flying': 'Flying',
    'psychic': 'Psychic',
    'bug': 'Bug',
    'rock': 'Rock',
    'ghost': 'Ghost',
    'dragon': 'Dragon',
    'dark': 'Dark',
    'steel': 'Steel',
    'fairy': 'Fairy',

    // PokedexViewer
    'search_pokemon': 'Search Pokémon',
    'search_pokemon_placeholder': 'Search Pokémon by name or ID...',
    'select_team': 'Select Team',
    'create_new_team': 'Create New Team',
    'filters': 'Filters',
    'random': 'Random',
    'types': 'Types',
    'order': 'Order',
    'ascending': 'Ascending',
    'descending': 'Descending',
    'pokemon_found': 'Pokémon found',
    'loading_pokedex': 'Loading Pokédex...',
    'enter_team_name': 'Enter new team name:',
    'select_team_first': 'Please select a team first!',
    'pokemon_added_to_team': 'was added to team',
    'failed_add_pokemon': 'Failed to add Pokémon to team',

    // TeamBuilder
    'my_teams': 'My Teams',
    'create_team': 'Create Team',
    'team_name': 'Team Name',
    'save_team': 'Save Team',
    'delete_team': 'Delete Team',
    'edit_team': 'Edit Team',
    'no_teams_created': 'No teams created yet. Create your first team!',
    'team_saved': 'Team saved successfully!',
    'team_deleted': 'Team deleted successfully!',
    'remove_from_team': 'Remove from Team',
    'team_full': 'Team is full (6 Pokémon maximum)',
    'empty_team_name': 'Please enter a team name',
    'team_name_exists': 'A team with this name already exists',

    // BattleArena
    'battle_setup': 'Battle Setup',
    'select_your_team': 'Select Your Team',
    'choose_a_team': 'Choose a team',
    'select_opponent': 'Select Opponent',
    'start_battle': 'Start Battle',
    'create_team_first': 'Please create a team with at least one Pokémon in the Team Builder first.',
    'loading_battle': 'Loading battle...',
    'turn': 'Turn',
    'reset': 'Reset',
    'choose_your_action': 'Choose Your Action',
    'switch_pokemon': 'Switch Pokémon',
    'choose_pokemon_to_switch': 'Choose Pokémon to Switch',
    'victory': 'Victory!',
    'defeat': 'Defeat!',
    'congratulations_won': 'Congratulations! You won the battle!',
    'better_luck_next_time': 'Better luck next time!',
    'battle_again': 'Battle Again',
    'battle_log': 'Battle Log',
    'power': 'Power',
    'pp': 'PP',
    'hp': 'HP',
    'lv': 'Lv.',
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard',
    'legendary': 'Legendary',
    'more': 'more',
    'view_team': 'View Team',
    'team_of': 'Team of',
    'level': 'Level',
    'team': 'Team',

    // AITeamAnalyzer
    'ai_team_analyzer': 'AI Team Analyzer',
    'select_team_to_analyze': 'Select Team to Analyze',
    'choose_team_to_analyze': 'Choose a team to analyze',
    'analyzing': 'Analyzing...',
    'analyze_team': 'Analyze Team',
    'no_teams_available': 'No teams available. Create a team in the Team Builder first.',
    'analysis_failed': 'Analysis Failed',
    'try_again': 'Try Again',
    'professor_oak_analysis': 'Professor Oak\'s Analysis',
    'overall_rating': 'Overall Rating',
    'team_strengths': 'Team Strengths',
    'areas_for_improvement': 'Areas for Improvement',
    'team_roles': 'Team Roles',
    'current_roles': 'Current Roles',
    'missing_roles': 'Missing Roles',
    'type_coverage': 'Type Coverage',
    'good_coverage': 'Good Coverage',
    'coverage_gaps': 'Coverage Gaps',
    'improvement_suggestions': 'Improvement Suggestions',
    'suggestion': 'Suggestion',
    'select_team_with_pokemon': 'Please select a team with at least one Pokémon',
    'ai_analysis_unavailable': 'AI analysis is currently unavailable. Please check your API key configuration in the .env file.',
    'failed_to_analyze_team': 'Failed to analyze team',

    // PokemonCard
    'stats': 'Stats',
    'total': 'Total',
    'abilities': 'Abilities',
    'add_to_team': 'Add to Team',

    // Generations
    'gen_i_kanto': 'Gen I (Kanto)',
    'gen_ii_johto': 'Gen II (Johto)',
    'gen_iii_hoenn': 'Gen III (Hoenn)',
    'gen_iv_sinnoh': 'Gen IV (Sinnoh)',
    'gen_v_unova': 'Gen V (Unova)',
    'gen_vi_kalos': 'Gen VI (Kalos)',
    'gen_vii_alola': 'Gen VII (Alola)',
    'gen_viii_galar': 'Gen VIII (Galar)',
    'gen_ix_paldea': 'Gen IX (Paldea)',

    // Language Toggle
    'switch_to_portuguese': 'Switch to Portuguese',
    'switch_to_english': 'Switch to English',
    'export': 'Export',
    'import': 'Import',
    'teams': 'Teams',

    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'close': 'Close',
    'save': 'Save',
    'edit': 'Edit',
    'name': 'Name',
    'id': 'ID',

    // Additional translations for hardcoded texts
    'team_builder_title': 'Team Builder',
    'build_manage': 'Build & Manage',
    'ai_team_analyzer_title': 'AI Team Analyzer',
    'ai_powered': 'AI Powered',
    'searching': 'Searching...',
    'no_major_weaknesses': 'No major weaknesses found',
    'no_major_resistances': 'No major resistances found',
    'no_team_selected': 'No Team Selected',
    'create_or_select_team': 'Create or select a team to get started',
    'average_stats': 'Average Stats',
    'type_distribution': 'Type Distribution',
    'team_weaknesses': 'Team Weaknesses',
    'team_resistances': 'Team Resistances',
    'add_pokemon': 'Add Pokemon',
    'add_pokemon_to_team': 'Add Pokemon to Team',
    'pokemon': 'Pokemons',

    // Trainer names and descriptions
    'champion_red': 'Champion Red',
    'champion_red_description': 'The legendary trainer from Mount Silver. His team is perfectly balanced and extremely powerful.',
    'elite_four_lance': 'Elite Four Lance',
    'elite_four_lance_description': 'The Dragon Master of the Elite Four. Specializes in Dragon-type Pokémon.',
    'gym_leader_brock': 'Gym Leader Brock',
    'gym_leader_brock_description': 'The Rock-type Gym Leader of Pewter City. A great trainer for beginners.',
    'rival_blue': 'Rival Blue',
    'rival_blue_description': 'Your long-time rival. His team is well balanced and competitive.'
  },
  'pt-BR': {
    // Header
    'pokemon_goat': 'Poke-Code',
    'tagline': 'Programe seu time Pokémon perfeito',
    'made_with_love': 'Feito com Amor',
    'pokedex': 'Pokédex',
    'team_builder': 'Construtor de Times',
    'battle_arena': 'Arena de Batalha',
    'ai_analyzer': 'Analisador IA',
    'language': 'Idioma',

    // Homepage Cards
    'explore': 'Explorar',
    'explore_description': 'Descobra todos os Pokémon',
    'build': 'Construir',
    'build_description': 'Crie times dos sonhos',
    'analyze': 'Analisar',
    'analyze_description': 'Insights com IA',
    'battle': 'Batalhar',
    'battle_description': 'Teste seus times',
    'battle_compete': 'Batalhe & Compete',

    // Section titles and descriptions
    'pokedex_explorer': 'Explorador Pokédex',
    'discover_and_explore': 'Descobrir & Explorar',
    'build_your_team': 'Monte seu Time',
    'analyze_with_ai': 'Analise com IA',
    'battle_with_team': 'Batalhe com seu Time',
    'discover_pokemon': 'Conheça novos pokémons!',

    // Footer
    'app_description': 'Uma aplicação moderna de gerenciamento Pokémon com IA',
    'built_with': 'Construído com Next.js & TypeScript',
    'powered_by_pokeapi': 'Powered by PokéAPI',
    'ai_by_gemini': 'IA by Google Gemini',

    // Pokémon Types
    'normal': 'Normal',
    'fire': 'Fogo',
    'water': 'Água',
    'electric': 'Elétrico',
    'grass': 'Planta',
    'ice': 'Gelo',
    'fighting': 'Lutador',
    'poison': 'Veneno',
    'ground': 'Terra',
    'flying': 'Voador',
    'psychic': 'Psíquico',
    'bug': 'Inseto',
    'rock': 'Pedra',
    'ghost': 'Fantasma',
    'dragon': 'Dragão',
    'dark': 'Sombrio',
    'steel': 'Aço',
    'fairy': 'Fada',

    // PokedexViewer
    'search_pokemon': 'Buscar Pokémon',
    'search_pokemon_placeholder': 'Buscar Pokémon por nome ou ID...',
    'select_team': 'Selecionar Time',
    'create_new_team': 'Criar Novo Time',
    'filters': 'Filtros',
    'random': 'Aleatório',
    'types': 'Tipos',
    'order': 'Ordem',
    'ascending': 'Crescente',
    'descending': 'Decrescente',
    'pokemon_found': 'Pokémon encontrados',
    'loading_pokedex': 'Carregando Pokédex...',
    'enter_team_name': 'Digite o nome do novo time:',
    'select_team_first': 'Por favor, selecione um time primeiro!',
    'pokemon_added_to_team': 'foi adicionado ao time',
    'failed_add_pokemon': 'Falha ao adicionar Pokémon ao time',

    // TeamBuilder
    'my_teams': 'Meus Times',
    'create_team': 'Criar Time',
    'team_name': 'Nome do Time',
    'save_team': 'Salvar Time',
    'delete_team': 'Excluir Time',
    'edit_team': 'Editar Time',
    'no_teams_created': 'Nenhum time criado ainda. Crie seu primeiro time!',
    'team_saved': 'Time salvo com sucesso!',
    'team_deleted': 'Time excluído com sucesso!',
    'remove_from_team': 'Remover do Time',
    'team_full': 'Time está cheio (máximo 6 Pokémon)',
    'empty_team_name': 'Por favor, digite um nome para o time',
    'team_name_exists': 'Já existe um time com este nome',

    // BattleArena
    'battle_setup': 'Configuração da Batalha',
    'select_your_team': 'Selecione Seu Time',
    'choose_a_team': 'Escolha um time',
    'select_opponent': 'Selecionar Oponente',
    'start_battle': 'Iniciar Batalha',
    'create_team_first': 'Por favor, crie um time com pelo menos um Pokémon no Construtor de Times primeiro.',
    'loading_battle': 'Carregando batalha...',
    'turn': 'Turno',
    'reset': 'Reiniciar',
    'choose_your_action': 'Escolha Sua Ação',
    'switch_pokemon': 'Trocar Pokémon',
    'choose_pokemon_to_switch': 'Escolha o Pokémon para Trocar',
    'victory': 'Vitória!',
    'defeat': 'Derrota!',
    'congratulations_won': 'Parabéns! Você venceu a batalha!',
    'better_luck_next_time': 'Mais sorte na próxima vez!',
    'battle_again': 'Batalhar Novamente',
    'battle_log': 'Log da Batalha',
    'power': 'Poder',
    'pp': 'PP',
    'hp': 'HP',
    'lv': 'Nv.',
    'easy': 'Fácil',
    'medium': 'Médio',
    'hard': 'Difícil',
    'legendary': 'Lendário',
    'more': 'mais',
    'view_team': 'Ver Equipe',
    'team_of': 'Equipe de',
    'level': 'Nível',
    'team': 'Time',

    // AITeamAnalyzer
    'ai_team_analyzer': 'Analisador de Time IA',
    'select_team_to_analyze': 'Selecionar Time para Analisar',
    'choose_team_to_analyze': 'Escolha um time para analisar',
    'analyzing': 'Analisando...',
    'analyze_team': 'Analisar Time',
    'no_teams_available': 'Nenhum time disponível. Crie um time no Construtor de Times primeiro.',
    'analysis_failed': 'Análise Falhou',
    'try_again': 'Tentar Novamente',
    'professor_oak_analysis': 'Análise do Professor Carvalho',
    'overall_rating': 'Avaliação Geral',
    'team_strengths': 'Pontos Fortes do Time',
    'areas_for_improvement': 'Áreas para Melhoria',
    'team_roles': 'Funções do Time',
    'current_roles': 'Funções Atuais',
    'missing_roles': 'Funções Ausentes',
    'type_coverage': 'Cobertura de Tipos',
    'good_coverage': 'Boa Cobertura',
    'coverage_gaps': 'Lacunas de Cobertura',
    'improvement_suggestions': 'Sugestões de Melhoria',
    'suggestion': 'Sugestão',
    'select_team_with_pokemon': 'Por favor, selecione um time com pelo menos um Pokémon',
    'ai_analysis_unavailable': 'Análise IA está indisponível no momento. Verifique a configuração da chave API no arquivo .env.',
    'failed_to_analyze_team': 'Falha ao analisar time',

    // PokemonCard
    'stats': 'Estatísticas',
    'total': 'Total',
    'abilities': 'Habilidades',
    'add_to_team': 'Adicionar ao Time',

    // Generations
    'gen_i_kanto': 'Ger I (Kanto)',
    'gen_ii_johto': 'Ger II (Johto)',
    'gen_iii_hoenn': 'Ger III (Hoenn)',
    'gen_iv_sinnoh': 'Ger IV (Sinnoh)',
    'gen_v_unova': 'Ger V (Unova)',
    'gen_vi_kalos': 'Ger VI (Kalos)',
    'gen_vii_alola': 'Ger VII (Alola)',
    'gen_viii_galar': 'Ger VIII (Galar)',
    'gen_ix_paldea': 'Ger IX (Paldea)',

    // Common
    'loading': 'Carregando...',
    'error': 'Erro',
    'close': 'Fechar',
    'save': 'Salvar',
    'edit': 'Editar',
    'name': 'Nome',
    'id': 'ID',

    // Additional translations for hardcoded texts
    'team_builder_title': 'Construtor de Times',
    'build_manage': 'Construir & Gerenciar',
    'ai_team_analyzer_title': 'Analisador de Time IA',
    'ai_powered': 'Powered by IA',
    'searching': 'Buscando...',
    'no_major_weaknesses': 'Nenhuma fraqueza importante encontrada',
    'no_major_resistances': 'Nenhuma resistência importante encontrada',
    'no_team_selected': 'Nenhum Time Selecionado',
    'create_or_select_team': 'Crie ou selecione um time para começar',
    'switch_to_portuguese': 'Mudar para Português',
    'switch_to_english': 'Mudar para Inglês',
    'export': 'Exportar',
    'import': 'Importar',
    'teams': 'Times',
    'average_stats': 'Estatísticas Médias',
    'type_distribution': 'Distribuição de Tipos',
    'team_weaknesses': 'Fraquezas do Time',
    'team_resistances': 'Resistências do Time',
    'add_pokemon': 'Adicionar Pokemon',
    'add_pokemon_to_team': 'Adicionar Pokemon ao Time',
    'pokemon': 'Pokemons',

    // Trainer names and descriptions
    'champion_red': 'Campeão Red',
    'champion_red_description': 'O lendário treinador do Monte Silver. Sua equipe é perfeitamente equilibrada e extremamente poderosa.',
    'elite_four_lance': 'Elite Four Lance',
    'elite_four_lance_description': 'O Mestre dos Dragões do Elite Four. Especializa-se em Pokémon do tipo Dragão.',
    'gym_leader_brock': 'Líder de Ginásio Brock',
    'gym_leader_brock_description': 'O Líder de Ginásio do tipo Pedra de Pewter City. Um ótimo treinador para iniciantes.',
    'rival_blue': 'Rival Blue',
    'rival_blue_description': 'Seu rival de longa data. Sua equipe é bem equilibrada e competitiva.'
  }
};

export const GENERATIONS = [
  { value: 'generation-i', label: 'gen_i_kanto' },
  { value: 'generation-ii', label: 'gen_ii_johto' },
  { value: 'generation-iii', label: 'gen_iii_hoenn' },
  { value: 'generation-iv', label: 'gen_iv_sinnoh' },
  { value: 'generation-v', label: 'gen_v_unova' },
  { value: 'generation-vi', label: 'gen_vi_kalos' },
  { value: 'generation-vii', label: 'gen_vii_alola' },
  { value: 'generation-viii', label: 'gen_viii_galar' },
  { value: 'generation-ix', label: 'gen_ix_paldea' }
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('poke-code-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt-BR')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('poke-code-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}