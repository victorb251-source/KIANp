import { BoardStyle, Level, Badge, BadgeRarity, ShopItem } from './types';

export const BOARD_STYLES: BoardStyle[] = [
  BoardStyle.CEBRASPE,
  BoardStyle.FGV,
  BoardStyle.FCC,
  BoardStyle.INEP,
  BoardStyle.FUVEST,
];

// Sound Identifiers for the Synthesizer
export const CORRECT_ANSWER_SOUND_URL = 'success';
export const INCORRECT_ANSWER_SOUND_URL = 'error';
export const CLICK_SOUND_URL = 'click';
export const FLIP_SOUND_URL = 'flip';
export const REWARD_SOUND_URL = 'reward';

// Keep the keys for compatibility, but values are now IDs
export const SOUND_LIBRARY: Record<string, string> = {
    click: 'click',
    success: 'success',
    error: 'error',
    hard: 'hard',
    flip: 'flip',
    reward: 'reward',
    delete: 'delete'
};

// --- GAMIFICATION CONSTANTS ---

export const GAMIFICATION_STORAGE_KEY = 'concurseiroAtivoGamification';
export const FOLDERS_STORAGE_KEY = 'concurseiroAtivoFolders';
export const ERROR_FLASHCARDS_STORAGE_KEY = 'concurseiroAtivoErrorFlashcards';
export const AUDIO_SETTINGS_STORAGE_KEY = 'concurseiroAtivoAudioSettings';
export const DEFAULT_THEME_ID = 'theme-kian-dark';

export const REWARDS = {
    PAGE_COMPLETED: { xp: 5, tokens: 20 }, // When questions are generated
    CORRECT_ANSWER: { xp: 10, tokens: 15 },
    GOAL_COMPLETED: { xp: 50, tokens: 100 },
};

