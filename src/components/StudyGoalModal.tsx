import React, { useState } from 'react';
import { StudyGoal } from '../types';
import { XMarkIcon, DocumentCheckIcon, QuestionMarkCircleIcon, ClockIcon } from './Icon';

interface StudyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetGoal: (type: StudyGoal['type'], target: number) => void;
  currentGoal: StudyGoal | null;
}

type GoalType = StudyGoal['type'];

const GoalTypeButton: React.FC<{
  type: GoalType;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}> = ({ type, label, icon, selected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
        selected
          ? 'bg-accent-primary/10 border-accent-primary text-accent-primary shadow-lg'
          : 'bg-bg-secondary border-border-color hover:border-accent-primary/50 text-text-secondary'
      }`}
    >
      {icon}
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
};

const StudyGoalModal: React.FC<StudyGoalModalProps> = ({ isOpen, onClose, onSetGoal, currentGoal }) => {
  const [goalType, setGoalType] = useState<GoalType>('questions');
  const [targetValue, setTargetValue] = useState<number>(10);

  if (!isOpen) return null;
  
  const handleSetGoal = () => {
    if (targetValue > 0) {
      onSetGoal(goalType, targetValue);
    }
  };
  
  const getUnit = () => {
      switch(goalType) {
          case 'pages': return 'páginas';
          case 'questions': return 'questões';
          case 'time': return 'minutos';
      }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-bg-primary border border-border-color rounded-xl shadow-2xl max-w-md w-full animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative">
          <h2 className="text-2xl font-bold text-text-primary">Definir Meta de Estudo</h2>
          <p className="text-sm text-text-tertiary">Foque sua sessão em um objetivo específico.</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        
        <div className="px-6 pb-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2">1. Escolha o tipo de meta</label>
            <div className="flex gap-3">
              <GoalTypeButton type="pages" label="Páginas Lidas" icon={<DocumentCheckIcon className="w-8 h-8"/>} selected={goalType === 'pages'} onSelect={() => setGoalType('pages')} />
              <GoalTypeButton type="questions" label="Questões Feitas" icon={<QuestionMarkCircleIcon className="w-8 h-8"/>} selected={goalType === 'questions'} onSelect={() => setGoalType('questions')} />
              <GoalTypeButton type="time" label="Tempo Focado" icon={<ClockIcon className="w-8 h-8"/>} selected={goalType === 'time'} onSelect={() => setGoalType('time')} />
            </div>
          </div>
          
          <div>
            <label htmlFor="goal-value" className="block text-sm font-bold text-text-secondary mb-2">
                2. Defina a quantidade ({getUnit()})
            </label>
            <input
              id="goal-value"
              type="number"
              min="1"
              value={targetValue}
              onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full p-3 bg-bg-tertiary text-text-primary text-lg font-bold border border-border-color rounded-md focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
            />
          </div>
          
          <button
            onClick={handleSetGoal}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-accent-gradient-from to-accent-gradient-to text-white font-bold rounded-lg hover:from-accent-gradient-from/80 hover:to-accent-gradient-to/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary disabled:opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            {currentGoal?.isActive ? 'Atualizar Meta' : 'Definir Meta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyGoalModal;
