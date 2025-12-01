import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Heart, Sparkles, Apple, Filter, CheckCircle2, Circle, TrendingUp, Flame, Wind, Mountain, Flower2, Leaf, Calendar, Users, Lightbulb, Info, HelpCircle, Lock, Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import yogaImage from "@/assets/wellness-yoga.jpg";
import meditationImage from "@/assets/wellness-meditation.jpg";
import nutritionImage from "@/assets/wellness-nutrition.jpg";
import articleImage from "@/assets/wellness-article.jpg";
import lockedImage from "@/assets/locked-content.jpg";
import { Navigation } from "@/components/Navigation";
import { ContentGridSkeleton } from "@/components/ContentSkeleton";

interface WellnessContent {
  id: string;
  title: string;
  description: string;
  detailed_guidance: string;
  content_type: string;
  doshas: string[];
  cycle_phases: string[];
  pregnancy_statuses: string[];
  pregnancy_trimesters: number[];
  benefits: string[];
  tags: string[];
  difficulty_level: string;
  duration_minutes: number;
  image_url: string;
  video_url: string;
  audio_url: string;
  tier_requirement: string;
  is_premium: boolean;
  preview_content: string;
  unlock_after_completions: number;
}

const ContentLibrary = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<string>("free");
  const [content, setContent] = useState<WellnessContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<WellnessContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<WellnessContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedContentIds, setSavedContentIds] = useState<Set<string>>(new Set());
  const [completedContentIds, setCompletedContentIds] = useState<Set<string>>(new Set());
  const [progressStats, setProgressStats] = useState({ total: 0, completed: 0 });
  
  // Filters
  const [selectedDosha, setSelectedDosha] = useState<string>("all");
  const [selectedLifePhase, setSelectedLifePhase] = useState<string>("all");
  const [selectedPregnancyStatus, setSelectedPregnancyStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCompletion, setSelectedCompletion] = useState<string>("all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadContent();
    if (user) {
      loadUserTier();
      loadSavedContent();
      loadProgress();
    }
  }, [user]);

  const loadUserTier = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_wellness_profiles')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error loading user tier:', error);
      return;
    }

    setUserTier(data?.subscription_tier || 'free');
  };

  useEffect(() => {
    // Update total count when content changes
    setProgressStats(prev => ({ ...prev, total: content.length }));
  }, [content]);

  useEffect(() => {
    applyFilters();
  }, [content, selectedDosha, selectedLifePhase, selectedPregnancyStatus, selectedType, selectedCompletion, completedContentIds]);

  const loadContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wellness_content')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
      setLoading(false);
      return;
    }

    setContent(data || []);
    setLoading(false);
  };

  const loadSavedContent = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_saved_content')
      .select('content_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading saved content:', error);
      return;
    }

    setSavedContentIds(new Set(data?.map(item => item.content_id) || []));
  };

  const loadProgress = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_content_progress')
      .select('content_id, completed')
      .eq('user_id', user.id)
      .eq('completed', true);

    if (error) {
      console.error('Error loading progress:', error);
      return;
    }

    const completedIds = new Set(data?.map(item => item.content_id) || []);
    setCompletedContentIds(completedIds);
    
    // Update stats
    setProgressStats({
      total: content.length,
      completed: completedIds.size
    });
  };

  const applyFilters = () => {
    let filtered = [...content];

    if (selectedType !== "all") {
      filtered = filtered.filter(item => item.content_type === selectedType);
    }

    if (selectedDosha !== "all") {
      filtered = filtered.filter(item => 
        !item.doshas || item.doshas.length === 0 || item.doshas.includes(selectedDosha)
      );
    }

    if (selectedLifePhase !== "all") {
      filtered = filtered.filter(item => 
        !item.cycle_phases || item.cycle_phases.length === 0 || item.cycle_phases.includes(selectedLifePhase)
      );
    }

    if (selectedPregnancyStatus !== "all") {
      filtered = filtered.filter(item => 
        !item.pregnancy_statuses || item.pregnancy_statuses.length === 0 || item.pregnancy_statuses.includes(selectedPregnancyStatus)
      );
    }

    if (selectedCompletion !== "all") {
      if (selectedCompletion === "completed") {
        filtered = filtered.filter(item => completedContentIds.has(item.id));
      } else if (selectedCompletion === "not-completed") {
        filtered = filtered.filter(item => !completedContentIds.has(item.id));
      }
    }

    setFilteredContent(filtered);
  };

  const toggleSaveContent = async (contentId: string) => {
    if (!user) {
      toast.error('Please log in to save content');
      return;
    }

    const isSaved = savedContentIds.has(contentId);

    if (isSaved) {
      const { error } = await supabase
        .from('user_saved_content')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', contentId);

      if (error) {
        console.error('Error removing saved content:', error);
        toast.error('Failed to remove from saved');
        return;
      }

      const newSaved = new Set(savedContentIds);
      newSaved.delete(contentId);
      setSavedContentIds(newSaved);
      toast.success('Removed from saved');
    } else {
      const { error } = await supabase
        .from('user_saved_content')
        .insert({
          user_id: user.id,
          content_id: contentId,
        });

      if (error) {
        console.error('Error saving content:', error);
        toast.error('Failed to save content');
        return;
      }

      const newSaved = new Set(savedContentIds);
      newSaved.add(contentId);
      setSavedContentIds(newSaved);
      toast.success('Saved to your library');
    }
  };

  const openContentDetail = (item: WellnessContent) => {
    setSelectedContent(item);
    setIsDialogOpen(true);
  };

  const toggleCompletion = async (contentId: string) => {
    if (!user) {
      toast.error('Please log in to track progress');
      return;
    }

    const isCompleted = completedContentIds.has(contentId);

    if (isCompleted) {
      // Mark as not completed
      const { error } = await supabase
        .from('user_content_progress')
        .update({ completed: false, completed_at: null })
        .eq('user_id', user.id)
        .eq('content_id', contentId);

      if (error) {
        console.error('Error updating progress:', error);
        toast.error('Failed to update progress');
        return;
      }

      const newCompleted = new Set(completedContentIds);
      newCompleted.delete(contentId);
      setCompletedContentIds(newCompleted);
      setProgressStats(prev => ({ ...prev, completed: prev.completed - 1 }));
      toast.success('Marked as not completed');
    } else {
      // Mark as completed
      const { error } = await supabase
        .from('user_content_progress')
        .upsert({
          user_id: user.id,
          content_id: contentId,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating progress:', error);
        toast.error('Failed to update progress');
        return;
      }

      const newCompleted = new Set(completedContentIds);
      newCompleted.add(contentId);
      setCompletedContentIds(newCompleted);
      setProgressStats(prev => ({ ...prev, completed: prev.completed + 1 }));
      toast.success('Marked as completed! 🎉');
    }
  };

  const clearFilters = () => {
    setSelectedDosha("all");
    setSelectedLifePhase("all");
    setSelectedPregnancyStatus("all");
    setSelectedType("all");
    setSelectedCompletion("all");
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'yoga': return <Flower2 className="h-5 w-5 text-dosha-pitta" />;
      case 'meditation': return <Sparkles className="h-5 w-5 text-dosha-vata" />;
      case 'nutrition': return <Leaf className="h-5 w-5 text-dosha-kapha" />;
      case 'article': return <BookOpen className="h-5 w-5 text-primary" />;
      case 'learning': return <Lightbulb className="h-5 w-5 text-primary" />;
      case 'community': return <Users className="h-5 w-5 text-secondary" />;
      case 'life-phase': return <Calendar className="h-5 w-5 text-accent" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getContentImage = (type: string) => {
    switch (type) {
      case 'yoga': return yogaImage;
      case 'meditation': return meditationImage;
      case 'nutrition': return nutritionImage;
      case 'article': return articleImage;
      case 'learning': return articleImage;
      default: return articleImage;
    }
  };

  const isContentUnlocked = (item: WellnessContent) => {
    if (!user) return false;
    
    // Check tier requirement
    const tierHierarchy: Record<string, number> = { free: 0, basic: 1, standard: 2, premium: 3 };
    const userTierLevel = tierHierarchy[userTier] || 0;
    const requiredTierLevel = tierHierarchy[item.tier_requirement] || 0;
    
    if (userTierLevel < requiredTierLevel) {
      return false;
    }

    // Check completion requirement
    if (item.unlock_after_completions > 0 && progressStats.completed < item.unlock_after_completions) {
      return false;
    }

    return true;
  };

  const isVideoUnlocked = (item: WellnessContent) => {
    if (!user) return false;
    
    const tierHierarchy: Record<string, number> = { free: 0, basic: 1, standard: 2, premium: 3 };
    const userTierLevel = tierHierarchy[userTier] || 0;
    
    // Basic tier has no video access
    if (userTierLevel < 2) return false; // Must be Standard (2) or Premium (3)
    
    // Standard tier only gets beginner/essential videos
    if (userTierLevel === 2 && item.difficulty_level !== 'beginner') {
      return false;
    }
    
    // Premium gets all videos
    return true;
  };

  const getDoshaIcon = (dosha: string) => {
    switch (dosha.toLowerCase()) {
      case 'pitta':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-dosha-pitta/10 border border-dosha-pitta/30" title="Pitta - Fire/Transformation">
            <Flame className="h-4 w-4 text-dosha-pitta" />
            <span className="text-xs font-medium text-dosha-pitta">Pitta</span>
          </div>
        );
      case 'vata':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-dosha-vata/10 border border-dosha-vata/30" title="Vata - Air/Movement">
            <Wind className="h-4 w-4 text-dosha-vata" />
            <span className="text-xs font-medium text-dosha-vata">Vata</span>
          </div>
        );
      case 'kapha':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-dosha-kapha/10 border border-dosha-kapha/30" title="Kapha - Earth/Stability">
            <Mountain className="h-4 w-4 text-dosha-kapha" />
            <span className="text-xs font-medium text-dosha-kapha">Kapha</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Wellness Library</h1>
              <p className="text-muted-foreground">Discover personalized wellness content</p>
            </div>
          </div>
        </div>

        {/* Dosha Legend Guide */}
        <TooltipProvider>
          <Card className="mb-6 bg-gradient-to-br from-wellness-sage-light via-background to-wellness-lilac-light border-wellness-sage/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Understanding Your Dosha</CardTitle>
              </div>
              <CardDescription>
                Content is personalized based on Ayurvedic elements - hover for details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pitta - Fire */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-4 rounded-lg bg-dosha-pitta/5 border border-dosha-pitta/20 hover:bg-dosha-pitta/10 transition-colors cursor-help">
                      <div className="p-3 bg-dosha-pitta/20 rounded-full mb-3">
                        <Flame className="h-8 w-8 text-dosha-pitta" />
                      </div>
                      <h3 className="font-semibold text-dosha-pitta mb-1 flex items-center gap-1">
                        Pitta
                        <HelpCircle className="h-3 w-3 opacity-50" />
                      </h3>
                      <p className="text-sm text-center text-muted-foreground">
                        Fire & Transformation • Governs metabolism, digestion, and energy production
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4">
                    <p className="font-semibold mb-2">Pitta Characteristics:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Sharp intellect and focus</li>
                      <li>Medium build, warm body temperature</li>
                      <li>Strong digestion and appetite</li>
                      <li>May experience heat-related issues</li>
                      <li>Benefits from cooling practices</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>

                {/* Vata - Air */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-4 rounded-lg bg-dosha-vata/5 border border-dosha-vata/20 hover:bg-dosha-vata/10 transition-colors cursor-help">
                      <div className="p-3 bg-dosha-vata/20 rounded-full mb-3">
                        <Wind className="h-8 w-8 text-dosha-vata" />
                      </div>
                      <h3 className="font-semibold text-dosha-vata mb-1 flex items-center gap-1">
                        Vata
                        <HelpCircle className="h-3 w-3 opacity-50" />
                      </h3>
                      <p className="text-sm text-center text-muted-foreground">
                        Air & Movement • Governs circulation, breathing, and nervous system
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4">
                    <p className="font-semibold mb-2">Vata Characteristics:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Creative and quick-thinking</li>
                      <li>Light, slender build</li>
                      <li>Variable energy and appetite</li>
                      <li>May experience anxiety or restlessness</li>
                      <li>Benefits from grounding practices</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>

                {/* Kapha - Earth */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-4 rounded-lg bg-dosha-kapha/5 border border-dosha-kapha/20 hover:bg-dosha-kapha/10 transition-colors cursor-help">
                      <div className="p-3 bg-dosha-kapha/20 rounded-full mb-3">
                        <Mountain className="h-8 w-8 text-dosha-kapha" />
                      </div>
                      <h3 className="font-semibold text-dosha-kapha mb-1 flex items-center gap-1">
                        Kapha
                        <HelpCircle className="h-3 w-3 opacity-50" />
                      </h3>
                      <p className="text-sm text-center text-muted-foreground">
                        Earth & Stability • Governs structure, immunity, and fluid balance
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4">
                    <p className="font-semibold mb-2">Kapha Characteristics:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Calm, steady, and nurturing</li>
                      <li>Strong, sturdy build</li>
                      <li>Good endurance and stamina</li>
                      <li>May experience sluggishness</li>
                      <li>Benefits from energizing practices</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>

        {/* Progress Summary */}
        {user && (
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Your Wellness Journey</h3>
                    <p className="text-sm text-muted-foreground">
                      {progressStats.completed} of {progressStats.total} items completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {progressStats.total > 0 ? Math.round((progressStats.completed / progressStats.total) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </div>
              <Progress 
                value={progressStats.total > 0 ? (progressStats.completed / progressStats.total) * 100 : 0} 
                className="h-2"
              />
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle>Filters</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="meditation">Meditation</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="article">Articles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Dosha</label>
                <Select value={selectedDosha} onValueChange={setSelectedDosha}>
                  <SelectTrigger>
                    <SelectValue placeholder="All doshas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doshas</SelectItem>
                    <SelectItem value="vata">Vata</SelectItem>
                    <SelectItem value="pitta">Pitta</SelectItem>
                    <SelectItem value="kapha">Kapha</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Life Phase</label>
                <Select value={selectedLifePhase} onValueChange={setSelectedLifePhase}>
                  <SelectTrigger>
                    <SelectValue placeholder="All phases" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="menstrual">Menstrual</SelectItem>
                    <SelectItem value="fertility">Fertility</SelectItem>
                    <SelectItem value="pregnancy">Pregnancy</SelectItem>
                    <SelectItem value="postpartum">Postpartum</SelectItem>
                    <SelectItem value="perimenopause">Perimenopause</SelectItem>
                    <SelectItem value="menopause">Menopause</SelectItem>
                    <SelectItem value="post-menopause">Post-menopause</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Pregnancy Status</label>
                <Select value={selectedPregnancyStatus} onValueChange={setSelectedPregnancyStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_pregnant">Not Pregnant</SelectItem>
                    <SelectItem value="pregnant">Pregnant</SelectItem>
                    <SelectItem value="postpartum">Postpartum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Progress</label>
                <Select value={selectedCompletion} onValueChange={setSelectedCompletion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All content" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="not-completed">Not Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        {loading ? (
          <ContentGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => {
            const isLocked = !isContentUnlocked(item);
            
            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                {/* Content Image with Lock Overlay */}
                <div className="h-48 overflow-hidden bg-muted relative">
                  <img 
                    src={item.image_url || getContentImage(item.content_type)}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-all ${isLocked ? 'blur-sm opacity-60' : ''}`}
                  />
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="text-center text-white p-4">
                        <Lock className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm font-semibold mb-1">Locked Content</p>
                        {item.tier_requirement !== 'free' && (
                          <Badge className="bg-primary/90 text-primary-foreground">
                            <Crown className="h-3 w-3 mr-1" />
                            {item.tier_requirement === 'basic' ? 'Basic' : 
                             item.tier_requirement === 'standard' ? 'Standard' : 'Premium'} Required
                          </Badge>
                        )}
                        {item.unlock_after_completions > 0 && (
                          <p className="text-xs mt-2">
                            Complete {item.unlock_after_completions} items to unlock
                            <br />
                            ({progressStats.completed}/{item.unlock_after_completions})
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {item.is_premium && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {getContentIcon(item.content_type)}
                      <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {user && completedContentIds.has(item.id) && (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSaveContent(item.id)}
                      >
                        <Heart 
                          className={`h-5 w-5 ${savedContentIds.has(item.id) ? 'fill-primary text-primary' : ''}`}
                        />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {isLocked && item.preview_content ? item.preview_content : item.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {/* Dosha Icons */}
                    {item.doshas && item.doshas.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.doshas.map((dosha) => (
                          <div key={dosha}>
                            {getDoshaIcon(dosha)}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Other Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {item.content_type}
                      </Badge>
                      {item.difficulty_level && (
                        <Badge variant="outline">{item.difficulty_level}</Badge>
                      )}
                      {item.duration_minutes && (
                        <Badge variant="outline">{item.duration_minutes} min</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => openContentDetail(item)}
                      disabled={isLocked}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          View Preview
                        </>
                      ) : (
                        'View Details'
                      )}
                    </Button>
                    {user && !isLocked && (
                      <Button
                        variant={completedContentIds.has(item.id) ? "default" : "outline"}
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompletion(item.id);
                        }}
                        title={completedContentIds.has(item.id) ? "Mark as not completed" : "Mark as completed"}
                      >
                        {completedContentIds.has(item.id) ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}

        {!loading && filteredContent.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No content matches your filters. Try adjusting your selection.
            </p>
          </Card>
        )}

        {/* Content Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            {selectedContent && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="flex items-center gap-2">
                      {getContentIcon(selectedContent.content_type)}
                      {selectedContent.title}
                    </DialogTitle>
                    {selectedContent.is_premium && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <DialogDescription>
                    {selectedContent.description}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[50vh]">
                  <div className="space-y-4">
                    {/* Video Section - Top Priority */}
                    {selectedContent.video_url ? (
                      <div className="relative">
                        {isVideoUnlocked(selectedContent) ? (
                          <div className="space-y-2">
                            <video controls className="w-full rounded-lg bg-black">
                              <source src={selectedContent.video_url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ) : (
                          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-sm">
                              <div className="text-center text-white p-6">
                                <Lock className="h-12 w-12 mx-auto mb-3 opacity-80" />
                                <p className="text-lg font-semibold mb-2">Video Locked</p>
                                <p className="text-sm opacity-90 mb-3">
                                  {userTier === 'free' || userTier === 'basic' 
                                    ? 'Upgrade to Standard or Premium to watch videos'
                                    : userTier === 'standard' && selectedContent.difficulty_level !== 'beginner'
                                    ? 'Upgrade to Premium for advanced videos'
                                    : 'Unlock this video with your plan'}
                                </p>
                                <Badge className="bg-primary/90 text-primary-foreground">
                                  <Crown className="h-4 w-4 mr-1" />
                                  {userTier === 'free' || userTier === 'basic' ? 'Standard+' : 'Premium'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                        <div className="text-center p-6">
                          <Sparkles className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground font-medium">Video coming soon</p>
                        </div>
                      </div>
                    )}

                    {/* Title and Tags Section */}
                    <div className="space-y-3">
                      {/* Dosha Icons */}
                      {selectedContent.doshas?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Recommended for Doshas:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedContent.doshas.map((dosha) => (
                              <div key={dosha}>
                                {getDoshaIcon(dosha)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Category, Phase, and Difficulty Tags */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {selectedContent.content_type}
                        </Badge>
                        {selectedContent.cycle_phases?.length > 0 && (
                          <Badge variant="outline">
                            {selectedContent.cycle_phases.join(', ')}
                          </Badge>
                        )}
                        {selectedContent.pregnancy_statuses?.length > 0 && (
                          <Badge variant="outline">
                            {selectedContent.pregnancy_statuses.join(', ')}
                          </Badge>
                        )}
                        {selectedContent.difficulty_level && (
                          <Badge variant="outline" className="capitalize">
                            {selectedContent.difficulty_level}
                          </Badge>
                        )}
                        {selectedContent.duration_minutes && (
                          <Badge variant="outline">{selectedContent.duration_minutes} min</Badge>
                        )}
                      </div>
                    </div>

                    {/* Text Guidance Section */}
                    <div>
                      <h3 className="font-semibold mb-2">
                        {isContentUnlocked(selectedContent) ? 'Guidance' : 'Preview'}
                      </h3>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {isContentUnlocked(selectedContent) 
                          ? selectedContent.detailed_guidance 
                          : (selectedContent.preview_content || selectedContent.description || 'Unlock to see full content...')
                        }
                      </p>
                    </div>

                    {/* Locked Content Overlay for Text */}
                    {!isContentUnlocked(selectedContent) && (
                      <div className="p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="text-center">
                          <Lock className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                          <p className="font-semibold mb-1">Unlock Full Content</p>
                          {selectedContent.tier_requirement !== 'free' && (
                            <Badge className="bg-primary/90 text-primary-foreground mb-2">
                              <Crown className="h-4 w-4 mr-1" />
                              Upgrade to {selectedContent.tier_requirement === 'basic' ? 'Basic' : 
                                           selectedContent.tier_requirement === 'standard' ? 'Standard' : 'Premium'}
                            </Badge>
                          )}
                          {selectedContent.unlock_after_completions > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Complete {selectedContent.unlock_after_completions} items to unlock
                              <br />
                              Progress: {progressStats.completed}/{selectedContent.unlock_after_completions}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Benefits Section - Only show when unlocked */}
                    {isContentUnlocked(selectedContent) && selectedContent.benefits?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Benefits</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {selectedContent.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Content Image - Supporting Visual */}
                    {isContentUnlocked(selectedContent) && (selectedContent.image_url || getContentImage(selectedContent.content_type)) && (
                      <div>
                        <img 
                          src={selectedContent.image_url || getContentImage(selectedContent.content_type)}
                          alt={selectedContent.title}
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}

                    {/* Audio Section - Only show when unlocked */}
                    {isContentUnlocked(selectedContent) && selectedContent.audio_url && (
                      <div>
                        <h3 className="font-semibold mb-2">Audio Guide</h3>
                        <audio controls className="w-full">
                          <source src={selectedContent.audio_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ContentLibrary;