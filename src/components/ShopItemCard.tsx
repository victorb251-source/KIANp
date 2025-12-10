

import React from 'react';
import { ShopItem, GamificationState } from '../types';
import { LEVELS } from '../constants';

interface ShopItemCardProps {
  item: ShopItem;
  state: GamificationState;
  onPurchase: (item: ShopItem) => void;
  onSelect: (themeId: string) => void;
}

const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, state, onPurchase, onSelect }) => {
  const isOwned = state.unlockedThemes.includes(item.id);
  const canAfford = state.tokens >= item.cost;
  const levelMet = state.levelIndex >= item.requiredLevel;
  const isActive = state.activeTheme === item.id;
  
  const requiredLevel = LEVELS[item.requiredLevel];

  const renderButton = () => {
    if (isActive) {
      return (
        <button disabled className="w-full px-4 py-2 text-sm font-bold bg-accent-success text-text-primary rounded-md opacity-70 cursor-default">
          Selecionado
        </button>
      );
    }
    if (isOwned) {
      return (
        <button 
            onClick={() => onSelect(item.id)}
            className="w-full px-4 py-2 text-sm font-bold bg-accent-primary text-white rounded-md hover:bg-accent-primary/80 transition-colors"
        >
          Selecionar
        </button>
      );
    }
    if (!levelMet) {
        return (
            <button disabled className="w-full px-4 py-2 text-sm font-bold bg-bg-tertiary text-text-tertiary rounded-md cursor-not-allowed">
              Requer Nível {requiredLevel.name}
            </button>
        );
    }
    return (
      <button
        onClick={() => onPurchase(item)}
        disabled={!canAfford}
        className="w-full px-4 py-2 text-sm font-bold bg-accent-secondary text-white rounded-md hover:bg-accent-secondary/80 disabled:bg-bg-tertiary disabled:text-text-tertiary disabled:cursor-not-allowed transition-colors"
      >
        Comprar
      </button>
    );
  };

  return (
    <div className={`p-4 rounded-lg border flex flex-col justify-between ${!isOwned && !levelMet ? 'bg-bg-secondary/30 filter grayscale opacity-70' : 'bg-bg-secondary'} border-border-color`}>
        <div>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-text-primary flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    {item.name}
                </h4>
                {!isOwned && (
                     <div className="flex items-center gap-1 text-sm font-bold text-yellow-400">
                        <span>🪙</span>
                        <span>{item.cost}</span>
                    </div>
                )}
            </div>
            <p className="text-xs text-text-tertiary mb-4 h-10">{item.description}</p>
        </div>
      {renderButton()}
    </div>
  );
};

export default ShopItemCard;