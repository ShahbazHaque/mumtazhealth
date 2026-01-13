import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportPlanRecommendations } from "./SupportPlanRecommendations";
import { WhatWorkedLog } from "./WhatWorkedLog";
import { Sparkles, ChevronRight, ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SupportPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  entryDate: string;
  lifeStage: string;
  symptoms: string[];
  dosha?: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  duration?: string;
  tags?: string[];
}

export function SupportPlanModal({ 
  open, 
  onOpenChange, 
  userId,
  entryDate,
  lifeStage,
  symptoms,
  dosha 
}: SupportPlanModalProps) {
  const [step, setStep] = useState<'recommendations' | 'log'>('recommendations');
  const [practicesTried, setPracticesTried] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setStep('recommendations');
      setPracticesTried([]);
    }
  }, [open]);

  const handleTryNow = async (rec: Recommendation, type: string) => {
    // Log this action
    try {
      await supabase.from('support_plan_logs').insert({
        user_id: userId,
        entry_date: entryDate,
        recommendation_id: rec.id,
        recommendation_type: type,
        recommendation_title: rec.title,
        recommendation_description: rec.description,
        action_taken: 'tried',
      });
      
      setPracticesTried(prev => [...prev, rec.title]);
      toast.success(`Added "${rec.title}" to your tried practices`);
      
      // Navigate to content library with search for this type
      navigate(`/content-library?type=${type}&search=${encodeURIComponent(rec.title)}`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error logging practice:', error);
    }
  };

  const handleAddToPlan = async (rec: Recommendation, type: string) => {
    try {
      await supabase.from('support_plan_logs').insert({
        user_id: userId,
        entry_date: entryDate,
        recommendation_id: rec.id,
        recommendation_type: type,
        recommendation_title: rec.title,
        recommendation_description: rec.description,
        action_taken: 'added_to_plan',
      });
      
      // Also save to saved practices
      await supabase.from('saved_practices').upsert({
        user_id: userId,
        practice_type: type,
        practice_title: rec.title,
        practice_description: rec.description,
        practice_data: { duration: rec.duration, tags: rec.tags },
      }, { onConflict: 'user_id,practice_type,practice_title' });
      
      toast.success(`"${rec.title}" added to your plan`);
    } catch (error) {
      console.error('Error adding to plan:', error);
      toast.error('Could not add to plan. Please try again.');
    }
  };

  const handleLogSaved = () => {
    toast.success('Your day\'s reflections have been saved');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-2 border-b bg-gradient-to-r from-wellness-sage/10 to-wellness-cream/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-wellness-taupe" />
              <DialogTitle className="text-xl text-wellness-taupe">
                {step === 'recommendations' ? 'Your Support Plan' : 'Reflect on Today'}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-sm">
            {step === 'recommendations' 
              ? 'Personalized suggestions based on how you\'re feeling today'
              : 'A gentle space to notice what supports your wellbeing'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-6">
            {step === 'recommendations' ? (
              <SupportPlanRecommendations
                userId={userId}
                lifeStage={lifeStage}
                symptoms={symptoms}
                dosha={dosha}
                onTryNow={handleTryNow}
                onAddToPlan={handleAddToPlan}
              />
            ) : (
              <WhatWorkedLog
                userId={userId}
                entryDate={entryDate}
                lifeStage={lifeStage}
                practicesTried={practicesTried}
                onSaved={handleLogSaved}
              />
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30 flex justify-between items-center">
          {step === 'recommendations' ? (
            <>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Maybe Later
              </Button>
              <Button
                onClick={() => setStep('log')}
                className="bg-wellness-taupe hover:bg-wellness-taupe/90"
              >
                Continue to Reflection
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setStep('recommendations')}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Suggestions
              </Button>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Skip for Now
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
