import { useLoadingOptional } from '@/contexts/LoadingContext';
import { cn } from '@/lib/utils';

interface GlobalLoadingIndicatorProps {
  className?: string;
}

export function GlobalLoadingIndicator({ className }: GlobalLoadingIndicatorProps) {
  const loadingContext = useLoadingOptional();
  const isLoading = loadingContext?.isLoading ?? false;

  return (
    <div 
      className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "h-full bg-gradient-to-r from-accent via-primary to-accent",
          "transition-all duration-200 ease-out",
          isLoading 
            ? "opacity-100 animate-loading-bar" 
            : "opacity-0"
        )}
      />
    </div>
  );
}

export default GlobalLoadingIndicator;
