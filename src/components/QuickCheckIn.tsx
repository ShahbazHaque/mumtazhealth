import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const feelingOptions = [
  { id: "tired", label: "Tired", emoji: "😴" },
  { id: "pain", label: "In pain", emoji: "😣" },
  { id: "exhausted", label: "Exhausted", emoji: "😩" },
  { id: "hormonal", label: "Hormonal", emoji: "🌙" },
  { id: "emotional", label: "Emotional", emoji: "💧" },
  { id: "restless", label: "Restless", emoji: "🦋" },
  { id: "bloated", label: "Bloated", emoji: "🎈" },
  { id: "cant-sleep", label: "Can't sleep", emoji: "🌃" },
  { id: "hot-flushes", label: "Hot flushes", emoji: "🔥" },
  { id: "digestive", label: "Digestive issues", emoji: "🍵" },
  { id: "back-ache", label: "Back ache", emoji: "🧘" },
  { id: "neck-shoulder", label: "Neck/shoulder", emoji: "💆" },
];

const suggestions: Record<string, { tips: string[]; explore: string }> = {
  tired: {
    tips: [
      "Try 5 slow, deep belly breaths to restore energy",
      "Sip warm water with lemon to gently awaken the body",
      "A short 5-minute legs-up-the-wall pose can help"
    ],
    explore: "Explore restorative poses in Content Library"
  },
  pain: {
    tips: [
      "Apply gentle warmth to the area of discomfort",
      "Try cat-cow stretches to release tension",
      "Turmeric golden milk can support natural relief"
    ],
    explore: "Track your pain patterns in Symptom Tracker"
  },
  exhausted: {
    tips: [
      "Honor your body with rest — even 10 minutes",
      "Warm sesame oil self-massage (Abhyanga) can restore",
      "Avoid stimulants and choose nourishing warm foods"
    ],
    explore: "Discover Vata-balancing practices"
  },
  hormonal: {
    tips: [
      "Cooling breathwork (Sitali) can help balance heat",
      "Include healthy fats like ghee and avocado today",
      "Moon salutations can honor your hormonal rhythm"
    ],
    explore: "View cycle-phase content in Library"
  },
  emotional: {
    tips: [
      "Place your hand on your heart and breathe slowly",
      "Journaling can help release emotional weight",
      "A warm bath with lavender supports emotional release"
    ],
    explore: "Explore meditation and breathwork"
  },
  restless: {
    tips: [
      "Try a grounding standing pose like Mountain Pose",
      "Avoid caffeine and opt for chamomile or warm milk",
      "Focus on slow exhales to activate your calm response"
    ],
    explore: "Find Vata-calming practices"
  },
  bloated: {
    tips: [
      "Gentle knee-to-chest pose (Apanasana) aids digestion",
      "Sip warm ginger tea after meals",
      "Avoid raw, cold foods — choose warm, cooked meals"
    ],
    explore: "View digestion-friendly nutrition tips"
  },
  "cant-sleep": {
    tips: [
      "Try alternate nostril breathing before bed",
      "Warm milk with nutmeg supports restful sleep",
      "Gentle forward folds help calm the nervous system"
    ],
    explore: "Discover evening wind-down routines"
  },
  "hot-flushes": {
    tips: [
      "Cooling breathwork (Sheetali) can bring relief",
      "Avoid spicy foods and opt for cooling foods",
      "Aloe vera juice can help balance internal heat"
    ],
    explore: "Explore menopause support content"
  },
  digestive: {
    tips: [
      "Chew food slowly and eat in a calm environment",
      "Fennel or cumin tea after meals aids digestion",
      "Gentle twists help stimulate digestive fire"
    ],
    explore: "View Ayurvedic nutrition guidance"
  },
  "back-ache": {
    tips: [
      "Cat-cow stretches gently mobilize the spine",
      "Warm compress on lower back can ease tension",
      "Supported bridge pose with a block may help"
    ],
    explore: "Explore mobility and joint care content"
  },
  "neck-shoulder": {
    tips: [
      "Gentle neck rolls and shoulder shrugs release tension",
      "Eagle arms stretch opens the upper back",
      "Warm oil massage on shoulders before bed helps"
    ],
    explore: "View chair yoga and gentle stretches"
  },
};

interface QuickCheckInProps {
  username?: string;
}

export function QuickCheckIn({ username }: QuickCheckInProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);

  const handleFeelingSelect = (feelingId: string) => {
    setSelectedFeeling(feelingId);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFeeling(null);
  };

  const currentSuggestions = selectedFeeling ? suggestions[selectedFeeling] : null;

  if (!isOpen) {
    return (
      <Card 
        className="bg-gradient-to-br from-mumtaz-lilac/30 to-mumtaz-sage/20 border-mumtaz-lilac/40 shadow-lg cursor-pointer hover:shadow-xl transition-all"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-mumtaz-lilac/20">
              <Heart className="h-6 w-6 text-mumtaz-lilac" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                How are you feeling today{username ? `, ${username}` : ""}?
              </h3>
              <p className="text-sm text-muted-foreground">
                Tap to get personalized suggestions
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-mumtaz-lilac/20 to-mumtaz-sage/10 border-mumtaz-lilac/40 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Heart className="h-5 w-5 text-mumtaz-lilac" />
            How are you feeling today?
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Select what resonates with you right now
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!selectedFeeling ? (
          <div className="flex flex-wrap gap-2">
            {feelingOptions.map((feeling) => (
              <Badge
                key={feeling.id}
                variant="outline"
                className="px-4 py-2 text-sm cursor-pointer hover:bg-mumtaz-lilac/20 hover:border-mumtaz-lilac transition-all"
                onClick={() => handleFeelingSelect(feeling.id)}
              >
                <span className="mr-2">{feeling.emoji}</span>
                {feeling.label}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-mumtaz-lilac/20">
                {feelingOptions.find(f => f.id === selectedFeeling)?.emoji}{" "}
                {feelingOptions.find(f => f.id === selectedFeeling)?.label}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedFeeling(null)}
                className="text-xs"
              >
                Change
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-mumtaz-lilac" />
                Here's what might help:
              </h4>
              <ul className="space-y-2">
                {currentSuggestions?.tips.map((tip, index) => (
                  <li 
                    key={index} 
                    className="text-sm text-muted-foreground pl-4 border-l-2 border-mumtaz-lilac/40 py-1"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-border/50 space-y-3">
              <p className="text-sm text-muted-foreground">
                Want to explore more?
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/content-library")}
                  className="text-sm"
                >
                  {currentSuggestions?.explore}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/tracker")}
                  className="text-sm"
                >
                  Log in Daily Tracker
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/insights")}
                  className="text-sm"
                >
                  View Dosha Insights
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
