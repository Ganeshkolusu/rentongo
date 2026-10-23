import React from "react";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  gradient?: boolean;
  variant?: "white" | "default" | "outline";
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  gradient = false,
  variant = "default",
  icon,
  className = "",
  loading = false,
  disabled = false,
}) => {
  const base =
    "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all";

  const styles =
    gradient
      ? "bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white hover:opacity-90"
      : variant === "white"
      ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
      : "bg-blue-600 text-white hover:bg-blue-700";

  const getVariantStyles = () => {
    if (variant === "outline") {
      return "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50";
    }
    if (gradient) {
      return "bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white hover:opacity-90";
    }
    return variant === "white"
      ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
      : "bg-blue-600 text-white hover:bg-blue-700";
  };

  return (
    <button 
      onClick={onClick} 
      disabled={loading || disabled}
      className={`${base} ${getVariantStyles()} ${className} ${
        (loading || disabled) ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
