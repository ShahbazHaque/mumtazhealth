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
import { ArrowLeft, BookOpen, Heart, Sparkles, Apple, Filter, CheckCircle2, Circle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

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
}

const ContentLibrary = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState<WellnessContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<WellnessContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<WellnessContent | null>(null);
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
      loadSavedContent();
      loadProgress();
    }
  }, [user]);

  useEffect(() => {
    // Update total count when content changes
    setProgressStats(prev => ({ ...prev, total: content.length }));
  }, [content]);

  useEffect(() => {
    applyFilters();
  }, [content, selectedDosha, selectedLifePhase, selectedPregnancyStatus, selectedType, selectedCompletion, completedContentIds]);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from('wellness_content')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
      return;
    }

    setContent(data || []);
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
      case 'yoga': return <Sparkles className="h-5 w-5" />;
      case 'meditation': return <Heart className="h-5 w-5" />;
      case 'nutrition': return <Apple className="h-5 w-5" />;
      case 'article': return <BookOpen className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.image_url && (
                <div className="h-48 overflow-hidden bg-muted">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
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
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => openContentDetail(item)}
                  >
                    View Details
                  </Button>
                  {user && (
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
          ))}
        </div>

        {filteredContent.length === 0 && (
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
                  <DialogTitle className="flex items-center gap-2">
                    {getContentIcon(selectedContent.content_type)}
                    {selectedContent.title}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedContent.description}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[50vh]">
                  <div className="space-y-4">
                    {selectedContent.image_url && (
                      <img 
                        src={selectedContent.image_url} 
                        alt={selectedContent.title}
                        className="w-full rounded-lg"
                      />
                    )}
                    
                    <div>
                      <h3 className="font-semibold mb-2">Details</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedContent.doshas?.length > 0 && (
                          <Badge>Doshas: {selectedContent.doshas.join(', ')}</Badge>
                        )}
                        {selectedContent.cycle_phases?.length > 0 && (
                          <Badge>Phases: {selectedContent.cycle_phases.join(', ')}</Badge>
                        )}
                        {selectedContent.difficulty_level && (
                          <Badge variant="outline">{selectedContent.difficulty_level}</Badge>
                        )}
                      </div>
                    </div>

                    {selectedContent.detailed_guidance && (
                      <div>
                        <h3 className="font-semibold mb-2">Guidance</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {selectedContent.detailed_guidance}
                        </p>
                      </div>
                    )}

                    {selectedContent.benefits?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Benefits</h3>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {selectedContent.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedContent.video_url && (
                      <div>
                        <h3 className="font-semibold mb-2">Video</h3>
                        <video controls className="w-full rounded-lg">
                          <source src={selectedContent.video_url} />
                        </video>
                      </div>
                    )}

                    {selectedContent.audio_url && (
                      <div>
                        <h3 className="font-semibold mb-2">Audio Guide</h3>
                        <audio controls className="w-full">
                          <source src={selectedContent.audio_url} />
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