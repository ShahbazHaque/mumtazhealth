import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { wellnessEntrySchema, validateInput, truncateText } from "@/lib/validation";
import { LogOut, Save, Trash2, UserCog, BarChart3, Plus, X, Calendar, BookOpen, Sparkles, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Navigation } from "@/components/Navigation";
import { CyclePhaseHelper } from "@/components/CyclePhaseHelper";
import { CyclePhaseEducation } from "@/components/CyclePhaseEducation";
import { MenopauseEducation } from "@/components/MenopauseEducation";
import { PregnancyEducation } from "@/components/PregnancyEducation";
import { PostpartumEducation } from "@/components/PostpartumEducation";
import { DailyRhythm } from "@/components/DailyRhythm";
import { BodyChangingEducation } from "@/components/BodyChangingEducation";
import { AppCompanionDisclaimer } from "@/components/AppCompanionDisclaimer";
import { SupportPlanModal } from "@/components/SupportPlan";
import { GentleSignInPrompt } from "@/components/GentleSignInPrompt";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { SimpleCheckIn } from "@/components/SimpleCheckIn";

interface DailyPractice {
  id: string;
  label: string;
  type: 'checkbox' | 'time' | 'number' | 'text';
  status?: boolean;
  detail?: string;
  notes?: string;
}

const DAILY_PRACTICES_BASE: DailyPractice[] = [
  { id: 'wake', label: 'Early Wake Up', type: 'time' },
  { id: 'water', label: 'Warm Water/Tea', type: 'checkbox' },
  { id: 'abhyanga', label: 'Abhyanga (Self-Massage)', type: 'checkbox' },
  { id: 'breakfast', label: 'Warm/Oily Meal', type: 'text' },
  { id: 'break', label: 'Mid-Day Break', type: 'checkbox' },
  { id: 'hydration', label: 'Warm Hydration Check', type: 'checkbox' },
  { id: 'tawakkul', label: 'Tawakkul Anchor', type: 'checkbox' },
  { id: 'breathing', label: 'Vata-Calming Breathing', type: 'checkbox' },
  { id: 'curfew', label: 'Device Curfew', type: 'checkbox' },
  { id: 'milk', label: 'Shukra Milk Tonic', type: 'checkbox' },
  { id: 'sleep', label: 'Total Sleep Achieved', type: 'number' },
];

const MENSTRUAL_ADJUSTMENTS = {
  'abhyanga': 'Passive Oil Application (Pelvic Area Only)',
  'breathing': 'Gentle Restorative Pranayama',
  'wake': 'Wake at Natural Time (REST)',
  'milk': 'Warm Broth/Ginger Tea (No Milk)',
};

