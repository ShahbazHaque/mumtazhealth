import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SavedContent {
  id: string;
  content_id: string;
  saved_at: string;
  notes: string | null;
  wellness_content: {
    id: string;
    title: string;
    content_type: string;
    description: string | null;
    duration_minutes: number | null;
  } | null;
}

export function FavoritesQuickAccess() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFavorites();
    }
  }, [isOpen]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_saved_content")
        .select(`
          id,
          content_id,
          saved_at,
          notes,
          wellness_content (
            id,
            title,
            content_type,
            description,
            duration_minutes
          )
        `)
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      yoga: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      meditation: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      nutrition: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      article: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const handleViewContent = (contentId: string) => {
    setIsOpen(false);
    navigate(`/content-library?highlight=${contentId}`);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/content-library?filter=favorites");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg bg-background border-pink-200 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/20"
        >
          <Heart className="h-5 w-5 text-pink-500" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[350px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            My Favorites
          </SheetTitle>
          <SheetDescription>
            Quick access to your saved wellness content
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-pink-300" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Your saved practices will appear here</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                When you find content that speaks to you, tap "Save" to keep it close. This is your personal collection — no rush, just what feels right.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => { setIsOpen(false); navigate("/content-library"); }}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse the Library
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-3 pr-4">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 cursor-pointer transition-all group"
                      onClick={() => handleViewContent(item.content_id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {item.wellness_content?.title || "Content"}
                          </h4>
                          {item.wellness_content?.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.wellness_content.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getContentTypeColor(item.wellness_content?.content_type || '')}`}
                            >
                              {item.wellness_content?.content_type || "content"}
                            </Badge>
                            {item.wellness_content?.duration_minutes && (
                              <span className="text-xs text-muted-foreground">
                                {item.wellness_content.duration_minutes} min
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="pt-4 border-t border-border mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewAll}
                >
                  View All Favorites
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
