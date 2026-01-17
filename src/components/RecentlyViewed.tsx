import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ChevronRight, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface RecentActivity {
  type: string;
  title: string;
  path: string;
  timestamp: string;
}

export function RecentlyViewed() {
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState<RecentActivity[]>([]);

  useEffect(() => {
    loadRecentItems();
  }, []);

  const loadRecentItems = () => {
    const stored = localStorage.getItem('mumtaz_recent_activities');
    if (stored) {
      try {
        const activities: RecentActivity[] = JSON.parse(stored);
        // Get unique items by path, keeping most recent, limit to 5
        const uniqueMap = new Map<string, RecentActivity>();
        activities.forEach(item => {
          if (!uniqueMap.has(item.path) || new Date(item.timestamp) > new Date(uniqueMap.get(item.path)!.timestamp)) {
            uniqueMap.set(item.path, item);
          }
        });
        const uniqueItems = Array.from(uniqueMap.values())
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);
        setRecentItems(uniqueItems);
      } catch (e) {
        console.error("Error parsing recent activities:", e);
      }
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('mumtaz_recent_activities');
    setRecentItems([]);
    toast.success("Recently viewed history cleared");
  };

  const getTypeIcon = (type: string) => {
    return <BookOpen className="h-4 w-4 text-primary" />;
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return format(date, "MMM d");
    } catch {
      return "";
    }
  };

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recently Viewed
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="h-8 px-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Clear history</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentItems.map((item, index) => (
          <Button
            key={`${item.path}-${index}`}
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-3 hover:bg-accent/10"
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">{getTypeIcon(item.type)}</div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground leading-snug break-words hyphens-auto">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {item.type.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatTime(item.timestamp)}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => navigate("/content-library")}
        >
          View All Content
        </Button>
      </CardContent>
    </Card>
  );
}

// Utility function to track activity - can be imported by other components
export function trackRecentActivity(activity: Omit<RecentActivity, 'timestamp'>) {
  try {
    const stored = localStorage.getItem('mumtaz_recent_activities');
    let activities: RecentActivity[] = stored ? JSON.parse(stored) : [];
    
    // Add new activity with timestamp
    const newActivity: RecentActivity = {
      ...activity,
      timestamp: new Date().toISOString()
    };
    
    // Add to beginning and limit to 20 items
    activities = [newActivity, ...activities].slice(0, 20);
    
    localStorage.setItem('mumtaz_recent_activities', JSON.stringify(activities));
  } catch (e) {
    console.error("Error tracking activity:", e);
  }
}
