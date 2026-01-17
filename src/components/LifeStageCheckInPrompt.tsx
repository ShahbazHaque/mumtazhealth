import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Sparkles, Check, X, ArrowRight, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const LIFE_STAGE_LABELS: Record<string, string> = {
  menstrual_cycle: "Regular Menstrual Cycle",
  cycle_changes: "Cycle Changes / Hormonal Shifts",
  perimenopause: "Perimenopause",
  peri_menopause_transition: "Peri → Menopause Transition",
  menopause: "Menopause",
  post_menopause: "Post-Menopause",
  pregnancy: "Pregnancy",
  postpartum: "Postpartum",
  not_sure: "Exploring",
};

const TRANSITION_STAGES = ["menstrual_cycle", "cycle_changes", "perimenopause", "peri_menopause_transition", "menopause", "post_menopause"];

interface LifeStageCheckInPromptProps {
  currentStage: string | null;
  onDismiss?: () => void;
}

export function LifeStageCheckInPrompt({ currentStage, onDismiss }: LifeStageCheckInPromptProps) {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkIfPromptShouldShow();
  }, [currentStage]);

  const checkIfPromptShouldShow = () => {
    // Only show for relevant life stages
    if (!currentStage || !TRANSITION_STAGES.includes(currentStage)) {
      setShowPrompt(false);
      return;
    }

    // Check if we've asked recently (once per month)
    const lastAsked = localStorage.getItem("mumtaz_life_stage_last_asked");
    const lastDismissed = localStorage.getItem("mumtaz_life_stage_dismissed");
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    
    // If already asked this month, don't show
    if (lastAsked === currentMonth || lastDismissed === currentMonth) {
      setShowPrompt(false);
      return;
    }

    // Show the prompt
    setShowPrompt(true);
  };

  const handleConfirmStage = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    localStorage.setItem("mumtaz_life_stage_last_asked", currentMonth);
    setShowPrompt(false);
    onDismiss?.();
  };

  const handleWantToChange = () => {
    setShowUpdateDialog(true);
  };

  const handleDismiss = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    localStorage.setItem("mumtaz_life_stage_dismissed", currentMonth);
    setShowPrompt(false);
    onDismiss?.();
  };

  const handleQuickUpdate = async (newStage: string) => {
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_wellness_profiles")
        .update({ life_stage: newStage, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
      localStorage.setItem("mumtaz_life_stage_last_asked", currentMonth);
      
      setShowUpdateDialog(false);
      setShowPrompt(false);
      onDismiss?.();
      
      // Reload to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating life stage:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getAvailableTransitions = (): string[] => {
    // Show relevant transitions based on current stage
    switch (currentStage) {
      case "menstrual_cycle":
        return ["cycle_changes", "perimenopause"];
      case "cycle_changes":
        return ["menstrual_cycle", "perimenopause", "peri_menopause_transition"];
      case "perimenopause":
        return ["cycle_changes", "peri_menopause_transition", "menopause"];
      case "peri_menopause_transition":
        return ["perimenopause", "menopause"];
      case "menopause":
        return ["peri_menopause_transition", "post_menopause"];
      case "post_menopause":
        return ["menopause"];
      default:
        return TRANSITION_STAGES.filter(s => s !== currentStage);
    }
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Gentle Monthly Prompt Card */}
      <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20 shadow-sm">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-full bg-accent/10 flex-shrink-0">
              <Heart className="w-5 h-5 text-accent" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  A gentle check-in about your journey
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You're currently receiving content for <span className="font-medium text-foreground">{LIFE_STAGE_LABELS[currentStage || ""] || currentStage}</span>. 
                  Does this still feel right for where you are?
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground italic">
                Bodies change at their own pace — there's no right or wrong answer.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={handleConfirmStage}
                  className="bg-accent/20 text-accent hover:bg-accent/30 border-0"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Yes, this feels right
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleWantToChange}
                  className="border-accent/30 text-accent hover:bg-accent/10"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  My body is changing
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Ask me later
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-accent" />
              Update Your Journey Stage
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select what feels closest to your experience right now. You can always change this later.
            </p>
            
            <div className="space-y-2">
              {getAvailableTransitions().map((stage) => (
                <button
                  key={stage}
                  onClick={() => handleQuickUpdate(stage)}
                  disabled={updating}
                  className="w-full p-4 text-left rounded-lg border border-border/50 hover:border-accent/40 hover:bg-accent/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {LIFE_STAGE_LABELS[stage]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stage === "menstrual_cycle" && "Consistent monthly cycling"}
                        {stage === "cycle_changes" && "Experiencing changes in your cycle"}
                        {stage === "perimenopause" && "Cycles becoming irregular, symptoms beginning"}
                        {stage === "peri_menopause_transition" && "Moving from perimenopause toward menopause"}
                        {stage === "menopause" && "No period for 12 months or more"}
                        {stage === "post_menopause" && "Settled into life after menopause"}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
            
            <div className="pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowUpdateDialog(false);
                  navigate("/settings");
                }}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-4 h-4 mr-2" />
                Go to Settings for more options
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
