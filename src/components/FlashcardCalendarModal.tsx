import React, { useMemo } from 'react';
import { ErrorFlashcard } from '../types';
import { XMarkIcon, CalendarDaysIcon, TrashIcon } from './Icon';
import { formatRelativeTime } from '../utils/dateUtils';

interface FlashcardCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: ErrorFlashcard[];
  onDelete: (id: string) => void;
}

const FlashcardCalendarModal: React.FC<FlashcardCalendarModalProps> = ({ isOpen, onClose, flashcards, onDelete }) => {
  const sortedCards = useMemo(() => {
    return [...flashcards].sort((a, b) => a.nextReview - b.nextReview);
  }, [flashcards]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-bg-primary border border-border-color rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 bg-bg-secondary p-4 flex items-center justify-between border-b border-border-color">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <CalendarDaysIcon className="w-6 h-6 text-accent-primary" />
            Calendário de Revisão
          </h3>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 bg-bg-tertiary/10">
          {sortedCards.length === 0 ? (
            <div className="text-center py-20 text-text-tertiary">
              <p>Nenhum flashcard criado ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedCards.map(card => {
                const isOverdue = card.nextReview < Date.now();
                const nextReviewDate = new Date(card.nextReview);
                
                return (
                  <div key={card.id} className="bg-bg-secondary border border-border-color rounded-lg p-3 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-accent-primary/50 transition-colors">
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className={`text-xs font-bold px-2 py-0.5 rounded ${isOverdue ? 'bg-accent-error/20 text-accent-error' : 'bg-accent-success/20 text-accent-success'}`}>
                            {isOverdue ? 'Vencido' : 'Agendado'}
                         </span>
                         <span className="text-xs text-text-tertiary truncate max-w-[150px]" title={card.sourcePdfName}>{card.sourcePdfName}</span>
                         <span className="text-xs text-text-tertiary">• Nível {card.repetitions}</span>
                      </div>
                      <p className="font-medium text-text-primary text-sm line-clamp-2">
                         {card.question.flashcard ? card.question.flashcard.front : card.question.question_text}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                       <div className="text-right">
                          <p className="text-xs text-text-tertiary">Próxima Revisão</p>
                          <p className="text-sm font-bold text-text-primary">
                            {formatRelativeTime(nextReviewDate)}
                          </p>
                          <p className="text-xs text-text-tertiary">
                             {nextReviewDate.toLocaleDateString()} {nextReviewDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                       </div>
                       <button 
                          onClick={() => onDelete(card.id)}
                          className="p-2 text-text-tertiary hover:text-accent-error transition-colors"
                          title="Excluir Flashcard"
                       >
                          <TrashIcon className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardCalendarModal;