
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameScene from './components/GameScene';
import { GameState, BuildingType, BuildingData, GridPosition, Resources, GRID_SIZE, KanbanStatus, KanbanTask, TaskSize, TaskComplexity, User, PlayerProfile, TaskRuleOption, Squad, FixedTimeType, TaskHistoryEntry } from './types';
import { getUpgradeCost, BUILD_COSTS, getBuildingSize, FIBONACCI_SIZES, COMPLEXITY_LABELS, AIM_OPTIONS, calculateNextLevelXP, getReputationStars, TASK_RULES, RULE_DESCRIPTIONS, BUILDING_PA_LIMITS, BUILDING_METADATA } from './constants';
import { Coins, Box, Hammer, ArrowBigUp, AlertTriangle, Trash2, Move, X, Plus, ClipboardList, BarChart3, GripVertical, Star, Target, CheckCircle2, UserCheck, LogIn, Home, Users, Briefcase, FileText, MessageSquare, Award, Link as LinkIcon, Save, Filter, Shield, Lock, Calculator, Database, Activity, CalendarClock, FastForward, ZoomIn, ZoomOut, Check, Menu, FilePlus, Layout, Crosshair, Settings, LogOut, ChevronDown, TrendingUp, Info, RefreshCcw, Clock, Zap, Crown, AlertCircle, Landmark, GraduationCap, Calendar, Repeat, History, CalendarDays, ShoppingBag, Package } from 'lucide-react';
import MentorContainer from './components/mentor/MentorContainer';
import AcademyContainer from './components/academy/AcademyContainer';
import MarketContainer from './components/market/MarketContainer';
import WarehouseView from './components/base/WarehouseView';

const INITIAL_RESOURCES: Resources = { coins: 0 };

// --- REAL DATA SETUP ---

const REAL_SQUADS: Squad[] = [
    { id: 'sq_board', name: 'Board', color: '#ffffff', description: 'Alta Gestão' }, // White/Master
    { id: 'sq_osc', name: 'OCCA Social Club', color: '#ef4444', description: 'Bem-vindos ao OSC' }, // Red
    { id: 'sq_academy', name: 'OCCA Academy', color: '#3b82f6', description: 'vamos juntos construir novos futuros com o aprendizado' }, // Blue
    { id: 'sq_occasulo', name: 'OCCAsulo', color: '#d946ef', description: 'Transformando iniciativas' }, // Fuchsia
];

