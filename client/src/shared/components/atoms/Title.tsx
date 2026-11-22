import { cn } from "@/lib/cn";
interface TitleProps {
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  center?: boolean;
  variant?: "primary" | "main" | "white" | "red";
  className?: string;
}

export default function Title({
  children,
  size = "lg",
  center = false,
  variant = "primary",
  className = "font-extrabold",
}: TitleProps) {
  const sizes = {
    sm: "text-sm md:text-base lg:text-lg",
    md: "text-base md:text-xl lg:text-2xl",
    lg: "text-lg md:text-2xl lg:text-3xl",
    xl: "text-lg md:text-3xl lg:text-5xl ",
  };

  const variants = {
    primary: "ds-text",
    main: "ds-text-main",
    white: "ds-text-white",
    red: "text-red-400",
  };
  return (
    <h2
      className={cn(
        sizes[size],
        variants[variant],
        center ? "text-center" : "",
        className,
      )}
    >
      {children}
    </h2>
  );
}
