import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Video, Upload, Edit, Trash2, Plus } from "lucide-react";
import { Navigation } from "@/components/Navigation";

interface Profile {
  id: string;
  username: string;
  user_id: string;
}

interface WellnessEntry {
  id: string;
  entry_date: string;
  cycle_phase: string | null;
  emotional_state: string | null;
  physical_symptoms: string | null;
  daily_practices: any;
}

interface WellnessContent {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  video_url: string | null;
  animation_url: string | null; // Animated instructional videos (all tiers)
  image_url: string | null;
  tier_requirement: string;
  difficulty_level: string | null;
  duration_minutes: number | null;
  detailed_guidance: string | null;
  benefits: string[] | null;
  cycle_phases: string[] | null;
  doshas: string[] | null;
  pregnancy_statuses: string[] | null;
  is_premium: boolean;
  is_active: boolean;
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [entries, setEntries] = useState<WellnessEntry[]>([]);
  const [contentList, setContentList] = useState<WellnessContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<WellnessContent | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [animationFile, setAnimationFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingAnimation, setUploadingAnimation] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (!data) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }
    
    setIsAdmin(true);
    loadProfiles();
    loadContent();
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('username');
    
    if (error) {
      console.error('Error loading profiles:', error);
      toast.error('Error loading user profiles');
      return;
    }
    
    setProfiles(data || []);
  };

  const loadUserEntries = async (userId: string) => {
    const { data, error } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error loading entries:', error);
      toast.error('Error loading wellness entries');
      return;
    }
    
    setEntries(data || []);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (userId) {
      loadUserEntries(userId);
    } else {
      setEntries([]);
    }
  };

  const loadContent = async () => {
    const { data, error } = await supabase
      .from('wellness_content')
      .select('*')
      .order('title');
    
    if (error) {
      console.error('Error loading content:', error);
      toast.error('Error loading wellness content');
      return;
    }
    
    setContentList(data || []);
  };

  const handleVideoUpload = async (contentId: string) => {
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    setUploading(true);
    try {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${contentId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('wellness-videos')
        .upload(filePath, videoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wellness-videos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('wellness_content')
        .update({ video_url: publicUrl })
        .eq('id', contentId);

      if (updateError) throw updateError;

      toast.success('Video uploaded successfully');
      loadContent();
      setVideoFile(null);
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleAnimationUpload = async (contentId: string) => {
    if (!animationFile) {
      toast.error("Please select an animation file");
      return;
    }

    setUploadingAnimation(true);
    try {
      const fileExt = animationFile.name.split('.').pop();
      const fileName = `animation-${contentId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('wellness-videos')
        .upload(filePath, animationFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wellness-videos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('wellness_content')
        .update({ animation_url: publicUrl })
        .eq('id', contentId);

      if (updateError) throw updateError;

      toast.success('Animation uploaded successfully');
      loadContent();
      setAnimationFile(null);
    } catch (error) {
      console.error('Error uploading animation:', error);
      toast.error('Failed to upload animation');
    } finally {
      setUploadingAnimation(false);
    }
  };

  const handleUpdateContent = async (content: Partial<WellnessContent>) => {
    if (!selectedContent) return;

    try {
      const { error } = await supabase
        .from('wellness_content')
        .update(content)
        .eq('id', selectedContent.id);

      if (error) throw error;

      toast.success('Content updated successfully');
      loadContent();
      setEditDialogOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this content?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('wellness_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast.success('Content deleted successfully');
      loadContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleResetUser = async (userId: string) => {
    if (!userId) {
      toast.error("Please select a user first");
      return;
    }

    const selectedProfile = profiles.find(p => p.user_id === userId);
    if (!selectedProfile) return;

    const confirmed = window.confirm(
      `Reset all data for ${selectedProfile.username}?\n\nThis will:\n- Reset onboarding status\n- Clear wellness profile\n- Delete all wellness entries\n- Clear saved content\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      // Delete wellness entries
      const { error: entriesError } = await supabase
        .from('wellness_entries')
        .delete()
        .eq('user_id', userId);

      if (entriesError) throw entriesError;

      // Delete saved content
      const { error: savedContentError } = await supabase
        .from('user_saved_content')
        .delete()
        .eq('user_id', userId);

      if (savedContentError) throw savedContentError;

      // Delete daily recommendations
      const { error: recsError } = await supabase
        .from('daily_recommendations')
        .delete()
        .eq('user_id', userId);

      if (recsError) throw recsError;

      // Reset wellness profile
      const { error: profileError } = await supabase
        .from('user_wellness_profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      toast.success(`User ${selectedProfile.username} has been reset to first-time state`);
      setEntries([]);
    } catch (error) {
      console.error('Error resetting user:', error);
      toast.error('Failed to reset user data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wellness-beige">
        <div className="text-wellness-taupe text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-wellness-beige">
      <Navigation />
      <div className="max-w-6xl mx-auto p-4 pt-24">
        <Card className="mb-6 bg-wellness-warm border-wellness-taupe/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-wellness-taupe">
                Admin Dashboard
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage users and wellness content
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="border-wellness-taupe/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tracker
            </Button>
          </CardHeader>
        </Card>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">

        <Card className="border-wellness-taupe/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-wellness-taupe">User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-wellness-taupe mb-2">
                Select User
              </label>
              <Select value={selectedUserId} onValueChange={handleUserSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to view their data" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.user_id}>
                      {profile.username} ({profile.user_id.slice(0, 8)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUserId && (
              <div className="flex items-center gap-3 p-4 bg-wellness-sage/10 rounded-lg border border-wellness-sage/20">
                <div className="flex-1">
                  <p className="text-sm font-medium text-wellness-taupe">Reset Test User</p>
                  <p className="text-xs text-wellness-taupe/70 mt-1">
                    Clear all data and return user to onboarding state
                  </p>
                </div>
                <Button
                  onClick={() => handleResetUser(selectedUserId)}
                  variant="outline"
                  className="border-wellness-sage text-wellness-sage hover:bg-wellness-sage/10"
                >
                  Reset User
                </Button>
              </div>
            )}
          </CardContent>
            </Card>

            {selectedUserId && entries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-wellness-taupe">Recent Entries (Last 10)</h2>
            {entries.map((entry) => (
              <Card key={entry.id} className="border-wellness-taupe/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-wellness-taupe" />
                      {new Date(entry.entry_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardTitle>
                    {entry.cycle_phase && (
                      <span className="px-3 py-1 bg-wellness-pink rounded-full text-sm font-medium">
                        {entry.cycle_phase}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entry.emotional_state && (
                    <div>
                      <p className="text-sm font-medium text-wellness-taupe">Emotional State:</p>
                      <p className="text-sm text-muted-foreground">{entry.emotional_state}</p>
                    </div>
                  )}
                  {entry.physical_symptoms && (
                    <div>
                      <p className="text-sm font-medium text-wellness-taupe">Physical Symptoms:</p>
                      <p className="text-sm text-muted-foreground">{entry.physical_symptoms}</p>
                    </div>
                  )}
                  {entry.daily_practices && Object.keys(entry.daily_practices).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-wellness-taupe mb-2">Daily Practices:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(entry.daily_practices).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center gap-2 text-muted-foreground">
                            <span className={value?.status ? "text-green-600" : "text-gray-400"}>
                              {value?.status ? "✓" : "○"}
                            </span>
                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
            )}

            {selectedUserId && entries.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No wellness entries found for this user.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="border-wellness-taupe/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-wellness-taupe flex items-center gap-2">
                  <Video className="w-6 h-6" />
                  Wellness Content Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentList.map((content) => (
                    <Card key={content.id} className="border-wellness-sage/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-wellness-taupe">
                                {content.title}
                              </h3>
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                {content.tier_requirement}
                              </span>
                              <span className="px-2 py-1 bg-wellness-sage/20 text-wellness-taupe text-xs rounded-full">
                                {content.content_type}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {content.description}
                            </p>
                            <div className="flex flex-col gap-1">
                              {content.animation_url ? (
                                <p className="text-xs text-blue-600 flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  Animation uploaded (All Tiers)
                                </p>
                              ) : (
                                <p className="text-xs text-amber-600">No animation uploaded</p>
                              )}
                              {content.video_url ? (
                                <p className="text-xs text-purple-600 flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  Live video uploaded (Premium Only)
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground">No live video</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Dialog open={editDialogOpen && selectedContent?.id === content.id} 
                                    onOpenChange={(open) => {
                                      setEditDialogOpen(open);
                                      if (!open) setSelectedContent(null);
                                    }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedContent(content)}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Content: {content.title}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="animation-upload" className="flex items-center gap-2">
                                      Upload Animation
                                      <span className="text-xs text-muted-foreground font-normal">(Available to all tiers)</span>
                                    </Label>
                                    <div className="flex gap-2">
                                      <Input
                                        id="animation-upload"
                                        type="file"
                                        accept="video/mp4,video/webm,video/quicktime,image/gif"
                                        onChange={(e) => setAnimationFile(e.target.files?.[0] || null)}
                                        disabled={uploadingAnimation}
                                      />
                                      <Button
                                        onClick={() => handleAnimationUpload(content.id)}
                                        disabled={!animationFile || uploadingAnimation}
                                        size="sm"
                                      >
                                        <Upload className="w-4 h-4 mr-1" />
                                        {uploadingAnimation ? 'Uploading...' : 'Upload'}
                                      </Button>
                                    </div>
                                    {content.animation_url && (
                                      <p className="text-xs text-muted-foreground">
                                        Current: {content.animation_url.split('/').pop()}
                                      </p>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="video-upload" className="flex items-center gap-2">
                                      Upload Live Video
                                      <span className="text-xs text-purple-600 font-normal">(Premium Only)</span>
                                    </Label>
                                    <div className="flex gap-2">
                                      <Input
                                        id="video-upload"
                                        type="file"
                                        accept="video/mp4,video/webm,video/quicktime"
                                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                        disabled={uploading}
                                      />
                                      <Button
                                        onClick={() => handleVideoUpload(content.id)}
                                        disabled={!videoFile || uploading}
                                        size="sm"
                                      >
                                        <Upload className="w-4 h-4 mr-1" />
                                        {uploading ? 'Uploading...' : 'Upload'}
                                      </Button>
                                    </div>
                                    {content.video_url && (
                                      <p className="text-xs text-muted-foreground">
                                        Current: {content.video_url.split('/').pop()}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                      id="title"
                                      defaultValue={content.title}
                                      onChange={(e) => {
                                        if (selectedContent) {
                                          setSelectedContent({...selectedContent, title: e.target.value});
                                        }
                                      }}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                      id="description"
                                      defaultValue={content.description || ''}
                                      onChange={(e) => {
                                        if (selectedContent) {
                                          setSelectedContent({...selectedContent, description: e.target.value});
                                        }
                                      }}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="guidance">Detailed Guidance</Label>
                                    <Textarea
                                      id="guidance"
                                      defaultValue={content.detailed_guidance || ''}
                                      rows={6}
                                      onChange={(e) => {
                                        if (selectedContent) {
                                          setSelectedContent({...selectedContent, detailed_guidance: e.target.value});
                                        }
                                      }}
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="tier">Tier Requirement</Label>
                                      <Select
                                        defaultValue={content.tier_requirement}
                                        onValueChange={(value) => {
                                          if (selectedContent) {
                                            setSelectedContent({...selectedContent, tier_requirement: value});
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="free">Free</SelectItem>
                                          <SelectItem value="basic">Basic</SelectItem>
                                          <SelectItem value="standard">Standard</SelectItem>
                                          <SelectItem value="premium">Premium</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="difficulty">Difficulty</Label>
                                      <Select
                                        defaultValue={content.difficulty_level || 'beginner'}
                                        onValueChange={(value) => {
                                          if (selectedContent) {
                                            setSelectedContent({...selectedContent, difficulty_level: value});
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="beginner">Beginner</SelectItem>
                                          <SelectItem value="intermediate">Intermediate</SelectItem>
                                          <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <Button
                                    onClick={() => handleUpdateContent(selectedContent!)}
                                    className="w-full"
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteContent(content.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
