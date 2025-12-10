

import React from 'react';
import { Badge, BadgeRarity } from '../types';

interface BadgeIconProps {
  badge: Badge;
  isUnlocked: boolean;
}

const rarityColorMap: Record<BadgeRarity, string> = {
  [BadgeRarity.Common]: 'border-text-tertiary',
  [BadgeRarity.Rare]: 'border-blue-500',
  [BadgeRarity.Epic]: 'border-purple-500',
  [BadgeRarity.Legendary]: 'border-yellow-500',
};

const BadgeIcon: React.FC<BadgeIconProps> = ({ badge, isUnlocked }) => {
  const wrapperClasses = `
    group relative flex flex-col items-center justify-center text-center p-4 
    border-2 rounded-lg transition-all duration-300
    ${isUnlocked 
      ? `bg-yellow-500/10 ${rarityColorMap[badge.rarity]}` 
      : 'bg-bg-secondary/60 border-dashed border-border-color filter grayscale'
    }
    ${badge.rarity === BadgeRarity.Legendary && !isUnlocked ? 'opacity-50' : ''}
  `;

  return (
    <div className={wrapperClasses}>
      <div className={`text-4xl transition-transform duration-300 ${isUnlocked ? 'group-hover:scale-125' : ''}`}>
        {badge.icon}
      </div>
      <p className="mt-2 text-xs font-bold text-text-primary">{badge.name}</p>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 w-48 p-2 bg-bg-primary text-text-primary text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <p className={`font-bold`}>{badge.name} ({badge.rarity})</p>
        <p className="text-text-secondary">{badge.description}</p>
        {!isUnlocked && <p className="mt-1 text-yellow-400 font-semibold">[BLOQUEADO]</p>}
      </div>
    </div>
  );
};

export default BadgeIcon;