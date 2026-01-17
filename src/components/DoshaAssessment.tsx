import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  dosha: "vata" | "pitta" | "kapha" | "vata-pitta" | "pitta-kapha" | "vata-kapha" | "tri-dosha";
}

interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
}

const doshaQuestions: Question[] = [
  {
    id: "body_frame",
    question: "How would you describe your natural body frame?",
    options: [
      { value: "thin", label: "Thin", description: "Slender build, long limbs, light bones", dosha: "vata" },
      { value: "medium", label: "Medium", description: "Athletic build, moderate frame", dosha: "pitta" },
      { value: "sturdy", label: "Sturdy", description: "Solid build, strong bones, gains weight easily", dosha: "kapha" },
      { value: "not_sure", label: "Not sure", description: "I'm not certain which fits me best", dosha: "tri-dosha" },
    ],
  },
  {
    id: "skin",
    question: "How does your skin usually feel?",
    options: [
      { value: "dry", label: "Dry or rough", description: "Tends to feel tight, may get flaky or cracked", dosha: "vata" },
      { value: "warm", label: "Warm or sensitive", description: "Prone to redness, irritation, or breakouts", dosha: "pitta" },
      { value: "oily", label: "Oily or smooth", description: "Naturally moisturized, may feel greasy by end of day", dosha: "kapha" },
      { value: "combo_dry_oily", label: "Mix of dry and oily", description: "Some areas dry, others oily—varies by season", dosha: "vata-kapha" },
      { value: "combo_tzone", label: "Oily T-zone, dry cheeks", description: "Forehead and nose are oily while cheeks feel dry", dosha: "vata-pitta" },
      { value: "not_sure", label: "Not sure", description: "I'm not certain which fits me best", dosha: "tri-dosha" },
    ],
  },
  {
    id: "digestion",
    question: "Which description fits your digestion most days?",
    options: [
      { value: "irregular", label: "Irregular", description: "Appetite and digestion vary day to day", dosha: "vata" },
      { value: "strong", label: "Strong", description: "Good appetite, can digest most foods easily", dosha: "pitta" },
      { value: "slow", label: "Slow", description: "Takes time to digest, may feel heavy after eating", dosha: "kapha" },
      { value: "not_sure", label: "Not sure", description: "I'm not certain which fits me best", dosha: "tri-dosha" },
    ],
  },
  {
    id: "energy",
    question: "How would you describe your general energy?",
    options: [
      { value: "variable", label: "Variable", description: "Energy comes in bursts, then fades quickly", dosha: "vata" },
      { value: "strong", label: "Strong", description: "High energy, driven, goal-oriented", dosha: "pitta" },
      { value: "steady", label: "Steady", description: "Consistent energy throughout the day", dosha: "kapha" },
      { value: "not_sure", label: "Not sure", description: "I'm not certain which fits me best", dosha: "tri-dosha" },
    ],
  },
  {
    id: "sleep",
    question: "How is your sleep most nights?",
    options: [
      { value: "light", label: "Light", description: "Wake easily, may have trouble falling asleep", dosha: "vata" },
      { value: "moderate", label: "Moderate", description: "Sleep well but may wake if overheated", dosha: "pitta" },
      { value: "deep", label: "Deep", description: "Sleep soundly, hard to wake up in morning", dosha: "kapha" },
      { value: "not_sure", label: "Not sure", description: "I'm not certain which fits me best", dosha: "tri-dosha" },
    ],
  },
  {
    id: "emotional",
    question: "Which best describes your emotional response?",
    options: [
      { value: "worry", label: "Worry", description: "Tend toward anxiety or overthinking", dosha: "vata" },
      { value: "irritability", label: "Irritability", description: "Can feel frustrated or impatient easily", dosha: "pitta" },
      { value: "calm", label: "Calm", description: "Generally relaxed, slow to anger", dosha: "kapha" },
      { value: "not_sure", label: "Not sure", description: "I'm not certain which fits me best", dosha: "tri-dosha" },
    ],
  },
  {
    id: "climate",
    question: "Which climate makes you feel your best?",
    options: [
      { value: "warm_humid", label: "Warm and humid", description: "Feel best when it's warm and moist", dosha: "vata" },
      { value: "cool_airy", label: "Cool and airy", description: "Prefer cooler temperatures and fresh air", dosha: "pitta" },
      { value: "warm_dry", label: "Warm and dry", description: "Thrive in warm but not humid conditions", dosha: "kapha" },
      { value: "not_sure", label: "Not sure", description: "I'm not certain which fits me best", dosha: "tri-dosha" },
    ],
  },
  {
    id: "activity",
    question: "How does your body feel during physical activity?",
    options: [
      { value: "gentle", label: "Loves gentle movement", description: "Prefer walking, stretching, or light yoga", dosha: "vata" },
      { value: "competitive", label: "Strong and competitive", description: "Enjoy intense workouts and challenges", dosha: "pitta" },
      { value: "motivated", label: "Needs motivation but steady", description: "Takes effort to start but can sustain once going", dosha: "kapha" },
      { value: "not_sure", label: "Not sure", description: "I'm not certain which fits me best", dosha: "tri-dosha" },
    ],
  },
];

