import React, { useMemo, useState } from 'react';
import { GeneratedQuestion } from '../types';
import { CheckIcon, XMarkIcon, SparklesIcon, KeyIcon } from './Icon';

interface QuestionCardProps {
  question: GeneratedQuestion;
  index: number;
  onAnswer: (answer: string, answerTimeInMs: number) => void;
  onGenerateFlashcard: () => void;
}

// Comprehensive list of tricky keywords for exams
const TRICKY_KEYWORDS = [
  // Negations
  "não", "nem", "jamais", "nunca",
  // Exclusions/Restrictions
  "exceto", "salvo", "ressalvado", "ressalvada", "apenas", "somente", "só", "unicamente", "exclusivamente", "senão",
  // Totality/Generalization
  "todo", "toda", "todos", "todas", "sempre", "qualquer", "quaisquer", "geralmente", "invariavelmente",
  "totalmente", "plenamente", "integralmente",
  // Absence
  "nenhum", "nenhuma", "ninguém", "nada",
  // Obligations/Permissions
  "deve", "deverá", "pode", "poderá", "obrigatoriamente", "compulsoriamente", "necessariamente",
  "facultativo", "facultativa", "opcional", "prescinde", "dispensa", "independe",
  "imprescindível", "indispensável", "essencial",
  // Prohibition
  "vedado", "proibido", "defeso", "ilegal", "ilícito",
  // Judgement/Error Prone
  "incorreto", "incorreta", "correto", "correta", "errado", "errada", "certo", "certa", "falso", "falsa", "verdadeiro", "verdadeira",
  "indevido", "indevida",
  // Intensifiers/Connectors
  "automaticamente", "imediatamente", "consequentemente", "respectivamente", "taxativo", "exemplificativo"
];

