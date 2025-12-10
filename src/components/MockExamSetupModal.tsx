import React, { useState } from 'react';
import { XMarkIcon } from './Icon';

interface MockExamSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (startPage: number, endPage: number) => void;
  totalPages: number;
}

const MockExamSetupModal: React.FC<MockExamSetupModalProps> = ({ isOpen, onClose, onSubmit, totalPages }) => {
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(Math.min(10, totalPages));
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError(null);
    if (startPage > endPage) {
      setError('A página inicial não pode ser maior que a página final.');
      return;
    }
    if (startPage < 1 || endPage > totalPages) {
      setError(`As páginas devem estar entre 1 e ${totalPages}.`);
      return;
    }
    onSubmit(startPage, endPage);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-bg-primary border border-border-color rounded-xl shadow-2xl max-w-md w-full animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative">
          <h2 className="text-2xl font-bold text-text-primary">Criar Simulado</h2>
          <p className="text-sm text-text-tertiary">Selecione o intervalo de páginas para gerar as questões.</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        
        <div className="px-6 pb-6 space-y-4">
          <div className="flex gap-4">
            <div>
              <label htmlFor="start-page" className="block text-sm font-bold text-text-secondary mb-1">Página inicial</label>
              <input
                id="start-page"
                type="number"
                min="1"
                max={totalPages}
                value={startPage}
                onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full p-3 bg-bg-tertiary text-text-primary text-lg font-bold border border-border-color rounded-md focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
              />
            </div>
            <div>
              <label htmlFor="end-page" className="block text-sm font-bold text-text-secondary mb-1">Página final</label>
              <input
                id="end-page"
                type="number"
                min="1"
                max={totalPages}
                value={endPage}
                onChange={(e) => setEndPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full p-3 bg-bg-tertiary text-text-primary text-lg font-bold border border-border-color rounded-md focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition"
              />
            </div>
          </div>
          <p className="text-xs text-text-tertiary text-center">O documento tem {totalPages} páginas.</p>

          {error && (
            <div className="bg-accent-error/20 text-accent-error p-2 rounded-md text-xs text-center">
              {error}
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-accent-gradient-from to-accent-gradient-to text-white font-bold rounded-lg hover:from-accent-gradient-from/80 hover:to-accent-gradient-to/80 transition-all transform hover:scale-105"
          >
            Prosseguir e Gerar Simulado
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockExamSetupModal;
