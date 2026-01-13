import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Bookmark, Play, Plus, Sparkles, Moon, Leaf, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  duration?: string;
  tags?: string[];
}

interface SupportPlanRecommendationsProps {
  userId: string;
  lifeStage: string;
  symptoms: string[];
  dosha?: string;
  onTryNow: (recommendation: Recommendation, type: string) => void;
  onAddToPlan: (recommendation: Recommendation, type: string) => void;
}

// Generate personalized recommendations based on life stage and symptoms
const getYogaRecommendations = (lifeStage: string, symptoms: string[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Base recommendations by life stage
  if (lifeStage === 'pregnancy') {
    recommendations.push(
      { id: 'prenatal-gentle', title: 'Gentle Prenatal Stretches', description: 'Soft movements to ease tension and support your changing body', duration: '10 min', tags: ['pregnancy', 'gentle'] },
      { id: 'prenatal-breathing', title: 'Calming Breath Practice', description: 'Pranayama techniques safe for pregnancy to reduce anxiety', duration: '5 min', tags: ['pregnancy', 'breathwork'] },
    );
  } else if (lifeStage === 'postpartum') {
    recommendations.push(
      { id: 'postpartum-restore', title: 'Restorative Recovery Poses', description: 'Gentle poses to support healing and reconnect with your body', duration: '15 min', tags: ['postpartum', 'recovery'] },
      { id: 'postpartum-core', title: 'Gentle Core Reconnection', description: 'Safe, slow movements to rebuild core strength', duration: '10 min', tags: ['postpartum', 'core'] },
    );
  } else if (['perimenopause', 'menopause', 'post_menopause'].includes(lifeStage)) {
    recommendations.push(
      { id: 'meno-cooling', title: 'Cooling Yoga Flow', description: 'Movements that may help with temperature regulation', duration: '15 min', tags: ['menopause', 'cooling'] },
      { id: 'meno-joints', title: 'Joint-Friendly Movement', description: 'Gentle stretches to support flexibility and ease stiffness', duration: '10 min', tags: ['menopause', 'mobility'] },
    );
  } else {
    recommendations.push(
      { id: 'cycle-gentle', title: 'Cycle-Supportive Yoga', description: 'Movements that honor where you are in your cycle', duration: '15 min', tags: ['cycle', 'gentle'] },
    );
  }
  
  // Symptom-based additions
  if (symptoms.includes('tired') || symptoms.includes('fatigue')) {
    recommendations.push({ id: 'energy-restore', title: 'Energy-Restoring Practice', description: 'Gentle movements to support your energy without depleting you', duration: '10 min', tags: ['energy', 'restorative'] });
  }
  if (symptoms.includes('pain') || symptoms.includes('aches')) {
    recommendations.push({ id: 'pain-relief', title: 'Soothing Stretch Sequence', description: 'Targeted stretches that may help ease discomfort', duration: '12 min', tags: ['pain', 'stretch'] });
  }
  if (symptoms.includes('anxious') || symptoms.includes('stressed')) {
    recommendations.push({ id: 'calm-anxiety', title: 'Grounding & Calming Practice', description: 'Slow, intentional movements to help settle the nervous system', duration: '10 min', tags: ['anxiety', 'grounding'] });
  }
  
  return recommendations.slice(0, 5);
};

const getNutritionRecommendations = (lifeStage: string, symptoms: string[], dosha?: string): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Dosha-based recommendations
  if (dosha === 'vata' || symptoms.includes('anxious') || symptoms.includes('cold')) {
    recommendations.push(
      { id: 'vata-warm', title: 'Warm, Nourishing Bowl', description: 'Grounding foods that may help calm Vata energy', tags: ['vata', 'warming'] },
      { id: 'vata-tea', title: 'Calming Ginger Tea', description: 'A soothing warm drink to support digestion and warmth', tags: ['vata', 'tea'] },
    );
  }
  if (dosha === 'pitta' || symptoms.includes('hot') || symptoms.includes('irritable')) {
    recommendations.push(
      { id: 'pitta-cool', title: 'Cooling Cucumber Salad', description: 'Refreshing foods that may help balance heat', tags: ['pitta', 'cooling'] },
      { id: 'pitta-milk', title: 'Rose & Cardamom Milk', description: 'A calming evening drink to support rest', tags: ['pitta', 'calming'] },
    );
  }
  if (dosha === 'kapha' || symptoms.includes('sluggish') || symptoms.includes('heavy')) {
    recommendations.push(
      { id: 'kapha-light', title: 'Light & Spiced Meal', description: 'Energizing foods that may help lift heaviness', tags: ['kapha', 'energizing'] },
    );
  }
  
  // Life stage additions
  if (lifeStage === 'pregnancy') {
    recommendations.push({ id: 'preg-nourish', title: 'Iron-Rich Nourishment', description: 'Foods to support you and baby during this time', tags: ['pregnancy', 'nourishing'] });
  }
  if (lifeStage === 'postpartum') {
    recommendations.push({ id: 'post-rebuild', title: 'Ojas-Building Foods', description: 'Traditional postpartum nourishment for recovery', tags: ['postpartum', 'rebuilding'] });
  }
  if (['perimenopause', 'menopause'].includes(lifeStage)) {
    recommendations.push({ id: 'meno-bone', title: 'Bone-Supportive Nutrition', description: 'Foods rich in nutrients for bone health', tags: ['menopause', 'bones'] });
  }
  
  // Symptom additions
  if (symptoms.includes('bloated')) {
    recommendations.push({ id: 'digest-ease', title: 'Digestive-Friendly Meal', description: 'Simple foods that are gentle on digestion', tags: ['digestion', 'gentle'] });
  }
  
  return recommendations.slice(0, 5);
};