export const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'theme-steampunk',
        name: 'Tema Steampunk',
        description: 'Engrenagens, bronze e vapor. Para o estudioso com um toque de inventor.',
        cost: 1000,
        requiredLevel: 4,
        icon: '⚙️',
    },
    {
        id: 'theme-cyberpunk',
        name: 'Tema Cyberpunk',
        description: 'Luzes de neon, cromo e noites chuvosas. Estude no futuro distópico.',
        cost: 1500,
        requiredLevel: 5,
        icon: '🌃',
    },
    {
        id: 'theme-minimal-light',
        name: 'Minimalista (Claro)',
        description: 'Foco total com cores suaves e design limpo, ideal para longas sessões de leitura.',
        cost: 800,
        requiredLevel: 3,
        icon: '⚪',
    },
    {
        id: 'theme-minimal-dark',
        name: 'Minimalista (Escuro)',
        description: 'Estudo sem distrações na escuridão elegante. Conforto visual para os noturnos.',
        cost: 800,
        requiredLevel: 3,
        icon: '⚫',
    },
    {
        id: 'theme-sakura',
        name: 'Flor de Cerejeira',
        description: 'Um ambiente de estudo com a calma e a beleza delicada das cerejeiras em flor.',
        cost: 1200,
        requiredLevel: 4,
        icon: '🌸',
    },
    {
        id: 'theme-ocean',
        name: 'Oceano Profundo',
        description: 'Mergulhe no conhecimento com tons relaxantes de azul e a tranquilidade do mar.',
        cost: 1200,
        requiredLevel: 4,
        icon: '🌊',
    },
    {
        id: 'theme-jungle',
        name: 'Selva',
        description: 'Desbrave o conhecimento em um ambiente selvagem com tons de verde e terra.',
        cost: 1300,
        requiredLevel: 5,
        icon: '🌴',
    },
    {
        id: 'theme-sunset',
        name: 'Pôr do Sol',
        description: 'Cores quentes e relaxantes para inspirar seus estudos ao entardecer.',
        cost: 1400,
        requiredLevel: 5,
        icon: '🌅',
    },
    {
        id: 'theme-retro-gaming',
        name: '8-Bit Clássico',
        description: 'Estude como se estivesse em um videogame retrô. Que a nostalgia lhe dê poder!',
        cost: 1600,
        requiredLevel: 6,
        icon: '👾',
    },
    {
        id: 'theme-synthwave',
        name: 'Synthwave',
        description: 'Uma vibe neon dos anos 80 para suas sessões de estudo. Aumente o som!',
        cost: 1800,
        requiredLevel: 6,
        icon: '🕶️',
    },
    {
        id: 'theme-matrix',
        name: 'Matrix',
        description: 'Siga o coelho branco. O conhecimento está esperando por você na Matrix.',
        cost: 2000,
        requiredLevel: 7,
        icon: '💻',
    },
    {
        id: 'theme-noir',
        name: 'Detetive Noir',
        description: 'Preto, branco e mistério. Resolva as questões mais difíceis como um detetive.',
        cost: 2000,
        requiredLevel: 7,
        icon: '🕵️‍♂️',
    },
    {
        id: 'theme-pirate',
        name: 'Tesouro Pirata',
        description: 'Navegue pelos mares do conhecimento em busca de tesouros escondidos.',
        cost: 2200,
        requiredLevel: 8,
        icon: '🏴‍☠️',
    },
    {
        id: 'theme-gothic',
        name: 'Gótico',
        description: 'Elegância sombria e foco absoluto para os estudos noturnos mais intensos.',
        cost: 2200,
        requiredLevel: 8,
        icon: '🦇',
    },
    {
        id: 'theme-art-deco',
        name: 'Art Déco',
        description: 'Luxo, ouro e geometria para uma mente sofisticada e organizada.',
        cost: 2500,
        requiredLevel: 9,
        icon: '🏛️',
    },
    {
        id: 'theme-scroll',
        name: 'Pergaminho Antigo',
        description: 'A sabedoria dos séculos em um pergaminho digital. Sinta-se um escriba.',
        cost: 2500,
        requiredLevel: 9,
        icon: '📜',
    },
    {
        id: 'theme-galaxy',
        name: 'Galáxia',
        description: 'Expanda sua mente e estude entre as estrelas, nebulosas e o cosmos.',
        cost: 2800,
        requiredLevel: 10,
        icon: '🚀',
    },
    {
        id: 'theme-volcano',
        name: 'Vulcão',
        description: 'Energia pura com lava, rochas e a força de um vulcão em erupção.',
        cost: 2800,
        requiredLevel: 10,
        icon: '🔥',
    },
    {
        id: 'theme-winter',
        name: 'Inverno Congelante',
        description: 'Foco cristalino e mente afiada com a clareza e a frieza do gelo.',
        cost: 3000,
        requiredLevel: 11,
        icon: '❄️',
    },
    {
        id: 'theme-candy',
        name: 'Doce Pastel',
        description: 'Um toque de doçura e cores suaves para tornar os estudos mais leves e divertidos.',
        cost: 3000,
        requiredLevel: 11,
        icon: '🍭',
    },
    {
        id: 'theme-comic',
        name: 'Gibi',
        description: 'Estude com o poder, a ação e a energia dos seus super-heróis favoritos.',
        cost: 3500,
        requiredLevel: 12,
        icon: '💥',
    },
    {
        id: 'theme-solarized-dark',
        name: 'Solarized Dark',
        description: 'O clássico tema de programação para máximo conforto visual e alta concentração.',
        cost: 4000,
        requiredLevel: 15,
        icon: '☀️',
    },
];


export const LEVELS: Level[] = [
    { name: "Noviço", minXp: 0, icon: "🔰" }, // 0
    { name: "Aprendiz", minXp: 100, icon: "🧠" }, // 1
    { name: "Estudante", minXp: 250, icon: "📚" }, // 2
    { name: "Veterano", minXp: 500, icon: "🧑‍🏫" }, // 3
    { name: "Especialista", minXp: 1000, icon: "💡" }, // 4
    { name: "Mestre", minXp: 2000, icon: "🏆" }, // 5
    { name: "Sábio", minXp: 5000, icon: "🦉" }, // 6
    { name: "Escriba", minXp: 7500, icon: "✍️" }, // 7
    { name: "Erudito", minXp: 10000, icon: "🧐" }, // 8
    { name: "Polímata", minXp: 15000, icon: "🌐" }, // 9
    { name: "Arquimago", minXp: 20000, icon: "🧙‍♂️" }, // 10
    { name: "Oráculo", minXp: 30000, icon: "🔮" }, // 11
    { name: "Titã", minXp: 45000, icon: "⚡" }, // 12
    { name: "Iluminado", minXp: 65000, icon: "✨" }, // 13
    { name: "Ascendido", minXp: 90000, icon: "🌟" }, // 14
    { name: "Divindade", minXp: 120000, icon: "🌌" }, // 15
];

