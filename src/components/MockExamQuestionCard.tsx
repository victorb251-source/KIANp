import React, { useMemo } from 'react';
import { GeneratedQuestion } from '../types';
import { CheckIcon, XMarkIcon } from './Icon';

interface MockExamQuestionCardProps {
  question: GeneratedQuestion;
  index: number;
  userAnswer?: string;
  onAnswer: (answer: string) => void;
  isReviewMode: boolean;
}

const MockExamQuestionCard: React.FC<MockExamQuestionCardProps> = ({ question, index, userAnswer, onAnswer, isReviewMode }) => {

  const isCorrectAnswer = (answer: string | undefined): boolean => {
    if (!answer) return false;
    const cleanedUserAnswer = answer.trim().toLowerCase();
    const cleanedCorrectAnswer = question.correct_answer.trim().toLowerCase();
    if (cleanedUserAnswer === cleanedCorrectAnswer) return true;
    return (cleanedUserAnswer === 'certo' && cleanedCorrectAnswer === 'correto') || 
           (cleanedUserAnswer === 'correto' && cleanedCorrectAnswer === 'certo');
  };

  const getOptionClass = (optionKey: string) => {
    if (!isReviewMode) {
      return userAnswer === optionKey 
        ? 'bg-accent-primary/20 border-accent-primary' 
        : 'bg-bg-primary border-border-color hover:bg-bg-tertiary';
    }
    
    // Review mode styling
    const isCorrect = isCorrectAnswer(optionKey);
    const isSelected = optionKey === userAnswer;

    if (isCorrect) {
      return "bg-accent-success/10 border-accent-success text-accent-success ring-2 ring-accent-success";
    }
    if (isSelected) { // and not correct
      return "bg-accent-error/10 border-accent-error text-accent-error";
    }
    return "bg-bg-secondary/50 border-border-color opacity-60";
  };

  const AnswerIcon = ({ optionKey }: { optionKey: string }) => {
    if (!isReviewMode) return null;

    const isCorrect = isCorrectAnswer(optionKey);
    const isSelected = optionKey === userAnswer;

    if (isCorrect) {
      return <CheckIcon className="w-5 h-5 text-accent-success" />;
    }
    if (isSelected) {
      return <XMarkIcon className="w-5 h-5 text-accent-error" />;
    }
    return null;
  };
  
  const optionsEntries = useMemo(() => question.options ? Object.entries(question.options) : [], [question.options]);

  return (
    <div className="border border-border-color bg-bg-secondary overflow-hidden shadow-sm rounded-lg">
      <div className="p-5">
        <p className="font-semibold text-text-primary whitespace-pre-wrap">
          <span className="text-accent-primary mr-2">Questão {index + 1}:</span>
          {question.question_text}
        </p>
        
        {question.options && (
          <div className="mt-4 space-y-3">
            {optionsEntries.map(([key, value]) => (
              <button
                key={key}
                onClick={() => onAnswer(key)}
                disabled={isReviewMode}
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
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
               <button
                  onClick={() => onAnswer('Certo')}
                  disabled={isReviewMode}
                  className={`flex items-center justify-center p-3 border rounded-md text-lg font-bold transition-all duration-200 ${getOptionClass('Certo')} disabled:cursor-not-allowed`}
                >
                  <AnswerIcon optionKey="Certo" />
                  <span className="ml-2">CERTO</span>
                </button>
                <button
                  onClick={() => onAnswer('Errado')}
                  disabled={isReviewMode}
                  className={`flex items-center justify-center p-3 border rounded-md text-lg font-bold transition-all duration-200 ${getOptionClass('Errado')} disabled:cursor-not-allowed`}
                >
                  <AnswerIcon optionKey="Errado" />
                  <span className="ml-2">ERRADO</span>
                </button>
            </div>
        )}
      </div>

      {isReviewMode && (
        <div className="p-5 bg-bg-primary/50 border-t border-border-color animate-fade-in">
          <div>
            <h4 className="font-bold text-text-primary">Gabarito Ancorado (Fonte no texto original):</h4>
            <blockquote className="mt-1 p-3 bg-bg-secondary border-l-4 border-accent-primary text-text-tertiary italic rounded-r-md">
              "{question.justification_anchor}"
            </blockquote>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockExamQuestionCard;
