import logo from "@/assets/mumtaz-health-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-10 sm:h-12",
    md: "h-14 sm:h-16",
    lg: "h-20 sm:h-24",
    xl: "h-24 sm:h-28 md:h-32",
    "2xl": "h-28 sm:h-32 md:h-40",
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