export default function Tracker() {
  const [searchParams] = useSearchParams();
  const showFullTracker = searchParams.get('mode') === 'full';

  // Simple check-in mode state - default to simple unless ?mode=full
  const [useSimpleMode, setUseSimpleMode] = useState(!showFullTracker);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [cyclePhase, setCyclePhase] = useState('');
  const [isMenstrual, setIsMenstrual] = useState(false);
  const [lifeStage, setLifeStage] = useState<string>('');
  const [trimester, setTrimester] = useState<string>('');
  const [showCycleHelper, setShowCycleHelper] = useState(false);
  
  // Red Day Protocol fields
  const [painLevel, setPainLevel] = useState('');
  const [emotionalScore, setEmotionalScore] = useState('');
  const [spiritualAnchor, setSpiritualAnchor] = useState('Istighfar');
  
  // Symptom fields
  const [emotionalState, setEmotionalState] = useState('');
  const [physicalSymptoms, setPhysicalSymptoms] = useState('');
  const [vataCrash, setVataCrash] = useState('No');
  const [tweakPlan, setTweakPlan] = useState('');
  const [monthlyReflection, setMonthlyReflection] = useState('');
  
  // Daily practices state
  const [practices, setPractices] = useState<Record<string, unknown>>({});
  
  // Yoga practice fields
  const [yogaStyle, setYogaStyle] = useState('');
  const [yogaDuration, setYogaDuration] = useState('');
  const [yogaPoses, setYogaPoses] = useState('');
  
  // Nutrition fields
  const [meals, setMeals] = useState<Array<{name: string, time: string, doshaNotes: string}>>([]);
  
  // Spiritual practice fields
  const [fajr, setFajr] = useState(false);
  const [dhuhr, setDhuhr] = useState(false);
  const [asr, setAsr] = useState(false);
  const [maghrib, setMaghrib] = useState(false);
  const [isha, setIsha] = useState(false);
  const [mantras, setMantras] = useState('');
  const [meditationMinutes, setMeditationMinutes] = useState('');
  
  // Pregnancy tracking fields
  const [pregnancyNausea, setPregnancyNausea] = useState('');
  const [pregnancyFatigue, setPregnancyFatigue] = useState('');
  const [pregnancySleep, setPregnancySleep] = useState('');
  const [pregnancyMood, setPregnancyMood] = useState('');
  const [pregnancyBackPain, setPregnancyBackPain] = useState('');
  const [pregnancyDigestion, setPregnancyDigestion] = useState('');
  const [pregnancyBabyMovement, setPregnancyBabyMovement] = useState('');
  const [pregnancyNotes, setPregnancyNotes] = useState('');
  
  // Postpartum tracking fields
  const [postpartumSleep, setPostpartumSleep] = useState('');
  const [postpartumMood, setPostpartumMood] = useState('');
  const [postpartumEnergy, setPostpartumEnergy] = useState('');
  const [postpartumPain, setPostpartumPain] = useState('');
  const [postpartumFeeding, setPostpartumFeeding] = useState('');
  const [postpartumNotes, setPostpartumNotes] = useState('');
  
  // Menopause tracking fields
  const [menopauseHotFlashes, setMenopauseHotFlashes] = useState('');
  const [menopauseNightSweats, setMenopauseNightSweats] = useState('');
  const [menopauseMood, setMenopauseMood] = useState('');
  const [menopauseBrainFog, setMenopauseBrainFog] = useState('');
  const [menopauseEnergy, setMenopauseEnergy] = useState('');
  const [menopauseSleep, setMenopauseSleep] = useState('');
  const [menopauseJointPain, setMenopauseJointPain] = useState('');
  const [menopauseDigestion, setMenopauseDigestion] = useState('');
  
  // Support Plan modal state
  const [showSupportPlan, setShowSupportPlan] = useState(false);
  const [userDosha, setUserDosha] = useState<string | undefined>();
  
  const navigate = useNavigate();

  // Sign-in prompt state
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
      checkOnboarding();
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedDate]);

  const checkOnboarding = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_wellness_profiles')
      .select('onboarding_completed, life_stage, primary_dosha')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking onboarding:', error);
      return;
    }
    
    // Set life stage and dosha if available
    if (data?.life_stage) {
      setLifeStage(data.life_stage);
    }
    if (data?.primary_dosha) {
      setUserDosha(data.primary_dosha);
    }
    
    // If no profile exists or onboarding not completed, redirect to onboarding
    if (!data || !data.onboarding_completed) {
      navigate('/onboarding');
    }
  };

  const getTrackerTitle = () => {
    switch (lifeStage) {
      case 'menstrual_cycle':
        return 'Menstrual Cycle Tracker';
      case 'pregnancy':
        return trimester ? `Pregnancy Tracker (Trimester ${trimester})` : 'Pregnancy Tracker';
      case 'postpartum':
        return 'Postpartum Tracker';
      case 'perimenopause':
        return 'Perimenopause Tracker';
      case 'menopause':
        return 'Menopause Tracker';
      case 'post_menopause':
        return 'Post-Menopause Tracker';
      default:
        return 'Holistic Motherhood Tracker';
    }
  };

  useEffect(() => {
    setIsMenstrual(cyclePhase === 'Menstrual');
  }, [cyclePhase]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const loadData = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('entry_date', selectedDate)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading data:', error);
      return;
    }
    
    if (data) {
      setCyclePhase(data.cycle_phase || '');
      setTrimester(data.trimester?.toString() || '');
      setPainLevel(data.pain_level?.toString() || '');
      setEmotionalScore(data.emotional_score?.toString() || '');
      setSpiritualAnchor(data.spiritual_anchor || 'Istighfar');
      setEmotionalState(data.emotional_state || '');
      setPhysicalSymptoms(data.physical_symptoms || '');
      setVataCrash(data.vata_crash || 'No');
      setTweakPlan(data.tweak_plan || '');
      setMonthlyReflection(data.monthly_reflection || '');
      setPractices(typeof data.daily_practices === 'object' && data.daily_practices !== null ? data.daily_practices as Record<string, unknown> : {});
      
      // Load pregnancy tracking data
      const pregnancyData = typeof data.pregnancy_tracking === 'object' && data.pregnancy_tracking !== null ? data.pregnancy_tracking as Record<string, unknown> : {};
      setPregnancyNausea(pregnancyData.nausea || '');
      setPregnancyFatigue(pregnancyData.fatigue || '');
      setPregnancySleep(pregnancyData.sleep || '');
      setPregnancyMood(pregnancyData.mood || '');
      setPregnancyBackPain(pregnancyData.backPain || '');
      setPregnancyDigestion(pregnancyData.digestion || '');
      setPregnancyBabyMovement(pregnancyData.babyMovement || '');
      setPregnancyNotes(pregnancyData.notes || '');
      
      // Load postpartum tracking data
      const postpartumData = typeof data.postpartum_tracking === 'object' && data.postpartum_tracking !== null ? data.postpartum_tracking as Record<string, unknown> : {};
      setPostpartumSleep(postpartumData.sleep || '');
      setPostpartumMood(postpartumData.mood || '');
      setPostpartumEnergy(postpartumData.energy || '');
      setPostpartumPain(postpartumData.pain || '');
      setPostpartumFeeding(postpartumData.feeding || '');
      setPostpartumNotes(postpartumData.notes || '');
      
      // Load menopause tracking data
      const menopauseData = typeof data.menopause_tracking === 'object' && data.menopause_tracking !== null ? data.menopause_tracking as Record<string, unknown> : {};
      setMenopauseHotFlashes(menopauseData.hotFlashes || '');
      setMenopauseNightSweats(menopauseData.nightSweats || '');
      setMenopauseMood(menopauseData.mood || '');
      setMenopauseBrainFog(menopauseData.brainFog || '');
      setMenopauseEnergy(menopauseData.energy || '');
      setMenopauseSleep(menopauseData.sleep || '');
      setMenopauseJointPain(menopauseData.jointPain || '');
      setMenopauseDigestion(menopauseData.digestion || '');
      
      // Load yoga practice data
      const yogaData = typeof data.yoga_practice === 'object' && data.yoga_practice !== null ? data.yoga_practice as Record<string, unknown> : {};
      setYogaStyle(yogaData.style || '');
      setYogaDuration(yogaData.duration || '');
      setYogaPoses(yogaData.poses || '');
      
      // Load nutrition data
      const nutritionData = typeof data.nutrition_log === 'object' && data.nutrition_log !== null ? data.nutrition_log as Record<string, unknown> : {};
      setMeals(Array.isArray(nutritionData.meals) ? nutritionData.meals : []);
      
      // Load spiritual practices data
      const spiritualData = typeof data.spiritual_practices === 'object' && data.spiritual_practices !== null ? data.spiritual_practices as Record<string, unknown> : {};
      setFajr(spiritualData.fajr || false);
      setDhuhr(spiritualData.dhuhr || false);
      setAsr(spiritualData.asr || false);
      setMaghrib(spiritualData.maghrib || false);
      setIsha(spiritualData.isha || false);
      setMantras(spiritualData.mantras || '');
      setMeditationMinutes(spiritualData.meditationMinutes || '');
    } else {
      // Reset form for new date
      setCyclePhase('');
      setTrimester('');
      setPainLevel('');
      setEmotionalScore('');
      setSpiritualAnchor('Istighfar');
      setEmotionalState('');
      setPhysicalSymptoms('');
      setVataCrash('No');
      setTweakPlan('');
      setPractices({});
      setPregnancyNausea('');
      setPregnancyFatigue('');
      setPregnancySleep('');
      setPregnancyMood('');
      setPregnancyBackPain('');
      setPregnancyDigestion('');
      setPregnancyBabyMovement('');
      setPregnancyNotes('');
      setPostpartumSleep('');
      setPostpartumMood('');
      setPostpartumEnergy('');
      setPostpartumPain('');
      setPostpartumFeeding('');
      setPostpartumNotes('');
      setMenopauseHotFlashes('');
      setMenopauseNightSweats('');
      setMenopauseMood('');
      setMenopauseBrainFog('');
      setMenopauseEnergy('');
      setMenopauseSleep('');
      setMenopauseJointPain('');
      setMenopauseDigestion('');
      setYogaStyle('');
      setYogaDuration('');
      setYogaPoses('');
      setMeals([]);
      setFajr(false);
      setDhuhr(false);
      setAsr(false);
      setMaghrib(false);
      setIsha(false);
      setMantras('');
      setMeditationMinutes('');
      setMonthlyReflection('');
    }
  };

  const saveData = async () => {
    if (!user) {
      // Show gentle sign-in prompt instead of hard redirect
      setShowSignInPrompt(true);
      return;
    }
    
    try {
      // Validate text inputs before saving
      const validation = validateInput(wellnessEntrySchema, {
        emotional_state: emotionalState || null,
        physical_symptoms: physicalSymptoms || null,
        spiritual_anchor: spiritualAnchor || null,
        vata_crash: vataCrash || null,
        tweak_plan: tweakPlan || null,
        monthly_reflection: monthlyReflection || null,
        pain_level: painLevel ? parseInt(painLevel) : null,
        emotional_score: emotionalScore ? parseInt(emotionalScore) : null,
        trimester: trimester ? parseInt(trimester) : null,
      });

      if (!validation.success) {
        toast.error((validation as { success: false; error: string }).error);
        return;
      }

      const validatedData = validation.data;

      const entryData = {
        user_id: user.id,
        entry_date: selectedDate,
        cycle_phase: truncateText(cyclePhase, 50),
        trimester: validatedData.trimester,
        pain_level: validatedData.pain_level,
        emotional_score: validatedData.emotional_score,
        spiritual_anchor: validatedData.spiritual_anchor,
        emotional_state: validatedData.emotional_state,
        physical_symptoms: validatedData.physical_symptoms,
        vata_crash: validatedData.vata_crash,
        tweak_plan: validatedData.tweak_plan,
        monthly_reflection: validatedData.monthly_reflection,
        daily_practices: practices,
        pregnancy_tracking: {
          nausea: truncateText(pregnancyNausea, 100),
          fatigue: truncateText(pregnancyFatigue, 100),
          sleep: truncateText(pregnancySleep, 100),
          mood: truncateText(pregnancyMood, 100),
          backPain: truncateText(pregnancyBackPain, 100),
          digestion: truncateText(pregnancyDigestion, 100),
          babyMovement: truncateText(pregnancyBabyMovement, 100),
          notes: truncateText(pregnancyNotes, 500),
        },
        postpartum_tracking: {
          sleep: truncateText(postpartumSleep, 100),
          mood: truncateText(postpartumMood, 100),
          energy: truncateText(postpartumEnergy, 100),
          pain: truncateText(postpartumPain, 100),
          feeding: truncateText(postpartumFeeding, 100),
          notes: truncateText(postpartumNotes, 500),
        },
        menopause_tracking: {
          hotFlashes: truncateText(menopauseHotFlashes, 100),
          nightSweats: truncateText(menopauseNightSweats, 100),
          mood: truncateText(menopauseMood, 100),
          brainFog: truncateText(menopauseBrainFog, 100),
          energy: truncateText(menopauseEnergy, 100),
          sleep: truncateText(menopauseSleep, 100),
          jointPain: truncateText(menopauseJointPain, 100),
          digestion: truncateText(menopauseDigestion, 100),
        },
        yoga_practice: {
          style: truncateText(yogaStyle, 100),
          duration: truncateText(yogaDuration, 50),
          poses: truncateText(yogaPoses, 500),
        },
        nutrition_log: {
          meals: meals.slice(0, 10).map(m => ({
            name: truncateText(m.name, 100),
            time: truncateText(m.time, 20),
            doshaNotes: truncateText(m.doshaNotes, 200),
          })),
        },
        spiritual_practices: {
          fajr: fajr,
          dhuhr: dhuhr,
          asr: asr,
          maghrib: maghrib,
          isha: isha,
          mantras: truncateText(mantras, 500),
          meditationMinutes: truncateText(meditationMinutes, 10),
        },
      };
      
      const { error } = await supabase
        .from('wellness_entries')
        .upsert(entryData, {
          onConflict: 'user_id,entry_date'
        });
      
      if (error) throw error;
      
      toast.success(`Progress saved for ${selectedDate}!`);
      // Show the Support Plan modal after saving
      setShowSupportPlan(true);
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Error saving data. Please try again.');
    }
  };

  const clearData = async () => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to clear the data for ${selectedDate}? This cannot be undone.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('wellness_entries')
        .delete()
        .eq('user_id', user.id)
        .eq('entry_date', selectedDate);
      
      if (error) throw error;
      
      toast.success(`Entry for ${selectedDate} cleared!`);
      loadData();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Error clearing data. Please try again.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getAdjustedPractices = (): DailyPractice[] => {
    if (!isMenstrual) return DAILY_PRACTICES_BASE;
    
    return DAILY_PRACTICES_BASE.map(practice => {
      const adjusted = MENSTRUAL_ADJUSTMENTS[practice.id as keyof typeof MENSTRUAL_ADJUSTMENTS];
      return adjusted ? { ...practice, label: adjusted } : practice;
    });
  };

  // Integrate with global loading indicator
  useGlobalLoading(loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wellness-lavender/20 to-background animate-fade-in">
        <Navigation />
        <div className="max-w-2xl mx-auto p-4 pt-24 space-y-6">
          {/* Header skeleton */}
          <Card className="mb-6 bg-wellness-warm border-wellness-taupe/20">
            <CardHeader className="text-center space-y-4">
              <div className="h-8 w-64 bg-muted animate-pulse rounded mx-auto" />
              <div className="flex items-center justify-center gap-4">
                <div className="h-10 w-40 bg-muted animate-pulse rounded" />
                <div className="h-9 w-24 bg-muted animate-pulse rounded" />
              </div>
            </CardHeader>
          </Card>
          
          {/* Form sections skeleton */}
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-wellness-sage/20">
              <CardHeader>
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
          
          {/* Save button skeleton */}
          <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  // Show simple check-in by default (better for non-technical users)
  if (useSimpleMode) {
    return (
      <SimpleCheckIn
        onComplete={() => {}}
        onSwitchToFull={() => setUseSimpleMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-wellness-beige animate-fade-in">
      <Navigation />

      {/* Gentle sign-in prompt */}
      <GentleSignInPrompt
        open={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
        feature="track"
        returnPath="/tracker"
      />
      
      <div className="max-w-2xl mx-auto p-4 pb-32 pt-24">
        {/* Header */}
        <Card className="mb-6 bg-wellness-warm border-wellness-taupe/20 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-wellness-taupe">
              {getTrackerTitle()}
            </CardTitle>
            <div className="flex items-center justify-center gap-4 pt-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto border-wellness-taupe/30"
              />
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="border-wellness-taupe/30"
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/summary")}
                className="border-wellness-taupe/30"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/bookings")}
                className="border-wellness-taupe/30"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Services
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/content")}
                className="border-wellness-taupe/30"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Library
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/insights")}
                className="border-wellness-taupe/30"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Insights
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/settings")}
                className="border-wellness-taupe/30"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-wellness-taupe/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Cycle Phase Check-In - Only show for menstrual cycle life stage */}
        {lifeStage === 'menstrual_cycle' && (
          <Card className="mb-6 border-wellness-sage/20">
            <CardHeader>
              <CardTitle className="text-xl text-wellness-taupe">1. Cycle Phase Check-In</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is here to help you understand your body, not to track perfection. 
                Choose whatever feels right for you today.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {showCycleHelper ? (
                <CyclePhaseHelper
                  onPhaseSelected={(phase) => {
                    setCyclePhase(phase);
                    setShowCycleHelper(false);
                  }}
                  onCancel={() => setShowCycleHelper(false)}
                />
              ) : (
                <>
                  <div>
                    <Label className="text-wellness-taupe">How does your body feel today?</Label>
                    <Select value={cyclePhase} onValueChange={(value) => {
                      if (value === "not_sure") {
                        setShowCycleHelper(true);
                      } else {
                        setCyclePhase(value);
                      }
                    }}>
                      <SelectTrigger className="mt-2 border-wellness-sage/30">
                        <SelectValue placeholder="Select your current phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Menstrual">Menstrual — resting & releasing</SelectItem>
                        <SelectItem value="Follicular">Follicular — energy building</SelectItem>
                        <SelectItem value="Ovulatory">Ovulatory — vibrant & expressive</SelectItem>
                        <SelectItem value="Luteal">Luteal — winding down</SelectItem>
                        <SelectItem value="not_sure" className="text-wellness-sage font-medium">
                          I'm not sure — help me find out
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {cyclePhase && (
                    <div className="space-y-4">
                      <div className="p-4 bg-wellness-sage/10 rounded-lg border border-wellness-sage/20">
                        <p className="text-sm text-wellness-taupe/90 leading-relaxed">
                          {cyclePhase === "Menstrual" && "A sacred time for rest and gentle self-care. Your body is doing important work — honour what it needs."}
                          {cyclePhase === "Follicular" && "Energy is often building during this phase. A lovely time for fresh ideas and gentle momentum."}
                          {cyclePhase === "Ovulatory" && "You may notice feeling more vibrant and connected. A beautiful time for expression and creativity."}
                          {cyclePhase === "Luteal" && "Energy naturally winds down now. Focus on nourishing yourself and preparing for renewal."}
                        </p>
                      </div>
                      
                      <CyclePhaseEducation selectedPhase={cyclePhase} lifeStage={lifeStage} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Trimester - Only show for pregnancy life stage */}
        {lifeStage === 'pregnancy' && (
          <Card className="mb-6 bg-wellness-lilac/10 border-wellness-lilac/20">
            <CardHeader>
              <CardTitle className="text-xl text-wellness-taupe">1. Your Pregnancy Journey</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is here to support you through this beautiful journey, not to add pressure.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Trimester:</Label>
                <Select value={trimester} onValueChange={setTrimester}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Trimester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Trimester 1 (Weeks 1-13)</SelectItem>
                    <SelectItem value="2">Trimester 2 (Weeks 14-27)</SelectItem>
                    <SelectItem value="3">Trimester 3 (Weeks 28-40)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Educational section */}
              {trimester && <PregnancyEducation trimester={trimester} />}
            </CardContent>
          </Card>
        )}

        {/* Pregnancy Tracking - Only show for pregnancy life stage */}
        {lifeStage === 'pregnancy' && (
          <Card className="mb-6 bg-wellness-pink/20 border-wellness-taupe/30">
            <CardHeader>
              <CardTitle className="text-xl">2. Pregnancy Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your daily symptoms and how you're feeling
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nausea Level:</Label>
                <Select value={pregnancyNausea} onValueChange={setPregnancyNausea}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fatigue Level:</Label>
                <Select value={pregnancyFatigue} onValueChange={setPregnancyFatigue}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Feeling energetic</SelectItem>
                    <SelectItem value="moderate">Moderate - Managing well</SelectItem>
                    <SelectItem value="high">High - Very tired</SelectItem>
                    <SelectItem value="extreme">Extreme - Need extra rest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sleep Quality:</Label>
                <Select value={pregnancySleep} onValueChange={setPregnancySleep}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mood:</Label>
                <Select value={pregnancyMood} onValueChange={setPregnancyMood}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy & Positive</SelectItem>
                    <SelectItem value="content">Content & Calm</SelectItem>
                    <SelectItem value="anxious">Anxious or Worried</SelectItem>
                    <SelectItem value="emotional">Emotional or Tearful</SelectItem>
                    <SelectItem value="irritable">Irritable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Back Pain:</Label>
                <Select value={pregnancyBackPain} onValueChange={setPregnancyBackPain}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Digestion/Bloating:</Label>
                <Select value={pregnancyDigestion} onValueChange={setPregnancyDigestion}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How's your digestion?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good - No issues</SelectItem>
                    <SelectItem value="slight_bloating">Slight bloating</SelectItem>
                    <SelectItem value="constipation">Constipation</SelectItem>
                    <SelectItem value="heartburn">Heartburn</SelectItem>
                    <SelectItem value="multiple">Multiple issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Baby Movement:</Label>
                <Select value={pregnancyBabyMovement} onValueChange={setPregnancyBabyMovement}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Any movement today?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_yet">Not felt yet (early pregnancy)</SelectItem>
                    <SelectItem value="light">Light flutters</SelectItem>
                    <SelectItem value="moderate">Moderate movement</SelectItem>
                    <SelectItem value="active">Very active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes:</Label>
                <Textarea
                  value={pregnancyNotes}
                  onChange={(e) => setPregnancyNotes(e.target.value)}
                  placeholder="Any other symptoms, concerns, or notes about how you're feeling today..."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={saveData}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    saveData();
                    navigate('/');
                  }}
                  className="flex-1"
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Postpartum Tracking - Only show for postpartum life stage */}
        {lifeStage === 'postpartum' && (
          <Card className="mb-6 bg-wellness-sage/10 border-wellness-sage/20">
            <CardHeader>
              <CardTitle className="text-xl text-wellness-taupe">1. Your Postpartum Recovery</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is here to support your healing, not to track perfection. 
                You are doing an amazing job.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Educational section */}
              <PostpartumEducation />
              <div>
                <Label>Sleep Quality:</Label>
                <Select value={postpartumSleep} onValueChange={setPostpartumSleep}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How did you sleep?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Poor - Very interrupted</SelectItem>
                    <SelectItem value="fair">Fair - Some sleep</SelectItem>
                    <SelectItem value="good">Good - Decent rest</SelectItem>
                    <SelectItem value="excellent">Excellent - Well rested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mood:</Label>
                <Select value={postpartumMood} onValueChange={setPostpartumMood}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How are you feeling emotionally?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive & Happy</SelectItem>
                    <SelectItem value="content">Content & Calm</SelectItem>
                    <SelectItem value="overwhelmed">Overwhelmed</SelectItem>
                    <SelectItem value="anxious">Anxious or Worried</SelectItem>
                    <SelectItem value="tearful">Tearful or Sad</SelectItem>
                    <SelectItem value="struggling">Really struggling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Energy Level:</Label>
                <Select value={postpartumEnergy} onValueChange={setPostpartumEnergy}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How's your energy?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very_low">Very Low - Exhausted</SelectItem>
                    <SelectItem value="low">Low - Need more rest</SelectItem>
                    <SelectItem value="moderate">Moderate - Managing</SelectItem>
                    <SelectItem value="good">Good - Feeling better</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Pain/Discomfort:</Label>
                <Select value={postpartumPain} onValueChange={setPostpartumPain}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Any pain or discomfort?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild - Manageable</SelectItem>
                    <SelectItem value="moderate">Moderate - Some concern</SelectItem>
                    <SelectItem value="severe">Severe - Need support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Feeding Method:</Label>
                <Select value={postpartumFeeding} onValueChange={setPostpartumFeeding}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How are you feeding baby?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breastfeeding">Breastfeeding</SelectItem>
                    <SelectItem value="pumping">Pumping</SelectItem>
                    <SelectItem value="formula">Formula feeding</SelectItem>
                    <SelectItem value="combination">Combination</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes:</Label>
                <Textarea
                  value={postpartumNotes}
                  onChange={(e) => setPostpartumNotes(e.target.value)}
                  placeholder="Any other notes about your recovery, concerns, or how you're feeling today..."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={saveData}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    saveData();
                    navigate('/');
                  }}
                  className="flex-1"
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menopause Tracking - Only show for perimenopause, menopause, and post-menopause */}
        {(lifeStage === 'perimenopause' || lifeStage === 'menopause' || lifeStage === 'post_menopause') && (
          <Card className="mb-6 bg-wellness-lilac/20 border-wellness-lilac/30">
            <CardHeader>
              <CardTitle className="text-xl text-wellness-taupe">1. Your Wellness Check-In</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is here to help you understand your body, not to track perfection. 
                Notice what feels true for you today.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Educational expandable section */}
              <MenopauseEducation lifeStage={lifeStage as 'perimenopause' | 'menopause' | 'post_menopause'} />
              
              {/* Body Changing Education - Deep dive into transition phases */}
              <BodyChangingEducation />
              
              <div>
                <Label>Hot Flashes:</Label>
                <Select value={menopauseHotFlashes} onValueChange={setMenopauseHotFlashes}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Frequency today?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild - 1-2 times</SelectItem>
                    <SelectItem value="moderate">Moderate - 3-5 times</SelectItem>
                    <SelectItem value="severe">Severe - 6+ times</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Night Sweats:</Label>
                <Select value={menopauseNightSweats} onValueChange={setMenopauseNightSweats}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Did you experience night sweats?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild - Slightly uncomfortable</SelectItem>
                    <SelectItem value="moderate">Moderate - Woke up once</SelectItem>
                    <SelectItem value="severe">Severe - Multiple times/changed sheets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mood:</Label>
                <Select value={menopauseMood} onValueChange={setMenopauseMood}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How's your mood today?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stable">Stable & Positive</SelectItem>
                    <SelectItem value="content">Content & Calm</SelectItem>
                    <SelectItem value="irritable">Irritable or Short-tempered</SelectItem>
                    <SelectItem value="anxious">Anxious or Worried</SelectItem>
                    <SelectItem value="low">Low or Down</SelectItem>
                    <SelectItem value="fluctuating">Fluctuating throughout day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Brain Fog:</Label>
                <Select value={menopauseBrainFog} onValueChange={setMenopauseBrainFog}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Mental clarity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">Clear - Sharp focus</SelectItem>
                    <SelectItem value="mild">Mild - Slight forgetfulness</SelectItem>
                    <SelectItem value="moderate">Moderate - Difficulty concentrating</SelectItem>
                    <SelectItem value="severe">Severe - Hard to focus/remember</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Energy Level:</Label>
                <Select value={menopauseEnergy} onValueChange={setMenopauseEnergy}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How's your energy?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High - Feeling energetic</SelectItem>
                    <SelectItem value="moderate">Moderate - Steady energy</SelectItem>
                    <SelectItem value="low">Low - Feeling tired</SelectItem>
                    <SelectItem value="depleted">Depleted - Very fatigued</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sleep Quality:</Label>
                <Select value={menopauseSleep} onValueChange={setMenopauseSleep}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How did you sleep?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent - Restful sleep</SelectItem>
                    <SelectItem value="good">Good - Slept well</SelectItem>
                    <SelectItem value="fair">Fair - Some interruptions</SelectItem>
                    <SelectItem value="poor">Poor - Restless/difficult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Joint Pain:</Label>
                <Select value={menopauseJointPain} onValueChange={setMenopauseJointPain}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Any joint pain?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild - Slight stiffness</SelectItem>
                    <SelectItem value="moderate">Moderate - Noticeable discomfort</SelectItem>
                    <SelectItem value="severe">Severe - Limiting movement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Digestion/Bloating:</Label>
                <Select value={menopauseDigestion} onValueChange={setMenopauseDigestion}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How's your digestion?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good - No issues</SelectItem>
                    <SelectItem value="bloating">Bloating</SelectItem>
                    <SelectItem value="constipation">Constipation</SelectItem>
                    <SelectItem value="sensitive">Sensitive stomach</SelectItem>
                    <SelectItem value="multiple">Multiple issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={saveData}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    saveData();
                    navigate('/');
                  }}
                  className="flex-1"
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Red Day Protocol */}
        {isMenstrual && lifeStage === 'menstrual_cycle' && (
          <Card className="mb-6 bg-wellness-pink/30 border-wellness-taupe/30">
            <CardHeader>
              <CardTitle className="text-xl">Sacred Day 1 Protocol (Maximum Rest)</CardTitle>
              <p className="text-sm text-red-700 font-medium">
                Vata is highest now. Your only job is **warmth and rest**.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Pain/Cramp Level (1-10):</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(e.target.value)}
                  placeholder="Record physical intensity"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Emotional Grief/Sadness Score (1-10):</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={emotionalScore}
                  onChange={(e) => setEmotionalScore(e.target.value)}
                  placeholder="Record emotional intensity"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Spiritual Anchor Today:</Label>
                <Select value={spiritualAnchor} onValueChange={setSpiritualAnchor}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Istighfar">Istighfar (Seeking Forgiveness)</SelectItem>
                    <SelectItem value="Tawakkul-Dhikr">Tawakkul Dhikr (Ya Rahman, Ya Raheem)</SelectItem>
                    <SelectItem value="None-Quiet">None, quiet reflection only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={saveData}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    saveData();
                    navigate('/');
                  }}
                  className="flex-1"
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Rhythm Section - Show for all life stages */}
        <Card className="mb-6 bg-gradient-to-br from-wellness-lilac/5 to-wellness-sage/5 border-wellness-lilac/15">
          <CardHeader>
            <CardTitle className="text-xl text-wellness-taupe flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-wellness-lilac" />
              Daily Rhythm
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ayurvedic wisdom for flowing with your body's natural rhythms throughout the day.
            </p>
          </CardHeader>
          <CardContent>
            <DailyRhythm lifeStage={lifeStage} />
          </CardContent>
        </Card>

        {/* Daily Practices - Show for menstrual cycle tracking */}
        {lifeStage === 'menstrual_cycle' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">2. Daily Dinacharya & Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getAdjustedPractices().map((practice) => (
                <div key={practice.id} className="flex items-start gap-4 p-3 bg-wellness-warm/50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">{practice.label}</Label>
                    <div className="flex gap-2 mt-2">
                      {practice.type === 'checkbox' && (
                        <input
                          type="checkbox"
                          checked={practices[practice.id]?.status || false}
                          onChange={(e) => setPractices({
                            ...practices,
                            [practice.id]: { ...practices[practice.id], status: e.target.checked }
                          })}
                          className="w-5 h-5"
                        />
                      )}
                      {(practice.type === 'time' || practice.type === 'checkbox') && (
                        <Input
                          type="time"
                          value={practices[practice.id]?.detail || ''}
                          onChange={(e) => setPractices({
                            ...practices,
                            [practice.id]: { ...practices[practice.id], detail: e.target.value }
                          })}
                          className="w-32 text-xs"
                        />
                      )}
                      {practice.type === 'number' && (
                        <Input
                          type="number"
                          value={practices[practice.id]?.detail || ''}
                          onChange={(e) => setPractices({
                            ...practices,
                            [practice.id]: { ...practices[practice.id], detail: e.target.value }
                          })}
                          placeholder="Hours"
                          className="w-24 text-xs"
                        />
                      )}
                      {practice.type === 'text' && (
                        <Input
                          type="text"
                          value={practices[practice.id]?.detail || ''}
                          onChange={(e) => setPractices({
                            ...practices,
                            [practice.id]: { ...practices[practice.id], detail: e.target.value }
                          })}
                          placeholder="Details"
                          className="flex-1 text-xs"
                        />
                      )}
                      <Input
                        type="text"
                        value={practices[practice.id]?.notes || ''}
                        onChange={(e) => setPractices({
                          ...practices,
                          [practice.id]: { ...practices[practice.id], notes: e.target.value }
                        })}
                        placeholder="Feeling Check"
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Symptom & Tweak Log - Show for menstrual cycle tracking */}
        {lifeStage === 'menstrual_cycle' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">3. Symptom & Tweak Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Emotional State (Anxiety, Calm, Irritable):</Label>
              <Textarea
                value={emotionalState}
                onChange={(e) => setEmotionalState(e.target.value)}
                placeholder="Describe your dominant feelings"
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label>Physical Symptoms (Dry skin, bloat, heat, pain):</Label>
              <Textarea
                value={physicalSymptoms}
                onChange={(e) => setPhysicalSymptoms(e.target.value)}
                placeholder="Record physical signs of Vata/Pitta imbalance"
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label>Did the 'Vata Crash' Occur?</Label>
              <Select value={vataCrash} onValueChange={setVataCrash}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Mild">Mild</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tweak Plan (What to change next week):</Label>
              <Textarea
                value={tweakPlan}
                onChange={(e) => setTweakPlan(e.target.value)}
                placeholder="What worked? What needs adjustment?"
                className="mt-2"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
        )}

        {/* Monthly Reflection - Show for menstrual cycle tracking */}
        {lifeStage === 'menstrual_cycle' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">4. Monthly Reflection</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={monthlyReflection}
              onChange={(e) => setMonthlyReflection(e.target.value)}
              placeholder="* What was the most successful Vata-pacifying action this month? * Which phase was the most challenging? * What is ONE new Dinacharya item to add next month?"
              rows={4}
            />
          </CardContent>
        </Card>
        )}

        {/* Companion Disclaimer */}
        <AppCompanionDisclaimer variant="subtle" className="mt-8 mb-24 text-center" />

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-2xl p-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              onClick={saveData}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Today's Data
            </Button>
            <Button
              onClick={clearData}
              variant="destructive"
              className="w-1/4"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>
      
      {/* Support Plan Modal */}
      {user && (
        <SupportPlanModal
          open={showSupportPlan}
          onOpenChange={setShowSupportPlan}
          userId={user.id}
          entryDate={selectedDate}
          lifeStage={lifeStage}
          symptoms={[emotionalState, physicalSymptoms, vataCrash].filter(Boolean)}
          dosha={userDosha}
        />
      )}
    </div>
  );
}
