import React from 'react';

export const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-all' : ''} ${className}`}
  >
    {children}
  </div>
);
