import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  icon,
  ...props 
}) => {
  const baseStyles = "font-bold rounded-2xl transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary hover:bg-indigo-600 text-white shadow-lg shadow-indigo-200 focus:ring-indigo-500",
    secondary: "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 focus:ring-red-500",
    success: "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200 focus:ring-green-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </button>
  );
};