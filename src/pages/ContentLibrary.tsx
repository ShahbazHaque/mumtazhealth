import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Heart, Sparkles, Apple, Filter, CheckCircle2, Circle, TrendingUp, Flame, Wind, Mountain, Flower2, Leaf, Calendar, Users, Lightbulb, Info, HelpCircle, Lock, Crown, Bell, Droplet, AlertTriangle, Search, X, Baby, Salad, Brain, Activity } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import yogaImage from "@/assets/wellness-yoga.jpg";
import meditationImage from "@/assets/wellness-meditation.jpg";
import nutritionImage from "@/assets/wellness-nutrition.jpg";
import articleImage from "@/assets/wellness-article.jpg";
import lockedImage from "@/assets/locked-content.jpg";
import jointCareChairYoga from "@/assets/joint-care-chair-yoga.jpg";
import jointCareWallYoga from "@/assets/joint-care-wall-yoga.jpg";
import jointCareBedMobility from "@/assets/joint-care-bed-mobility.jpg";
import jointCareAbhyanga from "@/assets/joint-care-abhyanga.jpg";
import jointCareGoldenMilk from "@/assets/joint-care-golden-milk.jpg";
import jointCareKitchari from "@/assets/joint-care-kitchari.jpg";
import jointCareBoneSoup from "@/assets/joint-care-bone-soup.jpg";
import jointCareBreathwork from "@/assets/joint-care-breathwork.jpg";
import jointCareFunctional from "@/assets/joint-care-functional.jpg";
import bloodSugarEnergySupport from "@/assets/blood-sugar-energy-support.jpg";
// Mumtaz brand images
import { 
  brandImages, 
  getBrandImage,
  mumtazYoga1, 
  mumtazYoga2, 
  mumtazYoga3, 
  mumtazYoga4, 
  mumtazYoga5, 
  mumtazYoga6, 
  mumtazYoga7, 
  mumtazYoga8, 
  mumtazYoga9, 
  mumtazYoga10 
} from "@/assets/brandImages";
// New pose images
import seatedMeditation from "@/assets/poses/seated-meditation.jpeg";
import seatedSideStretch from "@/assets/poses/seated-side-stretch.jpeg";
import headToKnee from "@/assets/poses/head-to-knee.jpeg";
import neckShoulderStretch from "@/assets/poses/neck-shoulder-stretch.jpeg";
import prayerPose from "@/assets/poses/prayer-pose.jpeg";
import pyramidPoseBlocks from "@/assets/poses/pyramid-pose-blocks.jpeg";
import camelPose from "@/assets/poses/camel-pose.jpeg";
import lowLungeBlock from "@/assets/poses/low-lunge-block.jpeg";
import seatedWelcome from "@/assets/poses/seated-welcome.jpeg";
import downwardDogBlocks from "@/assets/poses/downward-dog-blocks.jpeg";
// Additional pose images
import lizardPose from "@/assets/poses/lizard-pose.jpg";
import highCobraBlocks from "@/assets/poses/high-cobra-blocks.jpeg";
import trianglePose from "@/assets/poses/triangle-pose.jpeg";
import bridgeLegLift from "@/assets/poses/bridge-leg-lift.jpeg";
import lowLungeHip from "@/assets/poses/low-lunge-hip.jpeg";
import modifiedChaturanga from "@/assets/poses/modified-chaturanga.jpeg";
import threeLegPlank from "@/assets/poses/three-leg-plank.jpeg";
import highLungeTwist from "@/assets/poses/high-lunge-twist.jpeg";
import babyCobraBlocks from "@/assets/poses/baby-cobra-blocks.jpeg";
import birdDogStretch from "@/assets/poses/bird-dog-stretch.jpeg";
import { Navigation } from "@/components/Navigation";
import { ContentGridSkeleton } from "@/components/ContentSkeleton";
import { DailyReminderButton } from "@/components/DailyReminderButton";
import { PoseSequenceGuide } from "@/components/PoseSequenceGuide";
import { PoseImageSequence } from "@/components/PoseImageSequence";
import { FavoritesQuickAccess } from "@/components/FavoritesQuickAccess";
import { trackLastActivity } from "@/components/ReturningUserWelcome";
import { trackRecentActivity } from "@/components/RecentlyViewed";
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
  animation_url: string; // Animated instructional videos (available to all tiers)
  audio_url: string;
  tier_requirement: string;
  is_premium: boolean;
  preview_content: string;
  unlock_after_completions: number;
}

// Map movement preferences to content tags
const movementToTagsMap: Record<string, string[]> = {
  gentle: ["gentle", "restorative", "relaxation", "calming", "grounding", "slow", "beginner"],
  stretchy: ["stretchy", "fluid", "flow", "vinyasa", "flexibility", "opening", "yin"],
  strong: ["strong", "energising", "dynamic", "power", "strength", "active", "challenging"],
  seated: ["chair-yoga", "seated", "senior-friendly", "accessible", "bed-yoga", "mobility"],
  recommend: [], // Will be handled based on dosha
};

// Get recommended tags based on dosha
const getDoshaMovementTags = (primaryDosha: string | null): string[] => {
  switch (primaryDosha) {
    case "vata":
      return ["grounding", "slow", "stability", "gentle", "calming", "restorative"];
    case "pitta":
      return ["cooling", "fluid", "stretchy", "yin", "relaxation", "flow"];
    case "kapha":
      return ["energising", "uplifting", "dynamic", "strong", "active", "power"];
    default:
      return ["gentle", "beginner"];
  }
};

