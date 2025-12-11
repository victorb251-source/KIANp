





import { useState, useEffect, useCallback } from 'react';
import { ErrorFlashcard, GeneratedQuestion, CustomReviewConfig } from '../types';
import { ERROR_FLASHCARDS_STORAGE_KEY } from '../constants';
import { playSound } from '../utils/audioPlayer';
import { CORRECT_ANSWER_SOUND_URL, INCORRECT_ANSWER_SOUND_URL } from '../constants';

// Initial ease factor for SM-2
const DEFAULT_EASE_FACTOR = 2.5;

const useErrorFlashcards = () => {
    const [flashcards, setFlashcards] = useState<ErrorFlashcard[]>(() => {
        try {
            const saved = localStorage.getItem(ERROR_FLASHCARDS_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load flashcards", e);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(ERROR_FLASHCARDS_STORAGE_KEY, JSON.stringify(flashcards));
        } catch (e) {
            console.error("Failed to save flashcards", e);
        }
    }, [flashcards]);

    const addError = useCallback((question: GeneratedQuestion, pdfId: string, pdfName: string) => {
        setFlashcards(prev => {
            // Check if this exact question already exists to avoid duplicates
            const existingIndex = prev.findIndex(fc => 
                fc.sourcePdfId === pdfId && 
                fc.question.question_text === question.question_text
            );
            
            if (existingIndex !== -1) {
                // Determine if we should re-flag it as an error if it was previously mastered
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    isFlaggedError: true // Re-flag as error since the user got it wrong again in context
                };
                return updated;
            }

            // Remove the previous userAnswer so the flashcard appears fresh
            const cleanQuestion = { ...question };
            delete cleanQuestion.userAnswer;

            const newCard: ErrorFlashcard = {
                id: `${pdfId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                question: cleanQuestion,
                sourcePdfId: pdfId,
                sourcePdfName: pdfName,
                createdAt: Date.now(),
                nextReview: Date.now(), // Due immediately
                lastReviewDate: 0,
                interval: 0,
                easeFactor: DEFAULT_EASE_FACTOR,
                repetitions: 0,
                history: [],
                isFlaggedError: true,
            };

            return [...prev, newCard];
        });
    }, []);
    
    // Add manual flashcard generated from "Create Flashcard" button
    const addManualFlashcard = useCallback((question: GeneratedQuestion, flashcardData: {front: string, back: string}, pdfId: string, pdfName: string) => {
        setFlashcards(prev => {
            // Check existence based on question text or front text
            const exists = prev.some(fc => 
                fc.sourcePdfId === pdfId && 
                (fc.question.question_text === question.question_text || fc.question.flashcard?.front === flashcardData.front)
            );
            
            if (exists) return prev;

            const cleanQuestion = { ...question, flashcard: flashcardData };
            delete cleanQuestion.userAnswer;

            const newCard: ErrorFlashcard = {
                id: `${pdfId}-manual-${Date.now()}`,
                question: cleanQuestion,
                sourcePdfId: pdfId,
                sourcePdfName: pdfName,
                createdAt: Date.now(),
                nextReview: Date.now(),
                lastReviewDate: 0,
                interval: 0,
                easeFactor: DEFAULT_EASE_FACTOR,
                repetitions: 0,
                history: [],
                isFlaggedError: false, // Manual flashcards start as neutral study material, not necessarily "errors"
            };
            
            return [...prev, newCard];
        });
    }, []);

    const getDueFlashcards = useCallback(() => {
        const now = Date.now();
        return flashcards.filter(fc => fc.nextReview <= now).sort((a, b) => a.nextReview - b.nextReview);
    }, [flashcards]);
    
    // Get flashcards based on custom configuration
    const getCustomReviewDeck = useCallback((config: CustomReviewConfig) => {
        let deck = flashcards.filter(fc => {
            if (config.includeHard) {
                // Include flagged errors OR recent 'hard' ratings
                if (fc.isFlaggedError) return true;
                const lastHistory = fc.history[fc.history.length - 1];
                return lastHistory && lastHistory.rating === 'hard';
            }
            return fc.isFlaggedError;
        });

        // Sorting
        if (config.order === 'newest') {
            deck.sort((a, b) => b.createdAt - a.createdAt);
        } else if (config.order === 'oldest') {
            deck.sort((a, b) => a.createdAt - b.createdAt);
        } else {
            // Random shuffle
            deck = deck.sort(() => Math.random() - 0.5);
        }

        // Limit count
        return deck.slice(0, config.count);
    }, [flashcards]);

    // SM-2 Algorithm Implementation with Flexible Spacing
    const processReview = useCallback((cardId: string, quality: 'wrong' | 'hard' | 'easy', syncWithSRS: boolean = true) => {
        
        // Sound feedback
        if (quality === 'wrong') {
            playSound(INCORRECT_ANSWER_SOUND_URL);
        } else {
            playSound(CORRECT_ANSWER_SOUND_URL);
        }

        setFlashcards(prev => prev.map(card => {
            if (card.id !== cardId) return card;

            // If we are NOT syncing with SRS (Custom Error Review mode), we only update history and error flag
            if (!syncWithSRS) {
                return {
                    ...card,
                    // If they got it wrong or hard, keep/set error flag. If easy, maybe clear it?
                    // Let's adopt a policy: Easy -> Clear Error Flag. Wrong/Hard -> Keep Error Flag.
                    isFlaggedError: quality === 'easy' ? false : true,
                    history: [
                        ...(card.history || []),
                        { date: Date.now(), rating: quality, interval: card.interval } // Log interval as is
                    ]
                };
            }

            // --- Full SRS Update Logic ---

            let interval = card.interval;
            let repetitions = card.repetitions;
            let easeFactor = card.easeFactor;
            const now = Date.now();

            // Calculate actual days passed since last review (Flexible Spacing)
            // If it's a new card (lastReviewDate = 0), use 0.
            const daysSinceLastReview = card.lastReviewDate > 0 
                ? Math.max(0, (now - card.lastReviewDate) / (24 * 60 * 60 * 1000))
                : 0;

            if (quality === 'wrong') {
                repetitions = 0;
                interval = 0; // Immediate review
                // Ease factor doesn't change on fail in strict SM-2 usually, or drops slightly
            } else {
                // Success logic (Hard or Easy)
                
                // Flexible Spacing Adjustment:
                // If the user reviews EARLY (daysSinceLastReview < card.interval), 
                // we shouldn't grant the full bonus calculated on the scheduled interval.
                // We use the ACTUAL elapsed time as the basis for the next interval calculation.
                // However, if the user reviews LATE, we use the actual time too (bonus for remembering longer),
                // or stick to the scheduled interval? SM-2 usually uses scheduled. 
                // A modern approach is: NewInterval = ActualInterval * Multiplier.
                
                let effectiveInterval = interval;
                
                // If reviewed early, use actual time passed (but at least 1 day if it wasn't immediate review)
                if (daysSinceLastReview < interval && interval > 1) {
                    effectiveInterval = Math.max(1, Math.round(daysSinceLastReview));
                }
                
                if (repetitions === 0) {
                    interval = 1; // 1 day
                } else if (repetitions === 1) {
                    interval = 6; // 6 days
                } else {
                    // For subsequent repetitions, use the effective interval * easeFactor
                    interval = Math.round(effectiveInterval * easeFactor);
                }
                repetitions += 1;
            }

            if (quality === 'hard') {
                easeFactor = Math.max(1.3, easeFactor - 0.15);
                if (interval > 1) interval = Math.max(1, Math.round(interval * 0.8)); // Hard penalty on interval
            } else if (quality === 'easy') {
                easeFactor += 0.15;
            }
            
            // Calculate next review date
            const nextReview = now + (interval * 24 * 60 * 60 * 1000);

            return {
                ...card,
                interval,
                repetitions,
                easeFactor,
                nextReview: interval === 0 ? now + 60000 : nextReview, // 1 min delay if wrong
                lastReviewDate: now,
                // Update Flag: If 'easy', we assume the error is resolved. If 'wrong'/'hard', it stays flagged.
                isFlaggedError: quality === 'easy' ? false : true, 
                history: [
                    ...(card.history || []),
                    { date: now, rating: quality, interval }
                ]
            };
        }));
    }, []);

    const removeFlashcard = useCallback((cardId: string) => {
        setFlashcards(prev => prev.filter(fc => fc.id !== cardId));
    }, []);
    
    const importFlashcards = useCallback((newCards: ErrorFlashcard[]) => {
        setFlashcards(newCards);
        localStorage.setItem(ERROR_FLASHCARDS_STORAGE_KEY, JSON.stringify(newCards));
    }, []);

    const getStats = useCallback(() => {
        const now = Date.now();
        const pending = flashcards.filter(fc => fc.nextReview <= now).length;
        const errors = flashcards.filter(fc => fc.isFlaggedError).length;
        return { pending, errors, total: flashcards.length };
    }, [flashcards]);

    return {
        flashcards,
        addError,
        addManualFlashcard,
        getDueFlashcards,
        getCustomReviewDeck,
        processReview,
        removeFlashcard,
        getStats,
        importFlashcards
    };
};

export default useErrorFlashcards;