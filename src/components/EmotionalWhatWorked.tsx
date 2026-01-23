import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Heart, Sparkles, Moon, Zap, Smile, Brain, Cloud,
  ChevronDown, ChevronUp, Plus, Check, TrendingUp,
  Calendar, Star, Feather, Wind, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

// Emotional support practice categories
const EMOTIONAL_PRACTICES = [
  { id: "breathing", label: "Breathing / Breathwork", emoji: "🌬️", category: "calming" },
  { id: "gentle-yoga", label: "Gentle yoga or stretching", emoji: "🧘", category: "movement" },
  { id: "walking", label: "Mindful walking", emoji: "🚶", category: "movement" },
  { id: "journaling", label: "Journaling / Reflection", emoji: "📝", category: "reflective" },
  { id: "gratitude", label: "Gratitude practice", emoji: "🙏", category: "reflective" },
  { id: "dhikr", label: "Dhikr / Prayer", emoji: "📿", category: "spiritual" },
  { id: "nature", label: "Time in nature", emoji: "🌿", category: "grounding" },
  { id: "rest", label: "Intentional rest", emoji: "😴", category: "rest" },
  { id: "warm-food", label: "Warm, nourishing food", emoji: "🍲", category: "nutrition" },
  { id: "connection", label: "Connection with someone", emoji: "💬", category: "connection" },
  { id: "boundaries", label: "Setting a boundary", emoji: "🛡️", category: "self-care" },
  { id: "screen-break", label: "Screen break / digital rest", emoji: "📵", category: "self-care" },
];

// What areas it helped
const HELPED_AREAS = [
  { id: "calm", label: "Feeling calmer", icon: Feather, color: "text-sky-500" },
  { id: "mood", label: "Lifted my mood", icon: Smile, color: "text-yellow-500" },
  { id: "sleep", label: "Better sleep", icon: Moon, color: "text-indigo-500" },
  { id: "energy", label: "More energy", icon: Zap, color: "text-amber-500" },
  { id: "clarity", label: "Mental clarity", icon: Brain, color: "text-wellness-lilac" },
  { id: "grounded", label: "Feeling grounded", icon: Wind, color: "text-wellness-sage" },
];

interface EmotionalLog {
  id: string;
  entry_date: string;
  practices: string[];
  helped_areas: string[];
  reflection: string;
  rating: number | null;
  emotional_state: string | null;
}

interface PatternInsight {
  practice: string;
  label: string;
  emoji: string;
  helpCount: number;
  topBenefit: string;
}

