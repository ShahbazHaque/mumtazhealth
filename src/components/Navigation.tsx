import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border", className)}>
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:opacity-80"
        >
          <Logo size="sm" showText={false} />
          <span className="font-semibold text-foreground hidden sm:inline">Mumtaz Health</span>
        </Link>
      </div>
    </nav>
  );
}
