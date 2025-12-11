
import { SyncData, GamificationState, ProgressData, ErrorFlashcard, Folder } from '../types';

export const mergeData = (local: SyncData, cloud: SyncData): SyncData => {
    return {
        timestamp: Date.now(),
        gamification: mergeGamification(local.gamification, cloud.gamification),
        progress: mergeProgress(local.progress, cloud.progress),
        folders: mergeFolders(local.folders, cloud.folders),
        flashcards: mergeFlashcards(local.flashcards, cloud.flashcards),
    };
};

const mergeGamification = (local: GamificationState, cloud: GamificationState): GamificationState => {
    // Strategy: Maximize XP/Tokens/Level, merge arrays
    
    // If one is significantly ahead in XP, prefer it base structure
    const base = local.xp > cloud.xp ? local : cloud;
    const other = local.xp > cloud.xp ? cloud : local;

    return {
        ...base,
        // Take max of accumulated stats
        totalCorrectAnswers: Math.max(local.totalCorrectAnswers, cloud.totalCorrectAnswers),
        totalQuestionsAnswered: Math.max(local.totalQuestionsAnswered, cloud.totalQuestionsAnswered),
        maxCorrectAnswersInADay: Math.max(local.maxCorrectAnswersInADay, cloud.maxCorrectAnswersInADay),
        
        // Merge unlocked arrays (unique)
        unlockedThemes: Array.from(new Set([...local.unlockedThemes, ...cloud.unlockedThemes])),
        unlockedBadges: Array.from(new Set([...local.unlockedBadges, ...cloud.unlockedBadges])),
        pdfsWithQuestionsGenerated: Array.from(new Set([...local.pdfsWithQuestionsGenerated, ...cloud.pdfsWithQuestionsGenerated])),
        
        // Complex object merges (Pages Read)
        pagesReadPerPdf: mergePagesRead(local.pagesReadPerPdf, cloud.pagesReadPerPdf),
        completedPagesPerPdf: mergeCompletedPages(local.completedPagesPerPdf, cloud.completedPagesPerPdf),
    };
};

const mergePagesRead = (local: Record<string, any>, cloud: Record<string, any>) => {
    const merged = { ...local };
    for (const id in cloud) {
        if (!merged[id]) {
            merged[id] = cloud[id];
        } else {
            // Merge read pages arrays
            const combinedPages = Array.from(new Set([...merged[id].readPages, ...cloud[id].readPages]));
            merged[id] = {
                ...merged[id],
                readPages: combinedPages,
                totalPages: Math.max(merged[id].totalPages, cloud[id].totalPages)
            };
        }
    }
    return merged;
};

const mergeCompletedPages = (local: Record<string, number[]>, cloud: Record<string, number[]>) => {
    const merged = { ...local };
    for (const id in cloud) {
        if (!merged[id]) {
            merged[id] = cloud[id];
        } else {
            merged[id] = Array.from(new Set([...merged[id], ...cloud[id]]));
        }
    }
    return merged;
};

const mergeProgress = (local: Record<string, ProgressData>, cloud: Record<string, ProgressData>): Record<string, ProgressData> => {
    const merged = { ...local };
    
    for (const id in cloud) {
        const cloudItem = cloud[id];
        const localItem = local[id];

        if (!localItem) {
            merged[id] = cloudItem;
        } else {
            // Conflict: Check sessionDate
            const localDate = new Date(localItem.sessionDate).getTime();
            const cloudDate = new Date(cloudItem.sessionDate).getTime();
            
            // If cloud is newer, take cloud. HOWEVER, we might want to merge questionsByPage if they differ.
            // For simplicity in "No Server" architecture, we take the newest session snapshot mostly,
            // but we can try to merge the questions array to not lose generated questions.
            
            const base = cloudDate > localDate ? cloudItem : localItem;
            
            // Merge questionsByPage keys
            const mergedQuestions = { ...localItem.questionsByPage, ...cloudItem.questionsByPage };
            
            merged[id] = {
                ...base,
                questionsByPage: mergedQuestions,
                // Ensure max pages/progress is kept if dates are close
                pagesCompleted: Math.max(localItem.pagesCompleted, cloudItem.pagesCompleted),
                questionsAnswered: Math.max(localItem.questionsAnswered, cloudItem.questionsAnswered),
                flashcardsCreated: Math.max(localItem.flashcardsCreated, cloudItem.flashcardsCreated),
            };
        }
    }
    return merged;
};

const mergeFolders = (local: Folder[], cloud: Folder[]): Folder[] => {
    // Merge by ID
    const folderMap = new Map<string, Folder>();
    
    local.forEach(f => folderMap.set(f.id, f));
    
    cloud.forEach(f => {
        if (folderMap.has(f.id)) {
            const existing = folderMap.get(f.id)!;
            // Merge files list
            const mergedFiles = Array.from(new Set([...existing.files, ...f.files]));
            folderMap.set(f.id, { ...existing, files: mergedFiles });
        } else {
            folderMap.set(f.id, f);
        }
    });

    return Array.from(folderMap.values());
};

const mergeFlashcards = (local: ErrorFlashcard[], cloud: ErrorFlashcard[]): ErrorFlashcard[] => {
    const cardMap = new Map<string, ErrorFlashcard>();

    local.forEach(c => cardMap.set(c.id, c));

    cloud.forEach(c => {
        if (cardMap.has(c.id)) {
            const existing = cardMap.get(c.id)!;
            // Strategy: Use the one with the latest review or interaction
            // Since we track history, we can check history length or lastReviewDate
            const existingLastReview = existing.lastReviewDate || 0;
            const cloudLastReview = c.lastReviewDate || 0;
            
            if (cloudLastReview > existingLastReview) {
                cardMap.set(c.id, c);
            }
            // Else keep local
        } else {
            cardMap.set(c.id, c);
        }
    });

    return Array.from(cardMap.values());
};
