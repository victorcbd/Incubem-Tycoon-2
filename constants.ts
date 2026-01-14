
import { BuildingType, TaskRuleOption } from './types';

// Costs to build level 1 (Now Free as per request)
export const BUILD_COSTS: Record<BuildingType, { coins: number }> = {
  [BuildingType.RESIDENTIAL]: { coins: 0 },
  [BuildingType.SQUAD_HQ]: { coins: 0 },
  [BuildingType.TRIBAL_CENTER]: { coins: 0 },
  [BuildingType.DECORATION]: { coins: 0 },
  // Organizational Functions
  [BuildingType.GOVERNANCE]: { coins: 0 },
  [BuildingType.PEOPLE]: { coins: 0 },
  [BuildingType.PRODUCT]: { coins: 0 },
  [BuildingType.MARKET]: { coins: 0 },
  [BuildingType.RESOURCES]: { coins: 0 },
};

export const BUILDING_METADATA: Record<string, { title: string; description: string; functions: string[] }> = {
    [BuildingType.TRIBAL_CENTER]: {
        title: "Centro OCCA",
        description: "O coração estratégico e cultural da Tribo OCCA. Centro de acolhimento e gestão mestre.",
        functions: ["Dashboard Board", "Mentoria IA", "OCCA Academy"]
    },
    [BuildingType.GOVERNANCE]: {
        title: "Governança OCCA",
        description: "Garante integridade, direção institucional, conformidade e integridade da guilda.",
        functions: ["Gestão OCCA", "Compliance", "Jurídico"]
    },
    [BuildingType.PEOPLE]: {
        title: "Pessoas & Cultura OCCA",
        description: "Desenvolvimento humano e ambiente colaborativo da tribo.",
        functions: ["Talentos", "Comunidade", "Cultura"]
    },
    [BuildingType.PRODUCT]: {
        title: "Inovação & Produto",
        description: "Laboratório de soluções OCCA, pesquisa e novos desenvolvimentos.",
        functions: ["Design", "Prototipagem", "Laboratório"]
    },
    [BuildingType.MARKET]: {
        title: "Relacionamento OCCA",
        description: "Comunicação, expansão e conexão com o ecossistema externo.",
        functions: ["Marketing", "Vendas", "Networking"]
    },
    [BuildingType.RESOURCES]: {
        title: "Infra & Recursos",
        description: "Suporte logístico, financeiro e tecnológico para as squads.",
        functions: ["Financeiro", "Logística", "TI"]
    }
};

// Procedural Palette Phases
export const STYLES = {
  RUSTIC: { // Levels 1-3
    walls: 0x8B4513, 
    roof: 0xA0522D, 
    accent: 0xDEB887, 
    window: 0x87CEEB, 
  },
  MODERN: { // Levels 4-6
    walls: 0xE0E0E0, 
    roof: 0x708090, 
    accent: 0x4682B4, 
    window: 0xADD8E6, 
  },
  CYBERPUNK: { // Levels 7+
    walls: 0x2F4F4F, 
    roof: 0x483D8B, 
    accent: 0x00FF7F, 
    window: 0xFF00FF, 
  },
};

export const getBuildingSize = (level: number, type?: BuildingType): number => {
  if (type === BuildingType.TRIBAL_CENTER) return 3; // 3x3 Tile Size
  if (type === BuildingType.SQUAD_HQ) return 2; // Squad HQs are always larger base
  if (level >= 7) return 3; 
  if (level >= 4) return 2; 
  return 1; 
};

// New base cost for upgrades since construction is free
const BASE_UPGRADE_COST = 50; 

export const getUpgradeCost = (level: number, type: BuildingType) => {
  // Use a fixed base cost for calculations now that build cost is 0
  const multiplier = Math.pow(1.6, level);
  return {
    coins: Math.floor(BASE_UPGRADE_COST * multiplier),
  };
};

export const calculateIncome = (type: BuildingType, level: number) => {
  // No passive income anymore
  return 0;
};

// --- INCUBEM PROGRESSION CONSTANTS ---

export const FIBONACCI_SIZES = [1, 2, 3, 5, 8, 13, 21, 34, 55];

export const COMPLEXITY_LABELS = {
  1: 'Simples (x1)',
  2: 'Moderado (x2)',
  3: 'Complexo (x3)'
};

export const TASK_RULES: TaskRuleOption[] = [
    { label: 'Integrada (I)', value: 'INTEGRATED', multiplier: 1 },
    { label: 'Negociada (N)', value: 'NEGOTIATED', multiplier: 1 },
    { label: 'Fixa (F)', value: 'FIXED', multiplier: 1 },
];

export const RULE_DESCRIPTIONS: Record<string, string> = {
  INTEGRATED: "Integradas (I): todos os membros recebem o mesmo PA. Bons para ocasião que precisa de muita gente envolvida.",
  NEGOTIATED: "Negociadas (N): PA dividido conforme acordo entre participantes. Bom para missões específicas que envolvem uma ou um grupo pequeno de pessoas.",
  FIXED: "Fixas (F): tarefas rotineiras com valor pré-definido.",
};

export const AIM_OPTIONS = [
  { value: 0, label: 'Nulo/Prejudicial', multiplier: 0 },
  { value: 1, label: 'Básico', multiplier: 1.0 },
  { value: 2, label: 'Relevante', multiplier: 1.5 },
  { value: 3, label: 'Destaque/Inspiração', multiplier: 2.0 },
];

export const XP_PER_LEVEL_BASE = 1000;
export const calculateNextLevelXP = (currentLevel: number) => {
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(1.5, currentLevel - 1));
};

export const getReputationStars = (rep: number): number => {
  if (rep >= 4.6) return 5;
  if (rep >= 3.6) return 4;
  if (rep >= 2.6) return 3;
  if (rep >= 1.6) return 2;
  return 1;
};

// Max PA Capacity per Building Level
export const BUILDING_PA_LIMITS: Record<number, number> = {
  1: 100,
  2: 200,
  3: 400,
  4: 700,
  5: 1200,
  6: 2000,
  7: 3300,
  8: 5400,
  9: 8800,
  10: 14300,
  // Fallback for higher levels
  11: 20000,
  12: 30000
};
