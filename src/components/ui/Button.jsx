import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false, loading = false }) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    ghost: "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
    emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};
