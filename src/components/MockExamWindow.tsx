import React, { useState, useEffect } from 'react';
import { GeneratedQuestion } from '../types';
import { XMarkIcon } from './Icon';
import Loader from './Loader';
import MockExamQuestionCard from './MockExamQuestionCard';

interface MockExamWindowProps {
  isVisible: boolean;
  onClose: () => void;
  isLoading: boolean;
  questions: GeneratedQuestion[];
  error: string | null;
}

const MockExamWindow: React.FC<MockExamWindowProps> = ({ isVisible, onClose, isLoading, questions, error }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [score, setScore] = useState(0);

  // Reset state when a new exam starts
  useEffect(() => {
    if (questions.length > 0) {
      setAnswers({});
      setIsReviewMode(false);
      setScore(0);
    }
  }, [questions]);

  if (!isVisible) return null;
  
  const handleAnswer = (index: number, answer: string) => {
    if (isReviewMode) return;
    setAnswers(prev => ({...prev, [index]: answer}));
  };
  
  const handleSubmitExam = () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      const userAnswer = answers[i];
      if (!userAnswer) return;
      
      const cleanedUserAnswer = userAnswer.trim().toLowerCase();
      const cleanedCorrectAnswer = q.correct_answer.trim().toLowerCase();
      
      if (cleanedUserAnswer === cleanedCorrectAnswer || 
          (cleanedUserAnswer === 'certo' && cleanedCorrectAnswer === 'correto') || 
          (cleanedUserAnswer === 'correto' && cleanedCorrectAnswer === 'certo')) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setIsReviewMode(true);
  };
  
  const allAnswered = Object.keys(answers).length === questions.length;

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-8 flex items-center justify-center h-full"><Loader message="Gerando seu simulado..." /></div>;
    }
    if (error) {
      return (
        <div className="p-8 text-center flex items-center justify-center h-full">
            <div className="bg-accent-error/20 border border-accent-error text-accent-error p-3 rounded-md text-left text-sm" role="alert">
                <p className="font-bold">Erro ao gerar simulado</p>
                <p>{error}</p>
            </div>
        </div>
      );
    }
    
    return (
      <div className="p-4 sm:p-6 space-y-4">
        {isReviewMode && (
          <div className="p-6 text-center bg-bg-secondary rounded-lg mb-6 sticky top-0 z-10 animate-fade-in">
            <h3 className="text-2xl font-bold text-text-primary">Resultado do Simulado</h3>
            <p className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-gradient-from to-accent-gradient-to my-2">
              {questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%
            </p>
            <p className="text-text-secondary">Você acertou {score} de {questions.length} questões.</p>
          </div>
        )}

        {questions.map((q, i) => (
          <MockExamQuestionCard
            key={`${i}-${q.question_text.slice(0, 10)}`}
            question={q}
            index={i}
            userAnswer={answers[i]}
            onAnswer={(answer) => handleAnswer(i, answer)}
            isReviewMode={isReviewMode}
          />
        ))}

        {!isReviewMode && questions.length > 0 && (
            <div className="pt-4 text-center">
                <button
                    onClick={handleSubmitExam}
                    disabled={!allAnswered}
                    className="w-full max-w-xs inline-flex items-center justify-center px-6 py-3 bg-accent-secondary text-white font-bold rounded-lg hover:bg-accent-secondary/80 disabled:bg-bg-interactive disabled:cursor-not-allowed transition-all"
                >
                    Finalizar e Ver Resultado
                </button>
                {!allAnswered && <p className="text-xs text-text-tertiary mt-2">{Object.keys(answers).length} de {questions.length} questões respondidas.</p>}
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-bg-primary border border-border-color rounded-xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col animate-fade-in">
        <div className="flex-shrink-0 bg-bg-secondary p-3 flex items-center justify-between border-b border-border-color">
          <h3 className="font-bold text-text-primary pl-2">Simulado</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-accent-error/20 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MockExamWindow;
