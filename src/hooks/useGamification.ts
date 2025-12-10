

import { useState, useEffect, useCallback } from 'react';
import { GamificationState, Toast, ShopItem, Badge, GeneratedQuestion, BadgeRarity } from '../types';
import { GAMIFICATION_STORAGE_KEY, REWARDS, LEVELS, BADGES, DEFAULT_THEME_ID } from '../constants';
import { isToday, isYesterday, isSameDay } from '../utils/dateUtils';

const defaultState: GamificationState = {
    levelIndex: 0,
    xp: 0,
    tokens: 0,
    activeTheme: DEFAULT_THEME_ID,
    unlockedThemes: [DEFAULT_THEME_ID],
    lastSessionDate: null,
    studyStreak: 0,
    unlockedBadges: [],
    pagesReadPerPdf: {},
    completedPagesPerPdf: {},
    totalCorrectAnswers: 0,
    totalQuestionsAnswered: 0,
    correctStreak: 0,
    incorrectStreak: 0,
    badgesUnlockedThisSession: [],
    sessionStartTimestamp: Date.now(),
    maxCorrectAnswersInADay: 0,
    pdfsWithQuestionsGenerated: [],
    nightOwlStreak: 0,
    earlyBirdStreak: 0,
    lastStreakBrokenDate: null,
    correctAnswersToday: 0,
    questionsAnsweredThisSession: 0,
    sessionDurationToday: 0,
};

