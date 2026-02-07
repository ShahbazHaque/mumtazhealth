import { useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, BookOpen, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  onChatOpen: () => void;
  isChatOpen?: boolean;
}

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    id: "checkin",
    label: "Check-in",
    icon: Heart,
    href: "/tracker",
  },
  {
    id: "learn",
    label: "Learn",
    icon: BookOpen,
    href: "/content-library",
  },
  {
    id: "rose",
    label: "Rose",
    icon: MessageCircle,
    href: null, // Opens chat instead of navigating
  },
];

/**
 * Bottom navigation bar for mobile users.
 *
 * Design principles for elderly/non-technical users:
 * - Always visible (no scrolling to find navigation)
 * - Large touch targets (minimum 48x48px)
 * - Clear labels underneath icons
 * - High contrast active states
 * - Maximum 4 items to prevent choice overload
 */
export function BottomNavigation({ onChatOpen, isChatOpen }: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string | null) => {
    if (!href) return isChatOpen;
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.href === null) {
      // Open the AI chat
      onChatOpen();
    } else {
      navigate(item.href);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/60 shadow-lg md:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Safe area padding for devices with home indicators (iPhone X+) */}
      <div className="pb-safe">
        <div className="flex items-stretch justify-around px-2 py-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  // Base styles - large touch target
                  "flex flex-col items-center justify-center",
                  "min-w-[72px] min-h-[56px] px-3 py-2",
                  "rounded-xl transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  // Active/inactive states
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent"
                )}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 mb-1 transition-transform",
                    active && "scale-110"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-xs font-medium leading-tight",
                    active && "font-semibold"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
