

import React, { useState } from 'react';
import { CustomReviewConfig } from '../types';
import { XMarkIcon, FunnelIcon } from './Icon';

interface CustomReviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: CustomReviewConfig) => void;
  totalErrors: number;
}

const CustomReviewSetupModal: React.FC<CustomReviewSetupModalProps> = ({ isOpen, onClose, onStart, totalErrors }) => {
  const [count, setCount] = useState(10);
  const [order, setOrder] = useState<CustomReviewConfig['order']>('random');
  const [includeHard, setIncludeHard] = useState(false);
  const [syncWithSRS, setSyncWithSRS] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-bg-primary border border-border-color rounded-xl shadow-2xl max-w-md w-full animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border-color flex justify-between items-center bg-bg-secondary rounded-t-xl">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <FunnelIcon className="w-6 h-6 text-accent-primary" />
            Revisão Personalizada
          </h3>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2">Quantidade de Cartões</label>
            <div className="flex items-center gap-4">
               <input 
                  type="range" 
                  min="5" 
                  max={Math.max(50, totalErrors)} 
                  step="5"
                  value={count} 
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full accent-accent-primary"
               />
               <span className="font-mono font-bold text-text-primary w-12 text-center">{count}</span>
            </div>
            <p className="text-xs text-text-tertiary mt-1">Disponíveis: {totalErrors}</p>
          </div>

          <div>
             <label className="block text-sm font-bold text-text-secondary mb-2">Ordem de Exibição</label>
             <div className="flex bg-bg-tertiary rounded-lg p-1">
                 {['random', 'newest', 'oldest'].map((opt) => (
                     <button
                        key={opt}
                        onClick={() => setOrder(opt as any)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${order === opt ? 'bg-bg-primary text-accent-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
                     >
                        {opt === 'random' ? 'Aleatório' : opt === 'newest' ? 'Mais Recentes' : 'Mais Antigos'}
                     </button>
                 ))}
             </div>
          </div>

          <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-border-color rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors">
                  <input 
                    type="checkbox" 
                    checked={includeHard} 
                    onChange={e => setIncludeHard(e.target.checked)}
                    className="w-5 h-5 accent-accent-primary rounded"
                  />
                  <div>
                      <span className="block text-sm font-bold text-text-primary">Incluir "Difíceis"</span>
                      <span className="block text-xs text-text-tertiary">Além dos erros, incluir cartões marcados como difíceis recentemente.</span>
                  </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-border-color rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors">
                  <input 
                    type="checkbox" 
                    checked={syncWithSRS} 
                    onChange={e => setSyncWithSRS(e.target.checked)}
                    className="w-5 h-5 accent-accent-primary rounded"
                  />
                  <div>
                      <span className="block text-sm font-bold text-text-primary">Sincronizar com Agendamento</span>
                      <span className="block text-xs text-text-tertiary">Se marcado, sua avaliação atualizará a data da próxima revisão oficial. Se desmarcado, conta apenas como um treino extra.</span>
                  </div>
              </label>
          </div>

          <button 
            onClick={() => onStart({ count, order, includeHard, syncWithSRS })}
            className="w-full py-3 bg-accent-primary text-white font-bold rounded-lg hover:bg-accent-primary/80 shadow-lg transform transition active:scale-95"
          >
            Iniciar Sessão
          </button>

        </div>
      </div>
    </div>
  );
};

export default CustomReviewSetupModal;
