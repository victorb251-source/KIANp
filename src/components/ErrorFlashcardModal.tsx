

import React, { useState, useEffect } from 'react';
import { ErrorFlashcard } from '../types';
import { XMarkIcon, RectangleStackIcon, CheckIcon, InformationCircleIcon, CalendarDaysIcon } from './Icon';
import { formatRelativeTime } from '../utils/dateUtils';

interface ErrorFlashcardModalProps {
    isOpen: boolean;
    onClose: () => void;
    dueCards: ErrorFlashcard[];
    onReview: (cardId: string, rating: 'wrong' | 'hard' | 'easy') => void;
    onDelete: (cardId: string) => void;
}

const ErrorFlashcardModal: React.FC<ErrorFlashcardModalProps> = ({ isOpen, onClose, dueCards, onReview, onDelete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showStats, setShowStats] = useState(false);
    
    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setIsFlipped(false);
            setShowStats(false);
        }
    }, [isOpen, dueCards.length]);

    if (!isOpen) return null;

    const currentCard = dueCards[currentIndex];
    const isFinished = !currentCard;

    const handleRate = (rating: 'wrong' | 'hard' | 'easy') => {
        onReview(currentCard.id, rating);
        setIsFlipped(false);
        setShowStats(false);
    };

    // Determine content based on whether it's a manual flashcard or an automatic error question
    const frontContent = currentCard?.question.flashcard 
        ? currentCard.question.flashcard.front 
        : currentCard?.question.question_text;
        
    const backContent = currentCard?.question.flashcard 
        ? currentCard.question.flashcard.back 
        : currentCard?.question.correct_answer;
    
    const isManual = !!currentCard?.question.flashcard;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-bg-primary border border-border-color rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col animate-fade-in relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-bg-secondary p-4 flex items-center justify-between border-b border-border-color z-10">
                    <h3 className="font-bold text-text-primary flex items-center gap-2">
                        <RectangleStackIcon className="w-6 h-6 text-accent-primary" />
                        Flashcards de Erros
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-text-tertiary">
                            {isFinished ? 0 : dueCards.length} cartões pendentes
                        </span>
                        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow flex flex-col items-center justify-center p-6 overflow-y-auto bg-bg-tertiary/20 relative">
                    {isFinished ? (
                        <div className="text-center p-8 bg-bg-secondary rounded-xl shadow-lg border border-border-color max-w-md animate-fade-in">
                            <CheckIcon className="w-16 h-16 text-accent-success mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-text-primary mb-2">Tudo limpo!</h2>
                            <p className="text-text-secondary mb-6">Você revisou todos os erros pendentes por enquanto. Ótimo trabalho!</p>
                            <button 
                                onClick={onClose}
                                className="px-6 py-2 bg-accent-primary text-white font-bold rounded-lg hover:bg-accent-primary/80 transition"
                            >
                                Voltar ao Início
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col max-w-2xl mx-auto perspective-1000 relative">
                             
                             {/* Stats Overlay */}
                             {showStats && (
                                 <div className="absolute inset-0 z-20 bg-bg-secondary/95 backdrop-blur-sm rounded-xl p-6 border border-border-color flex flex-col animate-fade-in">
                                     <div className="flex justify-between items-center mb-6">
                                         <h4 className="font-bold text-lg text-text-primary flex items-center gap-2">
                                            <CalendarDaysIcon className="w-5 h-5 text-accent-secondary" />
                                            Detalhes da Revisão
                                         </h4>
                                         <button onClick={() => setShowStats(false)} className="text-text-tertiary hover:text-text-primary"><XMarkIcon className="w-6 h-6" /></button>
                                     </div>
                                     
                                     <div className="space-y-6">
                                         <div className="grid grid-cols-2 gap-4">
                                             <div className="bg-bg-tertiary p-3 rounded-lg">
                                                 <p className="text-xs text-text-tertiary uppercase">Nível SRS</p>
                                                 <p className="text-xl font-bold text-accent-primary">{currentCard.repetitions}</p>
                                             </div>
                                             <div className="bg-bg-tertiary p-3 rounded-lg">
                                                 <p className="text-xs text-text-tertiary uppercase">Intervalo Atual</p>
                                                 <p className="text-xl font-bold text-accent-secondary">{currentCard.interval} dias</p>
                                             </div>
                                             <div className="bg-bg-tertiary p-3 rounded-lg col-span-2">
                                                 <p className="text-xs text-text-tertiary uppercase">Próxima Revisão Agendada</p>
                                                 <p className="text-lg font-bold text-text-primary">
                                                     {new Date(currentCard.nextReview).toLocaleDateString()} às {new Date(currentCard.nextReview).toLocaleTimeString()}
                                                 </p>
                                             </div>
                                         </div>

                                         <div>
                                             <h5 className="font-bold text-sm text-text-secondary mb-2 uppercase">Histórico de Revisões</h5>
                                             <div className="bg-bg-tertiary rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                                                 {(currentCard.history || []).length > 0 ? (
                                                     <table className="w-full text-xs text-left">
                                                         <thead className="bg-bg-primary text-text-tertiary">
                                                             <tr>
                                                                 <th className="p-2">Data</th>
                                                                 <th className="p-2">Avaliação</th>
                                                                 <th className="p-2">Novo Intervalo</th>
                                                             </tr>
                                                         </thead>
                                                         <tbody className="divide-y divide-border-color">
                                                             {[...currentCard.history].reverse().map((log, idx) => (
                                                                 <tr key={idx}>
                                                                     <td className="p-2 text-text-secondary">{formatRelativeTime(new Date(log.date))}</td>
                                                                     <td className={`p-2 font-bold ${log.rating === 'easy' ? 'text-accent-success' : log.rating === 'hard' ? 'text-yellow-500' : 'text-accent-error'}`}>
                                                                         {log.rating === 'easy' ? 'Fácil' : log.rating === 'hard' ? 'Difícil' : 'Errei'}
                                                                     </td>
                                                                     <td className="p-2 text-text-secondary">{log.interval}d</td>
                                                                 </tr>
                                                             ))}
                                                         </tbody>
                                                     </table>
                                                 ) : (
                                                     <p className="p-4 text-center text-text-tertiary text-sm">Nenhuma revisão anterior.</p>
                                                 )}
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             )}

                             {/* Card Container */}
                            <div className="flex-grow relative bg-bg-secondary border border-border-color rounded-xl shadow-xl p-6 md:p-10 flex flex-col justify-between overflow-y-auto mb-6">
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    <button 
                                        onClick={() => setShowStats(true)}
                                        className="text-text-tertiary hover:text-accent-primary transition-colors p-1 rounded-full hover:bg-bg-tertiary"
                                        title="Próximas revisões e histórico"
                                    >
                                        <InformationCircleIcon className="w-5 h-5" />
                                    </button>
                                    <div className="text-xs text-text-tertiary font-mono px-2 py-1 bg-bg-tertiary rounded">
                                        Fonte: {currentCard.sourcePdfName}
                                    </div>
                                </div>
                                
                                <div className="space-y-6 mt-6">
                                    <div>
                                        <span className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-2 block">
                                            {isManual ? 'Frente (Pergunta)' : 'Questão Original'}
                                        </span>
                                        <p className="text-lg md:text-xl font-medium text-text-primary leading-relaxed whitespace-pre-wrap">
                                            {frontContent}
                                        </p>
                                    </div>

                                    {/* Options if MC and NOT manual flashcard */}
                                    {!isManual && currentCard.question.options && (
                                        <div className="space-y-2 mt-4">
                                            {Object.entries(currentCard.question.options).map(([key, value]) => (
                                                <div key={key} className="flex gap-3 text-sm text-text-secondary">
                                                    <span className="font-bold text-text-tertiary">{key})</span>
                                                    <span>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Back of Card */}
                                    {isFlipped && (
                                        <div className="pt-6 border-t border-border-color/50 animate-fade-in">
                                            <div className="mb-4">
                                                <span className="text-xs font-bold text-accent-success uppercase tracking-wider mb-1 block">
                                                    {isManual ? 'Verso (Resposta)' : 'Resposta Correta'}
                                                </span>
                                                <p className="text-xl font-bold text-text-primary">
                                                    {backContent}
                                                </p>
                                            </div>
                                            <div className="bg-bg-tertiary/50 p-4 rounded-lg border-l-4 border-accent-secondary">
                                                <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-1 block">Justificativa</span>
                                                <p className="text-sm text-text-secondary italic">
                                                    "{currentCard.question.justification_anchor}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="h-20 flex-shrink-0">
                                {!isFlipped ? (
                                    <button 
                                        onClick={() => setIsFlipped(true)}
                                        className="w-full h-14 bg-accent-primary text-white text-lg font-bold rounded-xl shadow-lg hover:bg-accent-primary/90 transition-transform active:scale-95"
                                    >
                                        Mostrar Resposta
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3 h-14">
                                        <button 
                                            onClick={() => handleRate('wrong')}
                                            className="bg-accent-error/20 border border-accent-error text-accent-error font-bold rounded-xl hover:bg-accent-error hover:text-white transition-colors flex flex-col items-center justify-center leading-none"
                                        >
                                            <span className="text-sm">Errei</span>
                                            <span className="text-[10px] opacity-70 font-normal mt-1">Repetir agora</span>
                                        </button>
                                        <button 
                                            onClick={() => handleRate('hard')}
                                            className="bg-yellow-500/20 border border-yellow-500 text-yellow-500 font-bold rounded-xl hover:bg-yellow-500 hover:text-white transition-colors flex flex-col items-center justify-center leading-none"
                                        >
                                            <span className="text-sm">Difícil</span>
                                            <span className="text-[10px] opacity-70 font-normal mt-1">Logo</span>
                                        </button>
                                        <button 
                                            onClick={() => handleRate('easy')}
                                            className="bg-accent-success/20 border border-accent-success text-accent-success font-bold rounded-xl hover:bg-accent-success hover:text-white transition-colors flex flex-col items-center justify-center leading-none"
                                        >
                                            <span className="text-sm">Fácil</span>
                                            <span className="text-[10px] opacity-70 font-normal mt-1">Mais tarde</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-2 text-center">
                                <button 
                                    onClick={() => onDelete(currentCard.id)}
                                    className="text-xs text-text-tertiary hover:text-accent-error underline"
                                >
                                    Remover este cartão permanentemente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorFlashcardModal;