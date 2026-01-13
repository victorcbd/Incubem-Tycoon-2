
export enum BuildingType {
  RESIDENTIAL = 'RESIDENTIAL', // Now acts as Player Home / HQ
  SQUAD_HQ = 'SQUAD_HQ',        // Squad Central
  TRIBAL_CENTER = 'TRIBAL_CENTER', // New Guild Hub
  DECORATION = 'DECORATION',
  
  // New Organizational Functions
  GOVERNANCE = 'GOVERNANCE',
  PEOPLE = 'PEOPLE',
  PRODUCT = 'PRODUCT',
  MARKET = 'MARKET',
  RESOURCES = 'RESOURCES'
}

export interface GridPosition {
  x: number;
  z: number;
}

export type KanbanStatus = 'BACKLOG' | 'TODO' | 'DOING' | 'BLOCKED' | 'REVIEW' | 'DONE';

export type TaskSize = 1 | 2 | 3 | 5 | 8 | 13 | 21 | 34 | 55;
export type TaskComplexity = 1 | 2 | 3;

export interface TaskRuleOption {
    label: string;
    value: string;
    multiplier: number;
}

export type FixedTimeType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface TaskHistoryEntry {
  timestamp: number;
  aim: number;
  xp: number;
  coins: number;
  participants: string[];
  feedback?: string;
  sprint: number;
}

export interface Squad {
  id: string;
  name: string;
  color: string;
  description?: string;
  xp?: number;
  level?: number;
}

export interface User {
  id: string;
  name: string;
  color: string; // Hex color for avatar/marker
  avatar?: string;
  squadId: string; // Users belong to a squad
  cpf?: string; // Used for authentication
  role?: string; // 'Mentor Júnior' | 'Executor' | 'Master'
}

export interface KanbanTask {
  id: string;
  content: string;
  status: KanbanStatus;
  createdAt: number;
  
  // Ownership/Assignment
  creatorId: string;
  assigneeId?: string; // Who is doing this task?
  squadId: string; // Task belongs to a specific squad context

  // Incubem Stats
  size: TaskSize;
  complexity: TaskComplexity;
  ruleMultiplier: number; 
  ruleLabel: string;
  ruleValue: string; // 'INTEGRATED' | 'NEGOTIATED' | 'FIXED' etc

  // Fixed Task Options
  fixedTimeType?: FixedTimeType;
  fixedQuantity?: number; // Legacy, kept for compatibility if needed
  
  // New Limiters
  fixedQuantityLimit?: number; 
  fixedQuantityCount?: number; 
  fixedDeadline?: number; // Timestamp

  // History & Routine
  history?: TaskHistoryEntry[];

  // Extended Details
  description?: string;
  participants?: string[]; // IDs of users involved
  
  // Negotiation Logic
  customPaDistribution?: Record<string, number>; // { userId: paAmount }

  // Evidence
  evidenceLink?: string;
  deliveryNotes?: string;
  reflections?: string;

  // Evaluation / Results
  aim?: number;
  feedback?: string;
  finalPA?: number;
  finalXP?: number;
  finalCoins?: number;

  // Sprint Logic
  sprintHistory?: string[]; // List of Sprints this task has participated in ["Sprint 1", "Sprint 2"]
}

export interface BuildingData {
  id: string;
  ownerId: string; // The user who owns this building (Project Owner or Home Owner)
  type: BuildingType;
  level: number;
  position: GridPosition;
  isPlaced: boolean; 
  lastCollected?: number;
  tasks: KanbanTask[]; 
  squadId?: string; // If type is SQUAD_HQ, this links to the squad
}

export interface PlayerProfile {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalPA: number;
  reputation: number;
  streak: number;
}

export interface Resources {
  coins: number;
}

// --- MARKET TYPES ---

export interface MarketItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    stock: number;
    category: string;
    imageUrl?: string;
    isActive: boolean;
}

