import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/Logo";
import { GlobalLoadingIndicator } from "@/components/GlobalLoadingIndicator";

interface PageLoadingSkeletonProps {
  variant?: "dashboard" | "tracker" | "content" | "simple";
  showLogo?: boolean;
}

export function PageLoadingSkeleton({ 
  variant = "simple", 
  showLogo = true 
}: PageLoadingSkeletonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-lavender/20 via-background to-wellness-sage-light/10 animate-fade-in">
      {/* Subtle navigation placeholder with loading indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        {/* Loading bar at top of nav */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent via-primary to-accent animate-loading-bar" />
        </div>
        
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {showLogo && <Logo size="sm" showText={false} className="opacity-70" />}
            <span className="font-semibold text-foreground/70 text-base sm:text-lg">Mumtaz Health</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 pt-24 pb-12">
        {variant === "dashboard" && <DashboardSkeleton showLogo={showLogo} />}
        {variant === "tracker" && <TrackerSkeleton />}
        {variant === "content" && <ContentSkeleton />}
        {variant === "simple" && <SimpleSkeleton />}
      </main>
    </div>
  );
}

function DashboardSkeleton({ showLogo }: { showLogo: boolean }) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Centered logo placeholder */}
      {showLogo && (
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText={false} className="opacity-30 animate-pulse" />
        </div>
      )}
      
      {/* Welcome header skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      {/* Quick check-in card skeleton */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border/50 p-4 space-y-2">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Content section skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackerSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Date selector skeleton */}
      <div className="bg-card rounded-xl border border-border/50 p-4">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Form sections skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}

      {/* Save button skeleton */}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* Content grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border/50 p-6 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageLoadingSkeleton;
