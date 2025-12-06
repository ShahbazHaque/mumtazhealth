import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Sun, 
  Moon, 
  Sunrise, 
  Trash2, 
  Bell, 
  BellOff,
  Play,
  Heart,
  Sparkles,
  Pencil,
  Save,
  Check,
  CheckCircle2
} from "lucide-react";

// Import joint care images
import chairYogaImg from "@/assets/joint-care-chair-yoga.jpg";
import wallYogaImg from "@/assets/joint-care-wall-yoga.jpg";
import bedMobilityImg from "@/assets/joint-care-bed-mobility.jpg";
import abhyangaImg from "@/assets/joint-care-abhyanga.jpg";
import goldenMilkImg from "@/assets/joint-care-golden-milk.jpg";
import kitchariImg from "@/assets/joint-care-kitchari.jpg";
import boneSoupImg from "@/assets/joint-care-bone-soup.jpg";
import breathworkImg from "@/assets/joint-care-breathwork.jpg";
import functionalImg from "@/assets/joint-care-functional.jpg";

interface DailyReminder {
  id: string;
  content_id: string;
  reminder_time: string;
  is_active: boolean;
  days_of_week: number[];
  content?: {
    id: string;
    title: string;
    description: string | null;
    content_type: string;
    duration_minutes: number | null;
    image_url: string | null;
    doshas: string[] | null;
    tags: string[] | null;
  };
  completedToday?: boolean;
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayValues = [1, 2, 3, 4, 5, 6, 7]; // Sunday=1, Monday=2, etc.

const getContentImage = (content: DailyReminder['content']) => {
  if (!content) return null;
  
  const title = content.title.toLowerCase();
  const tags = content.tags?.map(t => t.toLowerCase()) || [];
  
  if (title.includes('chair') || tags.includes('chair yoga')) return chairYogaImg;
  if (title.includes('wall') || tags.includes('wall-supported')) return wallYogaImg;
  if (title.includes('bed') || title.includes('couch') || tags.includes('bed-based')) return bedMobilityImg;
  if (title.includes('abhyanga') || title.includes('oiling')) return abhyangaImg;
  if (title.includes('golden milk') || title.includes('turmeric')) return goldenMilkImg;
  if (title.includes('kitchari')) return kitchariImg;
  if (title.includes('bone') || title.includes('broth')) return boneSoupImg;
  if (title.includes('breath') || tags.includes('breathwork')) return breathworkImg;
  if (title.includes('functional') || title.includes('mobility')) return functionalImg;
  
  return null;
};

const getTimeOfDayIcon = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 5 && hour < 12) return <Sunrise className="h-5 w-5 text-amber-500" />;
  if (hour >= 12 && hour < 17) return <Sun className="h-5 w-5 text-yellow-500" />;
  if (hour >= 17 && hour < 21) return <Moon className="h-5 w-5 text-indigo-400" />;
  return <Moon className="h-5 w-5 text-slate-400" />;
};