export const BADGES: Badge[] = [
    { id: 'FIRST_STEPS', name: 'Primeiros Passos', description: 'Acertar sua primeira questão.', icon: '👣', rarity: BadgeRarity.Common },
    { id: 'APPRENTICE', name: 'Aprendiz', description: 'Acertar 10 questões.', icon: '📘', rarity: BadgeRarity.Common },
    { id: 'SCHOLAR', name: 'Estudioso', description: 'Acertar 50 questões.', icon: '📚', rarity: BadgeRarity.Rare },
    { id: 'WISE_BEGINNER', name: 'Sábio Iniciante', description: 'Acertar 100 questões.', icon: '🧠', rarity: BadgeRarity.Rare },
    { id: 'MASTER_OF_KNOWLEDGE', name: 'Mestre do Conhecimento', description: 'Acertar 1.000 questões.', icon: '🏆', rarity: BadgeRarity.Epic },
    { id: 'FIRST_TRY_ACE', name: 'Acertador de Primeira', description: 'Acertar 5 questões seguidas na primeira tentativa.', icon: '🎯', rarity: BadgeRarity.Common },
    { id: 'PERFECT_COMBO', name: 'Combo Perfeito', description: 'Acertar 10 questões seguidas.', icon: '💎', rarity: BadgeRarity.Rare },
    { id: 'PRECISION_MASTER', name: 'Mestre da Precisão', description: 'Acertar 50 questões sem errar.', icon: '🎖️', rarity: BadgeRarity.Epic },
    { id: 'LIGHTNING_RESPONSE', name: 'Resposta Relâmpago', description: 'Responder corretamente em menos de 5 segundos.', icon: '⚡', rarity: BadgeRarity.Common },
    { id: 'TURBO_BRAIN', name: 'Cérebro Turbo', description: 'Ter a maior média de acertos do dia.', icon: '🚀', rarity: BadgeRarity.Legendary },
    { id: 'PERFECT_DAY', name: '100% do Dia', description: 'Acertar todas as questões de uma sessão.', icon: '🔥', rarity: BadgeRarity.Epic },
    { id: 'STEADY_STRONG', name: 'Firme e Forte', description: 'Estudar por 3 dias seguidos.', icon: '📆', rarity: BadgeRarity.Common },
    { id: 'NO_FAIL', name: 'Sem Falhar', description: 'Estudar 7 dias seguidos.', icon: '📅', rarity: BadgeRarity.Rare },
    { id: 'MASTER_ROUTINE', name: 'Rotina de Mestre', description: 'Estudar 30 dias seguidos.', icon: '🗓️', rarity: BadgeRarity.Epic },
    { id: 'MENTAL_MARATHONER', name: 'Maratonista Mental', description: 'Estudar 100 dias seguidos.', icon: '🥇', rarity: BadgeRarity.Epic },
    { id: 'YEAR_OF_STUDY', name: '365 Desafios', description: 'Estudar todos os dias por um ano.', icon: '🏅', rarity: BadgeRarity.Epic },
    { id: 'NIGHT_OWL_SESSION', name: 'Desafio da Madrugada', description: 'Responder entre 00h e 05h.', icon: '🌙', rarity: BadgeRarity.Common },
    { id: 'MIDNIGHT_TURN', name: 'Virada do Dia', description: 'Responder na virada da meia-noite.', icon: '⏰', rarity: BadgeRarity.Rare },
    { id: 'LAST_SECOND', name: 'Última Chance', description: 'Acertar no último segundo do tempo limite.', icon: '⌛', rarity: BadgeRarity.Legendary },
    { id: 'HARDCORE_MODE', name: 'Modo Hardcore', description: 'Acertar 20 questões seguidas no nível mais difícil.', icon: '💀', rarity: BadgeRarity.Legendary },
    { id: 'GOLD_HUNTER', name: 'Caçador de Ouro', description: 'Completar todos os desafios semanais.', icon: '🪙', rarity: BadgeRarity.Legendary },
    { id: 'TOP_RANKED', name: 'Primeiro no Ranking', description: 'Alcançar o topo do ranking do dia.', icon: '🥇', rarity: BadgeRarity.Legendary },
    { id: 'RIVAL_HUNTER', name: 'Caçador de Rival', description: 'Ultrapassar um amigo no ranking.', icon: '🥈', rarity: BadgeRarity.Legendary },
    { id: 'KING_OF_THE_MONTH', name: 'Rei do Mês', description: 'Manter-se no top 3 por um mês.', icon: '👑', rarity: BadgeRarity.Legendary },
    { id: 'DUEL_WON', name: 'Duelo Vencido', description: 'Ganhar um desafio contra outro jogador.', icon: '⚔️', rarity: BadgeRarity.Legendary },
    { id: 'LIVING_LEGEND', name: 'Lenda Viva', description: 'Entrar no Hall da Fama.', icon: '🏆', rarity: BadgeRarity.Legendary },
    { id: 'KNOWLEDGE_DETECTIVE', name: 'Detetive do Conhecimento', description: 'Acertar uma questão classificada como muito difícil.', icon: '🕵️', rarity: BadgeRarity.Legendary },
    { id: 'QUESTION_NINJA', name: 'Ninja das Perguntas', description: 'Acertar instantaneamente (em menos de 2s).', icon: '🥷', rarity: BadgeRarity.Rare },
    { id: 'MAD_SCIENTIST', name: 'Cientista Maluco', description: 'Errar 10 vezes seguidas.', icon: '🧪', rarity: BadgeRarity.Rare },
    { id: 'TEACH_YOURSELF', name: 'Professor de Si Mesmo', description: 'Criar uma questão que outros usuários acertaram.', icon: '👨‍🏫', rarity: BadgeRarity.Legendary },
    { id: 'INDESTRUCTIBLE', name: 'Indestrutível', description: 'Acertar todas as questões de uma sessão com mais de 50 perguntas.', icon: '🛡️', rarity: BadgeRarity.Epic },
    { id: 'STAR_HUNTER', name: 'Caçador de Estrelas', description: 'Conquistar 5 emblemas no mesmo dia.', icon: '⭐', rarity: BadgeRarity.Rare },
    { id: 'SUPER_STAR', name: 'Super Estrela', description: 'Conquistar 20 emblemas no total.', icon: '🌟', rarity: BadgeRarity.Epic },
    { id: 'GLORY_COLLECTOR', name: 'Colecionador de Glória', description: 'Conquistar todos os emblemas disponíveis.', icon: '🏵️', rarity: BadgeRarity.Epic },
    { id: 'CHAPTER_EXPLORER', name: 'Explorador de Arquivos', description: 'Ler e criar questões de 10 PDFs diferentes.', icon: '🗺️', rarity: BadgeRarity.Rare },
    { id: 'COMPLETE_LIBRARY', name: 'Biblioteca Completa', description: 'Ler todas as páginas de um livro no app.', icon: '📖', rarity: BadgeRarity.Epic },
    { id: 'ELITE_TRAINER', name: 'Treinador de Elite', description: 'Ajudar outro jogador a melhorar o desempenho.', icon: '🤝', rarity: BadgeRarity.Legendary },
    { id: 'RECORD_BREAKER', name: 'Recorde Quebrado', description: 'Superar seu próprio recorde de acertos em um dia.', icon: '🏹', rarity: BadgeRarity.Rare },
    { id: 'INVINCIBLE', name: 'Invencível', description: '100 acertos consecutivos.', icon: '🔱', rarity: BadgeRarity.Epic },
    { id: 'WISDOM_OWL', name: 'Coruja da Sabedoria', description: 'Estudar após as 22h por 10 dias seguidos.', icon: '🦉', rarity: BadgeRarity.Rare },
    { id: 'EARLY_BIRD', name: 'Madrugador', description: 'Estudar antes das 06h por 10 dias seguidos.', icon: '🌅', rarity: BadgeRarity.Rare },
    { id: 'KNOWLEDGE_FANATIC', name: 'Fanático por Conhecimento', description: 'Passar mais de 4 horas no app no mesmo dia.', icon: '⏳', rarity: BadgeRarity.Epic },
    { id: 'FINAL_SPRINT', name: 'Sprint Final', description: 'Fazer 50 questões nos últimos 30 minutos do dia.', icon: '🏃', rarity: BadgeRarity.Epic },
    { id: 'TREASURE_HUNTER', name: 'Caçador de Tesouros', description: 'Encontrar e responder uma questão secreta.', icon: '🗝️', rarity: BadgeRarity.Legendary },
    { id: 'TOP_STUDENT', name: 'Aluno Nota 10', description: 'Tirar 100% em um teste final.', icon: '🏅', rarity: BadgeRarity.Legendary },
    { id: 'WEEKLY_CHAMPION', name: 'Campeão Semanal', description: 'Ficar no top 3 da semana.', icon: '🏆', rarity: BadgeRarity.Legendary },
    { id: 'MONTHLY_CHAMPION', name: 'Campeão Mensal', description: 'Ficar no top 3 do mês.', icon: '🥇', rarity: BadgeRarity.Legendary },
    { id: 'THE_PERSISTENT', name: 'O Persistente', description: 'Voltar ao app 7 dias após perder a sequência.', icon: '🔄', rarity: BadgeRarity.Rare },
    { id: 'FIRST_LEGEND', name: 'Primeira Lenda', description: 'Ser o primeiro a conquistar um emblema novo.', icon: '🥂', rarity: BadgeRarity.Legendary }
];