const useGamification = () => {
    const [state, setState] = useState<GamificationState>(() => {
        try {
            const savedState = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                return { 
                    ...defaultState, 
                    ...parsedState,
                    unlockedThemes: parsedState.unlockedThemes || [DEFAULT_THEME_ID],
                    activeTheme: parsedState.activeTheme || DEFAULT_THEME_ID,
                    sessionStartTimestamp: Date.now(),
                    badgesUnlockedThisSession: [],
                    questionsAnsweredThisSession: 0,
                };
            }
        } catch (e) {
            console.error("Failed to load gamification state", e);
        }
        return defaultState;
    });

    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, icon?: string) => {
        const newToast = { id: Date.now(), message, icon };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
        }, 3900);
    }, []);

    const updateState = useCallback((updater: (prevState: GamificationState) => Partial<GamificationState>) => {
        setState(prevState => {
            const changes = updater(prevState);
            if (Object.keys(changes).length === 0) return prevState;
            
            const intermediateState = { ...prevState, ...changes };

            // --- Level Up Check ---
            const nextLevel = LEVELS[intermediateState.levelIndex + 1];
            let newLevelIndex = intermediateState.levelIndex;
            if (nextLevel && intermediateState.xp >= nextLevel.minXp) {
                newLevelIndex = intermediateState.levelIndex + 1;
                addToast(`Você subiu para o Nível ${LEVELS[newLevelIndex].name}!`, LEVELS[newLevelIndex].icon);
            }
            
            // --- Badge Check ---
            const newlyUnlocked: string[] = [];
            for (const badge of BADGES) {
                if (badge.rarity === BadgeRarity.Legendary || intermediateState.unlockedBadges.includes(badge.id)) continue;

                let shouldUnlock = false;
                switch (badge.id) {
                    case 'FIRST_STEPS': if (intermediateState.totalCorrectAnswers >= 1) shouldUnlock = true; break;
                    case 'APPRENTICE': if (intermediateState.totalCorrectAnswers >= 10) shouldUnlock = true; break;
                    case 'SCHOLAR': if (intermediateState.totalCorrectAnswers >= 50) shouldUnlock = true; break;
                    case 'WISE_BEGINNER': if (intermediateState.totalCorrectAnswers >= 100) shouldUnlock = true; break;
                    case 'MASTER_OF_KNOWLEDGE': if (intermediateState.totalCorrectAnswers >= 1000) shouldUnlock = true; break;
                    case 'FIRST_TRY_ACE': if (intermediateState.correctStreak >= 5) shouldUnlock = true; break;
                    case 'PERFECT_COMBO': if (intermediateState.correctStreak >= 10) shouldUnlock = true; break;
                    case 'PRECISION_MASTER': if (intermediateState.correctStreak >= 50) shouldUnlock = true; break;
                    case 'INVINCIBLE': if (intermediateState.correctStreak >= 100) shouldUnlock = true; break;
                    case 'MAD_SCIENTIST': if (intermediateState.incorrectStreak >= 10) shouldUnlock = true; break;
                    case 'STEADY_STRONG': if (intermediateState.studyStreak >= 3) shouldUnlock = true; break;
                    case 'NO_FAIL': if (intermediateState.studyStreak >= 7) shouldUnlock = true; break;
                    case 'MASTER_ROUTINE': if (intermediateState.studyStreak >= 30) shouldUnlock = true; break;
                    case 'MENTAL_MARATHONER': if (intermediateState.studyStreak >= 100) shouldUnlock = true; break;
                    case 'YEAR_OF_STUDY': if (intermediateState.studyStreak >= 365) shouldUnlock = true; break;
                    case 'WISDOM_OWL': if (intermediateState.nightOwlStreak >= 10) shouldUnlock = true; break;
                    case 'EARLY_BIRD': if (intermediateState.earlyBirdStreak >= 10) shouldUnlock = true; break;
                    case 'CHAPTER_EXPLORER': if (new Set(intermediateState.pdfsWithQuestionsGenerated).size >= 10) shouldUnlock = true; break;
                    case 'SUPER_STAR': if (intermediateState.unlockedBadges.length >= 20) shouldUnlock = true; break;
                    case 'GLORY_COLLECTOR': 
                        const totalImplementableBadges = BADGES.filter(b => b.rarity !== BadgeRarity.Legendary).length;
                        if (intermediateState.unlockedBadges.length >= totalImplementableBadges) shouldUnlock = true;
                        break;
                    case 'RECORD_BREAKER': if (intermediateState.correctAnswersToday > intermediateState.maxCorrectAnswersInADay) shouldUnlock = true; break;
                    case 'COMPLETE_LIBRARY': 
                        if(Object.values(intermediateState.pagesReadPerPdf).some((p: { readPages: number[], totalPages: number }) => p.totalPages > 0 && p.readPages.length >= p.totalPages)) shouldUnlock = true; 
                        break;
                    case 'KNOWLEDGE_FANATIC': if (intermediateState.sessionDurationToday >= 4 * 3600) shouldUnlock = true; break;
                    case 'STAR_HUNTER': 
                        const todayStr = new Date().toISOString().split('T')[0];
                        const unlockedTodayCount = intermediateState.badgesUnlockedThisSession.filter(b => new Date(b.timestamp).toISOString().split('T')[0] === todayStr).length;
                        if(unlockedTodayCount >= 5) shouldUnlock = true;
                        break;
                }
                if (shouldUnlock) {
                    newlyUnlocked.push(badge.id);
                }
            }

            let finalState = { ...intermediateState, levelIndex: newLevelIndex };
            if (newlyUnlocked.length > 0) {
                 newlyUnlocked.forEach(badgeId => {
                    const unlockedBadge = BADGES.find(b => b.id === badgeId);
                    if (unlockedBadge) {
                        addToast(`Emblema: ${unlockedBadge.name}`, unlockedBadge.icon);
                    }
                });
                finalState.unlockedBadges = [...finalState.unlockedBadges, ...newlyUnlocked];
                finalState.badgesUnlockedThisSession = [
                    ...finalState.badgesUnlockedThisSession,
                    ...newlyUnlocked.map(id => ({ id, timestamp: Date.now() }))
                ];
            }
            
            if (finalState.correctAnswersToday > finalState.maxCorrectAnswersInADay) {
                finalState.maxCorrectAnswersInADay = finalState.correctAnswersToday;
            }

            return finalState;
        });
    }, [addToast]);

    // Daily Logic
    useEffect(() => {
        const today = new Date();
        const lastSession = state.lastSessionDate ? new Date(state.lastSessionDate) : null;
        let updates: Partial<GamificationState> = {};
        
        if (!lastSession || !isToday(lastSession)) {
            updates.sessionDurationToday = 0;
            updates.correctAnswersToday = 0;
            const currentHour = today.getHours();

            if (lastSession && isYesterday(lastSession)) {
                updates.studyStreak = state.studyStreak + 1;
                updates.nightOwlStreak = (currentHour >= 22) ? state.nightOwlStreak + 1 : 0;
                updates.earlyBirdStreak = (currentHour < 6) ? state.earlyBirdStreak + 1 : 0;
            } else if (lastSession) {
                updates.studyStreak = 1;
                updates.nightOwlStreak = (currentHour >= 22) ? 1 : 0;
                updates.earlyBirdStreak = (currentHour < 6) ? 1 : 0;
                updates.lastStreakBrokenDate = lastSession.toISOString();
            } else {
                updates.studyStreak = 1;
                updates.nightOwlStreak = (currentHour >= 22) ? 1 : 0;
                updates.earlyBirdStreak = (currentHour < 6) ? 1 : 0;
            }

            if (updates.studyStreak && updates.studyStreak > 1) {
                addToast(`${updates.studyStreak} dias de sequência!`, '🔥');
            }

            if(state.lastStreakBrokenDate){
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 7);
                if(isSameDay(new Date(state.lastStreakBrokenDate), sevenDaysAgo) && !state.unlockedBadges.includes('THE_PERSISTENT')){
                    updateState(() => ({ unlockedBadges: [...state.unlockedBadges, 'THE_PERSISTENT'] }));
                    const badge = BADGES.find(b => b.id === 'THE_PERSISTENT');
                    if(badge) addToast(`Emblema: ${badge.name}`, badge.icon);
                }
            }
        }
        
        updates.lastSessionDate = today.toISOString();
        updateState(() => updates);
        
        const timer = setInterval(() => {
            updateState(prev => ({ sessionDurationToday: prev.sessionDurationToday + 1 }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Persistence Effect
    useEffect(() => {
        try {
            localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(state));
        } catch (e) { console.error("Failed to save gamification state locally", e); }
    }, [state]);

    const logPageRead = useCallback((pdfId: string, pageNum: number, totalPages: number) => {
        updateState(prev => {
            const pagesData = prev.pagesReadPerPdf[pdfId] || { readPages: [], totalPages: 0 };
            if (!pagesData.readPages.includes(pageNum)) {
                const newReadPages = [...pagesData.readPages, pageNum];
                return {
                    pagesReadPerPdf: {
                        ...prev.pagesReadPerPdf,
                        [pdfId]: { readPages: newReadPages, totalPages },
                    }
                };
            }
            return {};
        });
    }, [updateState]);

    const logPageCompleted = useCallback((pdfId: string, pageNum: number) => {
        updateState(prev => {
            const completedPages = prev.completedPagesPerPdf[pdfId] || [];
            if (!completedPages.includes(pageNum)) {
                addToast(`+${REWARDS.PAGE_COMPLETED.xp} XP, +${REWARDS.PAGE_COMPLETED.tokens} 🪙`, '⭐');
                const pdfs = prev.pdfsWithQuestionsGenerated.includes(pdfId) ? prev.pdfsWithQuestionsGenerated : [...prev.pdfsWithQuestionsGenerated, pdfId];
                return {
                    xp: prev.xp + REWARDS.PAGE_COMPLETED.xp,
                    tokens: prev.tokens + REWARDS.PAGE_COMPLETED.tokens,
                    pdfsWithQuestionsGenerated: pdfs,
                    completedPagesPerPdf: {
                        ...prev.completedPagesPerPdf,
                        [pdfId]: [...completedPages, pageNum],
                    },
                };
            }
            return {};
        });
    }, [updateState, addToast]);

    const logAnswer = useCallback((isCorrect: boolean, answerTimeInMs: number) => {
        updateState(prev => {
            const updates: Partial<GamificationState> = {
                totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
                questionsAnsweredThisSession: prev.questionsAnsweredThisSession + 1,
            };
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();

            if (isCorrect) {
                updates.xp = prev.xp + REWARDS.CORRECT_ANSWER.xp;
                updates.tokens = prev.tokens + REWARDS.CORRECT_ANSWER.tokens;
                updates.totalCorrectAnswers = prev.totalCorrectAnswers + 1;
                updates.correctAnswersToday = prev.correctAnswersToday + 1;
                updates.correctStreak = prev.correctStreak + 1;
                updates.incorrectStreak = 0;
                addToast(`+${REWARDS.CORRECT_ANSWER.tokens} 🪙`, '✅');
                
                if (answerTimeInMs < 2000 && !prev.unlockedBadges.includes('QUESTION_NINJA')) {
                     updates.unlockedBadges = [...prev.unlockedBadges, 'QUESTION_NINJA'];
                     const badge = BADGES.find(b => b.id === 'QUESTION_NINJA');
                     if(badge) addToast(`Emblema: ${badge.name}`, badge.icon);
                } else if (answerTimeInMs < 5000 && !prev.unlockedBadges.includes('LIGHTNING_RESPONSE')) {
                     updates.unlockedBadges = [...prev.unlockedBadges, 'LIGHTNING_RESPONSE'];
                     const badge = BADGES.find(b => b.id === 'LIGHTNING_RESPONSE');
                     if(badge) addToast(`Emblema: ${badge.name}`, badge.icon);
                }
                if (hour >= 0 && hour < 5 && !prev.unlockedBadges.includes('NIGHT_OWL_SESSION')) {
                     updates.unlockedBadges = [...prev.unlockedBadges, 'NIGHT_OWL_SESSION'];
                     const badge = BADGES.find(b => b.id === 'NIGHT_OWL_SESSION');
                     if(badge) addToast(`Emblema: ${badge.name}`, badge.icon);
                }
                 if (hour === 0 && minute <= 1 && !prev.unlockedBadges.includes('MIDNIGHT_TURN')) {
                     updates.unlockedBadges = [...prev.unlockedBadges, 'MIDNIGHT_TURN'];
                     const badge = BADGES.find(b => b.id === 'MIDNIGHT_TURN');
                     if(badge) addToast(`Emblema: ${badge.name}`, badge.icon);
                }
                if (hour === 23 && minute >= 30 && prev.correctAnswersToday >= 50 && !prev.unlockedBadges.includes('FINAL_SPRINT')) {
                     updates.unlockedBadges = [...prev.unlockedBadges, 'FINAL_SPRINT'];
                     const badge = BADGES.find(b => b.id === 'FINAL_SPRINT');
                     if(badge) addToast(`Emblema: ${badge.name}`, badge.icon);
                }

            } else {
                updates.correctStreak = 0;
                updates.incorrectStreak = prev.incorrectStreak + 1;
            }
            return updates;
        });
    }, [updateState, addToast]);

    const logQuestionSessionCompleted = useCallback((questions: GeneratedQuestion[]) => {
        updateState(prev => {
            const allCorrect = questions.every(q => q.userAnswer && isCorrectAnswer(q.userAnswer, q.correct_answer));
            const updates: Partial<GamificationState> = {};

            if (allCorrect && !prev.unlockedBadges.includes('PERFECT_DAY')) {
                 updates.unlockedBadges = [...prev.unlockedBadges, 'PERFECT_DAY'];
                 const badge = BADGES.find(b => b.id === 'PERFECT_DAY');
                 if(badge) addToast(`Emblema: ${badge.name}`, badge.icon);
            }
            if (allCorrect && questions.length >= 50 && !prev.unlockedBadges.includes('INDESTRUCTIBLE')) {
                updates.unlockedBadges = [...prev.unlockedBadges, 'INDESTRUCTIBLE'];
                const badge = BADGES.find(b => b.id === 'INDESTRUCTIBLE');
                if(badge) addToast(`Emblema: ${badge.name}`, badge.icon);
            }
            return updates;
        });
    }, [updateState, addToast]);
    
    const logGoalCompleted = useCallback(() => {
        updateState(prev => {
            addToast(`Meta concluída! +${REWARDS.GOAL_COMPLETED.xp} XP, +${REWARDS.GOAL_COMPLETED.tokens} 🪙`, '🎉');
            return {
                xp: prev.xp + REWARDS.GOAL_COMPLETED.xp,
                tokens: prev.tokens + REWARDS.GOAL_COMPLETED.tokens,
            };
        });
    }, [updateState, addToast]);

    const purchaseTheme = useCallback((item: ShopItem) => {
        if (state.tokens < item.cost) { addToast("Tokens insuficientes!", '❌'); return; }
        if (state.levelIndex < item.requiredLevel) { addToast(`Requer Nível ${LEVELS[item.requiredLevel].name}`, '🔒'); return; }
        if (state.unlockedThemes.includes(item.id)) { addToast("Você já possui este tema!", '🤔'); return; }
        updateState(prev => ({ tokens: prev.tokens - item.cost, unlockedThemes: [...prev.unlockedThemes, item.id] }));
        addToast(`Tema ${item.name} comprado!`, item.icon);
    }, [state.tokens, state.levelIndex, state.unlockedThemes, updateState, addToast]);

    const setActiveTheme = useCallback((themeId: string) => {
        if(state.unlockedThemes.includes(themeId)) {
            updateState(() => ({ activeTheme: themeId }));
            addToast("Tema aplicado!", '🎨');
        }
    }, [state.unlockedThemes, updateState, addToast]);
    
    return { state, toasts, logPageRead, logAnswer, logPageCompleted, purchaseTheme, setActiveTheme, addToast, logQuestionSessionCompleted, logGoalCompleted };
};

const isCorrectAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    const cleanedUserAnswer = userAnswer.trim().toLowerCase();
    const cleanedCorrectAnswer = correctAnswer.trim().toLowerCase();
    if (cleanedUserAnswer === cleanedCorrectAnswer) return true;
    return (cleanedUserAnswer === 'certo' && cleanedCorrectAnswer === 'correto') || 
           (cleanedUserAnswer === 'correto' && cleanedCorrectAnswer === 'certo');
};

export default useGamification;