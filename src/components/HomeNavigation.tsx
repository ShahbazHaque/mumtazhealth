import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  Heart, 
  BookOpen, 
  Calendar, 
  Settings, 
  BarChart3,
  Clock,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface HomeNavigationProps {
  className?: string;
  username?: string;
}

export function HomeNavigation({ className, username }: HomeNavigationProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Check-in", icon: Heart, href: "/tracker", description: "How are you feeling?" },
    { label: "Library", icon: BookOpen, href: "/content-library", description: "Explore practices" },
    { label: "My Practice", icon: Clock, href: "/my-daily-practice", description: "Saved & reminders" },
    { label: "Insights", icon: BarChart3, href: "/insights", description: "Your patterns" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50",
      className
    )}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:opacity-80"
        >
          <Logo size="sm" showText={false} />
          <span className="font-semibold text-foreground hidden sm:inline">Mumtaz Health</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.href)}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/10 gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/settings")}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/10"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        {isMobile && (
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-foreground gap-2"
              >
                <Menu className="h-5 w-5" />
                <span className="text-sm">Menu</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isMenuOpen && "rotate-180"
                )} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-card border-border shadow-lg"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.href}
                    onClick={() => {
                      navigate(item.href);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 py-3 cursor-pointer"
                  >
                    <Icon className="h-5 w-5 text-accent" />
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => {
                  navigate("/settings");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 py-3 cursor-pointer"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
