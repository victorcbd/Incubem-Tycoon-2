
import { GoogleGenAI } from "@google/genai";
import { DailyAnalysis, FeedbackAnalysis, DailyEntry, FeedbackEntry, AcademyGap, AcademyVideo, KanbanTask, Squad } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// Use 'gemini-3-flash-preview' for basic text tasks like summarization and analysis.
const MODEL_NAME = "gemini-3-flash-preview";

const cleanJsonString = (text: string) => {
    let clean = text.trim();
    if (clean.startsWith('```json')) clean = clean.replace('```json', '').replace('```', '');
    if (clean.startsWith('```')) clean = clean.replace('```', '').replace('```', '');
    return clean;
};

export const geminiService = {
    analyzeDaily: async (
        entry: Pick<DailyEntry, 'yesterday' | 'today' | 'blockers' | 'memberName' | 'role' | 'date'>
    ): Promise<DailyAnalysis> => {
        const prompt = `
            Você é o "Mentor Incubem", um gestor de squads e coach.
            Analise este Daily Standup:
            - Membro: ${entry.memberName}
            - Função: ${entry.role}
            - Data: ${entry.date}

            Respostas:
            1. Fez: ${entry.yesterday}
            2. Fará: ${entry.today}
            3. Bloqueios: ${entry.blockers}

            Critérios:
            - PRODUTIVO: Entregas claras + planejamento sólido + sem bloqueios críticos
            - REGULAR: Atividade normal, rotineira
            - ATENÇÃO: Vago, desorganizado, bloqueios graves, sinais de desmotivação

            Retorne APENAS um JSON válido com este formato, sem markdown:
            {
            "status": "PRODUTIVO" | "REGULAR" | "ATENCAO",
            "summary": "Resumo de 1-2 frases tom jovial",
            "consistencyCheck": "Breve análise da coerência",
            "riskDetected": boolean,
            "riskDetails": "Explicação se houver risco",
            "advice": "Dica prática e encorajadora",
            "tags": ["skill1", "skill2", ...]
            }
        `;

        try {
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: prompt
            });
            const text = response.text || "{}";
            return JSON.parse(cleanJsonString(text)) as DailyAnalysis;
        } catch (error) {
            console.error("Gemini Daily Error:", error);
            return {
                status: 'ATENCAO',
                summary: 'Erro na análise da IA.',
                consistencyCheck: 'N/A',
                riskDetected: false,
                riskDetails: '',
                advice: 'Tente novamente.',
                tags: []
            };
        }
    },

    analyzeFeedback: async (
        entry: Pick<FeedbackEntry, 'relationship' | 'q_comm' | 'q_empathy' | 'q_collab' | 'q_conflict' | 'q_strengths' | 'q_weaknesses' | 'q_impact' | 'q_development'>
    ): Promise<FeedbackAnalysis> => {
        const isSelf = entry.relationship === 'SELF';
        const content = isSelf 
            ? `
                1. Pontos Fortes: ${entry.q_strengths}
                2. Pontos de Melhoria: ${entry.q_weaknesses}
                3. Impacto: ${entry.q_impact}
                4. Desenvolvimento: ${entry.q_development}
              `
            : `
                1. Comunicação: ${entry.q_comm}
                2. Empatia: ${entry.q_empathy}
                3. Colaboração: ${entry.q_collab}
                4. Conflitos: ${entry.q_conflict}
              `;

        const prompt = `
            Você é um psicólogo organizacional e mentor.
            Analise esta avaliação (${entry.relationship}):
            ${content}

            Retorne APENAS um JSON válido com este formato, sem markdown:
            {
            "emotionalTone": "Tom detectado (ex: Construtivo)",
            "sentimentScore": number (0-100),
            "strengths": ["Skill 1", "Skill 2", ...],
            "gaps": ["Gap 1", "Gap 2", ...],
            "relationshipHealth": "SAUDAVEL" | "EM_RISCO" | "PRECISA_AJUSTE",
            "recommendations": ["Ação 1", "Ação 2", ...]
            }
        `;

        try {
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: prompt
            });
            const text = response.text || "{}";
            return JSON.parse(cleanJsonString(text)) as FeedbackAnalysis;
        } catch (error) {
             console.error("Gemini Feedback Error:", error);
             return {
                 emotionalTone: 'Erro',
                 sentimentScore: 0,
                 strengths: [],
                 gaps: [],
                 relationshipHealth: 'PRECISA_AJUSTE',
                 recommendations: []
             };
        }
    },

    // --- ACADEMY METHODS ---

    diagnoseGaps: async (
        tasks: KanbanTask[],
        dailies: DailyEntry[],
        feedbacks: FeedbackEntry[],
        squads: Squad[]
    ): Promise<AcademyGap[]> => {
        // Prepare data summary to reduce token usage
        const blockedTasks = tasks.filter(t => t.status === 'BLOCKED').map(t => t.content);
        const lowAimTasks = tasks.filter(t => t.status === 'DONE' && (t.aim || 0) <= 1).map(t => t.content);
        const dailyRisks = dailies.filter(d => d.analysis?.riskDetected).map(d => d.analysis?.riskDetails);
        const feedbackGaps = feedbacks.flatMap(f => f.analysis?.gaps || []);
        
        const summary = `
            Tarefas Bloqueadas: ${JSON.stringify(blockedTasks.slice(0, 10))}
            Tarefas com Baixa Performance: ${JSON.stringify(lowAimTasks.slice(0, 10))}
            Riscos em Dailies: ${JSON.stringify(dailyRisks.slice(0, 10))}
            Gaps de Feedback: ${JSON.stringify(feedbackGaps.slice(0, 20))}
        `;

        const prompt = `
            Você é o Diretor da Academy Incubem.
            Analise estes dados de performance de uma guilda de tecnologia e inovação:
            ${summary}

            Identifique de 3 a 5 principais Gaps de Conhecimento (Técnicos ou Soft Skills).
            Para cada gap, invente evidências plausíveis baseadas no contexto.

            Retorne APENAS um JSON array válido com este formato:
            [
                {
                    "skill": "Nome do Gap",
                    "severity": 0-20 (inteiro),
                    "urgency": "CRÍTICO" | "ALTO" | "MÉDIO",
                    "evidence": ["evidencia 1", "evidencia 2"],
                    "affectedMembers": ["Nome1", "Nome2"],
                    "recommendedLevel": "Iniciante" | "Intermediário" | "Avançado"
                }
            ]
        `;

        try {
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: prompt
            });
            const text = response.text || "[]";
            const gaps = JSON.parse(cleanJsonString(text)) as any[];
            return gaps.map((g, i) => ({ ...g, id: `gap_${Date.now()}_${i}`, timestamp: Date.now() }));
        } catch (error) {
            console.error("Gemini Diagnosis Error:", error);
            return [];
        }
    },

    generateCuratorship: async (gap: AcademyGap): Promise<AcademyVideo[]> => {
        const prompt = `
            Você é um curador educacional da Incubem.
            Gap: "${gap.skill}"
            Nível: ${gap.recommendedLevel}
            Contexto: ${gap.evidence.join('; ')}

            Gere uma lista de 4 a 6 vídeos do YouTube (REAIS ou simulados com alta precisão) que ensinem essa skill.
            Priorize canais brasileiros de tecnologia (ex: Código Fonte TV, Rocketseat, Filipe Deschamps, Curso em Vídeo, Akita, etc) ou Soft Skills.

            Retorne APENAS um JSON array válido:
            [
                {
                    "title": "Título do Vídeo",
                    "channel": "Nome do Canal",
                    "description": "Breve descrição didática",
                    "duration": "XXmin",
                    "videoUrl": "https://youtube.com/watch?v=mockID", 
                    "relevanceScore": 8-10,
                    "qualityScore": 8-10,
                    "audienceFit": 8-10,
                    "recommendation": "EXCELENTE" | "BOM",
                    "reasoning": "Por que este vídeo ajuda no gap"
                }
            ]
        `;

        try {
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: prompt
            });
            const text = response.text || "[]";
            const videos = JSON.parse(cleanJsonString(text)) as any[];
            return videos.map((v, i) => ({ 
                ...v, 
                id: `vid_${Date.now()}_${i}`, 
                status: 'DRAFT', 
                thumbnailUrl: `https://img.youtube.com/vi/${Math.random().toString(36).substring(7)}/hqdefault.jpg` // Mock thumb
            }));
        } catch (error) {
            console.error("Gemini Curation Error:", error);
            return [];
        }
    }
};