// --- PROMPT TEMPLATES ---

export const STUDY_SUGGESTIONS_PROMPT_TEMPLATE = `
<system_instructions>
Você é um tutor pedagógico experiente e empático. Sua especialidade é analisar os erros dos alunos para fornecer um feedback construtivo e personalizado que realmente os ajude a melhorar. Seu tom é encorajador, preciso e prático.
</system_instructions>

<task_instructions>
Analise o array de <incorrect_questions> fornecido. Cada objeto no array representa uma questão que o aluno errou. Ele contém o texto da questão, a resposta errada do aluno, a resposta correta e a justificativa baseada no texto original.

Sua tarefa é gerar um feedback conciso e útil, seguindo estas etapas:
1.  **Identificar o Padrão de Erro:** Analise todas as questões em conjunto. O erro se deve a uma interpretação incorreta de um termo específico? A uma falta de atenção a um detalhe? A um equívoco sobre um concept central?
2.  **Diagnosticar o Conceito-Chave:** Para cada erro (ou para o padrão de erros), identifique o conceito-chave que o aluno não dominou. Seja específico. Por exemplo, em vez de dizer "erro de direito administrativo", diga "equívoco sobre a diferença entre ato vinculado e ato discricionário".
3.  **Fornecer Sugestões Claras e Acionáveis:** Com base no diagnóstico, forneça sugestões de estudo. As sugestões devem ser práticas. Por exemplo:
    - "Para solidificar o conceito de X, tente criar um mapa mental que conecte X a Y e Z."
    - "Note a palavra 'exceto' no enunciado. Sempre que a vir, releia a questão com atenção redobrada para garantir que está respondendo ao que é pedido."
    - "Parece que o conceito de 'prescindível' vs. 'imprescindível' causou confusão. Uma dica é associar 'imprescindível' a 'indispensável'. Que tal criar 2 ou 3 frases usando cada palavra para fixar a diferença?"
4.  **Manter um Tom Positivo:** Encare os erros como oportunidades. Use uma linguagem que motive o aluno a continuar estudando.

**Formato da Saída:**
Gere apenas o texto do feedback, em markdown, sem qualquer formatação JSON ou chaves. Use títulos, listas e negrito para organizar a informação de forma clara. Comece com um título como "### Análise dos Seus Erros e Dicas de Estudo".
</task_instructions>

<incorrect_questions>
{{INCORRECT_QUESTIONS_JSON}}
</incorrect_questions>
`;