const REAL_USERS: User[] = [
    // MASTER USER
    { id: 'u_senior', name: 'Senior', squadId: 'sq_board', role: 'Master', cpf: '000.000.000-00', color: '#ffffff' },

    // OSC
    { id: 'u_14130055437', name: 'Vitoria Lira', squadId: 'sq_board', role: 'Mentor Júnior', cpf: '000.000.000-00', color: '#ef4444' },
    { id: 'u_07406180594', name: 'Luiz Guilherme', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_14900059439', name: 'Alice', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_12854473442', name: 'Camila', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_12379195412', name: 'Breno', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_16781484400', name: 'Gabriel Ferraz', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_71774671492', name: 'Rafael Cavalvanti', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_16817509459', name: 'Julia Moura', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_15067051469', name: 'Gabriel Vinicius', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_14634956411', name: 'Davi Andany', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_15671040450', name: 'Laish Rodrigues', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_15333194483', name: 'Evelin', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5'},
    { id: 'u_12688925482', name: 'Caio Cesar', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5'},
    { id: 'u_12854659465', name: 'Moises Carlos', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_11280537485', name: 'Gizelly', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    { id: 'u_11363982443', name: 'Grazielly', squadId: 'sq_osc', role: 'Executor', cpf: '000.000.000-00', color: '#fca5a5' },
    
];

// INITIAL BUILDINGS (Pre-built Squad HQs)
const INITIAL_BUILDINGS: BuildingData[] = [
    // TRIBAL CENTER (Center of Map) - 3x3 at 8,8 covers 8,9,10
    { id: 'b_tribal_center', ownerId: 'u_senior', squadId: 'sq_board', type: BuildingType.TRIBAL_CENTER, level: 1, position: { x: 8, z: 8 }, isPlaced: true, tasks: [] },
    //OCCA Social Club HQ (Red)
    { id: 'b_osc_hq', ownerId: 'u_senior', squadId: 'sq_osc', type: BuildingType.SQUAD_HQ, level: 1, position: { x: 4, z: 4 }, isPlaced: true, tasks: [] },
    // Geração Conectada HQ (Blue)
    { id: 'b_academy_hq', ownerId: 'u_senior', squadId: 'sq_academy', type: BuildingType.SQUAD_HQ, level: 1, position: { x: 16, z: 4 }, isPlaced: true, tasks: [] },
    // Made in Belo Jardim HQ (Fuchsia)
    { id: 'b_madein_hq', ownerId: 'u_senior', squadId: 'sq_occasulo', type: BuildingType.SQUAD_HQ, level: 1, position: { x: 4, z: 16 }, isPlaced: true, tasks: [] },
    //Luiz Guilherme Casa
    { id: 'b_luiz_hq', ownerId: 'u_07406180594', squadId: 'sq_osc', type: BuildingType.RESIDENTIAL, level: 1, position: { x: 1, z: 2}, isPlaced: true, tasks: [] }
    { id: 'b_alice_hq', ownerId: 'u_14900059439', squadId: 'sq_osc', type: BuildingType.RESIDENTIAL, level: 1, position: { x: 3, z: 2}, isPlaced: true, tasks: [] }
];


const KANBAN_COLUMNS: { id: KanbanStatus; label: string; color: string }[] = [
  { id: 'BACKLOG', label: 'Backlog', color: 'bg-slate-700' },
  { id: 'TODO', label: 'A Fazer', color: 'bg-blue-900/50' },
  { id: 'DOING', label: 'Fazendo', color: 'bg-yellow-900/50' },
  { id: 'BLOCKED', label: 'Bloqueado', color: 'bg-red-900/50' },
  { id: 'REVIEW', label: 'Para Revisão', color: 'bg-purple-900/50' },
  { id: 'DONE', label: 'Concluído', color: 'bg-green-900/50' },
];

const SWIMLANES: { id: string; label: string; rule: string; color: string; icon: any }[] = [
    { id: 'lane_integrated', label: 'Integradas (I)', rule: 'INTEGRATED', color: 'text-blue-400', icon: Users },
    { id: 'lane_negotiated', label: 'Negociadas (N)', rule: 'NEGOTIATED', color: 'text-purple-400', icon: Briefcase },
    { id: 'lane_fixed', label: 'Fixas (F)', rule: 'FIXED', color: 'text-orange-400', icon: RefreshCcw },
];

const SQUAD_COLORS = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#84cc16', // Lime
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#d946ef', // Fuchsia
    '#f43f5e', // Rose
];

// Helper to calculate PA of a single task
const calculateTaskPA = (task: Partial<KanbanTask>): number => {
    if (task.status === 'DONE' && task.finalPA) return task.finalPA;
    return Math.floor((task.size || 0) * (task.complexity || 1) * (task.ruleMultiplier || 1));
};

const SPRINT_DURATION_DAYS = 14;

interface ToastNotification {
    message: string;
    type: 'success' | 'error' | 'info';
    id: number;
}

export default function App() {
  // Login State
  const [loginStep, setLoginStep] = useState<'CREDENTIALS' | 'SQUAD'>('CREDENTIALS');
  const [loginName, setLoginName] = useState('');
  const [loginCpf, setLoginCpf] = useState('');
  
  const [gameState, setGameState] = useState<GameState>({
    currentUser: null,
    users: REAL_USERS,
    squads: REAL_SQUADS, 
    player: {
      level: 1,
      currentXP: 0,
      nextLevelXP: 1000,
      totalPA: 0,
      reputation: 3.0,
      streak: 0
    },
    resources: INITIAL_RESOURCES,
    buildings: INITIAL_BUILDINGS,
    selectedBuildingId: null,
    sprintCycle: 1,
    sprintStartDate: Date.now()
  });
  
  const [buildMode, setBuildMode] = useState<BuildingType | null>(null);
  const [targetBuildSquadId, setTargetBuildSquadId] = useState<string | null>(null); 
  
  const [moveModeId, setMoveModeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'KANBAN' | 'MENTOR' | 'ACADEMY' | 'MARKET' | 'WAREHOUSE'>('OVERVIEW');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [showBuildingSelectModal, setShowBuildingSelectModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSquadSelectorModal, setShowSquadSelectorModal] = useState(false); 

  const [dashboardTimeFilter, setDashboardTimeFilter] = useState<'ALL' | number>('ALL');

  // Unified Task Modal State
  const [editingTask, setEditingTask] = useState<{buildingId: string, task: KanbanTask} | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskModalTab, setTaskModalTab] = useState<1 | 2 | 3 | 4 | 5>(1); 

  // Limit Renewal Logic
  const [renewalPrompt, setRenewalPrompt] = useState<{buildingId: string, taskId: string, type: 'QUANTITY' | 'TIME'} | null>(null);

  const [pendingSquadPosition, setPendingSquadPosition] = useState<GridPosition | null>(null);
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadColor, setNewSquadColor] = useState(SQUAD_COLORS[0]);

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Notifications
  const [notification, setNotification] = useState<ToastNotification | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setNotification({ message, type, id: Date.now() });
      // Auto dismiss
      setTimeout(() => {
          setNotification(prev => prev && prev.message === message ? null : prev);
      }, 3000);
  };

  const isMaster = gameState.currentUser?.role === 'Master';

  // --- LOGIC: FIRST TIME HOME PLACEMENT ---
  useEffect(() => {
    if (gameState.currentUser && !isMaster) {
      const myHouse = gameState.buildings.find(
        b => b.type === BuildingType.RESIDENTIAL && b.ownerId === gameState.currentUser?.id
      );
      if (!myHouse && !buildMode && !gameState.selectedBuildingId && !pendingSquadPosition) {
        setBuildMode(BuildingType.RESIDENTIAL);
      }
    }
  }, [gameState.currentUser, gameState.buildings, buildMode, pendingSquadPosition, isMaster]);

  // --- LOGIN FLOW ---
  const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!loginName.trim() || !loginCpf.trim()) {
          showToast("Preencha Nome e CPF.", "error");
          return;
      }

      // Verify Credentials
      const foundUser = REAL_USERS.find(u => 
          u.name.toLowerCase() === loginName.trim().toLowerCase() && 
          u.cpf === loginCpf.trim()
      );

      if (foundUser) {
          setGameState(prev => ({
              ...prev,
              currentUser: foundUser,
              // RESET COINS TO 0 for NON-MASTER on Login
              resources: foundUser.role === 'Master' ? { coins: 15000 } : { coins: 1200 /* Debug: Start with some coins */ }
          }));
          showToast(`Bem-vindo de volta, ${foundUser.name}!`, "success");
      } else {
          showToast("Usuário não encontrado ou CPF incorreto.", "error");
      }
  };

  const handleLogout = () => {
      window.location.reload();
  };

  const isAreaOccupied = useCallback((startPos: GridPosition, size: number, excludeBuildingId?: string) => {
    if (startPos.x < 0 || startPos.z < 0 || startPos.x + size > GRID_SIZE || startPos.z + size > GRID_SIZE) return true;
    return gameState.buildings.some(b => {
      if (b.id === excludeBuildingId) return false;
      const bSize = getBuildingSize(b.level, b.type);
      const xOverlap = (startPos.x < b.position.x + bSize) && (startPos.x + size > b.position.x);
      const zOverlap = (startPos.z < b.position.z + bSize) && (startPos.z + size > b.position.z);
      return xOverlap && zOverlap;
    });
  }, [gameState.buildings]);

  const handleTileClick = (pos: GridPosition) => {
    if (!gameState.currentUser) return;
    
    // MOVE MODE
    if (moveModeId) {
       const building = gameState.buildings.find(b => b.id === moveModeId);
       if (!building) { setMoveModeId(null); return; }
       const size = getBuildingSize(building.level, building.type);
       if (isAreaOccupied(pos, size, moveModeId)) {
         showToast("Espaço ocupado! Não é possível mover para cá.", "error");
         return;
       }
       setGameState(prev => ({
         ...prev,
         buildings: prev.buildings.map(b => b.id === moveModeId ? { ...b, position: pos } : b),
         selectedBuildingId: null
       }));
       setMoveModeId(null);
       showToast("Construção movida com sucesso!", "success");
       return;
    }

    // BUILD MODE
    if (buildMode) {
      const myHouse = gameState.buildings.find(b => b.type === BuildingType.RESIDENTIAL && b.ownerId === gameState.currentUser?.id);
      const isFirstHouse = buildMode === BuildingType.RESIDENTIAL && !myHouse;
      const cost = isFirstHouse || isMaster ? { coins: 0 } : BUILD_COSTS[buildMode];
      
      if (buildMode === BuildingType.RESIDENTIAL && myHouse && !isFirstHouse && !isMaster) {
        showToast("Você só pode ter uma Casa (HQ)!", "error");
        setBuildMode(null);
        return;
      }

      if (buildMode === BuildingType.SQUAD_HQ) {
          if (isAreaOccupied(pos, 2)) {
              showToast("Espaço ocupado!", "error");
              return;
          }
          const isFree = gameState.currentUser.squadId === 'temp_pending';
          if (!isFree && !isMaster && gameState.resources.coins < cost.coins) {
              showToast("Moedas insuficientes!", "error");
              return;
          }
          setPendingSquadPosition(pos);
          setBuildMode(null); 
          return;
      }
      
      const squadId = targetBuildSquadId || gameState.currentUser.squadId;

      // Check if squad already has this organizational building type (Master Override blocked here, but Master creates tasks differently usually. Let's allow Master to build duplicates if they want or stick to rules. Sticking to rules for structure, but Coins bypassed)
      if (buildMode !== BuildingType.RESIDENTIAL && buildMode !== BuildingType.DECORATION) {
          const existingBuilding = gameState.buildings.find(b => b.type === buildMode && b.squadId === squadId);
          if (existingBuilding && !isMaster) {
              showToast("Sua Squad já possui esta construção! Apenas uma por tipo é permitida.", "error");
              setBuildMode(null);
              return;
          }
      }

      if (gameState.resources.coins >= cost.coins) {
        if (isAreaOccupied(pos, 1)) {
            showToast("Espaço ocupado!", "error");
            return;
        }

        const newBuilding: BuildingData = {
          id: Math.random().toString(36).substr(2, 9),
          ownerId: gameState.currentUser.id,
          type: buildMode,
          level: 1,
          position: pos,
          isPlaced: true,
          lastCollected: Date.now(),
          tasks: [],
          squadId: squadId 
        };
        setGameState(prev => ({
          ...prev,
          resources: { coins: prev.resources.coins - cost.coins },
          buildings: [...prev.buildings, newBuilding],
          selectedBuildingId: null
        }));
        setBuildMode(null);
        setTargetBuildSquadId(null);
        showToast("Construção realizada com sucesso!", "success");
      } else {
        showToast("Moedas insuficientes!", "error");
        setBuildMode(null);
      }
    } else {
      setGameState(prev => ({ ...prev, selectedBuildingId: null }));
    }
  };

  const confirmCreateSquad = () => {
    if (!newSquadName.trim() || !pendingSquadPosition || !gameState.currentUser) return;
    
    const isOnboarding = gameState.currentUser.squadId === 'temp_pending';
    const cost = (isOnboarding || isMaster) ? 0 : BUILD_COSTS[BuildingType.SQUAD_HQ].coins;
    
    if (gameState.resources.coins < cost) return;

    const newSquadId = 'sq_' + Date.now();
    const newSquad: Squad = {
        id: newSquadId,
        name: newSquadName,
        color: newSquadColor
    };

    const newBuilding: BuildingData = {
        id: 'b_' + Math.random().toString(36).substr(2, 9),
        ownerId: gameState.currentUser.id,
        type: BuildingType.SQUAD_HQ,
        level: 1,
        position: pendingSquadPosition,
        isPlaced: true,
        lastCollected: Date.now(),
        tasks: [],
        squadId: newSquadId 
    };

    setGameState(prev => {
        const updatedUser = isOnboarding 
            ? { ...prev.currentUser!, squadId: newSquadId } 
            : prev.currentUser!;
            
        return {
            ...prev,
            currentUser: updatedUser,
            resources: { coins: prev.resources.coins - cost },
            buildings: [...prev.buildings, newBuilding],
            squads: [...prev.squads, newSquad],
            selectedBuildingId: null
        };
    });
    
    setPendingSquadPosition(null);
    setNewSquadName('');
    showToast(`Squad ${newSquadName} fundada com sucesso!`, 'success');
  };

  const cancelCreateSquad = () => {
      setPendingSquadPosition(null);
      setNewSquadName('');
  }

  const updateSquad = (squadId: string, updates: Partial<Squad>) => {
      setGameState(prev => ({
          ...prev,
          squads: prev.squads.map(s => s.id === squadId ? { ...s, ...updates } : s)
      }));
  };

  const handleBuildingClick = (id: string) => {
    if (buildMode || moveModeId) return;
    setGameState(prev => ({ ...prev, selectedBuildingId: id }));
    setActiveTab('OVERVIEW');
  };

  const upgradeSelected = () => {
    const b = gameState.buildings.find(b => b.id === gameState.selectedBuildingId);
    if (!b) return;
    if (b.ownerId !== gameState.currentUser?.id && !isMaster) return;

    const nextSize = getBuildingSize(b.level + 1, b.type);
    if (nextSize > getBuildingSize(b.level, b.type)) {
        if (isAreaOccupied(b.position, nextSize, b.id)) {
            showToast("Sem espaço para expansão!", "error");
            return;
        }
    }
    const cost = getUpgradeCost(b.level, b.type);
    if (gameState.resources.coins >= cost.coins || isMaster) {
      setGameState(prev => ({
        ...prev,
        resources: { coins: prev.resources.coins - (isMaster ? 0 : cost.coins) },
        buildings: prev.buildings.map(building => building.id === b.id ? { ...building, level: building.level + 1 } : building)
      }));
      showToast("Construção evoluída!", "success");
    } else {
        showToast("Moedas insuficientes!", "error");
    }
  };

  const deleteSelected = () => {
    const b = gameState.buildings.find(b => b.id === gameState.selectedBuildingId);
    if (!b) return;
    if (b.ownerId !== gameState.currentUser?.id && !isMaster) return;
    
    if (b.type === BuildingType.RESIDENTIAL && !isMaster) {
        showToast("Você não pode demolir sua base principal!", "error");
        return;
    }
    if (!window.confirm("Tem certeza? Você receberá 50% das moedas investidas.")) return;
    const baseCost = BUILD_COSTS[b.type];
    setGameState(prev => ({
      ...prev,
      resources: { coins: prev.resources.coins + Math.floor(baseCost.coins * 0.5) },
      buildings: prev.buildings.filter(build => build.id !== b.id),
      selectedBuildingId: null
    }));
    showToast("Construção demolida.", "info");
  };

  const handleGoToBase = () => {
      if (!gameState.currentUser) return;
      const myBase = gameState.buildings.find(b => b.type === BuildingType.RESIDENTIAL && b.ownerId === gameState.currentUser?.id);
      if (myBase) {
          setGameState(prev => ({ ...prev, selectedBuildingId: myBase.id }));
          setActiveTab('OVERVIEW');
      } else {
          showToast("Você ainda não tem uma base!", "error");
      }
  };

  const handleGoToSquad = () => {
      if (!gameState.currentUser) return;
      const mySquadHQ = gameState.buildings.find(b => b.type === BuildingType.SQUAD_HQ && b.squadId === gameState.currentUser?.squadId);
      if (mySquadHQ) {
          setGameState(prev => ({ ...prev, selectedBuildingId: mySquadHQ.id }));
          setActiveTab('OVERVIEW');
      } else {
          showToast("Sua Squad ainda não tem um QG construído!", "error");
      }
  };

  // --- TASK MANAGEMENT: UNIFIED MODAL LOGIC ---

  const handleOpenCreateTask = (preselectedBuildingId?: string) => {
      if (!gameState.currentUser) return;

      // Restriction: Block creating tasks in Squad HQ if no other projects exist
      if (gameState.selectedBuildingId && !preselectedBuildingId) {
          const currentBuilding = gameState.buildings.find(b => b.id === gameState.selectedBuildingId);
          if (currentBuilding && currentBuilding.type === BuildingType.SQUAD_HQ) {
              const squadProjects = gameState.buildings.filter(b => 
                  b.squadId === currentBuilding.squadId && 
                  b.type !== BuildingType.SQUAD_HQ && 
                  b.type !== BuildingType.RESIDENTIAL
              );
              
              if (squadProjects.length === 0) {
                  showToast("Crie um Projeto (Construção) antes de criar tarefas na Squad HQ.", "error");
                  return;
              }
          }
      }
      
      // Determine context
      let initialSquadId = gameState.currentUser.squadId;
      let initialBuildingId = preselectedBuildingId || "";

      // If opening from inside a building, lock context
      if (gameState.selectedBuildingId && !preselectedBuildingId) {
          const b = gameState.buildings.find(b => b.id === gameState.selectedBuildingId);
          if (b) {
              initialSquadId = b.squadId || gameState.currentUser.squadId;
              initialBuildingId = b.id;
          }
      }

      // If passed specific ID (from Kanban "+")
      if (preselectedBuildingId) {
          const b = gameState.buildings.find(b => b.id === preselectedBuildingId);
          if (b) initialSquadId = b.squadId || gameState.currentUser.squadId;
      }

      // FIX: Ensure initial building is a valid functional project (Not HQ, Not Base)
      // If the context was HQ or Base, reset to empty so validation blocks saving and forces selection
      if (initialBuildingId) {
         const b = gameState.buildings.find(b => b.id === initialBuildingId);
         if (b && (b.type === BuildingType.SQUAD_HQ || b.type === BuildingType.RESIDENTIAL)) {
             initialBuildingId = "";
         }
      }

      // Draft Task
      const draftTask: KanbanTask = {
        id: Math.random().toString(36).substr(2, 9),
        content: "",
        status: 'BACKLOG',
        createdAt: Date.now(),
        creatorId: gameState.currentUser.id,
        assigneeId: gameState.currentUser.id,
        squadId: initialSquadId,
        size: 1,
        complexity: 1,
        ruleMultiplier: 1,
        ruleLabel: 'Integrada (I)',
        ruleValue: 'INTEGRATED',
        participants: [gameState.currentUser.id],
        customPaDistribution: {},
        sprintHistory: [],
        history: []
      };

      setIsCreatingTask(true);
      setEditingTask({ buildingId: initialBuildingId, task: draftTask });
      setTaskModalTab(1);
      setIsMainMenuOpen(false);
  };

  const handleSaveNewTask = () => {
      if (!editingTask || !gameState.currentUser) return;
      
      if (!editingTask.task.content.trim()) {
          showToast("A tarefa precisa de um título/descrição.", "error");
          return;
      }
      if (!editingTask.buildingId) {
          showToast("Selecione um projeto/construção para vincular esta tarefa.", "error");
          return;
      }
      
      // Add to global state
      setGameState(prev => ({
          ...prev,
          buildings: prev.buildings.map(b => 
              b.id === editingTask.buildingId 
              ? { ...b, tasks: [...b.tasks, editingTask.task] } 
              : b
          )
      }));

      // Close
      setEditingTask(null);
      setIsCreatingTask(false);
      showToast("Tarefa criada com sucesso!", "success");
  };

  // Wrapper for updating draft OR global state
  const handleTaskFieldUpdate = (updates: Partial<KanbanTask>, newBuildingId?: string) => {
      if (!editingTask) return;

      if (isCreatingTask) {
          // Update draft state only
          setEditingTask(prev => {
              if (!prev) return null;
              return {
                  buildingId: newBuildingId !== undefined ? newBuildingId : prev.buildingId,
                  task: { ...prev.task, ...updates }
              };
          });
      } else {
          // Update global state immediately (Editing Mode)
          updateTask(editingTask.buildingId, editingTask.task.id, updates);
      }
  };

  const updateTask = (buildingId: string, taskId: string, updates: Partial<KanbanTask>) => {
    setGameState(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === buildingId 
        ? { ...b, tasks: b.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }
        : b
      )
    }));
    // Sync local state if currently open (to avoid flickering)
    if (editingTask && editingTask.task.id === taskId && !isCreatingTask) {
        setEditingTask(prev => prev ? { ...prev, task: { ...prev.task, ...updates } } : null);
    }
  };

  const moveTask = (e: React.MouseEvent | null, task: KanbanTask, targetCol: KanbanStatus, buildingId: string) => {
    if (e) e.stopPropagation();
    const currentSprintName = `Sprint ${gameState.sprintCycle}`;
    let newSprintHistory = task.sprintHistory || [];
    if (task.status === 'BACKLOG' && targetCol !== 'BACKLOG') {
        if (!newSprintHistory.includes(currentSprintName)) {
            newSprintHistory = [...newSprintHistory, currentSprintName];
        }
    }
    updateTask(buildingId, task.id, { 
        status: targetCol,
        sprintHistory: newSprintHistory
    });
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, targetCol: KanbanStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId || !gameState.selectedBuildingId) return;

    // Use statsTasks (displayTasks) logic to find the task in current view
    // Note: displayTasks depends on render scope, so we look up in global building state for safety
    // Simplified: Look in the currently selected building context.
    
    // Find building containing task (might not be selectedBuilding if viewing HQ aggregate)
    let targetBuildingId = gameState.selectedBuildingId;
    let foundTask: KanbanTask | undefined;

    // First check selected building
    const selectedB = gameState.buildings.find(b => b.id === gameState.selectedBuildingId);
    foundTask = selectedB?.tasks.find(t => t.id === taskId);
    
    // If aggregate view (HQ or House), we might need to search all buildings
    if (!foundTask) {
        for (const b of gameState.buildings) {
            const t = b.tasks.find(task => task.id === taskId);
            if (t) {
                foundTask = t;
                targetBuildingId = b.id;
                break;
            }
        }
    }

    if (foundTask && foundTask.status !== targetCol) {
        moveTask(null, foundTask, targetCol, targetBuildingId);
    }
    setDraggedTaskId(null);
  };

  const confirmGrading = () => {
    if (!editingTask || !gameState.currentUser) return;
    const { buildingId, task } = editingTask;

    const building = gameState.buildings.find(b => b.id === buildingId);
    if (!building) return;

    // Calculate current Conclusion PA INCLUDING HISTORY for limit check
    const ConclusionPAWithHistory = building.tasks.reduce((acc, t) => {
        const currentDone = t.status === 'DONE' ? (t.finalPA || 0) : 0;
        const historySum = (t.history || []).reduce((hAcc, hEntry) => hAcc + hEntry.coins, 0);
        return acc + currentDone + historySum;
    }, 0);

    const paLimit = BUILDING_PA_LIMITS[building.level] || 99999;
    
    let totalTaskPA = Math.floor(task.size * task.complexity * task.ruleMultiplier);
    
    if (ConclusionPAWithHistory + totalTaskPA > paLimit) {
        showToast(`Capacidade de armazenamento atingida! (${ConclusionPAWithHistory}/${paLimit} PA)`, "error");
        return;
    }

    const aimValue = task.aim !== undefined ? task.aim : 1;
    const aimOption = AIM_OPTIONS.find(o => o.value === aimValue);
    const aimMultiplier = aimOption?.multiplier || 0;
    
    const participants = task.participants && task.participants.length > 0 ? task.participants : [gameState.currentUser.id];
    const isParticipating = participants.includes(gameState.currentUser!.id);
    
    let myBasePA = 0;
    if (task.ruleValue === 'NEGOTIATED') {
        myBasePA = task.customPaDistribution?.[gameState.currentUser!.id] || 0;
    } else {
        myBasePA = totalTaskPA;
    }
    
    const myFinalPA = Math.floor(myBasePA * aimMultiplier);
    const myCoins = myFinalPA;
    const myXP = myFinalPA * 10;

    // Routine History Entry
    const historyEntry: TaskHistoryEntry = {
        timestamp: Date.now(),
        aim: aimValue,
        xp: myXP,
        coins: myCoins,
        participants: [...participants],
        feedback: task.feedback,
        sprint: gameState.sprintCycle
    };

    setGameState(prev => {
        let playerUpdate = { ...prev.player };
        let resourcesUpdate = { ...prev.resources };
        
        if (isParticipating) {
            const newTotalPA = prev.player.totalPA + myFinalPA;
            let newXP = prev.player.currentXP + myXP;
            let newLevel = prev.player.level;
            let newNextLevelXP = prev.player.nextLevelXP;

            while (newXP >= newNextLevelXP) {
                newXP -= newNextLevelXP;
                newLevel++;
                newNextLevelXP = calculateNextLevelXP(newLevel);
            }
            const aimToStars = aimValue === 0 ? 1 : aimValue === 1 ? 3 : aimValue === 2 ? 4 : 5;
            const newRep = prev.player.reputation * 0.95 + aimToStars * 0.05;

            playerUpdate = {
                ...prev.player,
                level: newLevel,
                currentXP: newXP,
                nextLevelXP: newNextLevelXP,
                totalPA: newTotalPA,
                reputation: newRep,
            };
            resourcesUpdate = {
                coins: prev.resources.coins + myCoins
            };
        }

        let isLimitTriggered = false;
        let limitType: 'QUANTITY' | 'TIME' = 'QUANTITY';

        return {
            ...prev,
            player: playerUpdate,
            resources: resourcesUpdate,
            buildings: prev.buildings.map(b => {
                if (b.id === buildingId) {
                    return {
                        ...b,
                        tasks: b.tasks.map(t => {
                            if (t.id === task.id) {
                                const isFixed = t.ruleValue === 'FIXED';
                                
                                // Increment count if it's a fixed task
                                const newCount = isFixed ? (t.fixedQuantityCount || 0) + 1 : 0;
                                
                                // Check Limits
                                let limitReached = false;
                                if (isFixed) {
                                    // Check Quantity Limit
                                    if (t.fixedQuantityLimit && newCount >= t.fixedQuantityLimit) {
                                        limitReached = true;
                                        limitType = 'QUANTITY';
                                    }
                                    // Check Deadline Limit
                                    if (t.fixedDeadline && Date.now() >= t.fixedDeadline) {
                                        limitReached = true;
                                        limitType = 'TIME';
                                    }
                                }

                                if (limitReached) {
                                    isLimitTriggered = true;
                                    setRenewalPrompt({ buildingId, taskId: t.id, type: limitType });
                                }

                                const nextStatus: KanbanStatus = (isFixed && !limitReached) ? 'BACKLOG' : 'DONE';
                                
                                return { 
                                    ...t, 
                                    status: nextStatus, 
                                    aim: aimValue,
                                    finalPA: myFinalPA, 
                                    finalXP: myXP,
                                    finalCoins: myCoins,
                                    fixedQuantityCount: newCount,
                                    history: [...(t.history || []), historyEntry],
                                    // Reset ephemeral fields if routine and not yet finished permanently
                                    ...((isFixed && !limitReached) ? {
                                        aim: undefined,
                                        feedback: undefined,
                                        evidenceLink: undefined,
                                        deliveryNotes: undefined,
                                        reflections: undefined,
                                        finalPA: undefined,
                                        finalXP: undefined,
                                        finalCoins: undefined
                                    } : {})
                                };
                            }
                            return t;
                        })
                    };
                }
                return b;
            })
        };
    });
    setEditingTask(null);
    showToast(task.ruleValue === 'FIXED' ? "Ciclo de rotina concluído!" : "Avaliação concluída!", "success");
  };

  const handleRenewal = (renew: boolean) => {
      if (!renewalPrompt) return;
      const { buildingId, taskId, type } = renewalPrompt;
      
      setGameState(prev => ({
          ...prev,
          buildings: prev.buildings.map(b => {
              if (b.id === buildingId) {
                  return {
                      ...b,
                      tasks: b.tasks.map(t => {
                          if (t.id === taskId) {
                              if (renew) {
                                  // Reset count or extend deadline to some default (e.g., +1 week)
                                  return { 
                                      ...t, 
                                      status: 'BACKLOG',
                                      fixedQuantityCount: 0,
                                      fixedDeadline: type === 'TIME' ? Date.now() + (7 * 24 * 60 * 60 * 1000) : t.fixedDeadline,
                                      // Clear ephemeral fields
                                      aim: undefined,
                                      feedback: undefined,
                                      evidenceLink: undefined,
                                      deliveryNotes: undefined,
                                      reflections: undefined,
                                      finalPA: undefined,
                                      finalXP: undefined,
                                      finalCoins: undefined
                                  };
                              }
                              return { ...t, status: 'DONE' };
                          }
                          return t;
                      })
                  };
              }
              return b;
          })
      }));

      setRenewalPrompt(null);
      showToast(renew ? "Tarefa renovada e movida para o Backlog!" : "Tarefa finalizada permanentemente.", "info");
  };

  const renderSprintChart = (sprintData: Record<number, { pa: number, complexityAvg: number, aimAvg: number }>, maxSprint: number) => {
      const height = 150;
      const width = 400;
      const padding = 20;
      
      const sprints = Object.keys(sprintData).map(Number).sort((a,b) => a-b);
      if (sprints.length < 1) return <div className="text-xs text-slate-500 text-center py-10">Sem dados suficientes para gráfico</div>;

      const maxPA = Math.max(...Object.values(sprintData).map(d => d.pa), 10);
      
      const getX = (sprint: number) => padding + ((sprint - 1) / Math.max(1, maxSprint - 1)) * (width - 2 * padding);
      const getY_PA = (val: number) => height - padding - (val / maxPA) * (height - 2 * padding);
      const getY_Scale = (val: number) => height - padding - (val / 3) * (height - 2 * padding);

      const linePA = sprints.map((s, i) => `${i===0?'M':'L'} ${getX(s)} ${getY_PA(sprintData[s].pa)}`).join(' ');
      const lineComp = sprints.map((s, i) => `${i===0?'M':'L'} ${getX(s)} ${getY_Scale(sprintData[s].complexityAvg)}`).join(' ');
      const lineAIM = sprints.map((s, i) => `${i===0?'M':'L'} ${getX(s)} ${getY_Scale(sprintData[s].aimAvg)}`).join(' ');

      return (
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
              <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#475569" strokeWidth="1"/>
              <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#475569" strokeWidth="1"/>
              <path d={linePA} fill="none" stroke="#22c55e" strokeWidth="2" />
              <path d={lineComp} fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="4"/>
              <path d={lineAIM} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="2"/>
              {sprints.map(s => (
                  <g key={s}>
                      <circle cx={getX(s)} cy={getY_PA(sprintData[s].pa)} r="3" fill="#22c55e" />
                      <circle cx={getX(s)} cy={getY_Scale(sprintData[s].complexityAvg)} r="3" fill="#eab308" />
                      <circle cx={getX(s)} cy={getY_Scale(sprintData[s].aimAvg)} r="3" fill="#a855f7" />
                  </g>
              ))}
          </svg>
      );
  };

  const selectedBuilding = gameState.buildings.find(b => b.id === gameState.selectedBuildingId);
  const isOwner = selectedBuilding?.ownerId === gameState.currentUser?.id;
  const isMyHouse = selectedBuilding?.type === BuildingType.RESIDENTIAL && isOwner;
  const isSquadHQ = selectedBuilding?.type === BuildingType.SQUAD_HQ;
  const isTribalCenter = selectedBuilding?.type === BuildingType.TRIBAL_CENTER;
  const stars = getReputationStars(gameState.player.reputation);
  const buildingSquad = selectedBuilding ? gameState.squads.find(s => s.id === selectedBuilding.squadId) : null;

  // Calculate days remaining
  const daysElapsed = Math.floor((Date.now() - gameState.sprintStartDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, SPRINT_DURATION_DAYS - daysElapsed);

  // Helper to get building specific tasks
  let displayTasks = selectedBuilding?.tasks || [];
  
  if (isMyHouse) {
      const allMyTasks: (KanbanTask & { originalBuildingId: string })[] = [];
      gameState.buildings.forEach(b => {
          if (b.type !== BuildingType.RESIDENTIAL) {
              b.tasks.forEach(t => {
                  if (t.participants?.includes(gameState.currentUser!.id) || t.creatorId === gameState.currentUser?.id) {
                      allMyTasks.push({ ...t, originalBuildingId: b.id });
                  }
              });
          }
      });
      displayTasks = allMyTasks;
  } else if (isSquadHQ && selectedBuilding.squadId) {
      const allSquadTasks: (KanbanTask & { originalBuildingId: string })[] = [];
      const targetSquad = selectedBuilding.squadId;
      gameState.buildings.forEach(b => {
          b.tasks.forEach(t => {
             if (t.squadId === targetSquad) {
                 allSquadTasks.push({ ...t, originalBuildingId: b.id });
             }
          });
      });
      displayTasks = allSquadTasks;
  }

  const statsTasks = (isMyHouse || isSquadHQ) ? displayTasks : (selectedBuilding?.tasks || []);
  
  // FIX: REFINED PA CALCULATIONS FOR PROGRESS BAR
  const plannedPA = statsTasks
    .filter(t => t.status !== 'DONE')
    .reduce((acc, t) => acc + calculateTaskPA(t), 0);

  const concludedPA = statsTasks.reduce((acc, t) => {
      // Sum points from currently DONE tasks
      const currentDone = t.status === 'DONE' ? (t.finalPA || 0) : 0;
      // Sum points from all history cycles (Crucial for routines that went back to BACKLOG)
      const historySum = (t.history || []).reduce((hAcc, hEntry) => hAcc + hEntry.coins, 0);
      return acc + currentDone + historySum;
  }, 0);

  const paLimit = selectedBuilding ? (BUILDING_PA_LIMITS[selectedBuilding.level] || 99999) : 0;
  const concludedPercent = Math.min(100, (concludedPA / paLimit) * 100);

  const currentSquadFilter = gameState.squads.find(s => s.id === gameState.currentUser?.squadId);

  // Calculate Squad Stats for Dashboard
  let squadStats = {
      plannedPA: 0,
      completedPA: 0,
      totalXP: 0,
      reputation: 0,
      level: 1,
      currentXPInLevel: 0,
      nextLevelThreshold: 1000,
      xpProgress: 0
  };

  if (isSquadHQ && selectedBuilding.squadId) {
      // Filter tasks based on dashboardTimeFilter
      const filteredTasks = displayTasks.filter(t => {
          if (dashboardTimeFilter === 'ALL' || t.sprintHistory?.includes(`Sprint ${dashboardTimeFilter}`)) {
              return true;
          }
          return false;
      });

      const doneFiltered = filteredTasks.filter(t => t.status === 'DONE');
      const plannedFiltered = filteredTasks.filter(t => t.status !== 'DONE');
      
      squadStats.plannedPA = plannedFiltered.reduce((acc, t) => acc + calculateTaskPA(t), 0);
      squadStats.completedPA = concludedPA; // Using our corrected concludedPA
      
      // XP and Level (Calculated from ALL TIME mostly, but we can display filtered stats)
      squadStats.totalXP = displayTasks.reduce((acc, t) => {
          const currentXP = t.status === 'DONE' ? (t.finalXP || 0) : 0;
          const historyXP = (t.history || []).reduce((hAcc, he) => hAcc + he.xp, 0);
          return acc + currentXP + historyXP;
      }, 0);
      
      // Squad Level Formula logic
      let level = 1;
      let xpAccumulator = 0;
      let nextLevelXP = 2000; // Base Squad XP req
      
      while (squadStats.totalXP >= (xpAccumulator + nextLevelXP)) {
          xpAccumulator += nextLevelXP;
          level++;
          nextLevelXP = Math.floor(2000 * Math.pow(1.5, level - 1));
      }
      
      squadStats.level = level;
      squadStats.currentXPInLevel = squadStats.totalXP - xpAccumulator;
      squadStats.nextLevelThreshold = nextLevelXP;
      squadStats.xpProgress = (squadStats.currentXPInLevel / squadStats.nextLevelThreshold) * 100;


      // Reputation (Avg AIM)
      const ratedTasksCount = displayTasks.reduce((acc, t) => {
          let count = t.status === 'DONE' && t.aim !== undefined ? 1 : 0;
          count += (t.history || []).length;
          return acc + count;
      }, 0);
      
      const ratedTasksSum = displayTasks.reduce((acc, t) => {
          let sum = t.status === 'DONE' && t.aim !== undefined ? (t.aim || 0) : 0;
          sum += (t.history || []).reduce((hAcc, he) => hAcc + he.aim, 0);
          return acc + sum;
      }, 0);

      squadStats.reputation = ratedTasksCount > 0 ? ratedTasksSum / ratedTasksCount : 0;
  }

  function LocalTrophyIcon({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
  }

  if (!gameState.currentUser) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border-2 border-slate-600 w-full max-w-md relative z-10">
          <div className="flex justify-center mb-6">
             <div className="w-20 h-20 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-3 shadow-lg">
                <Box size={40} className="text-white" />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-white text-center mb-2 pixel-font">Incubem Tycoon</h1>
          
          <form onSubmit={handleLoginSubmit} className="space-y-4 mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <label className="text-xs uppercase font-bold text-slate-400">Nome (Primeiro Nome)</label>
                <input 
                    type="text" 
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Ana"
                />
            </div>
            <div>
                <label className="text-xs uppercase font-bold text-slate-400">CPF (Senha)</label>
                <input 
                    type="text" 
                    value={loginCpf}
                    onChange={(e) => setLoginCpf(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="000.000.000-00"
                />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 mt-2">
                <LogIn size={20} /> ENTRAR
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-gray-900 overflow-hidden text-slate-200 font-sans">
      <div className="absolute inset-0 z-0">
        <GameScene 
            gameState={gameState} 
            zoomLevel={zoomLevel}
            onTileClick={handleTileClick} 
            onBuildingClick={handleBuildingClick} 
        />
      </div>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right fade-in duration-300 pointer-events-none">
            <div className={`
                flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-l-4 min-w-[300px]
                ${notification.type === 'success' ? 'bg-slate-800 border-green-500 text-white' : ''}
                ${notification.type === 'error' ? 'bg-slate-800 border-red-500 text-white' : ''}
                ${notification.type === 'info' ? 'bg-slate-800 border-blue-500 text-white' : ''}
            `}>
                <div className={`p-2 rounded-full 
                    ${notification.type === 'success' ? 'bg-green-500/20 text-green-400' : ''}
                    ${notification.type === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                    ${notification.type === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
                `}>
                    {notification.type === 'success' && <CheckCircle2 size={20} />}
                    {notification.type === 'error' && <AlertTriangle size={20} />}
                    {notification.type === 'info' && <Info size={20} />}
                </div>
                <div>
                    <div className="font-bold text-sm uppercase mb-0.5 opacity-80">
                        {notification.type === 'success' ? 'Sucesso' : notification.type === 'error' ? 'Atenção' : 'Info'}
                    </div>
                    <div className="font-medium text-sm">{notification.message}</div>
                </div>
            </div>
        </div>
      )}

      {/* RENEWAL PROMPT MODAL */}
      {renewalPrompt && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
            <div className="bg-slate-800 border-2 border-orange-500 rounded-xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-orange-500">
                    {renewalPrompt.type === 'QUANTITY' ? <Repeat size={32} className="text-orange-400"/> : <CalendarDays size={32} className="text-orange-400"/>}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Limite de Rotina Atingido!</h3>
                <p className="text-slate-400 mb-8">
                    {renewalPrompt.type === 'QUANTITY' 
                        ? "Esta tarefa atingiu o número máximo de execuções planejadas. Deseja adicionar mais ciclos?" 
                        : "O prazo final planejado para esta rotina expirou. Deseja atualizar o deadline?"}
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => handleRenewal(true)}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={20}/> Sim, Renovação Imediata
                    </button>
                    <button 
                        onClick={() => handleRenewal(false)}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 rounded-xl"
                    >
                        Não, Finalizar Tarefa
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ZOOM CONTROLS */}
      <div className="absolute bottom-32 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
          <button onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))} className="bg-slate-800 p-2 rounded-full border border-slate-600 text-white hover:bg-slate-700 shadow-lg">
              <ZoomIn size={24} />
          </button>
          <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} className="bg-slate-800 p-2 rounded-full border border-slate-600 text-white hover:bg-slate-700 shadow-lg">
              <ZoomOut size={24} />
          </button>
      </div>

      {/* MOVE MODE BANNER */}
      {moveModeId && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-6 py-2 rounded-full shadow-xl font-bold animate-pulse z-30 flex items-center gap-2 pointer-events-none">
              <Move size={20}/> MODO DE MOVIMENTAÇÃO ATIVO - CLIQUE NO CHÃO PARA POSICIONAR
          </div>
      )}

      {/* BUILD MODE BANNER */}
      {buildMode && !moveModeId && (
          <div className={`absolute top-24 left-1/2 transform -translate-x-1/2 text-white px-6 py-2 rounded-full shadow-xl font-bold animate-pulse z-30 flex items-center gap-2 pointer-events-none ${buildMode === BuildingType.SQUAD_HQ ? 'bg-red-600' : 'bg-green-600'}`}>
              <Hammer size={20}/> CONSTRUINDO: {BUILDING_METADATA[buildMode]?.title || buildMode.replace('_', ' ')} - CLIQUE NO CHÃO
          </div>
      )}

      {/* HUD CONTAINER - POINTER EVENTS NONE TO ALLOW CLICKING THROUGH */}
      <div className="absolute top-0 left-0 w-full pointer-events-none z-10 flex flex-col items-center md:block">
        
        {/* RESPONSIVE HEADER ROW (Mobile: Flex, Desktop: Block/Absolute) */}
        <div className="w-full flex justify-between items-center p-2 md:p-0 relative">
            
            {/* TOP LEFT: PROFILE */}
            <div className="pointer-events-auto relative md:absolute md:top-4 md:left-4 z-50">
                <div className="relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="bg-slate-900/90 border-2 border-slate-600 rounded-full p-1 pr-4 shadow-xl backdrop-blur-md flex items-center gap-2 md:gap-3 hover:border-indigo-500 transition-colors scale-90 origin-top-left md:scale-100"
                    >
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-600 border-2 border-slate-700 flex items-center justify-center text-sm md:text-lg font-bold text-white uppercase shadow-inner">
                            {gameState.currentUser.name.substring(0,2)}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[8px] md:text-[10px] uppercase font-bold text-slate-400">Nível</span>
                            <span className="text-lg md:text-xl font-bold text-white leading-none">{gameState.player.level}</span>
                        </div>
                        <ChevronDown size={16} className={`text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showProfileMenu && (
                        <div className="absolute top-14 left-0 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-2 w-56 animate-in slide-in-from-top-2 fade-in duration-200">
                            <button 
                                onClick={() => { setShowSquadSelectorModal(true); setShowProfileMenu(false); }}
                                className="w-full text-left p-3 hover:bg-slate-700 rounded-lg flex items-center gap-3 text-sm font-bold text-slate-300"
                            >
                                <RefreshCcw size={18} /> Trocar Squad
                            </button>
                            <div className="h-px bg-slate-700 my-1"></div>
                            <button onClick={handleLogout} className="w-full text-left p-3 hover:bg-red-900/30 rounded-lg flex items-center gap-3 text-sm font-bold text-red-400">
                                <LogOut size={18} /> Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* TOP CENTER: SPRINT (Renovated Style) - Mobile: Static Center, Desktop: Absolute Center */}
            <div className="pointer-events-auto md:absolute md:top-4 md:left-1/2 md:transform md:-translate-x-1/2 z-30 flex justify-center">
                 <div className="bg-slate-900/90 border-2 border-slate-600 rounded-full py-1.5 px-4 md:py-2 md:px-6 shadow-xl backdrop-blur-md flex items-center gap-3 scale-90 md:scale-100">
                     <div className="flex flex-col items-center">
                         <span className="text-[9px] md:text-[10px] font-bold text-pink-400 uppercase tracking-widest leading-none">Sprint {gameState.sprintCycle}</span>
                         <div className="flex items-center gap-2 mt-0.5">
                             <Clock size={14} className="text-slate-300 md:w-4 md:h-4"/>
                             <span className="text-sm md:text-lg font-bold text-white leading-none">{daysRemaining} dias</span>
                         </div>
                     </div>
                 </div>
            </div>

            {/* TOP RIGHT: COINS (Renovated Style) */}
            <div className="pointer-events-auto relative md:absolute md:top-4 md:right-4 z-40">
                 <div className="bg-slate-900/90 border-2 border-slate-600 rounded-full py-1 px-4 md:py-2 md:px-6 shadow-xl backdrop-blur-md flex items-center gap-2 md:gap-3 h-10 md:h-[60px] scale-90 origin-top-right md:scale-100">
                    <div className="bg-yellow-500 p-1 md:p-1.5 rounded-full shadow-inner">
                        <Coins size={16} className="text-white md:w-5 md:h-5" />
                    </div>
                    <div className="text-yellow-400 font-mono font-bold text-lg md:text-xl">{gameState.resources.coins.toLocaleString()}</div>
                </div>
            </div>

        </div>

      </div>

      {/* NEW CENTRAL FLOATING MENU */}
      {!selectedBuilding && !buildMode && !moveModeId && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex items-end gap-6 pointer-events-auto">
              <button 
                  onClick={handleGoToBase}
                  className="flex flex-col items-center gap-1 group transition-all hover:-translate-y-1"
              >
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-lg group-hover:bg-slate-700 group-hover:border-indigo-500">
                      <Home size={20} className="text-indigo-400"/>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase bg-slate-900/80 px-2 rounded backdrop-blur-sm">Minha Base</span>
              </button>

              <div className="relative flex flex-col items-center gap-1">
                  {isMainMenuOpen && (
                      <div className="absolute bottom-16 flex flex-col gap-3 items-center mb-2 w-max">
                          <button 
                              onClick={() => handleOpenCreateTask(undefined)}
                              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-full shadow-xl transition-all animate-in slide-in-from-bottom-2 fade-in duration-200 border-2 border-white/20"
                          >
                              <FilePlus size={20} />
                              <span className="font-bold text-sm">Criar Task</span>
                          </button>

                          <button 
                              onClick={() => { 
                                  setBuildMode(BuildingType.SQUAD_HQ); 
                                  setIsMainMenuOpen(false); 
                                  showToast("Modo de Fundação de Squad Ativo: Clique no mapa para iniciar o QG.", "info");
                              }}
                              className="flex items-center gap-3 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full shadow-lg transition-all animate-in slide-in-from-bottom-6 fade-in duration-300 delay-100 border border-slate-600"
                          >
                              <Shield size={18} />
                              <span className="font-bold text-xs uppercase">Criar Squad</span>
                          </button>
                      </div>
                  )}

                  <button 
                      onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 ${isMainMenuOpen ? 'bg-slate-700 rotate-45' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                  >
                      <Plus size={32} className="text-white"/>
                  </button>
                  <span className="text-[10px] font-bold text-white uppercase bg-slate-900/80 px-2 rounded backdrop-blur-sm">Criar</span>
              </div>

              <button 
                  onClick={handleGoToSquad}
                  className="flex flex-col items-center gap-1 group transition-all hover:-translate-y-1"
              >
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-lg group-hover:bg-slate-700 group-hover:border-pink-500">
                      <Shield size={20} className="text-pink-400"/>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase bg-slate-900/80 px-2 rounded backdrop-blur-sm">Minha Squad</span>
              </button>

          </div>
      )}

      {/* SQUAD SELECTOR MODAL */}
      {showSquadSelectorModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pointer-events-auto">
               <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-600 w-full max-md animate-in zoom-in-95">
                   <div className="flex justify-between items-center mb-4">
                       <h2 className="text-xl font-bold text-white">Migrar de Squad</h2>
                       <button onClick={() => setShowSquadSelectorModal(false)}><X /></button>
                   </div>
                   <p className="text-sm text-slate-400 mb-4">Escolha uma nova Squad para se aliar. Seus dados serão mantidos.</p>
                   <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                     {gameState.squads.map(s => (
                         <button 
                            key={s.id}
                            onClick={() => {}}
                            disabled={true} 
                            className={`w-full p-4 rounded-lg text-left flex justify-between items-center transition-colors border opacity-50 cursor-not-allowed ${gameState.currentUser?.squadId === s.id ? 'bg-indigo-900/50 border-indigo-500' : 'bg-slate-700 border-slate-600'}`}
                         >
                             <span className="font-bold text-white">{s.name}</span>
                             {gameState.currentUser?.squadId === s.id && <Check size={16} className="text-indigo-400"/>}
                         </button>
                     ))}
                   </div>
                   <p className="text-xs text-red-400 mt-2 text-center">Mudança de squad bloqueada nesta versão.</p>
               </div>
          </div>
      )}

      {/* NEW SQUAD CREATION MODAL */}
      {pendingSquadPosition && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 pointer-events-auto">
              <div className="bg-slate-800 border-2 border-red-500 rounded-xl shadow-2xl w-full max-w-md p-6">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-red-600 p-3 rounded-lg"><Shield size={24} className="text-white"/></div>
                      <div>
                          <h2 className="text-xl font-bold text-white">Fundar Nova Squad</h2>
                          <p className="text-sm text-slate-400">Estabeleça um QG para sua nova equipe.</p>
                      </div>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome da Squad</label>
                          <input 
                              type="text" 
                              value={newSquadName}
                              onChange={(e) => setNewSquadName(e.target.value)}
                              placeholder="Ex: Squad Omega"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                              autoFocus
                          />
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cor da Squad</label>
                        <div className="flex flex-wrap gap-2">
                            {SQUAD_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setNewSquadColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${newSquadColor === color ? 'border-white scale-110 ring-2 ring-indigo-500' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                      
                      <div className="bg-slate-900 p-3 rounded border border-slate-700 flex justify-between items-center">
                          <span className="text-sm text-slate-400">Custo de Fundação</span>
                          <span className="text-yellow-400 font-bold flex items-center gap-1"><Coins size={14}/> {gameState.currentUser?.squadId === 'temp_pending' ? 'GRÁTIS' : BUILD_COSTS[BuildingType.SQUAD_HQ].coins}</span>
                      </div>

                      <div className="flex gap-3 pt-4">
                          <button onClick={cancelCreateSquad} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors">Cancelar</button>
                          <button onClick={confirmCreateSquad} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                              <Check size={18}/> Fundar Squad
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* BUILDING MODAL - Z-INDEX 50 */}
      {selectedBuilding && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
          <div className="bg-slate-800 border-2 border-slate-600 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            {/* NEW HEADER LAYOUT */}
            <div className="flex flex-col p-4 bg-slate-900 border-b border-slate-700 gap-4">
              <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                        {selectedBuilding.type === BuildingType.SQUAD_HQ ? <Shield size={28} /> : selectedBuilding.type === BuildingType.TRIBAL_CENTER ? <Landmark size={28} /> : <Box size={28} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white pixel-font leading-tight">
                            {selectedBuilding.type === BuildingType.SQUAD_HQ 
                                ? (gameState.squads.find(s => s.id === selectedBuilding.squadId)?.name || "Squad HQ")
                                : selectedBuilding.type === BuildingType.TRIBAL_CENTER 
                                ? "Centro da Tribo (Guilda)"
                                : isMyHouse ? "Minha Base" 
                                : BUILDING_METADATA[selectedBuilding.type]?.title || "Projeto"
                            }
                        </h2>
                        {buildingSquad && !isTribalCenter && (
                            <div className="text-sm font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1">
                                {buildingSquad.name}
                                <span className="text-slate-500 font-normal normal-case ml-1">• Nível {selectedBuilding.level}</span>
                            </div>
                        )}
                        {isTribalCenter && <div className="text-sm text-yellow-500 font-bold uppercase tracking-widest">Sede Administrativa</div>}
                    </div>
                  </div>
                  <button onClick={() => setGameState(prev => ({...prev, selectedBuildingId: null}))} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
              </div>

              {!isMyHouse && !isSquadHQ && !isTribalCenter && (
                  <div className="flex gap-8 px-2">
                      <div className="flex-1 opacity-90">
                         <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                             <span className="flex items-center gap-1"><Activity size={12}/> PLANEJADO</span>
                             <span className="text-blue-300">{plannedPA} PA</span>
                         </div>
                         <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                             <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (plannedPA / (paLimit || 100)) * 100)}%` }} />
                         </div>
                      </div>

                      <div className="flex-1">
                          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                              <span className="flex items-center gap-1"><Database size={12}/> CONCLUÍDO (Capacidade: {paLimit})</span>
                              <span className="text-green-400 font-bold">{concludedPA} PA</span>
                          </div>
                          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                              <div 
                                className={`h-full transition-all duration-500 ${concludedPercent >= 100 ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${concludedPercent}%` }} 
                              />
                          </div>
                          {concludedPercent >= 100 && <div className="text-[10px] text-red-400 mt-1 text-right font-bold animate-pulse">CAPACIDADE CHEIA!</div>}
                      </div>
                  </div>
              )}
            </div>

            <div className="flex border-b border-slate-700 bg-slate-800/50">
                {isTribalCenter ? (
                    <>
                        <button onClick={() => setActiveTab('OVERVIEW')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'OVERVIEW' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Overview</button>
                        <button onClick={() => setActiveTab('MENTOR')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'MENTOR' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Mentor</button>
                        <button onClick={() => setActiveTab('ACADEMY')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'ACADEMY' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Academy</button>
                        <button onClick={() => setActiveTab('MARKET')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'MARKET' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Mercado</button>
                    </>
                ) : isMyHouse ? (
                    <>
                        <button onClick={() => setActiveTab('OVERVIEW')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'OVERVIEW' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Overview</button>
                        <button onClick={() => setActiveTab('KANBAN')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'KANBAN' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Minhas Tasks</button>
                        <button onClick={() => setActiveTab('WAREHOUSE')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'WAREHOUSE' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Armazém</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setActiveTab('OVERVIEW')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'OVERVIEW' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Overview</button>
                        <button onClick={() => setActiveTab('KANBAN')} className={`flex-1 py-3 px-6 text-sm font-bold uppercase ${activeTab === 'KANBAN' ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}>Kanban</button>
                    </>
                )}
            </div>
            <div className="flex-1 overflow-hidden relative bg-slate-900/50">
              {activeTab === 'OVERVIEW' && (
                <div className="p-8 h-full overflow-y-auto">
                   {isTribalCenter ? (
                       <div className="max-w-6xl mx-auto space-y-8">
                            {(() => {
                                const allTasks = gameState.buildings.flatMap(b => b.tasks).filter(t => t.status === 'DONE' || (t.history && t.history.length > 0));
                                const totalGuildXP = allTasks.reduce((acc, t) => {
                                    const taskXP = (t.finalXP || 0);
                                    const historyXP = (t.history || []).reduce((ha, he) => ha + he.xp, 0);
                                    return acc + taskXP + historyXP;
                                }, 0);
                                let guildLvl = 1;
                                let nextLvlXP = 10000;
                                let currentLvlXP = totalGuildXP;
                                
                                if (totalGuildXP >= 150000) { guildLvl = 4; currentLvlXP = totalGuildXP; nextLvlXP = 500000; }
                                else if (totalGuildXP >= 50000) { guildLvl = 3; currentLvlXP = totalGuildXP - 50000; nextLvlXP = 100000; } 
                                else if (totalGuildXP >= 10000) { guildLvl = 2; currentLvlXP = totalGuildXP - 10000; nextLvlXP = 40000; } 
                                
                                const progress = Math.min(100, (currentLvlXP / nextLvlXP) * 100);

                                return (
                                    <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 flex items-center gap-6">
                                        <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-xl">
                                            <Crown size={32} className="text-white"/>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-end mb-2">
                                                <h3 className="text-2xl font-bold text-white uppercase">Nível da Guilda: {guildLvl}</h3>
                                                <span className="text-sm font-mono text-yellow-400">{currentLvlXP.toLocaleString()} / {nextLvlXP.toLocaleString()} XP</span>
                                            </div>
                                            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                                                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                           {(() => {
                                const allTasks = gameState.buildings.flatMap(b => b.tasks);
                                const plannedPA = allTasks.filter(t => t.status !== 'DONE').reduce((acc, t) => acc + calculateTaskPA(t), 0);
                                const totalCompletedPA = allTasks.reduce((acc, t) => {
                                    const currentPA = t.status === 'DONE' ? (t.finalPA || 0) : 0;
                                    const historyPA = (t.history || []).reduce((ha, he) => ha + he.coins, 0); 
                                    return acc + currentPA + historyPA;
                                }, 0);
                                const ratedTasks = allTasks.filter(t => t.status === 'DONE' && t.aim !== undefined);
                                const avgRep = ratedTasks.length ? ratedTasks.reduce((acc, t) => acc + (t.aim || 0), 0) / ratedTasks.length : 0;
                                
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-blue-400 font-bold mb-1 text-xs uppercase"><Activity size={16}/> Total PA Planejado</div>
                                            <div className="text-2xl font-bold text-white">{plannedPA}</div>
                                        </div>
                                        <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-green-400 font-bold mb-1 text-xs uppercase"><CheckCircle2 size={16}/> Total PA Concluído</div>
                                            <div className="text-2xl font-bold text-white">{totalCompletedPA}</div>
                                        </div>
                                        <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1 text-xs uppercase"><Shield size={16}/> Squads Ativas</div>
                                            <div className="text-2xl font-bold text-white">{gameState.squads.length}</div>
                                            <div className="text-xs text-slate-500">Reputação Média: {avgRep.toFixed(1)}</div>
                                        </div>
                                        <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-purple-400 font-bold mb-1 text-xs uppercase"><Users size={16}/> Integrantes</div>
                                            <div className="text-2xl font-bold text-white">{gameState.users.length}</div>
                                        </div>
                                    </div>
                                );
                           })()}

                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                               <div className="lg:col-span-1 bg-slate-800 border border-slate-600 rounded-xl p-6 flex flex-col">
                                   <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><TrendingUp size={20} className="text-indigo-400"/> Produtividade Global</h3>
                                   <div className="flex-1 min-h-[200px]">
                                       {(() => {
                                            const sprintStats: Record<number, { pa: number, compSum: number, aimSum: number, count: number }> = {};
                                            const allDone = gameState.buildings.flatMap(b => b.tasks).filter(t => t.status === 'DONE' || (t.history && t.history.length > 0));
                                            
                                            allDone.forEach(t => {
                                                if (t.status === 'DONE') {
                                                    const lastSprintTag = t.sprintHistory?.[t.sprintHistory.length - 1] || "Sprint 1";
                                                    const sprintNum = parseInt(lastSprintTag.replace("Sprint ", "")) || 1;
                                                    if (!sprintStats[sprintNum]) sprintStats[sprintNum] = { pa: 0, compSum: 0, aimSum: 0, count: 0 };
                                                    sprintStats[sprintNum].pa += (t.finalPA || 0);
                                                    sprintStats[sprintNum].compSum += t.complexity;
                                                    sprintStats[sprintNum].aimSum += (t.aim || 0);
                                                    sprintStats[sprintNum].count++;
                                                }
                                                (t.history || []).forEach(he => {
                                                    const sprintNum = he.sprint || 1;
                                                    if (!sprintStats[sprintNum]) sprintStats[sprintNum] = { pa: 0, compSum: 0, aimSum: 0, count: 0 };
                                                    sprintStats[sprintNum].pa += he.coins;
                                                    sprintStats[sprintNum].compSum += t.complexity;
                                                    sprintStats[sprintNum].aimSum += he.aim;
                                                    sprintStats[sprintNum].count++;
                                                });
                                            });

                                            const chartData: Record<number, any> = {};
                                            Object.keys(sprintStats).forEach(k => {
                                                const key = Number(k);
                                                const d = sprintStats[key];
                                                chartData[key] = {
                                                    pa: d.pa,
                                                    complexityAvg: d.count ? d.compSum / d.count : 0,
                                                    aimAvg: d.count ? d.aimSum / d.count : 0
                                                };
                                            });
                                            return renderSprintChart(chartData, gameState.sprintCycle);
                                       })()}
                                   </div>
                               </div>

                               <div className="lg:col-span-2 bg-slate-800 border border-slate-600 rounded-xl p-6 flex flex-col gap-6">
                                   <div className="flex justify-between items-center">
                                       <h3 className="text-lg font-bold text-white flex items-center gap-2"><LocalTrophyIcon size={20} className="text-yellow-400"/> Rankings da Tribo</h3>
                                       <div className="flex items-center gap-2">
                                           <span className="text-xs text-slate-400 uppercase font-bold">Período:</span>
                                           <select 
                                               className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                               value={dashboardTimeFilter}
                                               onChange={(e) => setDashboardTimeFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                                           >
                                               <option value="ALL">Geral (Todos)</option>
                                               {[...Array(gameState.sprintCycle)].map((_, i) => (
                                                   <option key={i+1} value={i+1}>Sprint {i+1}</option>
                                               ))}
                                           </select>
                                       </div>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <div>
                                           <h4 className="text-sm font-bold text-slate-300 uppercase mb-3 flex items-center gap-2"><Shield size={14}/> Top Squads</h4>
                                           <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
                                               <table className="w-full text-sm text-left">
                                                   <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                                                       <tr>
                                                           <th className="p-2">Squad</th>
                                                           <th className="p-2 text-right">PA</th>
                                                           <th className="p-2 text-right">AIM</th>
                                                       </tr>
                                                   </thead>
                                                   <tbody className="divide-y divide-slate-800">
                                                       {gameState.squads
                                                           .filter(s => s.id !== 'sq_board')
                                                           .map(s => {
                                                               const squadTasks = gameState.buildings.filter(b => b.squadId === s.id).flatMap(b => b.tasks);
                                                               let totalPA = 0;
                                                               let aimSum = 0;
                                                               let count = 0;
                                                               
                                                               squadTasks.forEach(t => {
                                                                   if (t.status === 'DONE' && (dashboardTimeFilter === 'ALL' || t.sprintHistory?.includes(`Sprint ${dashboardTimeFilter}`))) {
                                                                       totalPA += (t.finalPA || 0);
                                                                       aimSum += (t.aim || 0);
                                                                       count++;
                                                                   }
                                                                   (t.history || []).forEach(he => {
                                                                       if (dashboardTimeFilter === 'ALL' || he.sprint === dashboardTimeFilter) {
                                                                           totalPA += he.coins;
                                                                           aimSum += he.aim;
                                                                           count++;
                                                                       }
                                                                   });
                                                               });

                                                               const avgAim = count ? aimSum / count : 0;
                                                               return { squad: s, totalPA, avgAim };
                                                           })
                                                           .sort((a,b) => b.totalPA - a.totalPA)
                                                           .map(({squad, totalPA, avgAim}, idx) => (
                                                               <tr key={squad.id} className="hover:bg-slate-800/50">
                                                                   <td className="p-2 flex items-center gap-2">
                                                                       <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'}`}>{idx+1}</span>
                                                                       <span className="font-bold text-slate-200" style={{ color: squad.color }}>{squad.name}</span>
                                                                   </td>
                                                                   <td className="p-2 text-right font-mono text-green-400">{totalPA}</td>
                                                                   <td className="p-2 text-right font-mono text-purple-400">{avgAim.toFixed(1)}</td>
                                                               </tr>
                                                           ))
                                                       }
                                                   </tbody>
                                               </table>
                                           </div>
                                       </div>

                                       <div>
                                           <h4 className="text-sm font-bold text-slate-300 uppercase mb-3 flex items-center gap-2"><Users size={14}/> Top Integrantes</h4>
                                           <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
                                               <table className="w-full text-sm text-left">
                                                   <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                                                       <tr>
                                                           <th className="p-2">Nome</th>
                                                           <th className="p-2 text-right">PA</th>
                                                           <th className="p-2 text-right">AIM</th>
                                                       </tr>
                                                   </thead>
                                                   <tbody className="divide-y divide-slate-800">
                                                        {gameState.users
                                                           .filter(u => u.id !== 'u_senior')
                                                           .map(u => {
                                                               let totalPA = 0;
                                                               let aimSum = 0;
                                                               let count = 0;
                                                               
                                                               gameState.buildings.flatMap(b => b.tasks).forEach(t => {
                                                                   const isPart = t.participants?.includes(u.id) || t.creatorId === u.id;
                                                                   if (isPart && t.status === 'DONE' && (dashboardTimeFilter === 'ALL' || t.sprintHistory?.includes(`Sprint ${dashboardTimeFilter}`))) {
                                                                       totalPA += (t.finalPA || 0);
                                                                       aimSum += (t.aim || 0);
                                                                       count++;
                                                                   }
                                                                   (t.history || []).forEach(he => {
                                                                       if (he.participants.includes(u.id) && (dashboardTimeFilter === 'ALL' || he.sprint === dashboardTimeFilter)) {
                                                                           totalPA += he.coins;
                                                                           aimSum += he.aim;
                                                                           count++;
                                                                       }
                                                                   });
                                                               });

                                                               const avgAim = count ? aimSum / count : 0;
                                                               return { user: u, totalPA, avgAim };
                                                           })
                                                           .sort((a,b) => b.totalPA - a.totalPA)
                                                           .slice(0, 10) 
                                                           .map(({user, totalPA, avgAim}, idx) => (
                                                               <tr key={user.id} className="hover:bg-slate-800/50">
                                                                   <td className="p-2 flex items-center gap-2">
                                                                       <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'}`}>{idx+1}</span>
                                                                       <span className="font-bold text-slate-200 truncate max-w-[80px]">{user.name}</span>
                                                                   </td>
                                                                   <td className="p-2 text-right font-mono text-green-400">{totalPA}</td>
                                                                   <td className="p-2 text-right font-mono text-purple-400">{avgAim.toFixed(1)}</td>
                                                               </tr>
                                                           ))
                                                       }
                                                   </tbody>
                                               </table>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </div>

                           <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => { setMoveModeId(selectedBuilding.id); setGameState(prev => ({...prev, selectedBuildingId: null})); }}
                                    className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform"
                                >
                                    <Move size={20}/> Mover Centro da Tribo
                                </button>
                           </div>
                       </div>
                   ) : isMyHouse ? (
                       <div className="max-w-4xl mx-auto space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 flex flex-col items-center">
                                   <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1"><Target size={20}/> PONTOS DE ATIVIDADE</div>
                                   <div className="text-3xl font-bold text-white">{gameState.player.totalPA}</div>
                                   <div className="text-xs text-slate-400 uppercase tracking-wider">Total Acumulado</div>
                               </div>
                               
                               <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 flex flex-col items-center">
                                   <div className="flex items-center gap-2 text-green-400 font-bold mb-1"><Award size={20}/> XP & LEVEL</div>
                                   <div className="text-3xl font-bold text-white">Lvl {gameState.player.level}</div>
                                   <div className="text-xs text-slate-400 uppercase tracking-wider">{gameState.player.currentXP} / {gameState.player.nextLevelXP} XP</div>
                                   <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 overflow-hidden">
                                       <div className="h-full bg-green-500" style={{ width: `${(gameState.player.currentXP / gameState.player.nextLevelXP) * 100}%` }}></div>
                                   </div>
                               </div>

                               <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 flex flex-col items-center">
                                   <div className="flex items-center gap-2 text-purple-400 font-bold mb-1"><Star size={20}/> REPUTAÇÃO (AIM)</div>
                                   <div className="flex gap-1 text-yellow-400 my-1">
                                       {[...Array(5)].map((_, i) => ( <Star key={i} size={16} fill={i < stars ? "currentColor" : "none"} className={i < stars ? "" : "opacity-30"} /> ))}
                                   </div>
                                   <div className="text-xs text-slate-400 uppercase tracking-wider">Média Global: {gameState.player.reputation.toFixed(1)}</div>
                               </div>
                           </div>
                           
                           <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => { setMoveModeId(selectedBuilding.id); setGameState(prev => ({...prev, selectedBuildingId: null})); }}
                                    className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform"
                                >
                                    <Move size={20}/> Mover Base
                                </button>
                           </div>
                       </div>
                   ) : selectedBuilding.type === BuildingType.SQUAD_HQ ? (
                       <div className="max-w-6xl mx-auto space-y-8">
                           <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 flex flex-col md:flex-row gap-6">
                               <div className="flex-1">
                                   <div className="flex items-center gap-3 mb-4">
                                       <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/50">
                                            <Shield className="text-red-500" size={32}/>
                                       </div>
                                       <div>
                                           <h3 className="text-2xl font-bold text-white leading-none mb-1">{buildingSquad?.name}</h3>
                                           <p className="text-slate-400 text-sm">Central de Comando e Operações</p>
                                       </div>
                                   </div>
                                   <div className="relative group">
                                       <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Descrição da Squad</label>
                                       <textarea 
                                           className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                                           rows={3}
                                           placeholder="Descreva o propósito e a cultura desta Squad..."
                                           value={buildingSquad?.description || ''}
                                           onChange={(e) => buildingSquad && updateSquad(buildingSquad.id, { description: e.target.value })}
                                       />
                                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <Settings size={14} className="text-slate-500"/>
                                       </div>
                                   </div>
                               </div>
                               <div className="flex flex-col gap-3 justify-end min-w-[200px]">
                                   <button 
                                        onClick={() => {
                                            setTargetBuildSquadId(selectedBuilding.squadId || null);
                                            setShowBuildingSelectModal(true);
                                        }}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                                    >
                                        <Layout size={20}/> Novo Projeto
                                    </button>
                                    
                                    {(isMaster || (gameState.currentUser.role === 'Mentor Júnior' && gameState.currentUser.squadId === selectedBuilding.squadId)) && (
                                        <button
                                            onClick={() => { setMoveModeId(selectedBuilding.id); setGameState(prev => ({...prev, selectedBuildingId: null})); }}
                                            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                                        >
                                            <Move size={20}/> Mover QG
                                        </button>
                                    )}
                                </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                               <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                                   <div className="flex items-center gap-2 text-blue-400 font-bold mb-1 text-xs uppercase"><Activity size={16}/> PA Planejado</div>
                                   <div className="text-2xl font-bold text-white">{squadStats.plannedPA}</div>
                                   <div className="text-xs text-slate-500">Em andamento / Backlog</div>
                               </div>
                               <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                                   <div className="flex items-center gap-2 text-green-400 font-bold mb-1 text-xs uppercase"><CheckCircle2 size={16}/> PA Concluído</div>
                                   <div className="text-2xl font-bold text-white">{squadStats.completedPA}</div>
                                   <div className="text-xs text-slate-500">{dashboardTimeFilter === 'ALL' ? 'Total Histórico' : `Sprint ${dashboardTimeFilter}`}</div>
                               </div>
                               <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 flex flex-col justify-center">
                                   <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2 text-xs uppercase"><Crown size={16}/> Squad Level</div>
                                   <div className="flex justify-between items-end mb-1">
                                       <span className="text-2xl font-bold text-white">Lvl {squadStats.level}</span>
                                       <span className="text-xs text-slate-400">{Math.floor(squadStats.currentXPInLevel)} / {squadStats.nextLevelThreshold} XP</span>
                                   </div>
                                   <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                       <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${squadStats.xpProgress}%` }}></div>
                                   </div>
                               </div>
                               <div className="bg-slate-800 border border-slate-600 rounded-xl p-4">
                                   <div className="flex items-center gap-2 text-yellow-400 font-bold mb-1 text-xs uppercase"><Star size={16}/> Reputação</div>
                                   <div className="text-2xl font-bold text-white">{squadStats.reputation.toFixed(1)} <span className="text-sm text-slate-500">/ 3.0</span></div>
                                   <div className="text-xs text-slate-500">Média AIM</div>
                               </div>
                           </div>

                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                               <div className="lg:col-span-1 bg-slate-800 border border-slate-600 rounded-xl p-6 flex flex-col">
                                   <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><TrendingUp size={20} className="text-indigo-400"/> Evolução da Squad</h3>
                                   <div className="flex-1 min-h-[200px]">
                                       {(() => {
                                            const sprintStats: Record<number, { pa: number, compSum: number, aimSum: number, count: number }> = {};
                                            const allDone = displayTasks.filter(t => t.status === 'DONE' || (t.history && t.history.length > 0));
                                            
                                            allDone.forEach(t => {
                                                if (t.status === 'DONE') {
                                                    const lastSprintTag = t.sprintHistory?.[t.sprintHistory.length - 1] || "Sprint 1";
                                                    const sprintNum = parseInt(lastSprintTag.replace("Sprint ", "")) || 1;
                                                    if (!sprintStats[sprintNum]) sprintStats[sprintNum] = { pa: 0, compSum: 0, aimSum: 0, count: 0 };
                                                    sprintStats[sprintNum].pa += (t.finalPA || 0);
                                                    sprintStats[sprintNum].compSum += t.complexity;
                                                    sprintStats[sprintNum].aimSum += (t.aim || 0);
                                                    sprintStats[sprintNum].count++;
                                                }
                                                (t.history || []).forEach(he => {
                                                    const sprintNum = he.sprint || 1;
                                                    if (!sprintStats[sprintNum]) sprintStats[sprintNum] = { pa: 0, compSum: 0, aimSum: 0, count: 0 };
                                                    sprintStats[sprintNum].pa += he.coins;
                                                    sprintStats[sprintNum].compSum += t.complexity;
                                                    sprintStats[sprintNum].aimSum += he.aim;
                                                    sprintStats[sprintNum].count++;
                                                });
                                            });

                                            const chartData: Record<number, any> = {};
                                            Object.keys(sprintStats).forEach(k => {
                                                const key = Number(k);
                                                const d = sprintStats[key];
                                                chartData[key] = {
                                                    pa: d.pa,
                                                    complexityAvg: d.count ? d.compSum / d.count : 0,
                                                    aimAvg: d.count ? d.aimSum / d.count : 0
                                                };
                                            });
                                            return renderSprintChart(chartData, gameState.sprintCycle);
                                       })()}
                                   </div>
                               </div>

                               <div className="lg:col-span-2 bg-slate-800 border border-slate-600 rounded-xl p-6 flex flex-col gap-6">
                                   <div className="flex justify-between items-center">
                                       <h3 className="text-lg font-bold text-white flex items-center gap-2"><LocalTrophyIcon size={20} className="text-yellow-400"/> Rankings</h3>
                                       <div className="flex items-center gap-2">
                                           <span className="text-xs text-slate-400 uppercase font-bold">Período:</span>
                                           <select 
                                               className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                               value={dashboardTimeFilter}
                                               onChange={(e) => setDashboardTimeFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                                           >
                                               <option value="ALL">Geral (Todos)</option>
                                               {[...Array(gameState.sprintCycle)].map((_, i) => (
                                                   <option key={i+1} value={i+1}>Sprint {i+1}</option>
                                               ))}
                                           </select>
                                       </div>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <div>
                                           <h4 className="text-sm font-bold text-slate-300 uppercase mb-3 flex items-center gap-2"><Users size={14}/> Integrantes</h4>
                                           <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
                                               <table className="w-full text-sm text-left">
                                                   <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                                                       <tr>
                                                           <th className="p-2">Nome</th>
                                                           <th className="p-2 text-right">PA</th>
                                                           <th className="p-2 text-right">AIM Médio</th>
                                                       </tr>
                                                   </thead>
                                                   <tbody className="divide-y divide-slate-800">
                                                       {gameState.users
                                                           .filter(u => u.squadId === selectedBuilding.squadId)
                                                           .map(u => {
                                                               let totalPA = 0;
                                                               let aimSum = 0;
                                                               let count = 0;
                                                               
                                                               displayTasks.forEach(t => {
                                                                   const isPart = t.participants?.includes(u.id) || t.creatorId === u.id;
                                                                   if (isPart && t.status === 'DONE' && (dashboardTimeFilter === 'ALL' || t.sprintHistory?.includes(`Sprint ${dashboardTimeFilter}`))) {
                                                                       totalPA += (t.finalPA || 0);
                                                                       aimSum += (t.aim || 0);
                                                                       count++;
                                                                   }
                                                                   (t.history || []).forEach(he => {
                                                                       if (he.participants.includes(u.id) && (dashboardTimeFilter === 'ALL' || he.sprint === dashboardTimeFilter)) {
                                                                           totalPA += he.coins;
                                                                           aimSum += he.aim;
                                                                           count++;
                                                                       }
                                                                   });
                                                               });
                                                               
                                                               const avgAim = count ? aimSum / count : 0;
                                                               return { user: u, totalPA, avgAim };
                                                           })
                                                           .sort((a,b) => b.totalPA - a.totalPA)
                                                           .map(({user, totalPA, avgAim}, idx) => (
                                                               <tr key={user.id} className="hover:bg-slate-800/50">
                                                                   <td className="p-2 flex items-center gap-2">
                                                                       <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'}`}>{idx+1}</span>
                                                                       <span className="font-bold text-slate-200 truncate max-w-[80px]">{user.name}</span>
                                                                       {user.role === 'Mentor Júnior' && <Crown size={12} className="text-yellow-500"/>}
                                                                   </td>
                                                                   <td className="p-2 text-right font-mono text-green-400">{totalPA}</td>
                                                                   <td className="p-2 text-right font-mono text-purple-400">{avgAim.toFixed(1)}</td>
                                                               </tr>
                                                           ))
                                                       }
                                                   </tbody>
                                               </table>
                                           </div>
                                       </div>

                                       <div>
                                           <h4 className="text-sm font-bold text-slate-300 uppercase mb-3 flex items-center gap-2"><Box size={14}/> Projetos (Construções)</h4>
                                           <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
                                               <table className="w-full text-sm text-left">
                                                   <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                                                       <tr>
                                                           <th className="p-2">Projeto</th>
                                                           <th className="p-2 text-right">PA Gerado</th>
                                                           <th className="p-2 text-right">AIM Médio</th>
                                                       </tr>
                                                   </thead>
                                                   <tbody className="divide-y divide-slate-800">
                                                        {gameState.buildings
                                                           .filter(b => b.squadId === selectedBuilding.squadId && b.type !== BuildingType.SQUAD_HQ) 
                                                           .map(b => {
                                                               let totalPA = 0;
                                                               let aimSum = 0;
                                                               let count = 0;
                                                               
                                                               b.tasks.forEach(t => {
                                                                   if (t.status === 'DONE' && (dashboardTimeFilter === 'ALL' || t.sprintHistory?.includes(`Sprint ${dashboardTimeFilter}`))) {
                                                                       totalPA += (t.finalPA || 0);
                                                                       aimSum += (t.aim || 0);
                                                                       count++;
                                                                   }
                                                                   (t.history || []).forEach(he => {
                                                                       if (dashboardTimeFilter === 'ALL' || he.sprint === dashboardTimeFilter) {
                                                                           totalPA += he.coins;
                                                                           aimSum += he.aim;
                                                                           count++;
                                                                       }
                                                                   });
                                                               });

                                                               const avgAim = count ? aimSum / count : 0;
                                                               const title = BUILDING_METADATA[b.type]?.title || "Base";
                                                               return { building: b, title, totalPA, avgAim };
                                                           })
                                                           .sort((a,b) => b.totalPA - a.totalPA)
                                                           .map(({building, title, totalPA, avgAim}, idx) => (
                                                               <tr key={building.id} className="hover:bg-slate-800/50">
                                                                   <td className="p-2 flex items-center gap-2">
                                                                       <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'}`}>{idx+1}</span>
                                                                       <span className="font-bold text-slate-200 truncate max-w-[80px]">{title}</span>
                                                                   </td>
                                                                   <td className="p-2 text-right font-mono text-green-400">{totalPA}</td>
                                                                   <td className="p-2 text-right font-mono text-purple-400">{avgAim.toFixed(1)}</td>
                                                               </tr>
                                                           ))
                                                       }
                                                   </tbody>
                                               </table>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>
                   ) : (
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="bg-slate-800 p-4 rounded border border-slate-600 mb-6">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <Info size={16} className="text-blue-400"/> Sobre esta Função
                            </h3>
                            <p className="text-sm text-slate-300 mb-4">{BUILDING_METADATA[selectedBuilding.type]?.description}</p>
                            <div className="flex flex-wrap gap-1">
                                {BUILDING_METADATA[selectedBuilding.type]?.functions.map(f => (
                                    <span key={f} className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-200">{f}</span>
                                ))}
                            </div>
                        </div>
                        
                        {(isOwner || isMaster) && (
                            <>
                            <button onClick={upgradeSelected} className="w-full bg-green-600 p-4 rounded font-bold text-white flex items-center justify-center gap-2">
                                <ArrowBigUp /> Evoluir ({isMaster ? '0 (Master)' : getUpgradeCost(selectedBuilding.level, selectedBuilding.type).coins + 'C'})
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => { setMoveModeId(selectedBuilding.id); setGameState(prev => ({...prev, selectedBuildingId: null})); }} className="flex-1 bg-yellow-600 p-4 rounded font-bold text-white flex items-center justify-center gap-2">
                                    <Move /> Mover
                                </button>
                                <button onClick={deleteSelected} className="flex-1 bg-red-600 p-4 rounded font-bold text-white flex items-center justify-center gap-2">
                                    <Trash2 /> Demolir
                                </button>
                            </div>
                            </>
                        )}
                      </div>
                   )}
                </div>
              )}
              {activeTab === 'MENTOR' && isTribalCenter && (
                  <MentorContainer 
                    currentUser={gameState.currentUser!}
                    users={gameState.users}
                    squads={gameState.squads}
                    sprintCycle={gameState.sprintCycle}
                  />
              )}
              {activeTab === 'ACADEMY' && isTribalCenter && (
                   <AcademyContainer 
                        gameState={gameState}
                        currentUser={gameState.currentUser!}
                   />
              )}
              {activeTab === 'MARKET' && isTribalCenter && (
                   <MarketContainer 
                        currentUser={gameState.currentUser!}
                        userCoins={gameState.resources.coins}
                        onPurchaseSuccess={(cost) => {
                            setGameState(prev => ({
                                ...prev,
                                resources: { coins: prev.resources.coins - cost }
                            }));
                            showToast("Compra realizada! Vá ao armazém na sua base.", "success");
                        }}
                   />
              )}
              {activeTab === 'WAREHOUSE' && isMyHouse && (
                   <WarehouseView currentUser={gameState.currentUser!} />
              )}
              {activeTab === 'KANBAN' && (
                <div className="flex flex-col h-full bg-slate-900 overflow-auto">
                  <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-end shrink-0">
                        {!isMyHouse && (
                             <button 
                                onClick={() => handleOpenCreateTask(selectedBuilding.id)} 
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
                             >
                                <Plus size={18} /> Nova Tarefa
                             </button>
                        )}
                  </div>

                  <div className="flex-1 p-4 min-w-max">
                    <div className="flex gap-4 mb-4 ml-60">
                        {KANBAN_COLUMNS.map(col => (
                            <div key={col.id} className={`w-80 p-3 rounded-t-lg border-b-2 border-white/10 ${col.color.replace('/50', '/40')} text-white font-bold text-sm uppercase text-center shadow-sm`}>
                                {col.label}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-8">
                        {SWIMLANES.map(lane => (
                            <div key={lane.id} className="relative bg-slate-800/20 rounded-xl border border-slate-700/50 pb-4">
                                <div className="absolute left-0 top-0 bottom-0 w-56 flex flex-col items-center justify-center p-4 border-r border-slate-700 bg-slate-800/40 rounded-l-xl z-10">
                                    <div className={`p-3 rounded-full bg-slate-900 mb-3 border border-slate-700 ${lane.color}`}>
                                        <lane.icon size={24} />
                                    </div>
                                    <h3 className={`text-center font-black uppercase tracking-widest text-sm ${lane.color}`}>{lane.label}</h3>
                                    <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Regra: {lane.rule}</div>
                                </div>

                                <div className="flex gap-4 ml-60">
                                    {KANBAN_COLUMNS.map(col => {
                                        const laneTasks = displayTasks.filter(t => t.status === col.id && t.ruleValue === lane.rule);
                                        const lanePA = laneTasks.reduce((acc, t) => acc + calculateTaskPA(t), 0);
                                        
                                        return (
                                            <div 
                                                key={`${lane.id}-${col.id}`} 
                                                className="w-80 min-h-[120px] flex flex-col bg-slate-900/30 rounded-lg border border-slate-800 p-2 transition-colors relative"
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, col.id)}
                                            >
                                                {laneTasks.length > 0 && (
                                                    <div className="absolute -top-3 right-2 bg-slate-800 text-[9px] px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-700 z-10">
                                                        PA: {lanePA}
                                                    </div>
                                                )}
                                                
                                                <div className="space-y-2">
                                                    {laneTasks.map(task => {
                                                        const originBuilding = (isMyHouse || isSquadHQ) ? gameState.buildings.find(b => b.id === (task as any).originalBuildingId) : null;
                                                        const originTitle = originBuilding ? (BUILDING_METADATA[originBuilding.type]?.title || "Projeto") : null;
                                                        
                                                        return (
                                                            <div 
                                                                key={task.id} 
                                                                draggable={col.id !== 'DONE'} 
                                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                                onClick={() => {
                                                                    setIsCreatingTask(false);
                                                                    setEditingTask({ buildingId: (task as any).originalBuildingId || selectedBuilding.id, task: task });
                                                                    setTaskModalTab(1);
                                                                }}
                                                                className={`bg-slate-800 p-3 rounded border border-slate-700 shadow-sm relative group cursor-grab active:cursor-grabbing hover:border-indigo-500 transition-all ${draggedTaskId === task.id ? 'opacity-40 border-dashed border-slate-400' : ''}`}
                                                            >
                                                                <p className="text-sm text-slate-200 font-medium leading-snug mb-2">{task.content}</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    <span className="text-[9px] bg-slate-900 px-1.5 rounded border border-slate-700 text-slate-400">PA: {calculateTaskPA(task)}</span>
                                                                    {task.ruleValue === 'FIXED' && task.fixedTimeType && (
                                                                        <span className="text-[9px] bg-orange-900/40 text-orange-300 px-1.5 rounded border border-orange-800/50 flex items-center gap-0.5">
                                                                            <Calendar size={8}/> {task.fixedTimeType === 'DAILY' ? 'D' : task.fixedTimeType === 'WEEKLY' ? 'S' : task.fixedTimeType === 'MONTHLY' ? 'M' : 'P'}
                                                                        </span>
                                                                    )}
                                                                    {task.ruleValue === 'FIXED' && (task.fixedQuantityLimit || task.fixedQuantity) && (
                                                                        <span className="text-[9px] bg-orange-900/40 text-orange-300 px-1.5 rounded border border-orange-800/50 flex items-center gap-0.5">
                                                                            <Repeat size={8}/> {task.fixedQuantityCount || 0}/{task.fixedQuantityLimit || task.fixedQuantity}x
                                                                        </span>
                                                                    )}
                                                                    {task.ruleValue === 'FIXED' && task.fixedDeadline && (
                                                                        <span className="text-[9px] bg-red-900/40 text-red-300 px-1.5 rounded border border-red-800/50 flex items-center gap-0.5">
                                                                            <Calendar size={8}/> {new Date(task.fixedDeadline).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                    {(isMyHouse || isSquadHQ) && (
                                                                        <span className="text-[9px] bg-indigo-900/40 text-indigo-300 px-1.5 rounded border border-indigo-800/50">
                                                                            {originTitle || 'Projeto'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {laneTasks.length === 0 && (
                                                        <div className="h-full flex items-center justify-center opacity-10 pointer-events-none py-8">
                                                            <div className="border-2 border-dashed border-slate-400 w-full h-full rounded-lg"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showBuildingSelectModal && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
              <div className="bg-slate-800 border-2 border-slate-600 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layout size={24} className="text-blue-400"/> Funções Organizacionais (Construções)</h3>
                          <p className="text-sm text-slate-400 mt-1">Este novo projeto será vinculado à Squad: <strong className="text-white">{gameState.squads.find(s=>s.id === (targetBuildSquadId || gameState.currentUser?.squadId))?.name}</strong></p>
                      </div>
                      <button onClick={() => setShowBuildingSelectModal(false)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400"><X size={20}/></button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.values(BuildingType)
                        .filter(t => t !== BuildingType.RESIDENTIAL && t !== BuildingType.SQUAD_HQ && t !== BuildingType.TRIBAL_CENTER && t !== BuildingType.DECORATION)
                        .map(type => {
                          const meta = BUILDING_METADATA[type];
                          if (!meta) return null;
                          
                          const targetSquad = targetBuildSquadId || gameState.currentUser?.squadId;
                          const isBuilt = gameState.buildings.some(b => b.type === type && b.squadId === targetSquad);

                          return (
                            <button 
                                key={type} 
                                disabled={isBuilt && !isMaster}
                                onClick={() => { 
                                    if (isBuilt && !isMaster) return;
                                    setBuildMode(type); 
                                    setMoveModeId(null); 
                                    setGameState(prev => ({...prev, selectedBuildingId: null})); 
                                    setShowBuildingSelectModal(false);
                                    showToast(`Modo de Construção: ${meta.title}. Clique no mapa para iniciar.`, "info");
                                }} 
                                className={`flex flex-col text-left border rounded-xl p-4 transition-all group h-full relative overflow-hidden ${isBuilt && !isMaster ? 'bg-slate-800 border-slate-700 opacity-60 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-indigo-500'}`}
                            >
                                {isBuilt && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 pointer-events-none">
                                        <div className="bg-red-900/90 text-red-100 font-bold px-3 py-1 rounded border border-red-500 transform -rotate-12 shadow-xl">JÁ CONSTRUÍDO</div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-3 rounded-full transition-transform ${isBuilt ? 'bg-slate-700' : 'bg-slate-800 group-hover:scale-110'}`}>
                                        <Box size={24} className={isBuilt ? "text-slate-500" : "text-indigo-400"}/>
                                    </div>
                                    <div>
                                        <div className="font-bold text-white uppercase text-sm leading-tight">{meta.title}</div>
                                        <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold mt-1">
                                            <Coins size={12}/> {BUILD_COSTS[type].coins}
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-xs text-slate-300 mb-3 line-clamp-2">{meta.description}</p>
                                
                                <div className="mt-auto pt-3 border-t border-slate-600 w-full">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Funções:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {meta.functions.map(f => (
                                            <span key={f} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{f}</span>
                                        ))}
                                    </div>
                                </div>
                            </button>
                        );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* TASK DETAIL MODAL */}
      {editingTask && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-slate-800 border-2 border-indigo-500/50 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 rounded-t-xl">
                    <div className="flex items-center gap-3 w-full mr-4">
                        <div className="bg-indigo-600 p-2 rounded shrink-0"><ClipboardList size={20} className="text-white" /></div>
                        <div className="w-full">
                            <input 
                                className="bg-transparent text-xl font-bold text-white focus:outline-none focus:border-b border-indigo-500 w-full placeholder-slate-500"
                                value={editingTask.task.content}
                                onChange={(e) => handleTaskFieldUpdate({ content: e.target.value })}
                                placeholder={isCreatingTask ? "Escreva o título da nova tarefa..." : "Título da Tarefa"}
                                autoFocus={isCreatingTask}
                            />
                            {!isCreatingTask && (
                                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">{editingTask.task.status} • {gameState.squads.find(s => s.id === editingTask.task.squadId)?.name}</div>
                            )}
                        </div>
                    </div>
                    <button onClick={() => { setEditingTask(null); setIsCreatingTask(false); }} className="p-2 hover:bg-slate-700 rounded-full"><X /></button>
                </div>

                <div className="flex border-b border-slate-700 bg-slate-800">
                    <button onClick={() => setTaskModalTab(1)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${taskModalTab === 1 ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}><FileText size={16} /> Detalhes</button>
                    {!isCreatingTask && (
                        <>
                            <button onClick={() => setTaskModalTab(2)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${taskModalTab === 2 ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}><Users size={16} /> Equipe</button>
                            <button onClick={() => setTaskModalTab(3)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${taskModalTab === 3 ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}><LinkIcon size={16} /> Evidências</button>
                            <button onClick={() => setTaskModalTab(4)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${taskModalTab === 4 ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}><Award size={16} /> Avaliação</button>
                            <button onClick={() => setTaskModalTab(5)} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${taskModalTab === 5 ? 'bg-slate-700 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}`}><History size={16} /> Histórico</button>
                        </>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
                    {taskModalTab === 1 && (
                        <div className="space-y-6">
                            {isCreatingTask && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Squad Responsável</label>
                                        <select 
                                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                                            value={editingTask.task.squadId}
                                            onChange={(e) => handleTaskFieldUpdate({ squadId: e.target.value })}
                                        >
                                            {gameState.squads.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Vincular a Projeto/Construção *</label>
                                        <select 
                                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                                            value={editingTask.buildingId}
                                            onChange={(e) => handleTaskFieldUpdate({}, e.target.value)}
                                        >
                                            <option value="">Selecione um projeto...</option>
                                            {gameState.buildings
                                                .filter(b => 
                                                    b.squadId === editingTask.task.squadId && 
                                                    b.type !== BuildingType.RESIDENTIAL && 
                                                    b.type !== BuildingType.SQUAD_HQ &&
                                                    b.type !== BuildingType.TRIBAL_CENTER
                                                )
                                                .map(b => (
                                                    <option key={b.id} value={b.id}>{BUILDING_METADATA[b.type]?.title || "Projeto"} ({b.id.substring(b.id.length-4)})</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descrição</label>
                                <textarea 
                                    className="w-full h-32 bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm"
                                    placeholder="Descreva o que precisa ser feito..."
                                    value={editingTask.task.description || ''}
                                    onChange={(e) => handleTaskFieldUpdate({ description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tamanho (Fibonacci)</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                                        value={editingTask.task.size}
                                        onChange={(e) => handleTaskFieldUpdate({ size: Number(e.target.value) as TaskSize })}
                                    >
                                        {FIBONACCI_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Complexidade</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                                        value={editingTask.task.complexity}
                                        onChange={(e) => handleTaskFieldUpdate({ complexity: Number(e.target.value) as TaskComplexity })}
                                    >
                                        {[1,2,3].map(c => <option key={c} value={c}>{COMPLEXITY_LABELS[c as TaskComplexity]}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Regra</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                                        value={editingTask.task.ruleValue}
                                        onChange={(e) => {
                                            const rule = TASK_RULES.find(r => r.value === e.target.value);
                                            if (rule) handleTaskFieldUpdate({ ruleValue: rule.value, ruleLabel: rule.label, ruleMultiplier: rule.multiplier });
                                        }}
                                    >
                                        {TASK_RULES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {editingTask.task.ruleValue === 'FIXED' && (
                                <div className="p-4 bg-slate-800/50 rounded-lg border border-orange-500/30 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-4 mb-4">
                                        <button 
                                            onClick={() => handleTaskFieldUpdate({ fixedTimeType: 'DAILY', fixedQuantityLimit: undefined, fixedDeadline: Date.now() + 86400000 })}
                                            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all ${editingTask.task.fixedDeadline !== undefined && editingTask.task.fixedQuantityLimit === undefined ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                                        >
                                            <CalendarDays size={14}/> POR PERÍODO & PRAZO
                                        </button>
                                        <button 
                                            onClick={() => handleTaskFieldUpdate({ fixedQuantityLimit: 1, fixedDeadline: undefined, fixedTimeType: undefined })}
                                            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all ${editingTask.task.fixedQuantityLimit !== undefined ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                                        >
                                            <Repeat size={14}/> POR META (QTDE)
                                        </button>
                                    </div>
                                    
                                    {editingTask.task.fixedDeadline !== undefined && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2">
                                            <div>
                                                <label className="block text-[10px] font-bold text-orange-400 uppercase mb-1">Periodicidade</label>
                                                <select 
                                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                                                    value={editingTask.task.fixedTimeType || 'DAILY'}
                                                    onChange={(e) => handleTaskFieldUpdate({ fixedTimeType: e.target.value as FixedTimeType })}
                                                >
                                                    <option value="DAILY">Diária</option>
                                                    <option value="WEEKLY">Semanal</option>
                                                    <option value="MONTHLY">Mensal</option>
                                                    <option value="CUSTOM">Personalizada</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-orange-400 uppercase mb-1">Data Limite (Até quando)</label>
                                                <input 
                                                    type="date" 
                                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                                                    value={new Date(editingTask.task.fixedDeadline || Date.now()).toISOString().split('T')[0]}
                                                    onChange={(e) => handleTaskFieldUpdate({ fixedDeadline: new Date(e.target.value).getTime() })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {editingTask.task.fixedQuantityLimit !== undefined && (
                                        <div className="animate-in fade-in slide-in-from-right-2">
                                            <label className="block text-[10px] font-bold text-orange-400 uppercase mb-1">Meta (Número de Vezes)</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                                                value={editingTask.task.fixedQuantityLimit || 1}
                                                onChange={(e) => handleTaskFieldUpdate({ fixedQuantityLimit: parseInt(e.target.value) || 1 })}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="bg-indigo-900/30 border border-indigo-900 p-4 rounded text-sm text-indigo-200">
                                <div className="font-bold mb-1">ℹ️ Sobre a Regra selecionada:</div>
                                {RULE_DESCRIPTIONS[editingTask.task.ruleValue || 'INTEGRATED']}
                            </div>
                            <div className="bg-slate-800 p-4 rounded border border-slate-700 flex justify-between items-center">
                                <span className="text-slate-400 font-bold uppercase text-xs">PA Base Estimado (Sem AIM)</span>
                                <span className="text-2xl font-bold text-white">{calculateTaskPA(editingTask.task)}</span>
                            </div>

                            {isCreatingTask && (
                                <button 
                                    onClick={handleSaveNewTask}
                                    className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                                >
                                    <Check size={24} /> Criar Tarefa
                                </button>
                            )}
                        </div>
                    )}

                    {taskModalTab === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            <div>
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Users size={16}/> Selecionar Participantes</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {gameState.users.map(u => {
                                        const isSelected = (editingTask.task.participants || [editingTask.task.creatorId]).includes(u.id);
                                        return (
                                            <div key={u.id} className={`p-3 rounded border flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                                                onClick={() => {
                                                    const current = editingTask.task.participants || [editingTask.task.creatorId];
                                                    const newParticipants = isSelected ? current.filter(id => id !== u.id) : [...current, u.id];
                                                    handleTaskFieldUpdate({ participants: newParticipants });
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">{u.name.substring(0,2)}</div>
                                                    <div>
                                                        <span className="text-sm font-bold text-slate-200 block">{u.name}</span>
                                                        <span className="text-[10px] text-slate-400">{gameState.squads.find(s => s.id === u.squadId)?.name}</span>
                                                    </div>
                                                </div>
                                                {isSelected && <CheckCircle2 size={16} className="text-green-400"/>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Calculator size={16}/> Distribuição de Pontos</h4>
                                
                                {editingTask.task.ruleValue === 'NEGOTIATED' ? (
                                    <div className="space-y-4 flex-1">
                                        <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded text-sm mb-2">
                                            <p className="text-blue-200 text-xs">Regra <strong>Negociada</strong>: Distribua manualmente os pontos entre os participantes.</p>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold uppercase text-slate-400">Total PA Disponível</span>
                                            <span className="text-xl font-bold text-white">{editingTask.task.size * editingTask.task.complexity}</span>
                                        </div>

                                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                            {(editingTask.task.participants || [editingTask.task.creatorId]).map(userId => {
                                                const user = gameState.users.find(u => u.id === userId);
                                                const currentVal = editingTask.task.customPaDistribution?.[userId] || 0;
                                                return (
                                                    <div key={userId} className="flex justify-between items-center bg-slate-900 p-2 rounded">
                                                        <span className="text-sm text-slate-300">{user?.name || userId}</span>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-right text-white text-sm"
                                                            value={currentVal}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                handleTaskFieldUpdate({
                                                                    customPaDistribution: {
                                                                        ...(editingTask.task.customPaDistribution || {}),
                                                                        [userId]: val
                                                                    }
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-600">
                                             {(() => {
                                                const totalAvailable = editingTask.task.size * editingTask.task.complexity;
                                                // Fix: Explicitly cast to number[] to resolve unknown type addition error during reduction
                                                const currentDistributed = (Object.values(editingTask.task.customPaDistribution || {}) as number[]).reduce((a, b) => a + b, 0);
                                                const isMatch = currentDistributed === totalAvailable;
                                                return (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs uppercase text-slate-400">Distribuído</span>
                                                        <span className="text-xl font-bold" style={{color: isMatch ? '#22c55e' : '#ef4444'}}>
                                                            {currentDistributed} / {totalAvailable}
                                                        </span>
                                                    </div>
                                                );
                                             })()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between border-b border-slate-600 pb-2">
                                            <span className="text-slate-400">Regra Atual</span>
                                            <span className="font-bold text-indigo-300">{editingTask.task.ruleLabel}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-600 pb-2">
                                            <span className="text-slate-400">Participantes</span>
                                            <span className="font-bold text-white">{editingTask.task.participants?.length || 1}</span>
                                        </div>
                                        <div className="pt-2">
                                            <div className="text-center mb-2 text-slate-400">Cada participante receberá:</div>
                                            <div className="text-center text-3xl font-bold text-green-400">
                                                {calculateTaskPA(editingTask.task)} <span className="text-sm text-slate-500">PA/Moedas</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 text-center italic mt-4">
                                            *Valor final depende da nota AIM do mentor.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {taskModalTab === 3 && (
                         <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Link da Entrega (Drive, Figma, Github...)</label>
                                <div className="flex gap-2">
                                    <div className="bg-slate-700 p-2 rounded text-slate-400"><LinkIcon size={18}/></div>
                                    <input 
                                        className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 text-white text-sm"
                                        placeholder="https://..."
                                        value={editingTask.task.evidenceLink || ''}
                                        onChange={(e) => handleTaskFieldUpdate({ evidenceLink: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Notas de Entrega</label>
                                <textarea 
                                    className="w-full h-24 bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm"
                                    placeholder="Comentários sobre o que foi feito..."
                                    value={editingTask.task.deliveryNotes || ''}
                                    onChange={(e) => handleTaskFieldUpdate({ deliveryNotes: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Reflexões e Aprendizados</label>
                                <textarea 
                                    className="w-full h-24 bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm"
                                    placeholder="O que aprendemos com essa tarefa?"
                                    value={editingTask.task.reflections || ''}
                                    onChange={(e) => handleTaskFieldUpdate({ reflections: e.target.value })}
                                />
                            </div>
                         </div>
                    )}

                    {taskModalTab === 4 && (
                        <div className="h-full">
                            {editingTask.task.status === 'DONE' ? (
                                <div className="text-center py-10">
                                    <div className="inline-block p-4 bg-green-900/30 rounded-full mb-4">
                                        <Award size={48} className="text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Tarefa Avaliada!</h3>
                                    <p className="text-slate-400 mb-6">Esta tarefa foi concluída com sucesso.</p>
                                    
                                    <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-lg border border-slate-700 text-left space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Nota AIM</span>
                                            <span className="font-bold text-white">{editingTask.task.aim} / 3</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Feedback</span>
                                            <p className="text-sm text-slate-300 text-right max-w-[200px]">{editingTask.task.feedback || "Sem feedback registrado."}</p>
                                        </div>
                                        <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
                                            <span className="text-slate-400">Recompensa Final (Você)</span>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-yellow-400">{editingTask.task.finalCoins} Moedas</div>
                                                <div className="text-xs text-indigo-400">{editingTask.task.finalXP} XP</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : editingTask.task.status === 'REVIEW' ? (
                                <div className="max-w-lg mx-auto space-y-6">
                                    <div className="bg-purple-900/20 border border-purple-500/50 p-4 rounded text-center">
                                        <h4 className="font-bold text-purple-300">Tarefa em Revisão</h4>
                                        <p className="text-xs text-purple-200 mt-1">
                                            {isMaster 
                                                ? "Como Senior/Master, avalie o impacto desta entrega para liberar as recompensas." 
                                                : "Aguardando avaliação do Senior/Master."
                                            }
                                        </p>
                                    </div>

                                    {isMaster ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Feedback do Mentor/Master</label>
                                                <textarea 
                                                    className="w-full h-24 bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm"
                                                    placeholder="Pontos fortes e pontos de melhoria..."
                                                    value={editingTask.task.feedback || ''}
                                                    onChange={(e) => updateTask(editingTask.buildingId, editingTask.task.id, { feedback: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nota de Impacto (AIM)</label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {AIM_OPTIONS.map(option => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => updateTask(editingTask.buildingId, editingTask.task.id, { aim: option.value })}
                                                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${editingTask.task.aim === option.value ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'}`}
                                                        >
                                                            <span className="font-bold text-sm">{option.label}</span>
                                                            <span className="font-mono text-xs bg-black/20 px-2 py-1 rounded">x{option.multiplier}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button 
                                                onClick={confirmGrading}
                                                className="w-full mt-6 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={24}/> Confirmar Avaliação & Distribuir Recompensas
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-slate-500 border border-slate-700/50 rounded-lg bg-slate-900/30">
                                            <Lock size={48} className="mb-4 text-purple-500/50"/>
                                            <p className="text-center max-w-xs font-bold">Avaliação bloqueada.</p>
                                            <p className="text-center text-xs mt-2 max-w-xs">Apenas o usuário Senior/Master pode atribuir a nota AIM e liberar os pontos.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                    <Lock size={48} className="mb-4 opacity-50"/>
                                    <p className="text-center max-w-xs">A avaliação só fica disponível quando a tarefa está na coluna <strong>Para Revisão</strong>.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {taskModalTab === 5 && (
                        <div className="h-full">
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2"><History size={18}/> Histórico de Rotina</h4>
                            {!editingTask.task.history || editingTask.task.history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                                    <Clock size={48} className="mb-2 opacity-20"/>
                                    <p>Nenhuma rotina executada ainda.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold">
                                            <tr>
                                                <th className="p-3">Data/Hora</th>
                                                <th className="p-3">Participantes</th>
                                                <th className="p-3 text-center">Sprint</th>
                                                <th className="p-3 text-right">AIM</th>
                                                <th className="p-3 text-right">XP</th>
                                                <th className="p-3 text-right">Coins</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {editingTask.task.history.slice().reverse().map((entry, idx) => (
                                                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                                                    <td className="p-3 text-xs text-slate-300">
                                                        {new Date(entry.timestamp).toLocaleDateString()} <br/>
                                                        <span className="text-slate-500">{new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex -space-x-2">
                                                            {entry.participants.map(pid => {
                                                                const user = gameState.users.find(u => u.id === pid);
                                                                return (
                                                                    <div key={pid} title={user?.name} className="w-6 h-6 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                                                                        {user?.name.substring(0,2)}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center font-mono text-xs text-slate-400">{entry.sprint}</td>
                                                    <td className="p-3 text-right">
                                                        <span className={`font-bold ${entry.aim >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>{entry.aim}</span>
                                                    </td>
                                                    <td className="p-3 text-right font-mono text-indigo-400">+{entry.xp}</td>
                                                    <td className="p-3 text-right font-mono text-yellow-500">+{entry.coins}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