const getLifestyleRecommendations = (lifeStage: string, symptoms: string[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Sleep support
  if (symptoms.includes('tired') || symptoms.includes('insomnia')) {
    recommendations.push(
      { id: 'sleep-routine', title: 'Evening Wind-Down Ritual', description: 'A gentle routine to prepare your body for rest', duration: '15 min', tags: ['sleep', 'evening'] },
    );
  }
  
  // Stress support
  if (symptoms.includes('anxious') || symptoms.includes('stressed')) {
    recommendations.push(
      { id: 'stress-pause', title: 'Midday Pause Practice', description: 'A brief reset to support your nervous system', duration: '5 min', tags: ['stress', 'reset'] },
    );
  }
  
  // Energy support
  if (symptoms.includes('tired') || symptoms.includes('fatigue')) {
    recommendations.push(
      { id: 'energy-morning', title: 'Gentle Morning Awakening', description: 'Start your day with care, not rush', duration: '10 min', tags: ['energy', 'morning'] },
    );
  }
  
  // Life stage specific
  if (lifeStage === 'pregnancy') {
    recommendations.push({ id: 'preg-rest', title: 'Sacred Rest Moments', description: 'Permission to pause throughout your day', duration: 'As needed', tags: ['pregnancy', 'rest'] });
  }
  if (lifeStage === 'postpartum') {
    recommendations.push({ id: 'post-grace', title: 'Self-Compassion Practice', description: 'Gentle reminders that you are doing enough', duration: '5 min', tags: ['postpartum', 'self-care'] });
  }
  if (['perimenopause', 'menopause'].includes(lifeStage)) {
    recommendations.push({ id: 'meno-cool', title: 'Cooling Environment Tips', description: 'Simple ways to manage temperature changes', tags: ['menopause', 'comfort'] });
  }
  
  // Default additions
  recommendations.push(
    { id: 'nature-connection', title: 'Nature Connection', description: 'A few minutes outdoors can support wellbeing', duration: '10 min', tags: ['grounding', 'nature'] },
    { id: 'gratitude-moment', title: 'Gratitude Moment', description: 'Noticing small blessings in your day', duration: '3 min', tags: ['mindset', 'gratitude'] },
  );
  
  return recommendations.slice(0, 5);
};

const getSpiritualRecommendations = (lifeStage: string, symptoms: string[], isIslamic: boolean): Recommendation[] => {
  if (isIslamic) {
    return [
      { id: 'dhikr', title: 'Dhikr for Peace', description: 'Simple remembrance phrases to calm the heart', duration: '5 min', tags: ['islamic', 'peace'] },
      { id: 'dua', title: 'Du\'a for Wellbeing', description: 'Prayers for health, patience, and gratitude', duration: '3 min', tags: ['islamic', 'prayer'] },
      { id: 'gratitude-islamic', title: 'Shukr Practice', description: 'Reflecting on blessings with intention', duration: '5 min', tags: ['islamic', 'gratitude'] },
      { id: 'intention', title: 'Morning Intention Setting', description: 'Beginning your day with niyyah and purpose', duration: '3 min', tags: ['islamic', 'intention'] },
      { id: 'quran-reflection', title: 'Quranic Reflection', description: 'A verse to carry with you through the day', duration: '5 min', tags: ['islamic', 'quran'] },
    ];
  } else {
    return [
      { id: 'breath-prayer', title: 'Breath Prayer', description: 'Using breath as a gentle anchor for stillness', duration: '5 min', tags: ['universal', 'breath'] },
      { id: 'grounding', title: 'Grounding Meditation', description: 'Connecting with the earth and present moment', duration: '7 min', tags: ['universal', 'grounding'] },
      { id: 'compassion', title: 'Self-Compassion Practice', description: 'Offering yourself kindness and understanding', duration: '5 min', tags: ['universal', 'compassion'] },
      { id: 'gratitude-universal', title: 'Gratitude Reflection', description: 'Noticing and appreciating what supports you', duration: '5 min', tags: ['universal', 'gratitude'] },
      { id: 'body-awareness', title: 'Body Awareness Check-In', description: 'Listening to what your body is telling you', duration: '5 min', tags: ['universal', 'awareness'] },
    ];
  }
};

export function SupportPlanRecommendations({ 
  userId, 
  lifeStage, 
  symptoms, 
  dosha,
  onTryNow,
  onAddToPlan 
}: SupportPlanRecommendationsProps) {
  const [spiritualPreference, setSpiritualPreference] = useState<'islamic' | 'universal'>('universal');
  const [savingId, setSavingId] = useState<string | null>(null);

  const yogaRecs = getYogaRecommendations(lifeStage, symptoms);
  const nutritionRecs = getNutritionRecommendations(lifeStage, symptoms, dosha);
  const lifestyleRecs = getLifestyleRecommendations(lifeStage, symptoms);
  const spiritualRecs = getSpiritualRecommendations(lifeStage, symptoms, spiritualPreference === 'islamic');

  const handleSave = async (rec: Recommendation, type: string) => {
    setSavingId(rec.id);
    try {
      const { error } = await supabase
        .from('saved_practices')
        .upsert({
          user_id: userId,
          practice_type: type,
          practice_title: rec.title,
          practice_description: rec.description,
          practice_data: { duration: rec.duration, tags: rec.tags },
          is_favorite: true,
        }, { onConflict: 'user_id,practice_type,practice_title' });

      if (error) throw error;
      toast.success('Saved to your practices');
    } catch (error) {
      console.error('Error saving practice:', error);
      toast.error('Could not save. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const RecommendationCard = ({ rec, type }: { rec: Recommendation; type: string }) => (
    <Card className="bg-card/50 border-wellness-sage/20 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-foreground">{rec.title}</h4>
          {rec.duration && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {rec.duration}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSave(rec, type)}
            disabled={savingId === rec.id}
            className="text-xs"
          >
            <Bookmark className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTryNow(rec, type)}
            className="text-xs"
          >
            <Play className="w-3 h-3 mr-1" />
            Try Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddToPlan(rec, type)}
            className="text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add to Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="border-wellness-sage/30 bg-gradient-to-br from-wellness-sage/5 to-wellness-cream/30">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-wellness-taupe" />
          <CardTitle className="text-xl text-wellness-taupe">Your Support Plan</CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          Based on how you're feeling today, here are some gentle suggestions. 
          There's no pressure — explore what feels right for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="yoga" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="yoga" className="text-xs sm:text-sm">
              <Heart className="w-4 h-4 mr-1 hidden sm:inline" />
              Movement
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="text-xs sm:text-sm">
              <UtensilsCrossed className="w-4 h-4 mr-1 hidden sm:inline" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="text-xs sm:text-sm">
              <Leaf className="w-4 h-4 mr-1 hidden sm:inline" />
              Lifestyle
            </TabsTrigger>
            <TabsTrigger value="spiritual" className="text-xs sm:text-sm">
              <Moon className="w-4 h-4 mr-1 hidden sm:inline" />
              Spiritual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yoga" className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Movement suggestions that may support your body today:
            </p>
            {yogaRecs.map(rec => (
              <RecommendationCard key={rec.id} rec={rec} type="yoga" />
            ))}
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Nourishment ideas based on your current state:
            </p>
            {nutritionRecs.map(rec => (
              <RecommendationCard key={rec.id} rec={rec} type="nutrition" />
            ))}
          </TabsContent>

          <TabsContent value="lifestyle" className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Small adjustments that may help you feel more supported:
            </p>
            {lifestyleRecs.map(rec => (
              <RecommendationCard key={rec.id} rec={rec} type="lifestyle" />
            ))}
          </TabsContent>

          <TabsContent value="spiritual" className="space-y-3">
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                variant={spiritualPreference === 'islamic' ? 'default' : 'outline'}
                onClick={() => setSpiritualPreference('islamic')}
                className="text-xs"
              >
                Islamic Practices
              </Button>
              <Button
                size="sm"
                variant={spiritualPreference === 'universal' ? 'default' : 'outline'}
                onClick={() => setSpiritualPreference('universal')}
                className="text-xs"
              >
                Universal Practices
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {spiritualPreference === 'islamic' 
                ? 'Islamic spiritual practices for peace and connection:'
                : 'Universal mindfulness practices for grounding and calm:'}
            </p>
            {spiritualRecs.map(rec => (
              <RecommendationCard key={rec.id} rec={rec} type="spiritual" />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
