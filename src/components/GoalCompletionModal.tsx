import React from 'react';
import { StudyGoal } from '../types';
import { XMarkIcon, PartyPopperIcon } from './Icon';
import { REWARDS } from '../constants';

interface GoalCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: StudyGoal | null;
  reward: { xp: number, tokens: number };
}

const GoalCompletionModal: React.FC<GoalCompletionModalProps> = ({ isOpen, onClose, goal, reward }) => {
  if (!isOpen || !goal) return null;

  const goalTextMap: Record<StudyGoal['type'], string> = {
    pages: 'páginas lidas',
    questions: 'questões respondidas',
    time: 'minutos de estudo',
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-bg-primary border border-accent-success rounded-xl shadow-2xl max-w-md w-full text-center p-8 animate-fade-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition">
          <XMarkIcon className="w-7 h-7" />
        </button>
        
        <div className="flex justify-center mb-4">
            <PartyPopperIcon className="w-20 h-20 text-yellow-400" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-success to-green-400">
          Meta Concluída!
        </h2>
        
        <p className="mt-2 text-lg text-text-secondary">
          Parabéns! Você alcançou sua meta de <strong className="text-text-primary">{goal.target} {goalTextMap[goal.type]}</strong>.
        </p>
        
        <div className="mt-6 bg-bg-secondary rounded-lg p-4 inline-flex gap-6 justify-center">
            <div className="font-bold">
                <span className="text-2xl text-accent-primary">+{reward.xp}</span>
                <span className="text-sm ml-1">XP</span>
            </div>
            <div className="font-bold">
                <span className="text-2xl text-yellow-400">+{reward.tokens}</span>
                <span className="text-sm ml-1">🪙</span>
            </div>
        </div>

        <button
            onClick={onClose}
            className="mt-8 w-full px-6 py-3 bg-accent-primary text-white font-bold rounded-lg hover:bg-accent-primary/80 transition-all"
        >
            Continuar
        </button>
      </div>
    </div>
  );
};

export default GoalCompletionModal;