const getTimeOfDayLabel = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 5 && hour < 12) return "Morning Practice";
  if (hour >= 12 && hour < 17) return "Afternoon Practice";
  if (hour >= 17 && hour < 21) return "Evening Practice";
  return "Night Practice";
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default function MyDailyPractice() {
  const [reminders, setReminders] = useState<DailyReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editingReminder, setEditingReminder] = useState<DailyReminder | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editDays, setEditDays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    fetchReminders(user.id);
  };

  const fetchReminders = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch reminders
      const { data, error } = await supabase
        .from("daily_practice_reminders")
        .select(`
          id,
          content_id,
          reminder_time,
          is_active,
          days_of_week,
          wellness_content (
            id,
            title,
            description,
            content_type,
            duration_minutes,
            image_url,
            doshas,
            tags
          )
        `)
        .eq("user_id", userId)
        .order("reminder_time", { ascending: true });

      if (error) throw error;

      // Check today's completions
      const today = new Date().toISOString().split('T')[0];
      const { data: progressData } = await supabase
        .from("user_content_progress")
        .select("content_id, completed_at")
        .eq("user_id", userId)
        .eq("completed", true)
        .gte("completed_at", today + "T00:00:00")
        .lte("completed_at", today + "T23:59:59");

      const completedContentIds = new Set(progressData?.map(p => p.content_id) || []);

      const formattedReminders = (data || []).map(item => ({
        ...item,
        content: item.wellness_content as DailyReminder['content'],
        completedToday: completedContentIds.has(item.content_id)
      }));

      setReminders(formattedReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast({
        title: "Error loading practices",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("daily_practice_reminders")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;

      setReminders(prev => 
        prev.map(r => r.id === id ? { ...r, is_active: !isActive } : r)
      );

      toast({
        title: isActive ? "Reminder paused" : "Reminder activated",
        description: isActive ? "You won't receive notifications" : "You'll be reminded at the scheduled time",
      });
    } catch (error) {
      console.error("Error toggling reminder:", error);
      toast({
        title: "Error updating reminder",
        variant: "destructive",
      });
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from("daily_practice_reminders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== id));

      toast({
        title: "Practice removed",
        description: "Removed from your daily schedule",
      });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        title: "Error removing practice",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (reminder: DailyReminder) => {
    setEditingReminder(reminder);
    setEditTime(reminder.reminder_time.substring(0, 5)); // HH:MM format
    setEditDays(reminder.days_of_week);
  };

  const toggleDay = (dayValue: number) => {
    setEditDays(prev => 
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue].sort((a, b) => a - b)
    );
  };

  const saveReminderChanges = async () => {
    if (!editingReminder || editDays.length === 0) {
      toast({
        title: "Please select at least one day",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("daily_practice_reminders")
        .update({
          reminder_time: editTime + ":00",
          days_of_week: editDays,
        })
        .eq("id", editingReminder.id);

      if (error) throw error;

      setReminders(prev =>
        prev.map(r =>
          r.id === editingReminder.id
            ? { ...r, reminder_time: editTime + ":00", days_of_week: editDays }
            : r
        )
      );

      toast({
        title: "Reminder updated",
        description: "Your practice schedule has been saved",
      });

      setEditingReminder(null);
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast({
        title: "Error saving changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const markAsComplete = async (reminder: DailyReminder) => {
    if (!user || !reminder.content_id) return;

    try {
      // Check if already completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from("user_content_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_id", reminder.content_id)
        .gte("completed_at", today + "T00:00:00")
        .maybeSingle();

      if (existing) {
        // Uncomplete - delete the progress record
        await supabase
          .from("user_content_progress")
          .delete()
          .eq("id", existing.id);

        setReminders(prev =>
          prev.map(r =>
            r.id === reminder.id ? { ...r, completedToday: false } : r
          )
        );

        toast({
          title: "Practice unmarked",
          description: "You can mark it complete again anytime",
        });
      } else {
        // Mark as complete
        const { error } = await supabase
          .from("user_content_progress")
          .insert({
            user_id: user.id,
            content_id: reminder.content_id,
            completed: true,
            completed_at: new Date().toISOString(),
          });

        if (error) throw error;

        setReminders(prev =>
          prev.map(r =>
            r.id === reminder.id ? { ...r, completedToday: true } : r
          )
        );

        toast({
          title: "Practice completed! 🎉",
          description: "Great job on completing your practice",
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error updating progress",
        variant: "destructive",
      });
    }
  };

  // Group reminders by time of day
  const groupedReminders = reminders.reduce((acc, reminder) => {
    const label = getTimeOfDayLabel(reminder.reminder_time);
    if (!acc[label]) acc[label] = [];
    acc[label].push(reminder);
    return acc;
  }, {} as Record<string, DailyReminder[]>);

  const timeOrder = ["Morning Practice", "Afternoon Practice", "Evening Practice", "Night Practice"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wellness-lavender/20 to-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-lavender/20 to-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              My Daily Practice
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mt-2">
            Your personalized wellness routine, organized by time of day
          </p>
        </div>

        {/* Empty State */}
        {reminders.length === 0 && (
          <Card className="border-dashed border-2 border-muted animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No practices scheduled yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Browse our wellness content library and add practices to your daily routine. 
                We'll remind you at your chosen times.
              </p>
              <Button onClick={() => navigate("/content-library")} size="lg">
                Explore Content Library
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Grouped Reminders */}
        {timeOrder.map(timeLabel => {
          const timeReminders = groupedReminders[timeLabel];
          if (!timeReminders || timeReminders.length === 0) return null;

          return (
            <div key={timeLabel} className="mb-8 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                {getTimeOfDayIcon(timeReminders[0].reminder_time)}
                <h2 className="text-xl font-semibold text-foreground">{timeLabel}</h2>
                <Badge variant="secondary" className="ml-2">
                  {timeReminders.length} {timeReminders.length === 1 ? 'practice' : 'practices'}
                </Badge>
              </div>

              <div className="space-y-4">
                {timeReminders.map(reminder => (
                  <Card 
                    key={reminder.id} 
                    className={`overflow-hidden transition-all duration-300 hover:shadow-md ${
                      !reminder.is_active ? 'opacity-60' : ''
                    } ${reminder.completedToday ? 'ring-2 ring-green-500/50 bg-green-50/30 dark:bg-green-950/20' : ''}`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                          {getContentImage(reminder.content) ? (
                            <img 
                              src={getContentImage(reminder.content)!} 
                              alt={reminder.content?.title || 'Practice'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-wellness-sage/20 flex items-center justify-center">
                              <Play className="h-8 w-8 text-primary/50" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {reminder.content?.title || 'Unknown Practice'}
                                </h3>
                                {reminder.completedToday && (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {reminder.content?.description}
                              </p>
                              
                              {/* Time and Duration */}
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <div className="flex items-center gap-1 text-primary font-medium">
                                  <Clock className="h-4 w-4" />
                                  {formatTime(reminder.reminder_time)}
                                </div>
                                {reminder.content?.duration_minutes && (
                                  <Badge variant="outline">
                                    {reminder.content.duration_minutes} min
                                  </Badge>
                                )}
                                {reminder.content?.content_type && (
                                  <Badge variant="secondary" className="capitalize">
                                    {reminder.content.content_type.replace('_', ' ')}
                                  </Badge>
                                )}
                              </div>

                              {/* Days */}
                              <div className="flex gap-1 mt-3">
                                {dayNames.map((day, index) => (
                                  <span
                                    key={day}
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      reminder.days_of_week.includes(index + 1)
                                        ? 'bg-primary/20 text-primary font-medium'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    {day}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end gap-2">
                              {/* Mark Complete Button */}
                              <Button
                                variant={reminder.completedToday ? "secondary" : "default"}
                                size="sm"
                                onClick={() => markAsComplete(reminder)}
                                className={reminder.completedToday ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" : ""}
                              >
                                {reminder.completedToday ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Mark Done
                                  </>
                                )}
                              </Button>
                              <div className="flex items-center gap-2">
                                {reminder.is_active ? (
                                  <Bell className="h-4 w-4 text-primary" />
                                ) : (
                                  <BellOff className="h-4 w-4 text-muted-foreground" />
                                )}
                                <Switch
                                  checked={reminder.is_active}
                                  onCheckedChange={() => toggleReminder(reminder.id, reminder.is_active)}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(reminder)}
                                className="text-primary hover:text-primary hover:bg-primary/10"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteReminder(reminder.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Add More Button */}
        {reminders.length > 0 && (
          <div className="text-center mt-8 animate-fade-in">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/content-library")}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Add More Practices
            </Button>
          </div>
        )}
      </main>

      {/* Edit Reminder Dialog */}
      <Dialog open={!!editingReminder} onOpenChange={() => setEditingReminder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
            <DialogDescription>
              Change when you'd like to be reminded for "{editingReminder?.content?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Time Input */}
            <div className="space-y-2">
              <Label htmlFor="reminder-time" className="text-base font-medium">
                Reminder Time
              </Label>
              <Input
                id="reminder-time"
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="text-lg h-12"
              />
            </div>

            {/* Days Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Days of the Week</Label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((day, index) => {
                  const dayValue = index + 1;
                  const isSelected = editDays.includes(dayValue);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(dayValue)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Select the days you want to practice
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReminder(null)}>
              Cancel
            </Button>
            <Button onClick={saveReminderChanges} disabled={saving}>
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
