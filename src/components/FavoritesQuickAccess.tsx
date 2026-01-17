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
import { Heart, BookOpen, ArrowRight, Loader2, Flame, Wind, Mountain, Clock, Sparkles, Apple, Flower2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WellnessContent {
  id: string;
  title: string;
  content_type: string;
  description: string | null;
  duration_minutes: number | null;
  doshas: string[] | null;
  cycle_phases: string[] | null;
  pregnancy_statuses: string[] | null;
  tags: string[] | null;
  image_url: string | null;
  difficulty_level: string | null;
}

interface SavedContent {
  id: string;
  content_id: string;
  saved_at: string;
  notes: string | null;
  wellness_content: WellnessContent | null;
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
            duration_minutes,
            doshas,
            cycle_phases,
            pregnancy_statuses,
            tags,
            image_url,
            difficulty_level
          )
        `)
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false })
        .limit(15);

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

  const getContentIcon = (type: string) => {
    switch (type) {
      case "yoga":
        return <Flower2 className="h-3 w-3" />;
      case "meditation":
        return <Sparkles className="h-3 w-3" />;
      case "nutrition":
        return <Apple className="h-3 w-3" />;
      default:
        return <BookOpen className="h-3 w-3" />;
    }
  };

  const getDoshaIcon = (dosha: string) => {
    switch (dosha.toLowerCase()) {
      case "vata":
        return <Wind className="h-3 w-3 text-blue-500" />;
      case "pitta":
        return <Flame className="h-3 w-3 text-orange-500" />;
      case "kapha":
        return <Mountain className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const formatLifePhase = (phase: string) => {
    const phaseLabels: Record<string, string> = {
      menstrual: "Menstrual",
      follicular: "Follicular",
      ovulation: "Ovulation",
      luteal: "Luteal",
      pregnant: "Pregnancy",
      postpartum: "Postpartum",
      perimenopause: "Perimenopause",
      menopause: "Menopause",
      "post-menopause": "Post-Menopause",
    };
    return phaseLabels[phase] || phase;
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
      <SheetContent className="w-[380px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
            Your Saved Practices
          </SheetTitle>
          <SheetDescription>
            Quick access to your favorite wellness content
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
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-3 pr-4">
                  {favorites.map((item) => {
                    const content = item.wellness_content;
                    if (!content) return null;
                    
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 cursor-pointer transition-all group"
                        onClick={() => handleViewContent(item.content_id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <h4 className="font-medium text-foreground text-sm sm:text-base leading-snug break-words hyphens-auto mb-1.5">
                              {content.title}
                            </h4>
                            
                            {/* Description */}
                            {content.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                {content.description}
                              </p>
                            )}
                            
                            {/* Primary badges row: Type, Duration, Difficulty */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs capitalize flex items-center gap-1 ${getContentTypeColor(content.content_type)}`}
                              >
                                {getContentIcon(content.content_type)}
                                {content.content_type}
                              </Badge>
                              
                              {content.duration_minutes && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {content.duration_minutes} min
                                </Badge>
                              )}
                              
                              {content.difficulty_level && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {content.difficulty_level}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Doshas */}
                            {content.doshas && content.doshas.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                {content.doshas.map((dosha) => (
                                  <Badge 
                                    key={dosha} 
                                    variant="outline" 
                                    className="text-xs capitalize flex items-center gap-1"
                                  >
                                    {getDoshaIcon(dosha)}
                                    {dosha}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* Life phases & pregnancy statuses */}
                            {((content.cycle_phases && content.cycle_phases.length > 0) || 
                              (content.pregnancy_statuses && content.pregnancy_statuses.length > 0)) && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {content.cycle_phases?.slice(0, 2).map((phase) => (
                                  <Badge 
                                    key={phase} 
                                    variant="secondary" 
                                    className="text-xs bg-wellness-lilac-light/50 text-foreground"
                                  >
                                    {formatLifePhase(phase)}
                                  </Badge>
                                ))}
                                {content.cycle_phases && content.cycle_phases.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{content.cycle_phases.length - 2} more
                                  </Badge>
                                )}
                                {content.pregnancy_statuses?.slice(0, 2).map((status) => (
                                  <Badge 
                                    key={status} 
                                    variant="secondary" 
                                    className="text-xs bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
                                  >
                                    {formatLifePhase(status)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="pt-4 border-t border-border mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewAll}
                >
                  View All Favorites ({favorites.length})
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
