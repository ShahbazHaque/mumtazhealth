import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Save, Trash2, UserCog, BarChart3, Plus, X, Calendar, BookOpen, Sparkles, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [cyclePhase, setCyclePhase] = useState('');
  const [isMenstrual, setIsMenstrual] = useState(false);
  const [lifeStage, setLifeStage] = useState<string>('');
  const [trimester, setTrimester] = useState<string>('');
  
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
  const [practices, setPractices] = useState<Record<string, any>>({});
  
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
  
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
      checkOnboarding();
      loadData();
    }
  }, [user, selectedDate]);

  const checkOnboarding = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_wellness_profiles')
      .select('onboarding_completed, life_stage')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking onboarding:', error);
      return;
    }
    
    // Set life stage if available
    if (data?.life_stage) {
      setLifeStage(data.life_stage);
    }
    
    // If no profile exists or onboarding not completed, redirect to onboarding
    if (!data || !data.onboarding_completed) {
      navigate('/onboarding');
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
      setPractices(typeof data.daily_practices === 'object' && data.daily_practices !== null ? data.daily_practices as Record<string, any> : {});
      
      // Load pregnancy tracking data
      const pregnancyData = typeof data.pregnancy_tracking === 'object' && data.pregnancy_tracking !== null ? data.pregnancy_tracking as Record<string, any> : {};
      setPregnancyNausea(pregnancyData.nausea || '');
      setPregnancyFatigue(pregnancyData.fatigue || '');
      setPregnancySleep(pregnancyData.sleep || '');
      setPregnancyMood(pregnancyData.mood || '');
      setPregnancyBackPain(pregnancyData.backPain || '');
      setPregnancyDigestion(pregnancyData.digestion || '');
      setPregnancyBabyMovement(pregnancyData.babyMovement || '');
      setPregnancyNotes(pregnancyData.notes || '');
      
      // Load postpartum tracking data
      const postpartumData = typeof data.postpartum_tracking === 'object' && data.postpartum_tracking !== null ? data.postpartum_tracking as Record<string, any> : {};
      setPostpartumSleep(postpartumData.sleep || '');
      setPostpartumMood(postpartumData.mood || '');
      setPostpartumEnergy(postpartumData.energy || '');
      setPostpartumPain(postpartumData.pain || '');
      setPostpartumFeeding(postpartumData.feeding || '');
      setPostpartumNotes(postpartumData.notes || '');
      
      // Load menopause tracking data
      const menopauseData = typeof data.menopause_tracking === 'object' && data.menopause_tracking !== null ? data.menopause_tracking as Record<string, any> : {};
      setMenopauseHotFlashes(menopauseData.hotFlashes || '');
      setMenopauseNightSweats(menopauseData.nightSweats || '');
      setMenopauseMood(menopauseData.mood || '');
      setMenopauseBrainFog(menopauseData.brainFog || '');
      setMenopauseEnergy(menopauseData.energy || '');
      setMenopauseSleep(menopauseData.sleep || '');
      setMenopauseJointPain(menopauseData.jointPain || '');
      setMenopauseDigestion(menopauseData.digestion || '');
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
    }
  };

  const saveData = async () => {
    if (!user) return;
    
    try {
      const entryData = {
        user_id: user.id,
        entry_date: selectedDate,
        cycle_phase: cyclePhase,
        trimester: trimester ? parseInt(trimester) : null,
        pain_level: painLevel ? parseInt(painLevel) : null,
        emotional_score: emotionalScore ? parseInt(emotionalScore) : null,
        spiritual_anchor: spiritualAnchor,
        emotional_state: emotionalState,
        physical_symptoms: physicalSymptoms,
        vata_crash: vataCrash,
        tweak_plan: tweakPlan,
        monthly_reflection: monthlyReflection,
        daily_practices: practices,
        pregnancy_tracking: {
          nausea: pregnancyNausea,
          fatigue: pregnancyFatigue,
          sleep: pregnancySleep,
          mood: pregnancyMood,
          backPain: pregnancyBackPain,
          digestion: pregnancyDigestion,
          babyMovement: pregnancyBabyMovement,
          notes: pregnancyNotes,
        },
        postpartum_tracking: {
          sleep: postpartumSleep,
          mood: postpartumMood,
          energy: postpartumEnergy,
          pain: postpartumPain,
          feeding: postpartumFeeding,
          notes: postpartumNotes,
        },
        menopause_tracking: {
          hotFlashes: menopauseHotFlashes,
          nightSweats: menopauseNightSweats,
          mood: menopauseMood,
          brainFog: menopauseBrainFog,
          energy: menopauseEnergy,
          sleep: menopauseSleep,
          jointPain: menopauseJointPain,
          digestion: menopauseDigestion,
        },
      };
      
      const { error } = await supabase
        .from('wellness_entries')
        .upsert(entryData, {
          onConflict: 'user_id,entry_date'
        });
      
      if (error) throw error;
      
      toast.success(`Progress saved for ${selectedDate}!`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wellness-beige">
        <div className="text-wellness-taupe text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wellness-beige">
      <div className="max-w-2xl mx-auto p-4 pb-32">
        {/* Header */}
        <Card className="mb-6 bg-wellness-warm border-wellness-taupe/20 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-wellness-taupe">
              Holistic Motherhood Tracker
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Vata-Pitta Balance for Fertility & Calm
            </p>
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

        {/* Cycle Phase - Only show for menstrual cycle life stage */}
        {lifeStage === 'menstrual_cycle' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">1. Cycle Phase Check</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Current Cycle Phase:</Label>
              <Select value={cyclePhase} onValueChange={setCyclePhase}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select Phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Menstrual">Menstrual (Days 1-5)</SelectItem>
                  <SelectItem value="Follicular">Follicular (Days 6-14)</SelectItem>
                  <SelectItem value="Ovulatory">Ovulatory (Days 14-16)</SelectItem>
                  <SelectItem value="Luteal">Luteal (Days 17-28)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Trimester - Only show for pregnancy life stage */}
        {lifeStage === 'pregnancy' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">1. Trimester</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {/* Postpartum Tracking - Only show for postpartum life stage */}
        {lifeStage === 'postpartum' && (
          <Card className="mb-6 bg-wellness-sage/20 border-wellness-taupe/30">
            <CardHeader>
              <CardTitle className="text-xl">1. Postpartum Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your recovery journey and daily well-being
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )}

        {/* Menopause Tracking - Only show for perimenopause, menopause, and post-menopause */}
        {(lifeStage === 'perimenopause' || lifeStage === 'menopause' || lifeStage === 'post_menopause') && (
          <Card className="mb-6 bg-wellness-lilac/20 border-wellness-taupe/30">
            <CardHeader>
              <CardTitle className="text-xl">1. Menopause Symptom Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your symptoms and how you're managing this transition
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )}

        {/* Daily Practices */}
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

        {/* Symptom & Tweak Log */}
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

        {/* Monthly Reflection */}
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

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-2xl p-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              onClick={saveData}
              className="flex-1 bg-wellness-taupe hover:bg-wellness-taupe/90"
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
    </div>
  );
}
