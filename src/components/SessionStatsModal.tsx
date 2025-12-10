import React from 'react';
import { ProgressData } from '../types';
import { XMarkIcon, ClockIcon, DocumentCheckIcon, QuestionMarkCircleIcon, SparklesIcon, ChartBarIcon } from './Icon';

interface SessionStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ProgressData | null;
}

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (hours === 0 && minutes === 0 && seconds >= 0) result += `${seconds}s`;
    
    return result.trim() || '0s';
};

const StatItem: React.FC<{ icon: React.ReactNode, value: string | number, label: string }> = ({ icon, value, label }) => (
    <div className="bg-bg-secondary p-4 rounded-lg flex items-center gap-4">
        <div className="p-3 bg-bg-tertiary rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            <p className="text-sm text-text-tertiary">{label}</p>
        </div>
    </div>
);

const SessionStatsModal: React.FC<SessionStatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-bg-primary border border-border-color rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative flex-shrink-0 border-b border-border-color">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <ChartBarIcon className="w-7 h-7 text-accent-primary"/>
            Estatísticas da Sessão
          </h2>
          <p className="text-sm text-text-tertiary truncate" title={stats.fileName}>{stats.fileName}</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatItem 
                icon={<ClockIcon className="w-6 h-6 text-yellow-400" />} 
                value={formatTime(stats.studyTimeInSeconds || 0)} 
                label="Tempo de Estudo" 
            />
            <StatItem 
                icon={<DocumentCheckIcon className="w-6 h-6 text-blue-400" />} 
                value={stats.pagesCompleted || 0} 
                label="Páginas Finalizadas" 
            />
            <StatItem 
                icon={<QuestionMarkCircleIcon className="w-6 h-6 text-green-400" />} 
                value={stats.questionsAnswered || 0} 
                label="Questões Realizadas" 
            />
            <StatItem 
                icon={<SparklesIcon className="w-6 h-6 text-purple-400" />} 
                value={stats.flashcardsCreated || 0} 
                label="Flashcards Criados" 
            />
        </div>
      </div>
    </div>
  );
};

export default SessionStatsModal;