// Sort by length (descending) to ensure greedy matching for phrases/longer words
const SORTED_KEYWORDS = [...TRICKY_KEYWORDS].sort((a, b) => b.length - a.length);
// Global regex with word boundaries to prevent partial matches in other words
// Using 'gi' for global and case-insensitive matching
const KEYWORDS_REGEX = new RegExp(`\\b(${SORTED_KEYWORDS.join('|')})\\b`, 'gi');

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, onAnswer, onGenerateFlashcard }) => {
  const [mountTime] = useState(Date.now());
  const [showKeywords, setShowKeywords] = useState(false);
  
  const selectedAnswer = question.userAnswer;
  const isAnswered = selectedAnswer != null;

  const isCorrectAnswer = (answer: string): boolean => {
    if (!answer) return false;
    const cleanedUserAnswer = answer.trim().toLowerCase();
    const cleanedCorrectAnswer = question.correct_answer.trim().toLowerCase();
    if (cleanedUserAnswer === cleanedCorrectAnswer) return true;
    return (cleanedUserAnswer === 'certo' && cleanedCorrectAnswer === 'correto') || 
           (cleanedUserAnswer === 'correto' && cleanedCorrectAnswer === 'certo');
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    const answerTimeInMs = Date.now() - mountTime;
    onAnswer(answer, answerTimeInMs);
  };
  
  const getOptionClass = (optionKey: string) => {
    if (!isAnswered) {
      return "bg-bg-primary border-border-color hover:bg-bg-tertiary focus:ring-2 focus:ring-accent-primary";
    }

    const isCorrect = isCorrectAnswer(optionKey);
    const isSelected = optionKey === selectedAnswer;

    if (isCorrect) {
      return "bg-accent-success/10 border-accent-success text-accent-success ring-2 ring-accent-success";
    }
    if (isSelected) { // and not correct
      return "bg-accent-error/10 border-accent-error text-accent-error";
    }
    return "bg-bg-secondary/50 border-border-color opacity-60";
  };

  const AnswerIcon = ({ optionKey }: { optionKey: string }) => {
    if (!isAnswered) return null;

    const isCorrect = isCorrectAnswer(optionKey);
    const isSelected = optionKey === selectedAnswer;

    if (isCorrect) {
      return <CheckIcon className="w-5 h-5 text-accent-success" />;
    }
    if (isSelected) {
      return <XMarkIcon className="w-5 h-5 text-accent-error" />;
    }
    return null;
  };

  const renderHighlightedText = (text: string) => {
    if (!showKeywords) return text;

    // Split text by regex. The capturing group () in regex ensures separators (keywords) are included in result array.
    const parts = text.split(KEYWORDS_REGEX);

    return parts.map((part, i) => {
      // Check if this part matches one of our keywords (case insensitive)
      if (SORTED_KEYWORDS.includes(part.toLowerCase())) {
        return (
          <span key={i} className="text-accent-error font-extrabold bg-accent-error/20 px-1 rounded border-b-2 border-accent-error mx-0.5 inline-block">
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  const optionsEntries = useMemo(() => question.options ? Object.entries(question.options) : [], [question.options]);

  return (
    <div className="border border-border-color bg-bg-secondary overflow-hidden shadow-sm rounded-lg animate-fade-in">
      <div className="p-5">
        <div className="mb-4">
           <div className="font-semibold text-text-primary whitespace-pre-wrap leading-relaxed">
            <span className="text-accent-primary mr-2 font-bold uppercase tracking-wider text-xs block mb-1">Questão {index + 1}</span>
            <span>
              {renderHighlightedText(question.question_text)}
            </span>
          </div>
        </div>

        {/* Action Bar for Helper Tools */}
        <div className="flex justify-end mb-4">
            <button 
                onClick={() => setShowKeywords(!showKeywords)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${showKeywords ? 'bg-accent-error/20 text-accent-error font-bold ring-1 ring-accent-error' : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary'}`}
                title="Destacar palavras que podem induzir ao erro"
            >
                <KeyIcon className="w-4 h-4" />
                {showKeywords ? 'Ocultar Palavras-chave' : 'Palavras-chave'}
            </button>
        </div>
        
        {question.options && (
          <div className="mt-2 space-y-3">
            {optionsEntries.map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleAnswer(key)}
                disabled={isAnswered}
                className={`w-full flex items-center justify-between text-left p-3 border rounded-md transition-all duration-200 ${getOptionClass(key)} disabled:cursor-not-allowed`}
              >
                <span className="flex-grow">
                  <span className="font-bold mr-2">{key})</span>{value}
                </span>
                <AnswerIcon optionKey={key} />
              </button>
            ))}
          </div>
        )}

        {!question.options && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
               <button
                  onClick={() => handleAnswer('Certo')}
                  disabled={isAnswered}
                  className={`flex items-center justify-center p-3 border rounded-md text-lg font-bold transition-all duration-200 ${getOptionClass('Certo')} disabled:cursor-not-allowed`}
                >
                  <AnswerIcon optionKey="Certo" />
                  <span className="ml-2">CERTO</span>
                </button>
                <button
                  onClick={() => handleAnswer('Errado')}
                  disabled={isAnswered}
                  className={`flex items-center justify-center p-3 border rounded-md text-lg font-bold transition-all duration-200 ${getOptionClass('Errado')} disabled:cursor-not-allowed`}
                >
                  <AnswerIcon optionKey="Errado" />
                  <span className="ml-2">ERRADO</span>
                </button>
            </div>
        )}
      </div>

      {isAnswered && (
        <div className="p-5 bg-bg-primary/50 border-t border-border-color animate-fade-in">
          <div>
            <h4 className="font-bold text-text-primary">Gabarito Ancorado (Fonte no texto original):</h4>
            <blockquote className="mt-1 p-3 bg-bg-secondary border-l-4 border-accent-primary text-text-tertiary italic rounded-r-md">
              "{question.justification_anchor}"
            </blockquote>
          </div>
          
          <div className="mt-4">
            {!question.flashcard && (
              <button
                onClick={onGenerateFlashcard}
                disabled={question.isGeneratingFlashcard}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-accent-primary border-2 border-accent-primary rounded-md hover:bg-accent-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
              >
                {question.isGeneratingFlashcard ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-solid rounded-full animate-spin border-t-transparent"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Transformar em flashcard
                  </>
                )}
              </button>
            )}

            {question.flashcard && (
              <div className="mt-4 p-4 bg-bg-tertiary/50 rounded-lg animate-fade-in">
                <h5 className="font-bold text-text-primary flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-yellow-400" />
                  Flashcard Conceitual
                </h5>
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-bg-primary rounded-md">
                    <p className="text-sm font-semibold text-text-secondary">FRENTE</p>
                    <p className="mt-1 text-text-primary">{question.flashcard.front}</p>
                  </div>
                  <div className="p-3 bg-bg-primary rounded-md">
                    <p className="text-sm font-semibold text-text-secondary">VERSO</p>
                    <p className="mt-1 text-text-primary">{question.flashcard.back}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;