export function EmotionalWhatWorked() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Current entry state
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [helpedAreas, setHelpedAreas] = useState<Record<string, boolean>>({});
  const [reflection, setReflection] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [emotionalState, setEmotionalState] = useState<string | null>(null);
  
  // History and patterns
  const [recentLogs, setRecentLogs] = useState<EmotionalLog[]>([]);
  const [patterns, setPatterns] = useState<PatternInsight[]>([]);
  const [showAddNew, setShowAddNew] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          await fetchRecentLogs(user.id);
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchRecentLogs = async (uid: string) => {
    try {
      // Fetch from support_plan_logs where recommendation_type relates to emotional support
      const { data: logs, error } = await supabase
        .from("support_plan_logs")
        .select("*")
        .eq("user_id", uid)
        .order("entry_date", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform logs into our format
      const transformedLogs: EmotionalLog[] = (logs || []).map(log => ({
        id: log.id,
        entry_date: log.entry_date,
        practices: [log.recommendation_title],
        helped_areas: [
          log.helped_mood && "mood",
          log.helped_pain && "calm",
          log.helped_sleep && "sleep",
          log.helped_energy && "energy",
          log.helped_digestion && "grounded",
        ].filter(Boolean) as string[],
        reflection: log.notes || "",
        rating: log.support_rating,
        emotional_state: null,
      }));

      setRecentLogs(transformedLogs);
      calculatePatterns(transformedLogs);
    } catch (error) {
      console.log("Error fetching logs:", error);
    }
  };

  const calculatePatterns = (logs: EmotionalLog[]) => {
    // Count how often each practice helped
    const practiceHelps: Record<string, { count: number; benefits: Record<string, number> }> = {};
    
    logs.forEach(log => {
      log.practices.forEach(practice => {
        if (!practiceHelps[practice]) {
          practiceHelps[practice] = { count: 0, benefits: {} };
        }
        practiceHelps[practice].count++;
        
        log.helped_areas.forEach(area => {
          practiceHelps[practice].benefits[area] = (practiceHelps[practice].benefits[area] || 0) + 1;
        });
      });
    });

    // Convert to insights
    const insights: PatternInsight[] = Object.entries(practiceHelps)
      .map(([practice, data]) => {
        const matchedPractice = EMOTIONAL_PRACTICES.find(p => p.label === practice);
        const topBenefit = Object.entries(data.benefits)
          .sort(([,a], [,b]) => b - a)[0];
        const benefitLabel = topBenefit 
          ? HELPED_AREAS.find(h => h.id === topBenefit[0])?.label || ""
          : "";
        
        return {
          practice,
          label: matchedPractice?.label || practice,
          emoji: matchedPractice?.emoji || "✨",
          helpCount: data.count,
          topBenefit: benefitLabel,
        };
      })
      .sort((a, b) => b.helpCount - a.helpCount)
      .slice(0, 5);

    setPatterns(insights);
  };

  const togglePractice = (practiceId: string) => {
    setSelectedPractices(prev => 
      prev.includes(practiceId) 
        ? prev.filter(p => p !== practiceId)
        : [...prev, practiceId]
    );
  };

  const toggleHelpedArea = (areaId: string) => {
    setHelpedAreas(prev => ({ ...prev, [areaId]: !prev[areaId] }));
  };

  const handleSave = async () => {
    if (!userId || selectedPractices.length === 0) {
      toast.error("Please select at least one practice");
      return;
    }

    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const selectedPracticeLabels = selectedPractices.map(id => 
        EMOTIONAL_PRACTICES.find(p => p.id === id)?.label || id
      );

      // Save each practice as a separate log entry
      for (const practice of selectedPracticeLabels) {
        const { error } = await supabase
          .from("support_plan_logs")
          .insert({
            user_id: userId,
            entry_date: today,
            recommendation_type: "lifestyle", // Using lifestyle for emotional practices
            recommendation_title: practice,
            recommendation_description: "Emotional wellbeing practice",
            action_taken: "tried",
            helped_mood: helpedAreas.mood || helpedAreas.calm || false,
            helped_pain: false,
            helped_sleep: helpedAreas.sleep || false,
            helped_energy: helpedAreas.energy || false,
            helped_digestion: helpedAreas.grounded || false,
            support_rating: rating,
            notes: reflection,
          });

        if (error) throw error;
      }

      toast.success("Your reflections have been saved");
      
      // Reset form
      setSelectedPractices([]);
      setHelpedAreas({});
      setReflection("");
      setRating(null);
      setShowAddNew(false);
      
      // Refresh data
      await fetchRecentLogs(userId);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const hasAnySelection = selectedPractices.length > 0;

  if (loading) {
    return (
      <Card className="border-wellness-lilac/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-all duration-300 border-wellness-sage/30 bg-gradient-to-br from-wellness-sage/10 to-wellness-lilac/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-wellness-sage/15">
                  <Star className="w-5 h-5 text-wellness-sage" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">What Worked for Me</h3>
                  <p className="text-sm text-muted-foreground">
                    Track which emotional support practices help you most
                  </p>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3">
        <Card className="border-wellness-sage/20">
          <CardContent className="p-4 space-y-5">
            {/* Introduction */}
            <div className="p-3 rounded-xl bg-wellness-sage/5 border border-wellness-sage/15">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is a gentle space to notice what helps you feel better. 
                There's no right or wrong — just patterns to discover over time.
              </p>
            </div>

            {/* Patterns / Insights (if any) */}
            {patterns.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-wellness-lilac" />
                  <h4 className="text-sm font-medium text-foreground">Your Patterns</h4>
                </div>
                <div className="grid gap-2">
                  {patterns.slice(0, 3).map((insight, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
                    >
                      <span className="text-lg">{insight.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {insight.label}
                        </p>
                        {insight.topBenefit && (
                          <p className="text-xs text-muted-foreground">
                            Often helps with: {insight.topBenefit}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {insight.helpCount}× tried
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent History */}
            {recentLogs.length > 0 && !showAddNew && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-wellness-sage" />
                    <h4 className="text-sm font-medium text-foreground">Recent</h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddNew(true)}
                    className="text-xs border-wellness-sage/30"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add New
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recentLogs.slice(0, 5).map((log) => (
                    <div 
                      key={log.id}
                      className="p-3 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1 mb-1">
                            {log.practices.map((practice, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {practice}
                              </Badge>
                            ))}
                          </div>
                          {log.reflection && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {log.reflection}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {format(new Date(log.entry_date), "MMM d")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Entry Form */}
            {(showAddNew || recentLogs.length === 0) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-wellness-lilac" />
                    <h4 className="text-sm font-medium text-foreground">What helped today?</h4>
                  </div>
                  {recentLogs.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddNew(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                {/* Practice Selection */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Select any practices you tried:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {EMOTIONAL_PRACTICES.map(practice => (
                      <button
                        key={practice.id}
                        onClick={() => togglePractice(practice.id)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all text-xs",
                          selectedPractices.includes(practice.id)
                            ? "border-wellness-sage bg-wellness-sage/15 ring-1 ring-wellness-sage/30"
                            : "border-border/50 hover:border-wellness-sage/30 hover:bg-wellness-sage/5"
                        )}
                      >
                        <span>{practice.emoji}</span>
                        <span className="flex-1 min-w-0 truncate">{practice.label}</span>
                        {selectedPractices.includes(practice.id) && (
                          <Check className="w-3 h-3 text-wellness-sage flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* What did it help with? */}
                {selectedPractices.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      What did it help with? (optional)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {HELPED_AREAS.map(area => {
                        const Icon = area.icon;
                        return (
                          <div
                            key={area.id}
                            onClick={() => toggleHelpedArea(area.id)}
                            className={cn(
                              "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all",
                              helpedAreas[area.id]
                                ? "bg-wellness-lilac/10 border-wellness-lilac/40"
                                : "bg-card/50 border-border hover:bg-muted/50"
                            )}
                          >
                            <Checkbox 
                              checked={helpedAreas[area.id] || false}
                              className="pointer-events-none"
                            />
                            <Icon className={cn("w-3.5 h-3.5", area.color)} />
                            <span className="text-xs">{area.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Rating */}
                {selectedPractices.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      How supportive did this feel? (optional)
                    </p>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map(value => (
                        <button
                          key={value}
                          onClick={() => setRating(rating === value ? null : value)}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            rating === value
                              ? "bg-wellness-sage text-white"
                              : "bg-card border border-border hover:bg-muted/50"
                          )}
                        >
                          <span className="text-sm font-medium">{value}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground px-2">
                      <span>Not very</span>
                      <span>Very helpful</span>
                    </div>
                  </div>
                )}

                {/* Reflection */}
                {selectedPractices.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Any notes for yourself? (optional)
                    </p>
                    <Textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="What did you notice? How did it feel?"
                      className="min-h-[60px] text-sm resize-none"
                    />
                  </div>
                )}

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasAnySelection}
                  className="w-full bg-wellness-sage hover:bg-wellness-sage/90"
                >
                  {saving ? "Saving..." : "Save What Worked"}
                </Button>

                <p className="text-xs text-center text-muted-foreground italic">
                  These notes are just for you — to help you understand what supports you over time.
                </p>
              </div>
            )}

            {/* Empty state - encourage first entry */}
            {recentLogs.length === 0 && !showAddNew && (
              <div className="text-center py-6">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  You haven't logged any practices yet
                </p>
                <Button
                  onClick={() => setShowAddNew(true)}
                  className="bg-wellness-sage hover:bg-wellness-sage/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Practice
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default EmotionalWhatWorked;