export const SIMPLE_EXPLANATION_PROMPT_TEMPLATE = `
<system_instructions>
Você é um especialista em comunicação e um excelente professor. Sua tarefa é ler um texto, que pode ser técnico ou acadêmico, e explicá-lo de forma clara e concisa para um leigo que está vendo o assunto pela primeira vez. O tom deve ser maduro, mas acessível e didático.
</system_instructions>

<task_instructions>
Analise o <source_text> abaixo e resuma os conceitos-chave para um iniciante no assunto.

**Regras Essenciais:**
1.  **Clareza e Simplicidade:** Use uma linguagem direta. Se um termo técnico for essencial, explique-o de forma simples na primeira vez que aparecer.
2.  **Analogias Inteligentes:** Para conceitos complexos, utilize analogias e exemplos do mundo real que facilitem a compreensão e a memorização.
3.  **Foco no Essencial:** Concentre-se nos conceitos fundamentais e na ideia principal do texto. Qual é a mensagem central que um iniciante precisa entender para construir uma base sólida sobre o tema?
4.  **Tom Didático e Maduro:** Mantenha um tom respeitoso e instrutivo. O objetivo é capacitar o leitor com conhecimento, não infantilizá-lo.
5.  **Estrutura Lógica:** Apresente a informação de forma bem estruturada, facilitando o fluxo de leitura e o entendimento.

**Formato da Saída:**
Gere apenas o texto da explicação, sem qualquer formatação JSON ou chaves. Apenas o texto puro.
</task_instructions>

<source_text>
{{PAGE_CONTENT}}
</source_text>
`;

