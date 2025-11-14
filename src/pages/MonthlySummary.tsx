import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";

interface WellnessEntry {
  id: string;
  entry_date: string;
  cycle_phase: string | null;
  emotional_state: string | null;
  pain_level: number | null;
  emotional_score: number | null;
  vata_crash: string | null;
  daily_practices: any;
  yoga_practice: any;
  nutrition_log: any;
  spiritual_practices: any;
}

const COLORS = ['#8B7355', '#D4A574', '#E8C4A0', '#F5E6D3', '#C9A68A'];

export default function MonthlySummary() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WellnessEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const summaryRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadMonthlyData();
    }
  }, [user, selectedMonth]);

  const loadMonthlyData = async () => {
    if (!user) return;
    
    const monthStart = format(startOfMonth(parseISO(selectedMonth + '-01')), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(parseISO(selectedMonth + '-01')), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', monthStart)
      .lte('entry_date', monthEnd)
      .order('entry_date', { ascending: true });
    
    if (error) {
      console.error('Error loading monthly data:', error);
      toast.error('Failed to load monthly data');
      return;
    }
    
    setEntries(data || []);
  };

  const getCycleDistribution = () => {
    const distribution: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.cycle_phase) {
        distribution[entry.cycle_phase] = (distribution[entry.cycle_phase] || 0) + 1;
      }
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getMoodTrendData = () => {
    return entries
      .filter(entry => entry.emotional_score !== null)
      .map(entry => ({
        date: format(parseISO(entry.entry_date), 'MMM dd'),
        mood: entry.emotional_score,
        pain: entry.pain_level || 0,
      }));
  };

  const getPracticeConsistency = () => {
    const practices: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.daily_practices) {
        Object.entries(entry.daily_practices).forEach(([key, value]: [string, any]) => {
          if (value?.status) {
            practices[key] = (practices[key] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(practices).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      completed: count,
      total: entries.length,
      percentage: Math.round((count / entries.length) * 100),
    }));
  };

  const getYogaStats = () => {
    const styles: Record<string, number> = {};
    let totalMinutes = 0;
    let sessionsCount = 0;

    entries.forEach(entry => {
      if (entry.yoga_practice?.style && entry.yoga_practice.style !== 'None') {
        styles[entry.yoga_practice.style] = (styles[entry.yoga_practice.style] || 0) + 1;
        sessionsCount++;
        if (entry.yoga_practice.duration_minutes) {
          totalMinutes += entry.yoga_practice.duration_minutes;
        }
      }
    });

    return {
      styles: Object.entries(styles).map(([name, value]) => ({ name, value })),
      totalMinutes,
      sessionsCount,
      avgMinutes: sessionsCount > 0 ? Math.round(totalMinutes / sessionsCount) : 0,
    };
  };

  const getNutritionStats = () => {
    let totalMeals = 0;
    entries.forEach(entry => {
      if (entry.nutrition_log?.meals) {
        totalMeals += entry.nutrition_log.meals.length;
      }
    });
    return {
      totalMeals,
      avgMealsPerDay: entries.length > 0 ? (totalMeals / entries.length).toFixed(1) : 0,
      trackedDays: entries.filter(e => e.nutrition_log?.meals?.length > 0).length,
    };
  };

  const getSpiritualStats = () => {
    let prayerCounts = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
    let totalMeditation = 0;
    let meditationDays = 0;

    entries.forEach(entry => {
      if (entry.spiritual_practices) {
        Object.keys(prayerCounts).forEach(prayer => {
          if (entry.spiritual_practices[prayer]) {
            prayerCounts[prayer as keyof typeof prayerCounts]++;
          }
        });
        if (entry.spiritual_practices.meditation_minutes) {
          totalMeditation += entry.spiritual_practices.meditation_minutes;
          meditationDays++;
        }
      }
    });

    return {
      prayerCounts,
      totalMeditation,
      avgMeditation: meditationDays > 0 ? Math.round(totalMeditation / meditationDays) : 0,
      prayerData: Object.entries(prayerCounts).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        completed: count,
        total: entries.length,
        percentage: Math.round((count / entries.length) * 100),
      })),
    };
  };

  const getVataCrashData = () => {
    const crashes: Record<string, number> = { No: 0, Mild: 0, Severe: 0 };
    entries.forEach(entry => {
      if (entry.vata_crash) {
        crashes[entry.vata_crash] = (crashes[entry.vata_crash] || 0) + 1;
      }
    });
    return Object.entries(crashes).map(([name, value]) => ({ name, value }));
  };

  const exportToPDF = async () => {
    if (!summaryRef.current) return;
    
    toast.info('Generating PDF...');
    
    try {
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`wellness-summary-${selectedMonth}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const cycleData = getCycleDistribution();
  const moodTrend = getMoodTrendData();
  const practiceConsistency = getPracticeConsistency();
  const yogaStats = getYogaStats();
  const nutritionStats = getNutritionStats();
  const spiritualStats = getSpiritualStats();
  const vataCrashData = getVataCrashData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wellness-beige">
        <div className="text-wellness-taupe text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wellness-beige">
      <div className="max-w-6xl mx-auto p-4 pb-8">
        {/* Header */}
        <Card className="mb-6 bg-wellness-warm border-wellness-taupe/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="text-wellness-taupe"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tracker
                </Button>
                <CardTitle className="text-2xl font-bold text-wellness-taupe">
                  Monthly Wellness Summary
                </CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-wellness-taupe" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - i);
                      const value = format(date, 'yyyy-MM');
                      const label = format(date, 'MMMM yyyy');
                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button onClick={exportToPDF} className="bg-wellness-taupe hover:bg-wellness-taupe/90">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No data recorded for {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}</p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Start Tracking
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div ref={summaryRef} className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Days Tracked</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-wellness-taupe">{entries.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Yoga Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-wellness-taupe">{yogaStats.sessionsCount}</p>
                  <p className="text-sm text-muted-foreground">{yogaStats.totalMinutes} min total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Meals Logged</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-wellness-taupe">{nutritionStats.totalMeals}</p>
                  <p className="text-sm text-muted-foreground">Avg {nutritionStats.avgMealsPerDay}/day</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Meditation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-wellness-taupe">{spiritualStats.totalMeditation} min</p>
                  <p className="text-sm text-muted-foreground">Avg {spiritualStats.avgMeditation} min/session</p>
                </CardContent>
              </Card>
            </div>

            {/* Cycle Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Cycle Phase Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cycleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {cycleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Mood & Pain Trend */}
            {moodTrend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mood & Pain Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={moodTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="mood" stroke="#8B7355" name="Emotional Score" strokeWidth={2} />
                      <Line type="monotone" dataKey="pain" stroke="#D4A574" name="Pain Level" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Practice Consistency */}
            {practiceConsistency.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Practice Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={practiceConsistency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="percentage" fill="#8B7355" name="Completion %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Yoga Style Distribution */}
            {yogaStats.styles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Yoga Style Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={yogaStats.styles}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#D4A574" name="Sessions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Spiritual Practice - Prayer Consistency */}
            {spiritualStats.prayerData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prayer Consistency (Salah)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={spiritualStats.prayerData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="percentage" fill="#8B7355" name="Completion %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Vata Crash Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Vata Crash Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vataCrashData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vataCrashData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Insights Summary */}
            <Card className="bg-wellness-pink/20">
              <CardHeader>
                <CardTitle>Key Insights for {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>✨ You tracked <strong>{entries.length} days</strong> this month</p>
                  {yogaStats.sessionsCount > 0 && (
                    <p>🧘 Completed <strong>{yogaStats.sessionsCount} yoga sessions</strong> ({yogaStats.avgMinutes} min avg)</p>
                  )}
                  {nutritionStats.trackedDays > 0 && (
                    <p>🍽️ Logged nutrition for <strong>{nutritionStats.trackedDays} days</strong></p>
                  )}
                  {spiritualStats.totalMeditation > 0 && (
                    <p>🙏 Practiced <strong>{spiritualStats.totalMeditation} minutes</strong> of meditation</p>
                  )}
                  {practiceConsistency.length > 0 && (
                    <p>
                      📈 Most consistent practice: <strong>{practiceConsistency.sort((a, b) => b.percentage - a.percentage)[0]?.name}</strong> ({practiceConsistency[0]?.percentage}%)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}