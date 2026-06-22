import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label ? (
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        type={type}
        className={`
          w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800
          text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary-500
          focus:ring-2 focus:ring-primary-500/20 transition-all duration-200
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error ? (
        <span className="text-xs font-bold text-red-500">{error}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
