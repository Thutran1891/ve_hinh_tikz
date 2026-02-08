import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-teal-700 dark:text-teal-400">
        {label}
      </label>
      <input
        className={`w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg 
        bg-white dark:bg-slate-800 text-center text-slate-800 dark:text-slate-100
        focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 
        transition-all duration-200 font-mono ${className}`}
        {...props}
      />
    </div>
  );
};