const ContentLibrary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<string>("free");
  const [userMovementPreference, setUserMovementPreference] = useState<string | null>(null);
  const [userPrimaryDosha, setUserPrimaryDosha] = useState<string | null>(null);
  const [content, setContent] = useState<WellnessContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<WellnessContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<WellnessContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedContentIds, setSavedContentIds] = useState<Set<string>>(new Set());
  const [completedContentIds, setCompletedContentIds] = useState<Set<string>>(new Set());
  const [progressStats, setProgressStats] = useState({ total: 0, completed: 0 });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDosha, setSelectedDosha] = useState<string>("all");
  const [selectedLifePhase, setSelectedLifePhase] = useState<string>("all");
  const [selectedMobility, setSelectedMobility] = useState<string>("all");
  const [selectedConcern, setSelectedConcern] = useState<string>("all");
  const [selectedCompletion, setSelectedCompletion] = useState<string>("all");

  // Category definitions for better organization
  const categories = [
    { value: "all", label: "All Content", icon: BookOpen },
    { value: "yoga", label: "Yoga", icon: Flower2 },
    { value: "mobility", label: "Mobility & Arthritis", icon: Activity },
    { value: "ayurveda", label: "Ayurveda Lifestyle", icon: Leaf },
    { value: "nutrition", label: "Nutrition & Recipes", icon: Salad },
    { value: "pregnancy", label: "Pregnancy & Postpartum", icon: Baby },
    { value: "menopause", label: "Menopause & Beyond", icon: Sparkles },
    { value: "emotional", label: "Emotional & Spiritual", icon: Brain },
    { value: "digestive", label: "Digestive Wellness", icon: Apple },
    { value: "energy", label: "Diabetes Support", icon: Droplet },
  ];

  // Wellness concerns for filtering
  const wellnessConcerns = [
    { value: "all", label: "All Concerns" },
    { value: "bloating", label: "Bloating" },
    { value: "fatigue", label: "Fatigue" },
    { value: "stiffness", label: "Stiffness" },
    { value: "mood", label: "Mood Support" },
    { value: "stress", label: "Stress Relief" },
    { value: "sleep", label: "Sleep Support" },
    { value: "pain", label: "Pain & Discomfort" },
    { value: "hormonal", label: "Hormonal Balance" },
  ];

  // Mobility levels for accessibility
  const mobilityLevels = [
    { value: "all", label: "All Levels" },
    { value: "chair", label: "Chair-based" },
    { value: "gentle", label: "Gentle & Slow" },
    { value: "moderate", label: "Moderate" },
    { value: "active", label: "Active & Energising" },
  ];

  // Handle URL params for filtering
  useEffect(() => {
    const doshaParam = searchParams.get('dosha');
    const typeParam = searchParams.get('type');
    const filterParam = searchParams.get('filter');
    const pregnancyParam = searchParams.get('pregnancy');
    const stageParam = searchParams.get('stage');
    
    if (doshaParam) {
      setSelectedDosha(doshaParam);
    }
    if (typeParam) {
      // Map type to category
      const typeToCategory: Record<string, string> = {
        yoga: 'yoga',
        meditation: 'emotional',
        nutrition: 'nutrition'
      };
      setSelectedCategory(typeToCategory[typeParam] || 'all');
    }
    if (filterParam === 'favorites') {
      setSelectedCompletion('saved');
    }
    if (pregnancyParam || stageParam) {
      setSelectedLifePhase(pregnancyParam || stageParam || 'all');
    }
  }, [searchParams]);

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
      loadUserProfile();
      loadSavedContent();
      loadProgress();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_wellness_profiles')
      .select('subscription_tier, preferred_yoga_style, primary_dosha')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading user profile:', error);
      return;
    }

    setUserTier(data?.subscription_tier || 'free');
    setUserMovementPreference(data?.preferred_yoga_style || null);
    setUserPrimaryDosha(data?.primary_dosha || null);
  };

  useEffect(() => {
    // Update total count when content changes
    setProgressStats(prev => ({ ...prev, total: content.length }));
  }, [content]);

  useEffect(() => {
    applyFilters();
  }, [content, searchQuery, selectedCategory, selectedDosha, selectedLifePhase, selectedMobility, selectedConcern, selectedCompletion, completedContentIds, userMovementPreference, userPrimaryDosha]);

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

    // Search query filter - search across titles, descriptions, and tags
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        item.benefits?.some(benefit => benefit.toLowerCase().includes(query)) ||
        item.cycle_phases?.some(phase => phase.toLowerCase().includes(query)) ||
        item.doshas?.some(dosha => dosha.toLowerCase().includes(query))
      );
    }

    // Category filter - maps to content types and tags
    if (selectedCategory !== "all") {
      const categoryMappings: Record<string, { types: string[], tags: string[] }> = {
        yoga: { types: ["yoga"], tags: ["yoga", "asana", "flow", "stretch"] },
        mobility: { types: ["yoga"], tags: ["arthritis", "joint-care", "mobility", "chair-yoga", "wall-yoga", "bed-yoga", "senior-friendly", "accessible"] },
        ayurveda: { types: ["article", "learning"], tags: ["ayurveda", "dosha", "lifestyle", "routine", "ritual"] },
        nutrition: { types: ["nutrition"], tags: ["nutrition", "recipe", "food", "meal", "diet", "eating"] },
        pregnancy: { types: ["yoga", "nutrition", "article"], tags: ["pregnancy", "prenatal", "postpartum", "fertility", "trimester"] },
        menopause: { types: ["yoga", "nutrition", "article"], tags: ["menopause", "perimenopause", "post-menopause", "hormonal", "hot-flush"] },
        emotional: { types: ["meditation", "article"], tags: ["emotional", "spiritual", "mindfulness", "meditation", "breathwork", "grounding", "dhikr", "prayer"] },
        digestive: { types: ["nutrition", "article"], tags: ["digestive", "bloating", "gut", "ibs", "digestion", "easy-digest"] },
        energy: { types: ["yoga", "nutrition", "meditation"], tags: ["diabetes", "blood-sugar", "insulin-resistance", "type-2-diabetes", "balanced-energy", "energy-support", "blood-sugar-balance", "diabetes-support"] },
      };

      const mapping = categoryMappings[selectedCategory];
      if (mapping) {
        filtered = filtered.filter(item => 
          mapping.types.includes(item.content_type) ||
          item.tags?.some(tag => mapping.tags.some(t => tag.toLowerCase().includes(t)))
        );
      }
    }

    if (selectedDosha !== "all") {
      filtered = filtered.filter(item => 
        !item.doshas || item.doshas.length === 0 || item.doshas.includes(selectedDosha)
      );
    }

    if (selectedLifePhase !== "all") {
      filtered = filtered.filter(item => 
        !item.cycle_phases || item.cycle_phases.length === 0 || item.cycle_phases.includes(selectedLifePhase) ||
        item.pregnancy_statuses?.includes(selectedLifePhase)
      );
    }

    // Mobility level filter
    if (selectedMobility !== "all") {
      const mobilityMappings: Record<string, string[]> = {
        chair: ["chair-yoga", "seated", "bed-yoga", "accessible"],
        gentle: ["gentle", "restorative", "slow", "beginner", "relaxation"],
        moderate: ["moderate", "intermediate", "flow"],
        active: ["strong", "energising", "dynamic", "power", "active"],
      };
      const mobilityTags = mobilityMappings[selectedMobility] || [];
      filtered = filtered.filter(item => {
        if (!item.tags || item.tags.length === 0) return selectedMobility === "gentle";
        return item.tags.some(tag => 
          mobilityTags.some(mTag => tag.toLowerCase().includes(mTag))
        ) || item.difficulty_level?.toLowerCase() === selectedMobility;
      });
    }

    // Wellness concern filter
    if (selectedConcern !== "all") {
      const concernMappings: Record<string, string[]> = {
        bloating: ["bloating", "digestive", "gut", "ibs"],
        fatigue: ["fatigue", "energy", "tiredness", "exhaustion", "vitality"],
        stiffness: ["stiffness", "mobility", "joint", "arthritis", "flexibility"],
        mood: ["mood", "emotional", "anxiety", "stress", "calm", "peace"],
        stress: ["stress", "relaxation", "calming", "grounding", "anxiety"],
        sleep: ["sleep", "insomnia", "rest", "relaxation", "evening"],
        pain: ["pain", "discomfort", "relief", "soothing"],
        hormonal: ["hormonal", "hormone", "menopause", "perimenopause", "menstrual", "pms"],
      };
      const concernTags = concernMappings[selectedConcern] || [];
      filtered = filtered.filter(item => 
        item.tags?.some(tag => 
          concernTags.some(cTag => tag.toLowerCase().includes(cTag))
        ) ||
        item.benefits?.some(benefit => 
          concernTags.some(cTag => benefit.toLowerCase().includes(cTag))
        )
      );
    }

    if (selectedCompletion !== "all") {
      if (selectedCompletion === "completed") {
        filtered = filtered.filter(item => completedContentIds.has(item.id));
      } else if (selectedCompletion === "not-completed") {
        filtered = filtered.filter(item => !completedContentIds.has(item.id));
      }
    }

    // Sort content to prioritize user's movement preference matches
    if (userMovementPreference && userMovementPreference !== "recommend") {
      const preferredTags = movementToTagsMap[userMovementPreference] || [];
      filtered.sort((a, b) => {
        const aMatch = a.tags?.some(tag => 
          preferredTags.some(pTag => tag.toLowerCase().includes(pTag.toLowerCase()))
        ) ? 1 : 0;
        const bMatch = b.tags?.some(tag => 
          preferredTags.some(pTag => tag.toLowerCase().includes(pTag.toLowerCase()))
        ) ? 1 : 0;
        return bMatch - aMatch;
      });
    } else if (userMovementPreference === "recommend" && userPrimaryDosha) {
      const doshaMovementTags = getDoshaMovementTags(userPrimaryDosha);
      filtered.sort((a, b) => {
        const aMatch = a.tags?.some(tag => 
          doshaMovementTags.some(dTag => tag.toLowerCase().includes(dTag.toLowerCase()))
        ) ? 1 : 0;
        const bMatch = b.tags?.some(tag => 
          doshaMovementTags.some(dTag => tag.toLowerCase().includes(dTag.toLowerCase()))
        ) ? 1 : 0;
        return bMatch - aMatch;
      });
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
    
    // Track this activity for returning user experience
    trackLastActivity({
      type: 'content',
      title: item.title,
      path: `/content-library?highlight=${item.id}`,
      timestamp: new Date().toISOString()
    });
    
    // Track for recently viewed section on dashboard
    trackRecentActivity({
      type: item.content_type,
      title: item.title,
      path: `/content-library?highlight=${item.id}`
    });
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

  // Reusable content card renderer
  const renderContentCard = (item: WellnessContent) => {
    const isLocked = !isContentUnlocked(item);
    return (
      <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
        <div className="h-40 overflow-hidden bg-muted relative">
          <img 
            src={getContentImage(item.content_type, item.tags, item.image_url)}
            alt={item.title}
            className={`w-full h-full object-cover transition-all ${isLocked ? 'blur-sm opacity-60' : ''}`}
          />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-center text-white p-4">
                <Lock className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm font-semibold">Upgrade to unlock</p>
              </div>
            </div>
          )}
          {/* Category badge */}
          <Badge className="absolute top-2 left-2 capitalize text-xs">
            {item.content_type}
          </Badge>
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => toggleSaveContent(item.id)}
            >
              <Heart className={`h-4 w-4 ${savedContentIds.has(item.id) ? 'fill-primary text-primary' : ''}`} />
            </Button>
          </div>
          <CardDescription className="line-clamp-2 text-sm">
            {item.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.doshas?.slice(0, 2).map((dosha) => (
              <Badge key={dosha} variant="outline" className="text-xs capitalize">{dosha}</Badge>
            ))}
            {item.duration_minutes && (
              <Badge variant="outline" className="text-xs">{item.duration_minutes} min</Badge>
            )}
          </div>
          
          <Button 
            className="w-full" 
            size="sm"
            onClick={() => openContentDetail(item)}
            disabled={isLocked}
          >
            {isLocked ? 'View Preview' : 'View Details'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDosha("all");
    setSelectedLifePhase("all");
    setSelectedMobility("all");
    setSelectedConcern("all");
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

  // Map database image URLs to imported images
  const imageUrlMap: Record<string, string> = {
    '/src/assets/poses/seated-meditation.jpeg': seatedMeditation,
    '/src/assets/poses/seated-side-stretch.jpeg': seatedSideStretch,
    '/src/assets/poses/head-to-knee.jpeg': headToKnee,
    '/src/assets/poses/neck-shoulder-stretch.jpeg': neckShoulderStretch,
    '/src/assets/poses/prayer-pose.jpeg': prayerPose,
    '/src/assets/poses/pyramid-pose-blocks.jpeg': pyramidPoseBlocks,
    '/src/assets/poses/camel-pose.jpeg': camelPose,
    '/src/assets/poses/low-lunge-block.jpeg': lowLungeBlock,
    '/src/assets/poses/seated-welcome.jpeg': seatedWelcome,
    '/src/assets/poses/downward-dog-blocks.jpeg': downwardDogBlocks,
    '/src/assets/poses/lizard-pose.jpg': lizardPose,
    '/src/assets/poses/high-cobra-blocks.jpeg': highCobraBlocks,
    '/src/assets/poses/triangle-pose.jpeg': trianglePose,
    '/src/assets/poses/bridge-leg-lift.jpeg': bridgeLegLift,
    '/src/assets/poses/low-lunge-hip.jpeg': lowLungeHip,
    '/src/assets/poses/modified-chaturanga.jpeg': modifiedChaturanga,
    '/src/assets/poses/three-leg-plank.jpeg': threeLegPlank,
    '/src/assets/poses/high-lunge-twist.jpeg': highLungeTwist,
    '/src/assets/poses/baby-cobra-blocks.jpeg': babyCobraBlocks,
    '/src/assets/poses/bird-dog-stretch.jpeg': birdDogStretch,
    '/src/assets/joint-care-chair-yoga.jpg': jointCareChairYoga,
    '/src/assets/joint-care-wall-yoga.jpg': jointCareWallYoga,
    '/src/assets/joint-care-bed-mobility.jpg': jointCareBedMobility,
    '/src/assets/joint-care-abhyanga.jpg': jointCareAbhyanga,
    '/src/assets/joint-care-golden-milk.jpg': jointCareGoldenMilk,
    '/src/assets/joint-care-kitchari.jpg': jointCareKitchari,
    '/src/assets/joint-care-bone-soup.jpg': jointCareBoneSoup,
    '/src/assets/joint-care-breathwork.jpg': jointCareBreathwork,
    '/src/assets/joint-care-functional.jpg': jointCareFunctional,
    '/src/assets/blood-sugar-energy-support.jpg': bloodSugarEnergySupport,
  };

  const resolveImageUrl = (imageUrl: string | null | undefined): string | null => {
    if (!imageUrl) return null;
    return imageUrlMap[imageUrl] || null;
  };

  const getContentImage = (type: string, tags?: string[], imageUrl?: string) => {
    // First check if there's a database image URL that maps to an import
    if (imageUrl) {
      const resolved = resolveImageUrl(imageUrl);
      if (resolved) return resolved;
    }

    // Check for specific tag-based images (new pose images first)
    if (tags?.some(tag => ['meditation', 'breathwork', 'relaxation', 'calming'].includes(tag))) {
      return seatedMeditation;
    }
    if (tags?.some(tag => ['flexibility', 'side-stretch', 'stretch'].includes(tag))) {
      return seatedSideStretch;
    }
    if (tags?.some(tag => ['forward-fold', 'hamstring'].includes(tag))) {
      return headToKnee;
    }
    if (tags?.some(tag => ['neck', 'shoulder', 'upper-body'].includes(tag))) {
      return neckShoulderStretch;
    }
    if (tags?.some(tag => ['prayer', 'spiritual', 'mantra', 'affirmation', 'dosha'].includes(tag))) {
      return prayerPose;
    }
    if (tags?.some(tag => ['standing', 'strength', 'pyramid'].includes(tag))) {
      return pyramidPoseBlocks;
    }
    if (tags?.some(tag => ['backbend', 'spine', 'camel'].includes(tag))) {
      return camelPose;
    }
    if (tags?.some(tag => ['hip', 'lunge', 'hip-flexor'].includes(tag))) {
      return lowLungeBlock;
    }
    if (tags?.some(tag => ['downward-dog', 'foundation', 'inversion'].includes(tag))) {
      return downwardDogBlocks;
    }
    // Additional pose images
    if (tags?.some(tag => ['lizard', 'deep-lunge', 'hip-opener'].includes(tag))) {
      return lizardPose;
    }
    if (tags?.some(tag => ['cobra', 'upward-dog', 'chest-opener'].includes(tag))) {
      return highCobraBlocks;
    }
    if (tags?.some(tag => ['revolved-forward-fold', 'parivrtta-uttanasana', 'standing-twist'].includes(tag))) {
      return trianglePose;
    }
    if (tags?.some(tag => ['bridge', 'glutes', 'pelvic-floor', 'postpartum'].includes(tag))) {
      return bridgeLegLift;
    }
    if (tags?.some(tag => ['crescent-lunge', 'balance', 'leg-strength'].includes(tag))) {
      return lowLungeHip;
    }
    if (tags?.some(tag => ['chaturanga', 'plank', 'arm-strength', 'modified'].includes(tag))) {
      return modifiedChaturanga;
    }
    if (tags?.some(tag => ['core', 'plank-variation', 'advanced'].includes(tag))) {
      return threeLegPlank;
    }
    if (tags?.some(tag => ['twist', 'detox', 'digestion', 'revolved'].includes(tag))) {
      return highLungeTwist;
    }
    if (tags?.some(tag => ['baby-cobra', 'gentle-backbend', 'beginner'].includes(tag))) {
      return babyCobraBlocks;
    }
    if (tags?.some(tag => ['bird-dog', 'balance', 'core-stability', 'all-fours'].includes(tag))) {
      return birdDogStretch;
    }

    // Check for joint care specific images based on tags
    if (tags?.some(tag => ['chair-yoga', 'senior-friendly'].includes(tag))) {
      return jointCareChairYoga;
    }
    if (tags?.includes('wall-yoga')) {
      return jointCareWallYoga;
    }
    if (tags?.includes('bed-yoga')) {
      return jointCareBedMobility;
    }
    if (tags?.includes('abhyanga') || tags?.includes('self-massage')) {
      return jointCareAbhyanga;
    }
    if (tags?.includes('golden-milk') || tags?.includes('turmeric')) {
      return jointCareGoldenMilk;
    }
    if (tags?.includes('kitchari')) {
      return jointCareKitchari;
    }
    if (tags?.includes('soup') || tags?.includes('bone-health')) {
      return jointCareBoneSoup;
    }
    if (tags?.includes('breathwork') || tags?.includes('grounding') || tags?.includes('gratitude')) {
      return jointCareBreathwork;
    }
    if (tags?.includes('functional-movement')) {
      return jointCareFunctional;
    }
    
    // Default by content type - use Mumtaz brand images as primary
    switch (type) {
      case 'yoga': return mumtazYoga6; // Reverse warrior pose
      case 'meditation': return mumtazYoga8; // Pigeon pose variation
      case 'breathwork': return mumtazYoga7; // Thread the needle
      case 'affirmation': return mumtazYoga9; // King pigeon
      case 'nutrition': return nutritionImage; // Keep food images
      case 'article': return mumtazYoga10; // Extended side angle outdoor
      case 'learning': return mumtazYoga10;
      case 'recipe': return nutritionImage; // Keep food images
      default: return mumtazYoga6;
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

  // Check if animated instructional video is available (all tiers can view animations)
  const isAnimationAvailable = (item: WellnessContent) => {
    return !!item.animation_url;
  };

  // Check if live video is unlocked (Premium only for live recorded sessions)
  const isLiveVideoUnlocked = (item: WellnessContent) => {
    if (!user) return false;
    
    const tierHierarchy: Record<string, number> = { free: 0, basic: 1, standard: 2, premium: 3 };
    const userTierLevel = tierHierarchy[userTier] || 0;
    
    // Only Premium (3) gets access to live recorded video sessions
    return userTierLevel >= 3;
  };

  // Legacy function for backward compatibility
  const isVideoUnlocked = (item: WellnessContent) => {
    // Animations are available to all authenticated users
    if (item.animation_url && user) return true;
    
    // Live videos require Premium
    return isLiveVideoUnlocked(item);
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

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="mb-6">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-max h-auto gap-1 p-1 bg-muted/50">
                <TabsTrigger value="all" className="text-sm py-2 px-3">
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  All
                </TabsTrigger>
                <TabsTrigger value="saved" className="text-sm py-2 px-3">
                  <Heart className="h-4 w-4 mr-1.5" />
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="yoga" className="text-sm py-2 px-3">
                  <Flower2 className="h-4 w-4 mr-1.5" />
                  Yoga
                </TabsTrigger>
                <TabsTrigger value="joint-care" className="text-sm py-2 px-3">
                  <Activity className="h-4 w-4 mr-1.5" />
                  Mobility
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="text-sm py-2 px-3">
                  <Salad className="h-4 w-4 mr-1.5" />
                  Nutrition
                </TabsTrigger>
                <TabsTrigger value="pregnancy" className="text-sm py-2 px-3">
                  <Baby className="h-4 w-4 mr-1.5" />
                  Pregnancy
                </TabsTrigger>
                <TabsTrigger value="menopause" className="text-sm py-2 px-3">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Menopause
                </TabsTrigger>
                <TabsTrigger value="emotional" className="text-sm py-2 px-3">
                  <Brain className="h-4 w-4 mr-1.5" />
                  Spiritual
                </TabsTrigger>
                <TabsTrigger value="energy-support" className="text-sm py-2 px-3">
                  <Droplet className="h-4 w-4 mr-1.5" />
                  Diabetes Support
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>

          <TabsContent value="all" className="space-y-6">
            {/* Search Bar */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for yoga, nutrition, breathwork, life phases, conditions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Try: "yoga for arthritis", "perimenopause support", "breathwork", "nutrition for bloating"
                </p>
              </CardContent>
            </Card>

            {/* Disclaimer Banner */}
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                This content provides general wellbeing and lifestyle guidance only. It is not medical advice. Always consult your doctor for medical concerns.
              </p>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <CardTitle className="text-lg">Filter Content</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Mobility Level</label>
                    <Select value={selectedMobility} onValueChange={setSelectedMobility}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        {mobilityLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Life Phase</label>
                    <Select value={selectedLifePhase} onValueChange={setSelectedLifePhase}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All" />
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
                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Dosha</label>
                    <Select value={selectedDosha} onValueChange={setSelectedDosha}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All" />
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
                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Wellness Concern</label>
                    <Select value={selectedConcern} onValueChange={setSelectedConcern}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        {wellnessConcerns.map(concern => (
                          <SelectItem key={concern.value} value={concern.value}>{concern.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {user && (
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Progress</label>
                      <Select value={selectedCompletion} onValueChange={setSelectedCompletion}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Content</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="not-completed">Not Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Active filters indicator */}
                {(searchQuery || selectedCategory !== "all" || selectedMobility !== "all" || selectedLifePhase !== "all" || selectedDosha !== "all" || selectedConcern !== "all") && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge variant="secondary" className="gap-1">
                        Search: "{searchQuery}"
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                      </Badge>
                    )}
                    {selectedCategory !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {categories.find(c => c.value === selectedCategory)?.label}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                      </Badge>
                    )}
                    {selectedMobility !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {mobilityLevels.find(m => m.value === selectedMobility)?.label}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedMobility("all")} />
                      </Badge>
                    )}
                    {selectedLifePhase !== "all" && (
                      <Badge variant="secondary" className="gap-1 capitalize">
                        {selectedLifePhase}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLifePhase("all")} />
                      </Badge>
                    )}
                    {selectedDosha !== "all" && (
                      <Badge variant="secondary" className="gap-1 capitalize">
                        {selectedDosha}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDosha("all")} />
                      </Badge>
                    )}
                    {selectedConcern !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {wellnessConcerns.find(c => c.value === selectedConcern)?.label}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedConcern("all")} />
                      </Badge>
                    )}
                  </div>
                )}

                {/* Results count */}
                <div className="mt-3 text-sm text-muted-foreground">
                  Showing {filteredContent.length} of {content.length} items
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
                    src={getContentImage(item.content_type, item.tags, item.image_url)}
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
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {loading ? (
              <ContentGridSkeleton count={6} />
            ) : savedContentIds.size === 0 ? (
              <Card className="p-12 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Favorites Yet</h3>
                <p className="text-muted-foreground">
                  Start saving content by clicking the heart icon on any wellness item.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .filter(item => savedContentIds.has(item.id))
                  .map((item) => {
                  const isLocked = !isContentUnlocked(item);
                  
                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                      <div className="h-48 overflow-hidden bg-muted relative">
                        <img 
                          src={getContentImage(item.content_type, item.tags, item.image_url)}
                          alt={item.title}
                          className={`w-full h-full object-cover transition-all ${isLocked ? 'blur-sm opacity-60' : ''}`}
                        />
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="text-center text-white p-4">
                              <Lock className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-sm font-semibold">Locked Content</p>
                            </div>
                          </div>
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
                              <Heart className="h-5 w-5 fill-primary text-primary" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          {item.doshas && item.doshas.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.doshas.map((dosha) => (
                                <div key={dosha}>{getDoshaIcon(dosha)}</div>
                              ))}
                            </div>
                          )}
                          
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
          </TabsContent>

          {/* Joint Care Tab - Arthritis, Mobility & Joint Health Section */}
          <TabsContent value="joint-care" className="space-y-6">
            {/* Joint Care Hero Banner */}
            <Card className="bg-gradient-to-br from-wellness-sage-light via-background to-wellness-lilac-light border-wellness-sage/30 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 bg-primary/20 rounded-full">
                    <Flower2 className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-2">Arthritis, Mobility & Joint Care</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                      Gentle practices designed for post-menopause and beyond. Calming, inclusive, and accessible for all ages.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                      <Badge variant="secondary" className="text-sm py-1 px-3">Chair Yoga</Badge>
                      <Badge variant="secondary" className="text-sm py-1 px-3">Wall-Supported</Badge>
                      <Badge variant="secondary" className="text-sm py-1 px-3">Bed Exercises</Badge>
                      <Badge variant="secondary" className="text-sm py-1 px-3">Joint Nutrition</Badge>
                      <Badge variant="secondary" className="text-sm py-1 px-3">Emotional Support</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <ContentGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .filter(item => 
                    item.tags?.some(tag => 
                      ['arthritis', 'joint-care', 'mobility', 'chair-yoga', 'wall-yoga', 'bed-yoga', 'senior-friendly', 'accessible'].includes(tag)
                    ) || 
                    item.cycle_phases?.includes('post-menopause') ||
                    item.cycle_phases?.includes('menopause')
                  )
                  .map((item) => {
                  const isLocked = !isContentUnlocked(item);
                  
                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                      <div className="h-48 overflow-hidden bg-muted relative">
                        <img 
                          src={getContentImage(item.content_type, item.tags, item.image_url)}
                          alt={item.title}
                          className={`w-full h-full object-cover transition-all ${isLocked ? 'blur-sm opacity-60' : ''}`}
                        />
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="text-center text-white p-4">
                              <Lock className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-base font-semibold">Locked Content</p>
                              <p className="text-sm mt-1">Upgrade to access</p>
                            </div>
                          </div>
                        )}
                        {/* Accessibility-friendly tags */}
                        {item.tags?.some(tag => ['chair-yoga', 'wall-yoga', 'bed-yoga', 'accessible'].includes(tag)) && (
                          <Badge className="absolute top-2 left-2 bg-wellness-sage text-white text-sm">
                            Accessible
                          </Badge>
                        )}
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            {getContentIcon(item.content_type)}
                            <CardTitle className="text-lg md:text-xl line-clamp-2">{item.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {user && completedContentIds.has(item.id) && (
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSaveContent(item.id)}
                              className="h-10 w-10"
                            >
                              <Heart 
                                className={`h-5 w-5 ${savedContentIds.has(item.id) ? 'fill-primary text-primary' : ''}`}
                              />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2 text-base">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          {item.doshas && item.doshas.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.doshas.map((dosha) => (
                                <div key={dosha}>{getDoshaIcon(dosha)}</div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="capitalize text-sm">
                              {item.content_type}
                            </Badge>
                            {item.difficulty_level && (
                              <Badge variant="outline" className="text-sm">{item.difficulty_level}</Badge>
                            )}
                            {item.duration_minutes && (
                              <Badge variant="outline" className="text-sm">{item.duration_minutes} min</Badge>
                            )}
                          </div>

                          {/* Benefits preview */}
                          {item.benefits && item.benefits.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Benefits: </span>
                              {item.benefits.slice(0, 2).join(', ')}
                              {item.benefits.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 text-base py-5" 
                            size="lg"
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
                              size="lg"
                              className="px-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompletion(item.id);
                              }}
                              title={completedContentIds.has(item.id) ? "Mark as not completed" : "Mark as completed"}
                            >
                              {completedContentIds.has(item.id) ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <Circle className="h-5 w-5" />
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

            {!loading && content.filter(item => 
              item.tags?.some(tag => 
                ['arthritis', 'joint-care', 'mobility', 'chair-yoga', 'wall-yoga', 'bed-yoga', 'senior-friendly', 'accessible'].includes(tag)
              )
            ).length === 0 && (
              <Card className="p-12 text-center">
                <Flower2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Joint Care Content Coming Soon</h3>
                <p className="text-muted-foreground text-lg">
                  Gentle practices for arthritis and mobility are being prepared with care.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Holistic Blood Sugar & Energy Support Section */}
          <TabsContent value="energy-support" className="space-y-6">
            {/* Medical Disclaimer */}
            <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-400">Important Disclaimer</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This content is for <strong>general wellbeing and educational purposes only</strong>. It does not diagnose, treat, reverse, or cure any medical condition including diabetes. 
                      Always consult your doctor or healthcare provider before making changes to your treatment, medication, or lifestyle. 
                      This section does not replace professional medical care.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Header */}
            <Card className="bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-950/40 dark:to-cyan-950/40 border-teal-200">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-200 flex-shrink-0 flex items-center justify-center bg-teal-50">
                    <Droplet className="h-16 w-16 text-teal-600" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-teal-900 dark:text-teal-100">Blood Sugar & Diabetes Support</h2>
                    <p className="text-lg text-teal-700 dark:text-teal-300 max-w-2xl">
                      This space offers gentle yoga, lifestyle, nutrition and spiritual tools to support women living with or at risk of type 2 diabetes. 
                      It is for education and wellbeing only and does not replace medical care.
                    </p>
                    <p className="text-sm text-teal-600 dark:text-teal-400 mt-2 italic">
                      Please always check with your doctor before making changes to medication, diet or exercise.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                      <Badge variant="secondary" className="text-sm py-1 px-3 bg-teal-200/80 text-teal-800">Gentle Yoga</Badge>
                      <Badge variant="secondary" className="text-sm py-1 px-3 bg-teal-200/80 text-teal-800">Blood Sugar Balance</Badge>
                      <Badge variant="secondary" className="text-sm py-1 px-3 bg-teal-200/80 text-teal-800">Stress & Sleep Support</Badge>
                      <Badge variant="secondary" className="text-sm py-1 px-3 bg-teal-200/80 text-teal-800">Simple Nutrition</Badge>
                      <Badge variant="secondary" className="text-sm py-1 px-3 bg-teal-200/80 text-teal-800">Spiritual Wellbeing</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Flower2 className="h-5 w-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">Gentle Mobility</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Chair yoga, gentle stretches, and movement routines to improve circulation and reduce stiffness.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Wind className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Breathing & Relaxation</h4>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Simple breathwork and stress-reducing techniques to calm the nervous system and support wellbeing.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Leaf className="h-5 w-5 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300">Mindful Nutrition</h4>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    Warm, easy-to-digest meal ideas and mindful eating guidance for balanced, sustained energy.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Mountain className="h-5 w-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300">Grounding Routines</h4>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    Daily grounding practices and healthy routine suggestions inspired by Ayurvedic wisdom.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-pink-100 rounded-full">
                      <Sparkles className="h-5 w-5 text-pink-600" />
                    </div>
                    <h4 className="font-semibold text-pink-800 dark:text-pink-300">Spiritual Support</h4>
                  </div>
                  <p className="text-sm text-pink-700 dark:text-pink-400">
                    Islamic spiritual tools (dhikr, du'a) and universal mindfulness options for emotional balance.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-teal-100 rounded-full">
                      <Lightbulb className="h-5 w-5 text-teal-600" />
                    </div>
                    <h4 className="font-semibold text-teal-800 dark:text-teal-300">Lifestyle Education</h4>
                  </div>
                  <p className="text-sm text-teal-700 dark:text-teal-400">
                    Educational content on how lifestyle choices can support balanced energy and overall health.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Premium Tier Information */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Crown className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Premium Content Available</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upgrade to access deeper education and personalised guidance from our practitioner. 
                      Premium members receive tailored recommendations based on their unique constitution.
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      Note: Premium content provides educational lifestyle guidance only and does not replace working with a qualified healthcare practitioner.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <ContentGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .filter(item => 
                    item.tags?.some(tag => 
                      ['diabetes', 'blood-sugar', 'insulin-resistance', 'type-2-diabetes', 'diabetes-support', 'blood-sugar-balance', 'energy-support', 'balanced-energy', 'grounding', 'stress-relief', 'mindful-eating', 'gentle-movement', 'circulation', 'nervous-system', 'relaxation'].includes(tag)
                    ) ||
                    (item.tags?.includes('gentle') && item.tags?.includes('breathwork')) ||
                    (item.content_type === 'nutrition' && item.tags?.some(tag => ['easy-digest', 'warming', 'nourishing', 'balancing', 'blood-sugar'].includes(tag)))
                  )
                  .map((item) => {
                  const isLocked = !isContentUnlocked(item);
                  
                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                      <div className="h-48 overflow-hidden bg-muted relative">
                        <img 
                          src={getContentImage(item.content_type, item.tags, item.image_url)}
                          alt={item.title}
                          className={`w-full h-full object-cover transition-all ${isLocked ? 'blur-sm opacity-60' : ''}`}
                        />
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="text-center text-white p-4">
                              <Lock className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-base font-semibold">Locked Content</p>
                              <p className="text-sm mt-1">Upgrade to access</p>
                            </div>
                          </div>
                        )}
                        {/* Energy Support tag */}
                        <Badge className="absolute top-2 left-2 bg-teal-500 text-white text-sm">
                          <Droplet className="h-3 w-3 mr-1" />
                          Diabetes Support
                        </Badge>
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            {getContentIcon(item.content_type)}
                            <CardTitle className="text-lg md:text-xl line-clamp-2">{item.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {user && completedContentIds.has(item.id) && (
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSaveContent(item.id)}
                              className="h-10 w-10"
                            >
                              <Heart 
                                className={`h-5 w-5 ${savedContentIds.has(item.id) ? 'fill-primary text-primary' : ''}`}
                              />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2 text-base">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          {item.doshas && item.doshas.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.doshas.map((dosha) => (
                                <div key={dosha}>{getDoshaIcon(dosha)}</div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="capitalize text-sm">
                              {item.content_type}
                            </Badge>
                            {item.difficulty_level && (
                              <Badge variant="outline" className="text-sm">{item.difficulty_level}</Badge>
                            )}
                            {item.duration_minutes && (
                              <Badge variant="outline" className="text-sm">{item.duration_minutes} min</Badge>
                            )}
                          </div>

                          {/* Benefits preview */}
                          {item.benefits && item.benefits.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Benefits: </span>
                              {item.benefits.slice(0, 2).join(', ')}
                              {item.benefits.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 text-base py-5" 
                            size="lg"
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
                              size="lg"
                              className="px-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompletion(item.id);
                              }}
                              title={completedContentIds.has(item.id) ? "Mark as not completed" : "Mark as completed"}
                            >
                              {completedContentIds.has(item.id) ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <Circle className="h-5 w-5" />
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

            {!loading && content.filter(item => 
              item.tags?.some(tag => 
                ['energy-support', 'blood-sugar', 'balanced-energy', 'grounding', 'stress-relief', 'mindful-eating', 'gentle-movement'].includes(tag)
              )
            ).length === 0 && (
              <Card className="p-12 text-center">
                <Droplet className="h-16 w-16 mx-auto mb-4 text-teal-500" />
                <h3 className="text-xl font-semibold mb-2">Diabetes Support Content Coming Soon</h3>
                <p className="text-muted-foreground text-lg mb-4">
                  Gentle yoga, lifestyle, nutrition and spiritual tools to support women living with or at risk of type 2 diabetes are being prepared with care.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Remember: Always consult your healthcare provider for medical advice.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Yoga Tab */}
          <TabsContent value="yoga" className="space-y-6">
            {loading ? (
              <ContentGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .filter(item => item.content_type === 'yoga')
                  .map((item) => renderContentCard(item))}
              </div>
            )}
            {!loading && content.filter(item => item.content_type === 'yoga').length === 0 && (
              <Card className="p-12 text-center">
                <Flower2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Yoga Content Coming Soon</h3>
                <p className="text-muted-foreground">Supportive yoga practices are being prepared with care.</p>
              </Card>
            )}
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            {loading ? (
              <ContentGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .filter(item => item.content_type === 'nutrition' || item.tags?.some(tag => ['recipe', 'food', 'meal', 'eating'].includes(tag)))
                  .map((item) => renderContentCard(item))}
              </div>
            )}
            {!loading && content.filter(item => item.content_type === 'nutrition').length === 0 && (
              <Card className="p-12 text-center">
                <Salad className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nutrition Content Coming Soon</h3>
                <p className="text-muted-foreground">Ayurveda-inspired nutrition guidance is being prepared with care.</p>
              </Card>
            )}
          </TabsContent>

          {/* Pregnancy & Postpartum Tab */}
          <TabsContent value="pregnancy" className="space-y-6">
            <Card className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Baby className="h-10 w-10 text-pink-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-pink-800 dark:text-pink-300">Pregnancy & Postpartum Support</h2>
                    <p className="text-pink-600 dark:text-pink-400 text-sm">Gentle practices and Ayurveda-inspired suggestions for your journey</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {loading ? (
              <ContentGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .filter(item => 
                    item.cycle_phases?.some(phase => ['pregnancy', 'postpartum', 'fertility'].includes(phase)) ||
                    item.pregnancy_statuses?.some(status => ['pregnant', 'postpartum'].includes(status)) ||
                    item.tags?.some(tag => ['pregnancy', 'prenatal', 'postpartum', 'fertility', 'trimester'].includes(tag))
                  )
                  .map((item) => renderContentCard(item))}
              </div>
            )}
            {!loading && content.filter(item => 
              item.cycle_phases?.some(phase => ['pregnancy', 'postpartum'].includes(phase))
            ).length === 0 && (
              <Card className="p-12 text-center">
                <Baby className="h-16 w-16 mx-auto mb-4 text-pink-400" />
                <h3 className="text-xl font-semibold mb-2">Pregnancy Content Coming Soon</h3>
                <p className="text-muted-foreground">Supportive practices for pregnancy and postpartum are being prepared with care.</p>
              </Card>
            )}
          </TabsContent>

          {/* Menopause & Beyond Tab */}
          <TabsContent value="menopause" className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Sparkles className="h-10 w-10 text-purple-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-300">Menopause & Beyond</h2>
                    <p className="text-purple-600 dark:text-purple-400 text-sm">Holistic routines that may help you feel better during this transition</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {loading ? (
              <ContentGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .filter(item => 
                    item.cycle_phases?.some(phase => ['perimenopause', 'menopause', 'post-menopause'].includes(phase)) ||
                    item.tags?.some(tag => ['menopause', 'perimenopause', 'post-menopause', 'hormonal', 'hot-flush'].includes(tag))
                  )
                  .map((item) => renderContentCard(item))}
              </div>
            )}
            {!loading && content.filter(item => 
              item.cycle_phases?.some(phase => ['perimenopause', 'menopause', 'post-menopause'].includes(phase))
            ).length === 0 && (
              <Card className="p-12 text-center">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-semibold mb-2">Menopause Content Coming Soon</h3>
                <p className="text-muted-foreground">Supportive practices for menopause and beyond are being prepared with care.</p>
              </Card>
            )}
          </TabsContent>

          {/* Emotional & Spiritual Tab */}
          <TabsContent value="emotional" className="space-y-6">
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Brain className="h-10 w-10 text-indigo-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300">Emotional & Spiritual Wellbeing</h2>
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm">Mindfulness, meditation, and spiritual tools (Islamic + universal options)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {loading ? (
              <ContentGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .filter(item => 
                    item.content_type === 'meditation' ||
                    item.tags?.some(tag => ['emotional', 'spiritual', 'mindfulness', 'meditation', 'breathwork', 'grounding', 'dhikr', 'prayer', 'gratitude', 'reflection'].includes(tag))
                  )
                  .map((item) => renderContentCard(item))}
              </div>
            )}
            {!loading && content.filter(item => 
              item.content_type === 'meditation' ||
              item.tags?.some(tag => ['emotional', 'spiritual', 'mindfulness'].includes(tag))
            ).length === 0 && (
              <Card className="p-12 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-indigo-400" />
                <h3 className="text-xl font-semibold mb-2">Spiritual Content Coming Soon</h3>
                <p className="text-muted-foreground">Mindfulness and spiritual support are being prepared with care.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

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
                    {/* Pose Image Sequence - Primary display for all content */}
                    <PoseImageSequence
                      contentId={selectedContent.id}
                      videoUrl={selectedContent.video_url}
                      isPremiumUser={userTier === 'premium'}
                      isPremiumContent={selectedContent.tier_requirement === 'premium'}
                    />

                    {/* Fallback: Animation Section - If no pose images uploaded */}
                    {selectedContent.animation_url && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">Animated Instruction</span>
                          <Badge variant="outline" className="text-xs">All Tiers</Badge>
                        </div>
                        <video controls className="w-full rounded-lg bg-black">
                          <source src={selectedContent.animation_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
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
                    {isContentUnlocked(selectedContent) && getContentImage(selectedContent.content_type, selectedContent.tags, selectedContent.image_url) && (
                      <div>
                        <img 
                          src={getContentImage(selectedContent.content_type, selectedContent.tags, selectedContent.image_url)}
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

                    {/* Daily Reminder Button */}
                    {isContentUnlocked(selectedContent) && (
                      <div className="pt-4 border-t border-border">
                        <DailyReminderButton 
                          contentId={selectedContent.id}
                          contentTitle={selectedContent.title}
                          userId={user?.id || null}
                        />
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