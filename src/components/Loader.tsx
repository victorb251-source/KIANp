
import React from 'react';

const Loader: React.FC<{ message?: string }> = ({ message = "Processando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-bg-secondary rounded-lg shadow-md">
      <div className="w-16 h-16 border-4 border-accent-primary border-dashed rounded-full animate-spin border-t-transparent"></div>
      <p className="mt-4 text-lg font-semibold text-text-primary">{message}</p>
      <p className="text-sm text-text-tertiary">Isso pode levar alguns instantes. A IA está gerando suas questões.</p>
    </div>
  );
};

export default Loader;