

import React, { useState } from 'react';
import { GamificationState, ShopItem } from '../types';
import { LEVELS, BADGES, SHOP_ITEMS } from '../constants';
import BadgeIcon from './BadgeIcon';
import ShopItemCard from './ShopItemCard';
import { XMarkIcon } from './Icon';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamificationState: GamificationState;
  onPurchaseTheme: (item: ShopItem) => void;
  onSelectTheme: (themeId: string) => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, gamificationState, onPurchaseTheme, onSelectTheme }) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'shop'>('progress');
  
  if (!isOpen) return null;

  const currentLevel = LEVELS[gamificationState.levelIndex];
  const nextLevel = LEVELS[gamificationState.levelIndex + 1];
  
  const xpForNextLevel = nextLevel ? nextLevel.minXp - currentLevel.minXp : 0;
  const xpInCurrentLevel = gamificationState.xp - currentLevel.minXp;
  const progressPercentage = nextLevel ? Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100) : 100;

  const TabButton: React.FC<{tabId: 'progress' | 'shop', children: React.ReactNode}> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
        activeTab === tabId 
        ? 'bg-bg-secondary text-accent-primary border-b-2 border-accent-primary' 
        : 'text-text-tertiary hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-bg-primary border border-border-color rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition">
            <XMarkIcon className="w-7 h-7" />
          </button>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                Sua Jornada
            </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-secondary rounded-full font-bold text-yellow-400">
                <span className="text-xl">🪙</span>
                <span>{gamificationState.tokens}</span>
            </div>
          </div>
          
          <div className="border-b border-border-color mb-6">
            <TabButton tabId="progress">Progresso</TabButton>
            <TabButton tabId="shop">Loja</TabButton>
          </div>

          {activeTab === 'progress' && (
            <div className="animate-fade-in">
              {/* Level and XP */}
              <div className="bg-bg-secondary p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-accent-primary">{currentLevel.icon} {currentLevel.name}</span>
                  <span className="text-sm font-semibold text-text-secondary">{gamificationState.xp} XP</span>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-accent-success to-accent-secondary h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-right text-xs mt-1 text-text-tertiary">
                  {nextLevel ? `${nextLevel.minXp - gamificationState.xp} XP para ${nextLevel.name}` : "Nível Máximo Alcançado!"}
                </p>
              </div>

              {/* Core Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center mb-6">
                <div className="bg-bg-secondary p-3 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-400">{gamificationState.studyStreak}</div>
                  <div className="text-sm text-text-tertiary">Dias em Sequência</div>
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg">
                  <div className="text-3xl font-bold text-accent-success">{gamificationState.totalCorrectAnswers}</div>
                  <div className="text-sm text-text-tertiary">Respostas Corretas</div>
                </div>
                <div className="bg-bg-secondary p-3 rounded-lg col-span-2 sm:col-span-1">
                  <div className="text-3xl font-bold text-accent-primary">
                    {gamificationState.totalQuestionsAnswered > 0 
                      ? `${Math.round((gamificationState.totalCorrectAnswers / gamificationState.totalQuestionsAnswered) * 100)}%`
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-text-tertiary">Taxa de Acerto</div>
                </div>
              </div>

              {/* Badges Gallery */}
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-4">Mural de Conquistas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {BADGES.map(badge => (
                    <BadgeIcon 
                      key={badge.id}
                      badge={badge}
                      isUnlocked={gamificationState.unlockedBadges.includes(badge.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-text-primary mb-4">Itens Cosméticos</h3>
                <p className="text-sm text-text-tertiary mb-6">Use seus Tokens de Estudo para personalizar sua experiência!</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SHOP_ITEMS.map(item => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            state={gamificationState}
                            onPurchase={onPurchaseTheme}
                            onSelect={onSelectTheme}
                        />
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;