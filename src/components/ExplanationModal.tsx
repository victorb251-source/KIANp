import React from 'react';
import { XMarkIcon } from './Icon';
import Loader from './Loader';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string | null;
  isLoading: boolean;
  error: string | null;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onClose, explanation, isLoading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-bg-primary border border-border-color rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative flex-shrink-0 border-b border-border-color">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gradient-from to-accent-gradient-to">
            Explicação Simplificada
          </h2>
          <p className="text-sm text-text-tertiary">A IA resume os conceitos-chave da página para quem está vendo o assunto pela primeira vez.</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        
        <div className="px-6 pb-6 pt-4 overflow-y-auto flex-grow">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader message="Explicando a página..." />
            </div>
          )}
          {error && !isLoading && (
            <div className="bg-accent-error/20 border border-accent-error text-accent-error p-3 rounded-md text-left text-sm" role="alert">
              <p className="font-bold">Erro ao gerar explicação</p>
              <p>{error}</p>
            </div>
          )}
          {explanation && !isLoading && (
            <div className="text-text-secondary leading-relaxed space-y-4 whitespace-pre-wrap">
              {explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplanationModal;