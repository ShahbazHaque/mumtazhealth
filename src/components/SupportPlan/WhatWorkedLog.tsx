import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Sparkles, Moon, Zap, Smile, Activity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WhatWorkedLogProps {
  userId: string;
  entryDate: string;
  lifeStage: string;
  practicesTried: string[];
  onSaved?: () => void;
}

const helpedOptions = [
  { id: 'mood', label: 'Helped my mood', icon: Smile, color: 'text-yellow-500' },
  { id: 'pain', label: 'Helped with pain/discomfort', icon: Heart, color: 'text-rose-500' },
  { id: 'sleep', label: 'Helped my sleep', icon: Moon, color: 'text-indigo-500' },
  { id: 'digestion', label: 'Helped my digestion', icon: Activity, color: 'text-green-500' },
  { id: 'energy', label: 'Helped my energy', icon: Zap, color: 'text-amber-500' },
];

const ratingLabels = [
  { value: 1, label: 'Not very' },
  { value: 2, label: 'A little' },
  { value: 3, label: 'Somewhat' },
  { value: 4, label: 'Quite' },
  { value: 5, label: 'Very' },
];

export function WhatWorkedLog({ userId, entryDate, lifeStage, practicesTried, onSaved }: WhatWorkedLogProps) {
  const [helpedAreas, setHelpedAreas] = useState<Record<string, boolean>>({
    mood: false,
    pain: false,
    sleep: false,
    digestion: false,
    energy: false,
  });
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleHelped = (id: string) => {
    setHelpedAreas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('wellness_effectiveness')
        .upsert({
          user_id: userId,
          entry_date: entryDate,
          life_stage: lifeStage,
          practices_tried: practicesTried,
          overall_effectiveness: rating,
          mood_improvement: helpedAreas.mood,
          pain_improvement: helpedAreas.pain,
          sleep_improvement: helpedAreas.sleep,
          energy_improvement: helpedAreas.energy,
          digestion_improvement: helpedAreas.digestion,
          reflections: notes,
        }, { onConflict: 'user_id,entry_date' });

      if (error) throw error;
      
      toast.success('Your reflections have been saved');
      onSaved?.();
    } catch (error) {
      console.error('Error saving effectiveness log:', error);
      toast.error('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasAnySelection = Object.values(helpedAreas).some(v => v) || rating !== null || notes.trim().length > 0;

  return (
    <Card className="border-wellness-cream/50 bg-gradient-to-br from-wellness-cream/20 to-wellness-beige/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-wellness-taupe" />
          <CardTitle className="text-lg text-wellness-taupe">What Worked for Me Today?</CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          This is simply to help you notice patterns over time. 
          There's no right or wrong — just gentle awareness.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Helped checkboxes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Did today's practices help with any of these? (optional)
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {helpedOptions.map(option => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    helpedAreas[option.id] 
                      ? 'bg-wellness-sage/20 border-wellness-sage/40' 
                      : 'bg-card/50 border-border hover:bg-muted/50'
                  }`}
                  onClick={() => toggleHelped(option.id)}
                >
                  <Checkbox 
                    checked={helpedAreas[option.id]} 
                    onCheckedChange={() => toggleHelped(option.id)}
                    className="pointer-events-none"
                  />
                  <Icon className={`w-4 h-4 ${option.color}`} />
                  <span className="text-sm">{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes field */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-foreground">
            What did you notice? (optional)
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations about how you're feeling..."
            className="resize-none bg-card/50"
            rows={3}
          />
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            How supportive did today's practices feel? (optional)
          </Label>
          <div className="flex gap-2 justify-center">
            {ratingLabels.map(r => (
              <button
                key={r.value}
                onClick={() => setRating(rating === r.value ? null : r.value)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all min-w-[52px] ${
                  rating === r.value 
                    ? 'bg-wellness-sage/30 border-2 border-wellness-sage' 
                    : 'bg-card/50 border border-border hover:bg-muted/50'
                }`}
              >
                <span className="text-lg font-medium">{r.value}</span>
                <span className="text-[10px] text-muted-foreground">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <Button 
          onClick={handleSave} 
          disabled={saving || !hasAnySelection}
          className="w-full bg-wellness-taupe hover:bg-wellness-taupe/90"
        >
          {saving ? 'Saving...' : 'Save My Reflections'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          These notes are just for you — to help you understand what supports your wellbeing over time.
        </p>
      </CardContent>
    </Card>
  );
}