export interface PurchaseRecord {
    id: string;
    itemId: string;
    userId: string;
    userName: string; // Snapshot
    itemName: string; // Snapshot
    itemCost: number; // Snapshot
    timestamp: number;
    status: 'PENDING' | 'VALIDATED' | 'CANCELLED';
}

// --- MENTOR INCUBEM TYPES ---

export interface DailyAnalysis {
  status: 'PRODUTIVO' | 'REGULAR' | 'ATENCAO';
  summary: string;
  consistencyCheck: string;
  riskDetected: boolean;
  riskDetails: string;
  advice: string;
  tags: string[];
}

export interface DailyEntry {
  id: string;
  userId: string;
  squadId: string;
  memberName: string; // Captured at time of entry
  role: string; // Captured at time of entry
  date: string; // YYYY-MM-DD
  yesterday: string;
  today: string;
  blockers: string;
  analysis?: DailyAnalysis;
  timestamp: number;
}

export interface FeedbackAnalysis {
  emotionalTone: string;
  sentimentScore: number;
  strengths: string[];
  gaps: string[];
  relationshipHealth: 'SAUDAVEL' | 'EM_RISCO' | 'PRECISA_AJUSTE';
  recommendations: string[];
}

export interface FeedbackEntry {
  id: string;
  squadId: string;
  sourceUserId: string; // Who wrote it
  targetUserId: string; // Who is it about
  sprint: number;
  relationship: 'MENTOR_TO_EXECUTOR' | 'EXECUTOR_TO_MENTOR' | 'SELF';
  
  // 360 Questions
  q_comm?: string;
  q_empathy?: string;
  q_collab?: string;
  q_conflict?: string;

  // Self Questions
  q_strengths?: string;
  q_weaknesses?: string;
  q_impact?: string;
  q_development?: string;

  analysis?: FeedbackAnalysis;
  timestamp: number;
}

// --- ACADEMY TYPES ---

export interface AcademyGap {
    id: string;
    skill: string;
    severity: number; // 0-20
    urgency: 'CRÍTICO' | 'ALTO' | 'MÉDIO';
    evidence: string[];
    affectedMembers: string[];
    recommendedLevel: 'Iniciante' | 'Intermediário' | 'Avançado';
    timestamp: number;
}

export interface AcademyVideo {
    id: string;
    title: string;
    channel: string;
    description: string;
    duration: string; // "12min"
    thumbnailUrl?: string; // Mock or real
    videoUrl: string; // YouTube link
    
    // AI Analysis
    relevanceScore: number; // 0-10
    qualityScore: number; // 0-10
    audienceFit: number; // 0-10
    recommendation: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'NÃO_RECOMENDADO';
    reasoning: string;

    status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
}

export interface LearningTrack {
    id: string;
    gapId: string;
    title: string;
    description: string;
    urgency: 'CRÍTICO' | 'ALTO' | 'MÉDIO';
    videos: AcademyVideo[];
    createdAt: number;
    publishedAt?: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    
    // Stats
    totalViews: number;
    completions: number;
    impactScore?: number; // Calculated later
}

export interface UserTrackProgress {
    userId: string;
    trackId: string;
    videosWatched: string[]; // video IDs
    completed: boolean;
    lastAccess: number;
}


export interface GameState {
  currentUser: User | null;
  users: User[]; // Mock list of other users in the session
  squads: Squad[]; // List of available squads
  player: PlayerProfile;
  resources: Resources;
  buildings: BuildingData[];
  selectedBuildingId: string | null;
  sprintCycle: number; // Current Sprint Number (1, 2, 3...)
  sprintStartDate: number; // Timestamp for when the sprint started
  dailies?: DailyEntry[];
  feedbacks?: FeedbackEntry[];
  academyTracks?: LearningTrack[]; // Global list of tracks
}

export const GRID_SIZE = 20;
export const TILE_SIZE = 2;
