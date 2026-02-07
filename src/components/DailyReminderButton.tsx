import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

interface DailyReminderButtonProps {
  contentId: string;
  contentTitle: string;
  userId: string | null;
}

const DAYS_OF_WEEK = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
  { id: 7, label: "Sun" },
];

const TIME_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

export const DailyReminderButton = ({ contentId, contentTitle, userId }: DailyReminderButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId && contentId) {
      checkExistingReminder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, contentId]);

  const checkExistingReminder = async () => {
    const { data, error } = await supabase
      .from('daily_practice_reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    if (data && !error) {
      setHasReminder(true);
      setReminderTime(data.reminder_time.slice(0, 5));
      setSelectedDays(data.days_of_week || [1, 2, 3, 4, 5, 6, 7]);
    }
  };

  const handleDayToggle = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const saveReminder = async () => {
    if (!userId) {
      toast.error("Please log in to set reminders");
      return;
    }

    if (selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('daily_practice_reminders')
        .upsert({
          user_id: userId,
          content_id: contentId,
          reminder_time: reminderTime + ":00",
          days_of_week: selectedDays,
          is_active: true,
        }, {
          onConflict: 'user_id,content_id'
        });

      if (error) throw error;

      setHasReminder(true);
      setIsOpen(false);
      toast.success("Daily reminder set! You'll be reminded to practice.");
    } catch (error: unknown) {
      console.error('Error saving reminder:', error);
      toast.error("Failed to save reminder");
    } finally {
      setIsLoading(false);
    }
  };

  const removeReminder = async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('daily_practice_reminders')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', contentId);

      if (error) throw error;

      setHasReminder(false);
      setIsOpen(false);
      toast.success("Reminder removed");
    } catch (error: unknown) {
      console.error('Error removing reminder:', error);
      toast.error("Failed to remove reminder");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <Button variant="outline" size="lg" disabled className="text-base">
        <Bell className="h-4 w-4 mr-2" />
        Log in to set reminders
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasReminder ? "default" : "outline"}
          size="lg"
          className="text-base"
        >
          {hasReminder ? (
            <>
              <Bell className="h-4 w-4 mr-2 fill-current" />
              Reminder Set
            </>
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Add to Daily Practice
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Daily Practice Reminder
          </DialogTitle>
          <DialogDescription className="text-base">
            Set a reminder to practice "{contentTitle}" regularly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Reminder Time</Label>
            <Select value={reminderTime} onValueChange={setReminderTime}>
              <SelectTrigger className="text-base h-12">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map(time => (
                  <SelectItem key={time} value={time} className="text-base py-2">
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Days Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Days to Practice
            </Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleDayToggle(day.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDays.includes(day.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedDays.length === 7
                ? "Every day"
                : selectedDays.length === 0
                  ? "Select at least one day"
                  : `${selectedDays.length} days per week`}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={saveReminder}
            disabled={isLoading || selectedDays.length === 0}
            className="flex-1 text-base h-12"
          >
            <Bell className="h-4 w-4 mr-2" />
            {hasReminder ? "Update Reminder" : "Set Reminder"}
          </Button>

          {hasReminder && (
            <Button
              variant="destructive"
              onClick={removeReminder}
              disabled={isLoading}
              className="text-base h-12"
            >
              <BellOff className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