export const MASTER_PROMPT_TEMPLATE = `
<system_instructions>
Você é um especialista em avaliação educacional e um mestre na elaboração de questões para exames de alto impacto no Brasil. Sua tarefa é analisar o texto fornecido e gerar um conjunto de questões no estilo da banca examinadora especificada, seguindo um processo de raciocínio sofisticado e deliberado, inspirado na "Arquitetônica da Confusão". Seu objetivo não é criar "pegadinhas" aleatórias, mas sim testes que medem profundidade de conhecimento, vigilância cognitiva e raciocínio crítico.
</system_instructions>

<board_style_instructions>
{{BOARD_STYLE_INSTRUCTIONS}}
</board_style_instructions>

<general_methodology_instructions>
Para criar questões que efetivamente discriminem candidatos de alta e baixa proficiência, utilize as seguintes técnicas metodológicas:
- **Hierarquia Cognitiva:** Formule questões que exijam diferentes níveis de pensamento (Identificar -> Comparar -> Relacionar -> Inferir -> Propor). Construa distratores (alternativas incorretas) que correspondam a níveis cognitivos inferiores ou a erros conceituais comuns e plausíveis. O candidato deve escolher a *melhor* e *mais completa* resposta, não apenas uma resposta possível.
- **Ancoragem no Texto:** Cada questão, resposta correta e justificação deve ser rigorosamente fundamentada no <source_text>. A 'justification_anchor' deve ser uma citação direta e contínua, não uma paráfrase, que prove inequivocamente a validade da resposta.
- **Profundidade sobre Abrangência:** Em vez de cobrir superficialmente muitos tópicos, priorize a extração de múltiplos conceitos, fatos ou princípios distintos de um mesmo parágrafo denso em informação, se possível. O objetivo é explorar a profundidade do conteúdo.
</general_methodology_instructions>

{{EXISTING_QUESTIONS_SECTION}}

<source_text>
{{PAGE_CONTENT}}
</source_text>

<task_instructions>
Analise o <source_text> e gere um total de {{NUM_QUESTIONS}} questões que sigam estritamente as <board_style_instructions> e a <general_methodology_instructions>.

IMPORTANTE: Se a seção <existing_questions> for fornecida, você DEVE garantir que as novas questões sejam conceitualmente diferentes das existentes. Não repita os mesmos fatos ou abordagens. Explore outras partes do texto ou outros ângulos dos mesmos tópicos.

Siga este Processo de Raciocínio (Cadeia de Pensamento):
1.  **Leitura Estratégica:** Leia o <source_text> para entender os conceitos centrais e identificar os parágrafos ou seções mais densos em informação.
2.  **Identificação de Alvos:** Para CADA uma das {{NUM_QUESTIONS}} questões a serem geradas:
    a. Identifique um conceito, fato, princípio ou nuance testável e significativo que ainda não tenha sido abordado nas <existing_questions>.
    b. **Aplicação da Metodologia da Banca:** Formule o enunciado e as alternativas (se aplicável) aplicando rigorosamente as técnicas descritas nas <board_style_instructions>. A questão deve ser um reflexo autêntico da "personalidade" da banca.
    c. Determine a resposta correta com base no texto.
    d. Localize e extraia a frase ou trecho contínuo e exato do <source_text> que serve como prova direta para a resposta ('justification_anchor'). A precisão aqui é crucial.
3.  **Formatação Final:** Formate a saída como um array JSON contendo {{NUM_QUESTIONS}} objetos. Cada objeto deve seguir o schema definido, contendo as chaves: "question_text", "options" (um objeto JSON se for múltipla escolha, omitido para Certo/Errado), "correct_answer" (a string 'Certo' ou 'Errado' para Cebraspe, ou a letra da alternativa correta para outras bancas), e "justification_anchor".
</task_instructions>
`;

