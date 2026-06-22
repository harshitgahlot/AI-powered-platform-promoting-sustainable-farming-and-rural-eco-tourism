import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
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
      <select
        ref={ref}
        className={`
          w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800
          text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-500
          focus:ring-2 focus:ring-primary-500/20 transition-all duration-200
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-800">
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs font-bold text-red-500">{error}</span>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
