import logo from "@/assets/mumtaz-health-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 sm:h-10",
    md: "h-12 sm:h-14",
    lg: "h-16 sm:h-20",
    xl: "h-20 sm:h-24 md:h-28",
    "2xl": "h-24 sm:h-28 md:h-32",
  };

  const taglineSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-sm sm:text-base",
    xl: "text-base sm:text-lg",
    "2xl": "text-lg sm:text-xl",
  };

  if (!showText) {
    return (
      <img
        src={logo}
        alt="Mumtaz Health"
        className={`${sizeClasses[size]} w-auto object-contain ${className}`}
      />
    );
  }

  return (
    <div className={`flex flex-col items-center gap-1.5 sm:gap-2 ${className}`}>
      <img
        src={logo}
        alt="Mumtaz Health - Empowering Your Journey"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {size !== "sm" && (
        <p className={`${taglineSizes[size]} text-muted-foreground font-accent italic`}>
          Empowering Your Journey
        </p>
      )}
    </div>
  );
}
