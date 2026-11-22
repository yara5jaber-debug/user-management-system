import React from "react";
import { cn } from "@/lib/cn";

interface TextProp {
  children?: React.ReactNode;
  center?: boolean;
  variant?: "primary" | "main" | "disabled" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Text({
  children,
  center = false,
  variant = "primary",
  size = "lg",
  className,
}: TextProp) {
  const sizes = {
    sm: "text-sm",
    md: "text-md",
    lg: "text-lg",
  };
  const variants = {
    primary: "ds-text-alt",
    main: "ds-text-main",
    disabled: "ds-text-disabled",
    dark: "ds-text",
    black: "ds-text-black",
  };

  return (
    <p
      className={cn(
        sizes[size],
        variants[variant],
        center ? "text-center" : "",
        className,
      )}
    >
      {children}
    </p>
  );
}
