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
import { LogOut, Save, Trash2, UserCog } from "lucide-react";

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
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking onboarding:', error);
      return;
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
      setPainLevel(data.pain_level?.toString() || '');
      setEmotionalScore(data.emotional_score?.toString() || '');
      setSpiritualAnchor(data.spiritual_anchor || 'Istighfar');
      setEmotionalState(data.emotional_state || '');
      setPhysicalSymptoms(data.physical_symptoms || '');
      setVataCrash(data.vata_crash || 'No');
      setTweakPlan(data.tweak_plan || '');
      setMonthlyReflection(data.monthly_reflection || '');
      setPractices(typeof data.daily_practices === 'object' && data.daily_practices !== null ? data.daily_practices as Record<string, any> : {});
    } else {
      // Reset form for new date
      setCyclePhase('');
      setPainLevel('');
      setEmotionalScore('');
      setSpiritualAnchor('Istighfar');
      setEmotionalState('');
      setPhysicalSymptoms('');
      setVataCrash('No');
      setTweakPlan('');
      setPractices({});
    }
  };

  const saveData = async () => {
    if (!user) return;
    
    try {
      const entryData = {
        user_id: user.id,
        entry_date: selectedDate,
        cycle_phase: cyclePhase,
        pain_level: painLevel ? parseInt(painLevel) : null,
        emotional_score: emotionalScore ? parseInt(emotionalScore) : null,
        spiritual_anchor: spiritualAnchor,
        emotional_state: emotionalState,
        physical_symptoms: physicalSymptoms,
        vata_crash: vataCrash,
        tweak_plan: tweakPlan,
        monthly_reflection: monthlyReflection,
        daily_practices: practices,
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
                onClick={handleLogout}
                className="border-wellness-taupe/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Cycle Phase */}
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

        {/* Red Day Protocol */}
        {isMenstrual && (
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