export const FLASHCARD_PROMPT_TEMPLATE = `
<system_instructions>
Você é um assistente de estudos especializado em criar flashcards eficazes para memorização. Sua tarefa é transformar uma questão de concurso complexa e seu contexto em um flashcard simples, direto e conceitual.
</system_instructions>

<context>
A seguir estão uma questão de concurso e o trecho do texto original que justifica a resposta correta.
- **Questão Original:** "{{QUESTION_TEXT}}"
- **Justificativa (Texto Fonte):** "{{JUSTIFICATION_ANCHOR}}"
</context>

<task_instructions>
Baseado no <context>, crie um único flashcard para ajudar um estudante a memorizar o conceito principal. O flashcard deve ter uma frente (uma pergunta direta ou um termo-chave) e um verso (a resposta concisa e clara).

**Regras:**
1.  **Frente (front):** Deve ser uma pergunta curta e direta que capture a essência do tópico. Evite o formato da questão original (múltipla escolha ou Certo/Errado).
2.  **Verso (back):** Deve ser a resposta direta e objetiva para a pergunta da frente, extraída ou resumida da justificativa.
3.  **Conceitual e Sucinto:** O objetivo é a memorização rápida, não um teste complexo.

**Formato da Saída:**
Formate a saída como um único objeto JSON com as chaves "front" e "back".
</task_instructions>
`;

