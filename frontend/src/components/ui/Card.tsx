import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glassEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  glassEffect = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl p-6 overflow-hidden transition-all duration-300
        ${glassEffect ? 'glass' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md'}
        ${hoverEffect ? 'hover:shadow-xl hover:-translate-y-1 hover:border-primary-500/30' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
