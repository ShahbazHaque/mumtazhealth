import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, HelpCircle, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CyclePhaseHelperProps {
  onPhaseSelected: (phase: string) => void;
  onCancel: () => void;
}

const CYCLE_PHASES = [
  { id: "Menstrual", label: "Menstrual", days: "Days 1-5", range: [1, 5] },
  { id: "Follicular", label: "Follicular", days: "Days 6-14", range: [6, 14] },
  { id: "Ovulatory", label: "Ovulatory", days: "Days 14-16", range: [14, 16] },
  { id: "Luteal", label: "Luteal", days: "Days 17-28", range: [17, 28] },
];

export function CyclePhaseHelper({ onPhaseSelected, onCancel }: CyclePhaseHelperProps) {
  const [step, setStep] = useState<"date" | "length" | "result">("date");
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | undefined>();
  const [cycleLength, setCycleLength] = useState<"28" | "not_sure">("28");
  const [estimatedPhase, setEstimatedPhase] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const estimateCyclePhase = (lastPeriod: Date, length: number): string => {
    const today = new Date();
    const daysSinceStart = differenceInDays(today, lastPeriod) + 1;
    const dayInCycle = ((daysSinceStart - 1) % length) + 1;

    if (dayInCycle >= 1 && dayInCycle <= 5) return "Menstrual";
    if (dayInCycle >= 6 && dayInCycle <= 14) return "Follicular";
    if (dayInCycle >= 15 && dayInCycle <= 17) return "Ovulatory";
    return "Luteal";
  };

  const handleContinueToLength = () => {
    if (!lastPeriodDate) return;
    setStep("length");
  };

  const handleCalculate = () => {
    if (!lastPeriodDate) return;
    const length = cycleLength === "28" ? 28 : 28; // Default to 28 if not sure
    const phase = estimateCyclePhase(lastPeriodDate, length);
    setEstimatedPhase(phase);
    setStep("result");
  };

  const getPhaseDescription = (phase: string): string => {
    switch (phase) {
      case "Menstrual":
        return "This is a time for rest and gentle self-care. Your body is releasing and renewing.";
      case "Follicular":
        return "Energy is often building during this phase. A good time for new beginnings.";
      case "Ovulatory":
        return "You may feel more social and energetic. Your body is at its peak fertility.";
      case "Luteal":
        return "Energy may start to wind down. Focus on nourishing activities and rest.";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6 p-4 bg-wellness-sage/10 rounded-lg border border-wellness-sage/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-wellness-sage" />
          <span className="font-medium text-wellness-taupe">Cycle Phase Helper</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {step === "date" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No pressure — this is just to give you a gentle estimate. You can always choose a different phase if it doesn't feel right.
          </p>
          
          <div className="space-y-2">
            <Label className="text-base">When was the first day of your last period?</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !lastPeriodDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {lastPeriodDate ? format(lastPeriodDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={lastPeriodDate}
                  onSelect={(date) => {
                    setLastPeriodDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Skip this
            </Button>
            <Button
              onClick={handleContinueToLength}
              disabled={!lastPeriodDate}
              className="flex-1 bg-wellness-sage hover:bg-wellness-sage/90"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === "length" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Are your cycles usually around 28 days?</Label>
            <p className="text-sm text-muted-foreground">
              Most cycles are between 21-35 days. If you're not sure, that's completely okay.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={cycleLength === "28" ? "default" : "outline"}
              onClick={() => setCycleLength("28")}
              className={cn(
                "h-auto py-3",
                cycleLength === "28" && "bg-wellness-sage hover:bg-wellness-sage/90"
              )}
            >
              Yes, around 28 days
            </Button>
            <Button
              variant={cycleLength === "not_sure" ? "default" : "outline"}
              onClick={() => setCycleLength("not_sure")}
              className={cn(
                "h-auto py-3",
                cycleLength === "not_sure" && "bg-wellness-sage hover:bg-wellness-sage/90"
              )}
            >
              I'm not sure
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setStep("date")}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleCalculate}
              className="flex-1 bg-wellness-sage hover:bg-wellness-sage/90"
            >
              Estimate my phase
            </Button>
          </div>
        </div>
      )}

      {step === "result" && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-wellness-sage/30">
            <p className="text-sm text-muted-foreground mb-2">
              Based on what you shared, you may be in the:
            </p>
            <p className="text-xl font-semibold text-wellness-taupe">
              {estimatedPhase} Phase
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {getPhaseDescription(estimatedPhase)}
            </p>
          </div>

          <p className="text-xs text-muted-foreground italic text-center">
            This is only a gentle guide. Cycles vary, and it's okay if this doesn't feel exact.
          </p>

          <div className="space-y-2">
            <Button
              onClick={() => onPhaseSelected(estimatedPhase)}
              className="w-full bg-wellness-sage hover:bg-wellness-sage/90"
            >
              Use this phase
            </Button>
            
            <div className="text-center">
              <span className="text-sm text-muted-foreground">or choose a different phase:</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {CYCLE_PHASES.filter(p => p.id !== estimatedPhase).map((phase) => (
                <Button
                  key={phase.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onPhaseSelected(phase.id)}
                  className="text-xs"
                >
                  {phase.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