export const BOARD_STYLE_INSTRUCTIONS_MAP: Record<BoardStyle, string> = {
  [BoardStyle.CEBRASPE]: `**Filosofia Central:** Testar precisão, atenção e vigilância cognitiva. Cada item é um teste de alto risco.
**Instrução Crucial:** Ao gerar as questões, busque um equilíbrio entre assertivas com gabarito "Certo" e "Errado". Não favoreça um tipo sobre o outro.
**Formato:** Julgamento Certo/Errado.
**Técnicas de Elaboração:**
1.  **Para assertivas 'Certo':** Crie uma paráfrase fiel e precisa de uma afirmação contida no texto. A assertiva deve ser uma reafirmação correta de um conceito, fato ou regra do texto, mas com uma redação ligeiramente diferente para testar a compreensão, não a memorização pura.
2.  **Para assertivas 'Errado' (Técnicas de Distorção Sutil):**
    a. **Inversão Semântica:** Crie uma assertiva que parece correta, mas é invalidada pela inserção sutil de uma negação ("não", "jamais"), uma exceção ("exceto", "salvo"), ou pela troca de uma palavra-chave por seu antônimo (ex: "imprescindível" por "prescindível").
    b. **Generalização/Restrição Indevida:** Altere um quantificador. Se o texto fala "alguns casos", a assertiva pode generalizar para "todos os casos", ou vice-versa, tornando-a incorreta.
    c. **Sutilezas Gramaticais:** Explore a função lógica da pontuação ou a recategorização de palavras para criar uma interpretação errônea.
3.  **Interdisciplinaridade Densa:** Construa uma única e concisa assertiva que exija a integração de conhecimentos de diferentes áreas para ser julgada corretamente. Esta técnica pode ser usada para criar tanto assertivas 'Certas' quanto 'Erradas'.
**Saída:** A chave 'correct_answer' deve ser a string 'Certo' ou 'Errado'.`,
  [BoardStyle.FGV]: `**Filosofia Central:** Testar resistência cognitiva, raciocínio crítico sob pressão e interpretação de nuances conceituais e sintáticas.
**Formato:** Múltipla Escolha (A-E).
**Técnicas de Elaboração:**
1.  **Enunciado Labiríntico:** Crie um enunciado longo e narrativo (estudo de caso ou situação hipotética) que contenha detalhes contextuais que precisam ser filtrados pelo candidato. A primeira tarefa é separar o "sinal" do "ruído".
2.  **Inversão Sintática com Alteração de Sentido:** Utilize a ordem das palavras como um mecanismo de teste. Exemplo clássico: a diferença semântica entre "grande reportagem" (notável, de qualidade) e "reportagem grande" (extensa, longa).
3.  **Troca de Conceitos por Sinônimos Aparentes:** Use alternativas que trocam conceitos por termos com nuances distintas, testando a precisão lexical. Exemplo: a diferença entre "vários motivos" (quantidade) e "motivos vários" (diversidade).
4.  **Distratores Plausíveis:** As alternativas incorretas devem representar interpretações equivocadas, mas plausíveis, do estudo de caso apresentado no enunciado.
**Saída:** A chave 'correct_answer' deve ser a letra da alternativa correta (A, B, C, D ou E).`,
  [BoardStyle.INEP]: `**Filosofia Central:** Avaliar competências e habilidades, não a simples memorização, usando a Teoria de Resposta ao Item (TRI). Testar o "pensamento hierárquico".
**Formato:** Múltipla Escolha (A-E).
**Técnicas de Elaboração:**
1.  **Situação-Problema:** Apresente um texto-base (que pode incluir textos, gráficos, charges, etc.) que descreva uma situação do mundo real ou um problema prático.
2.  **Comando Baseado em Competência:** O comando da questão deve ser claro e pedir a aplicação de uma competência cognitiva (ex: relacionar informações, inferir objetivos, comparar fenômenos, propor uma solução).
3.  **Distratores Calibrados e Plausíveis:** Os distratores (alternativas incorretas) devem ser altamente plausíveis e baseados em erros conceituais comuns, interpretações parciais ou operações cognitivas de nível inferior. Um distrator pode ser uma afirmação correta, mas que não responde completamente ao comando da questão ou que ignora parte do texto-base. O candidato deve escolher a *melhor* e *mais completa* resposta.
**Saída:** A chave 'correct_answer' deve ser a letra da alternativa correta (A, B, C, D ou E).`,
  [BoardStyle.FUVEST]: `**Filosofia Central:** Fundir um profundo conhecimento de conteúdo ("conteudista") com um rigoroso raciocínio abstrato e interpretativo, espelhando o nível de um debate acadêmico universitário.
**Formato:** Múltipla Escolha (A-E).
**Técnicas de Elaboração:**
1.  **Profundidade Conceitual:** A questão não deve testar um fato isolado, mas sim o princípio teórico subjacente, suas causas, suas implicações ou sua relação com outros conceitos. A exigência de conteúdo é alta.
2.  **Interdisciplinaridade Acadêmica:** Crie questões que conectem conceitos de diferentes disciplinas de forma significativa (ex: História com Sociologia, Biologia com Química, Literatura com Filosofia).
3.  **Temas Abstratos e Filosóficos:** Não hesite em abordar temas mais abstratos ou que exijam uma argumentação complexa para ser resolvidos. A questão deve ter um elevado rigor acadêmico.
4.  **Rigor Interpretativo:** Use textos, gráficos e charges que exijam um alto nível de interpretação, combinando a dificuldade interpretativa com uma carga de conteúdo pesada.
**Saída:** A chave 'correct_answer' deve ser a letra da alternativa correta (A, B, C, D ou E).`,
  [BoardStyle.FCC]: `**Filosofia Central:** Especialista em Elaboração de Questões Estilo FCC (Fundação Carlos Chagas). Mimetize com precisão o estilo, o rigor e a estrutura da "Nova" FCC.
**Formato:** Múltipla Escolha (A-E).
**Diretrizes de Conteúdo:**
1. **Língua Portuguesa:** Foco em sintaxe do período, concordância verbal/nominal complexa, regência e, principalmente, reescrita de frases. As alternativas devem ser longas e sutilmente diferentes entre si, exigindo a identificação da manutenção do sentido e correção gramatical.
2. **Direito/Legislação:** Combine a literalidade da lei (Lei Seca) com jurisprudência consolidada (Súmulas do STF e STJ). Use enunciados que descrevam uma situação hipotética (ex: "Tício, servidor público...") para que o candidato aplique a norma técnica ou legal.
3. **Conhecimentos Técnicos (Medicina/Perícia/Superior):** Utilize casos clínicos, situações-problema ou descrições de vestígios forenses. A questão deve exigir o diagnóstico correto ou a classificação técnica precisa com base na norma técnica.
**Técnicas de Elaboração:**
- **Literalidade Inteligente:** Não basta a memorização do artigo; a questão deve exigir a aplicação do conceito em uma situação narrada.
- **Pegadinhas de Precisão:** Troque termos técnicos por sinônimos que alteram levemente o sentido jurídico ou científico.
- **Extensão Uniforme:** As alternativas devem ter extensões similares para evitar eliminação por tamanho.
- **Enunciado:** Objetivo, mas contextualizado.
**Tom de Voz:** Formal, técnico, jurídico e acadêmico.
**Saída:** A chave 'correct_answer' deve ser a letra da alternativa correta (A, B, C, D ou E).`,
};