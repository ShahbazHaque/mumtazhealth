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
      { value: "thin", label: "Thin", dosha: "vata" },
      { value: "medium", label: "Medium", dosha: "pitta" },
      { value: "sturdy", label: "Sturdy", dosha: "kapha" },
    ],
  },
  {
    id: "skin",
    question: "How does your skin usually feel?",
    options: [
      { value: "dry", label: "Dry", dosha: "vata" },
      { value: "warm", label: "Warm", dosha: "pitta" },
      { value: "oily", label: "Oily", dosha: "kapha" },
    ],
  },
  {
    id: "digestion",
    question: "Which description fits your digestion most days?",
    options: [
      { value: "irregular", label: "Irregular", dosha: "vata" },
      { value: "strong", label: "Strong", dosha: "pitta" },
      { value: "slow", label: "Slow", dosha: "kapha" },
    ],
  },
  {
    id: "energy",
    question: "How would you describe your general energy?",
    options: [
      { value: "variable", label: "Variable", dosha: "vata" },
      { value: "strong", label: "Strong", dosha: "pitta" },
      { value: "steady", label: "Steady", dosha: "kapha" },
    ],
  },
  {
    id: "sleep",
    question: "How is your sleep most nights?",
    options: [
      { value: "light", label: "Light", dosha: "vata" },
      { value: "moderate", label: "Moderate", dosha: "pitta" },
      { value: "deep", label: "Deep", dosha: "kapha" },
    ],
  },
  {
    id: "emotional",
    question: "Which best describes your emotional response?",
    options: [
      { value: "worry", label: "Worry", dosha: "vata" },
      { value: "irritability", label: "Irritability", dosha: "pitta" },
      { value: "calm", label: "Calm", dosha: "kapha" },
    ],
  },
  {
    id: "climate",
    question: "Which climate makes you feel your best?",
    options: [
      { value: "warm_humid", label: "Warm and humid", dosha: "vata" },
      { value: "cool_airy", label: "Cool and airy", dosha: "pitta" },
      { value: "warm_dry", label: "Warm and dry", dosha: "kapha" },
    ],
  },
  {
    id: "activity",
    question: "How does your body feel during physical activity?",
    options: [
      { value: "gentle", label: "Loves gentle movement", dosha: "vata" },
      { value: "competitive", label: "Strong and competitive", dosha: "pitta" },
      { value: "motivated", label: "Needs motivation but then steady", dosha: "kapha" },
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