interface DoshaAssessmentProps {
  onComplete: (primary: string, secondary: string) => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function DoshaAssessment({ onComplete, onBack, currentStep = 2, totalSteps = 6 }: DoshaAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < doshaQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateDosha();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  const calculateDosha = () => {
    const scores = { vata: 0, pitta: 0, kapha: 0 };

    Object.entries(answers).forEach(([questionId, value]) => {
      const question = doshaQuestions.find((q) => q.id === questionId);
      const option = question?.options.find((opt) => opt.value === value);
      if (option) {
        // Handle combination and tri-doshas - split points accordingly
        if (option.dosha === "tri-dosha") {
          scores.vata += 0.33;
          scores.pitta += 0.33;
          scores.kapha += 0.34;
        } else if (option.dosha === "vata-pitta") {
          scores.vata += 0.5;
          scores.pitta += 0.5;
        } else if (option.dosha === "pitta-kapha") {
          scores.pitta += 0.5;
          scores.kapha += 0.5;
        } else if (option.dosha === "vata-kapha") {
          scores.vata += 0.5;
          scores.kapha += 0.5;
        } else {
          scores[option.dosha]++;
        }
      }
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0][0];
    const secondary = sorted[1][0];

    onComplete(primary, secondary);
  };

  const question = doshaQuestions[currentQuestion];
  const currentAnswer = answers[question.id];
  const progress = ((currentQuestion + 1) / doshaQuestions.length) * 100;

  return (
    <Card className="w-full max-w-2xl border-wellness-taupe/20">
      <CardHeader>
        <CardTitle className="text-2xl text-wellness-taupe">Discover Your Dosha</CardTitle>
        <CardDescription>
          Question {currentQuestion + 1} of {doshaQuestions.length}
        </CardDescription>
        {/* Overall onboarding progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-primary">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-wellness-lilac to-wellness-sage transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        {/* Dosha assessment progress */}
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">{question.question}</h3>
          <RadioGroup value={currentAnswer} onValueChange={(value) => handleAnswer(question.id, value)}>
            <div className="space-y-3">
              {question.options.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-start space-x-3 p-3 sm:p-4 rounded-lg border transition-colors ${
                    currentAnswer === option.value 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <span className="block text-sm sm:text-base font-medium leading-snug">{option.label}</span>
                    {option.description && (
                      <span className="block text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                        {option.description}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handlePrevious}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentQuestion === 0 ? "Back" : "Previous"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!currentAnswer}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {currentQuestion === doshaQuestions.length - 1 ? "Complete Assessment" : "Next"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
