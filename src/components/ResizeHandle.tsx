
import React from 'react';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown }) => {
  return (
    <div
      className="flex-shrink-0 w-4 cursor-col-resize flex items-center justify-center group"
      onMouseDown={onMouseDown}
      title="Arraste para redimensionar"
      aria-label="Redimensionar painéis"
      role="separator"
      aria-orientation="vertical"
    >
      <div className="w-0.5 h-full bg-border-color transition-all duration-200 group-hover:w-1.5 group-hover:bg-accent-primary" />
    </div>
  );
};

export default ResizeHandle;
