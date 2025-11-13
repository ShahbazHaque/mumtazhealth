import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    dosha: "vata" | "pitta" | "kapha";
  }[];
}

const doshaQuestions: Question[] = [
  {
    id: "body_frame",
    question: "How would you describe your natural body frame?",
    options: [
      { value: "thin", label: "Thin, light, hard to gain weight", dosha: "vata" },
      { value: "medium", label: "Medium build, athletic", dosha: "pitta" },
      { value: "sturdy", label: "Sturdy, heavier, gains weight easily", dosha: "kapha" },
    ],
  },
  {
    id: "skin",
    question: "How would you describe your skin?",
    options: [
      { value: "dry", label: "Dry, rough, cool to touch", dosha: "vata" },
      { value: "warm", label: "Warm, oily, prone to inflammation", dosha: "pitta" },
      { value: "smooth", label: "Smooth, moist, cool", dosha: "kapha" },
    ],
  },
  {
    id: "digestion",
    question: "How is your digestion?",
    options: [
      { value: "irregular", label: "Irregular, sensitive, bloating", dosha: "vata" },
      { value: "strong", label: "Strong, fast metabolism, gets hungry easily", dosha: "pitta" },
      { value: "slow", label: "Slow, steady, can skip meals", dosha: "kapha" },
    ],
  },
  {
    id: "sleep",
    question: "How do you sleep?",
    options: [
      { value: "light", label: "Light sleeper, difficulty falling asleep", dosha: "vata" },
      { value: "moderate", label: "Moderate sleep, but sound when asleep", dosha: "pitta" },
      { value: "heavy", label: "Deep, long sleeper", dosha: "kapha" },
    ],
  },
  {
    id: "energy",
    question: "How is your energy throughout the day?",
    options: [
      { value: "bursts", label: "Comes in bursts, easily exhausted", dosha: "vata" },
      { value: "intense", label: "Intense, driven, moderate stamina", dosha: "pitta" },
      { value: "steady", label: "Steady, enduring, slow to start", dosha: "kapha" },
    ],
  },
  {
    id: "mind",
    question: "How would you describe your mind?",
    options: [
      { value: "quick", label: "Quick, creative, anxious when stressed", dosha: "vata" },
      { value: "sharp", label: "Sharp, focused, irritable when stressed", dosha: "pitta" },
      { value: "calm", label: "Calm, slow to anger, resistant to change", dosha: "kapha" },
    ],
  },
  {
    id: "stress",
    question: "How do you respond to stress?",
    options: [
      { value: "worry", label: "Worry, anxiety, overwhelm", dosha: "vata" },
      { value: "anger", label: "Frustration, anger, impatience", dosha: "pitta" },
      { value: "withdraw", label: "Withdraw, lethargy, emotional eating", dosha: "kapha" },
    ],
  },
  {
    id: "weather",
    question: "Which weather affects you most negatively?",
    options: [
      { value: "cold_dry", label: "Cold, dry, windy weather", dosha: "vata" },
      { value: "hot", label: "Hot, humid weather", dosha: "pitta" },
      { value: "cold_damp", label: "Cold, damp, cloudy weather", dosha: "kapha" },
    ],
  },
];

interface DoshaAssessmentProps {
  onComplete: (primary: string, secondary: string) => void;
  onBack: () => void;
}

export default function DoshaAssessment({ onComplete, onBack }: DoshaAssessmentProps) {
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
        scores[option.dosha]++;
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
                  className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
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
            className="bg-wellness-taupe hover:bg-wellness-taupe/90"
          >
            {currentQuestion === doshaQuestions.length - 1 ? "Complete Assessment" : "Next"}
            {currentQuestion < doshaQuestions.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
