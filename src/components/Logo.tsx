import logo from "@/assets/mumtaz-health-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
    xl: "h-24",
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
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <img
        src={logo}
        alt="Mumtaz Health - Empowering Your Journey"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {size !== "sm" && (
        <p className="text-sm text-muted-foreground font-accent italic">
          Empowering Your Journey
        </p>
      )}
    </div>
  );
}
