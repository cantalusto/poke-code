# 🎮 Pokémon Team Builder

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

##  

Uma aplicação web moderna e interativa para construir, analisar e batalhar com times Pokémon, desenvolvida com **Next.js 15** e integração com **IA Gemini**. A plataforma oferece uma experiência completa para treinadores Pokémon criarem estratégias vencedoras.

## ✨ Funcionalidades Principais

### 🔧 **Construtor de Times Inteligente**
- **Time de 6 Pokémon:** Construa sua equipe ideal com até 6 membros
- **Busca Avançada:** Pesquisa por nome, número da Pokédex ou tipos
- **Análise em Tempo Real:** Visualização detalhada de stats, tipos e habilidades
- **Armazenamento Local:** Salve múltiplos times para acesso rápido

### 🤖 **Analisador com IA Gemini**
- **Análise Estratégica:** Avaliação inteligente do seu time por IA
- **Estratégias Personalizadas:** Táticas de batalha específicas para seu time
- **Sugestões de Melhoria:** Recomendações baseadas em sinergia e cobertura
- **Personalidades Temáticas:** 
  - 🇧🇷 **Professor Carvalho** em português
  - 🇺🇸 **Professor Oak** em inglês

### ⚔️ **Arena de Batalha Realista**
- **Sistema de Combate:** Batalhas automáticas entre times
- **Cálculos de Dano:** Mecânicas baseadas nos jogos oficiais
- **Animações Dinâmicas:** Efeitos visuais durante as batalhas
- **Histórico Detalhado:** Estatísticas completas dos confrontos

### 📚 **Pokédex Interativa**
- **Navegação Completa:** Acesso a todas as gerações Pokémon
- **Filtros Avançados:** Busca por tipo, geração, habilidade e estatísticas
- **Informações Detalhadas:** Dados completos de cada Pokémon
- **Design Responsivo:** Interface adaptada para todos os dispositivos

### 🌐 **Recursos Adicionais**
- **Tema Escuro/Claro:** Alternância entre modos de visualização
- **Suporte Bilíngue:** Português e Inglês integrados
- **Interface Moderna:** Animações fluidas com Framer Motion
- **Componentes Acessíveis:** Radix UI para melhor experiência

## 🛠️ Stack Tecnológica

### **Frontend de Última Geração**
- **Framework:** Next.js 15 com App Router
- **Biblioteca UI:** React 19 com Hooks modernos
- **Tipagem:** TypeScript para desenvolvimento robusto
- **Estilização:** Tailwind CSS 4 com design system

### **Inteligência Artificial & APIs**
- **IA Generativa:** Google Gemini API
- **Dados Pokémon:** PokéAPI oficial
- **Integração:** Serviços especializados para cada funcionalidade

### **Experiência do Usuário**
- **Animações:** Framer Motion para transições suaves
- **Componentes:** Radix UI para acessibilidade
- **Performance:** Turbopack para desenvolvimento rápido
- **Estado:** Context API para gerenciamento global

## 🚀 Implementação Rápida

### ⚡ **Pré-requisitos**
- Node.js 18.0+
- Chave da API Google Gemini

### 🛠️ **Configuração em 4 Passos**

1. **Clone o Repositório:**
```bash
git clone https://github.com/cantalusto/poke-code.git
cd poke-code
```

2. **Instalação de Dependências:**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configuração de Ambiente:**
```bash
# Crie .env.local na raiz
echo "NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_gemini_aqui" > .env.local
```

4. **Execução do Projeto:**
```bash
npm run dev
# ou
yarn dev
```

5. **Acesso:**
```
http://localhost:3000
```

### 🔑 **Obtenção da Chave Gemini**
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova chave API
3. Adicione ao arquivo `.env.local`

## 🎯 Fluxo de Utilização

### 1. **Construção do Time**
- Navegue para "Team Builder"
- Pesquise e adicione até 6 Pokémon
- Analise sinergias e cobertura de tipos
- Salve o time para uso futuro

### 2. **Análise com IA**
- Acesse "AI Team Analyzer"
- Selecione um time salvo
- Escolha o tipo de análise:
  - 📊 Análise Estratégica Completa
  - ⚔️ Estratégias de Batalha
  - 💡 Sugestões de Melhorias
  - 🆕 Recomendações de Pokémon

### 3. **Batalhas na Arena**
- Vá para "Battle Arena"
- Selecione dois times para confronto
- Assista à simulação automática
- Analise resultados e estatísticas

### 4. **Exploração da Pokédex**
- Use "Pokédex Viewer" para descobrir Pokémon
- Filtre por diversos critérios
- Estude características e evoluções

## 🏗️ Arquitetura do Projeto

```
poke-code/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx      # Layout principal
│   │   ├── page.tsx        # Página inicial
│   │   └── globals.css     # Estilos globais
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes reutilizáveis
│   │   ├── AITeamAnalyzer.tsx
│   │   ├── BattleArena.tsx
│   │   ├── TeamBuilder.tsx
│   │   └── PokedexViewer.tsx
│   ├── contexts/          # Gerenciamento de estado
│   │   ├── ThemeContext.tsx
│   │   └── LanguageContext.tsx
│   ├── services/          # Integrações externas
│   │   ├── gemini.ts      # Serviço da IA Gemini
│   │   └── pokeapi.ts     # Serviço da PokéAPI
│   ├── types/             # Definições TypeScript
│   └── utils/             # Utilitários e helpers
├── public/               # Assets estáticos
└── package.json         # Dependências e scripts
```

## 🌍 Sistema de Idiomas

### **🇧🇷 Português Brasileiro**
- Interface completamente localizada
- IA responde como **Professor Carvalho**
- Terminologia adaptada para o público brasileiro

### **🇺🇸 English**
- Full English support
- IA responds as **Professor Oak**
- Official Pokémon terminology

## 📊 Funcionalidades Técnicas

### **🧠 IA Gemini Integration**
- Análise contextual de times Pokémon
- Respostas em linguagem natural
- Adaptação ao idioma selecionado
- Personalidades temáticas por região

### **⚡ Performance Optimizations**
- Cache inteligente de dados da PokéAPI
- Lazy loading de componentes
- Otimização de imagens com Next.js
- Estados locais para resposta rápida

### **🎨 Design System**
- Sistema de cores consistente
- Componentes modulares e reutilizáveis
- Animações performáticas
- Acessibilidade integrada

## 👨‍💻 Autor

**Lucas Cantarelli Lustosa**

[![GitHub](https://img.shields.io/badge/GitHub-Pokémon_Team_Builder-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/cantalusto/poke-code)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Lucas_Cantarelli-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lucas-cantarelli-lustosa-aab5492ba/)

## 🙏 Agradecimentos

- [PokéAPI](https://pokeapi.co/) - Dados completos da Pokémon
- [Google Gemini](https://ai.google.dev/) - Plataforma de IA generativa
- [Radix UI](https://www.radix-ui.com/) - Componentes acessíveis
- [Tailwind CSS](https://tailwindcss.com/) - Sistema de design

---

**🎉 Capture sua estratégia perfeita!** Desenvolvido com ❤️ para a comunidade Pokémon.