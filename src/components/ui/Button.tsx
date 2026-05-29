interface ButtonProps {
  children: React.ReactNode;

  variant?: "default" | "outline";

  type?: "button" | "submit" | "reset";

  disabled?: boolean;

  onClick?: () => void;

  className?: string;
}

export default function Button({
  children,
  variant = "default",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}: ButtonProps) {
  const baseStyle = `
    inline-flex items-center justify-center
    rounded-xl px-6 py-3
    font-medium
    transition-all
    duration-200
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

  const variants = {
    default: `
      bg-slate-900
      text-white
      hover:bg-slate-800
    `,

    outline: `
      border border-slate-300
      bg-white
      text-slate-900
      hover:bg-slate-100
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseStyle}
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}