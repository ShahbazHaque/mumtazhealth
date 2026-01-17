import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, subMonths } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Calendar, Heart, Sparkles, Moon, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const feelingEmojis: Record<string, string> = {
  tired: "😴",
  pain: "😣",
  exhausted: "😩",
  hormonal: "🌙",
  emotional: "💧",
  restless: "🦋",
  bloated: "🎈",
  "cant-sleep": "🌃",
  "hot-flushes": "🔥",
  digestive: "🍵",
  "back-ache": "🧘",
  "neck-shoulder": "💆",
};

const feelingColors: Record<string, string> = {
  tired: "hsl(var(--mumtaz-lilac))",
  pain: "hsl(var(--destructive))",
  exhausted: "hsl(var(--mumtaz-plum))",
  hormonal: "hsl(var(--mumtaz-sage))",
  emotional: "hsl(var(--primary))",
  restless: "hsl(var(--accent))",
  bloated: "hsl(var(--mumtaz-sand))",
  "cant-sleep": "hsl(var(--muted-foreground))",
  "hot-flushes": "hsl(var(--destructive))",
  digestive: "hsl(var(--mumtaz-sage))",
  "back-ache": "hsl(var(--mumtaz-lilac))",
  "neck-shoulder": "hsl(var(--primary))",
};

const cyclePhaseLabels: Record<string, string> = {
  menstrual: "Menstrual Phase",
  follicular: "Follicular Phase",
  ovulatory: "Ovulatory Phase",
  luteal: "Luteal Phase",
};

const lifeStageLabels: Record<string, string> = {
  menstrual: "Menstrual",
  menstrual_cycle: "Regular Menstrual Cycle",
  cycle_changes: "Cycle Changes / Hormonal Shifts",
  fertility: "Fertility Journey",
  pregnancy: "Pregnancy",
  postpartum: "Postpartum",
  perimenopause: "Perimenopause",
  peri_menopause_transition: "Peri → Menopause Transition",
  menopause: "Menopause",
  post_menopause: "Post-Menopause",
  not_sure: "Exploring",
};

// Educational insights explaining why feelings are common during specific phases
const cyclePhaseInsights: Record<string, Record<string, string>> = {
  menstrual: {
    tired: "Fatigue is common as your body sheds the uterine lining and iron levels may dip.",
    pain: "Prostaglandins cause uterine contractions, leading to cramps and discomfort.",
    exhausted: "Low estrogen and progesterone during menstruation can leave you feeling drained.",
    emotional: "Hormone levels are at their lowest, which can affect mood regulation.",
    bloated: "Water retention from hormonal shifts often causes bloating during your period.",
    "back-ache": "Prostaglandins can cause referred pain in the lower back during menstruation.",
  },
  follicular: {
    restless: "Rising estrogen can boost energy but may also cause restlessness.",
    emotional: "Estrogen fluctuations as your body prepares for ovulation can affect mood.",
    "cant-sleep": "Increasing hormones may temporarily disrupt your sleep pattern.",
  },
  ovulatory: {
    hormonal: "Estrogen peaks and LH surges during ovulation, causing hormonal sensitivity.",
    bloated: "Some women experience mild bloating around ovulation due to fluid retention.",
    pain: "Mittelschmerz — mild ovulation pain — affects about 20% of women.",
  },
  luteal: {
    tired: "Progesterone rises significantly, naturally causing fatigue and sleepiness.",
    exhausted: "Your body is working hard to prepare the uterine lining, using extra energy.",
    hormonal: "The dramatic hormone shifts in the luteal phase trigger PMS symptoms.",
    emotional: "Progesterone and estrogen fluctuations can intensify emotional responses.",
    bloated: "Progesterone causes water retention and digestive slowdown.",
    "cant-sleep": "Despite feeling tired, progesterone can paradoxically disrupt sleep quality.",
    pain: "Breast tenderness and headaches are common as hormones shift.",
    "back-ache": "Hormonal changes can increase muscle tension and lower back discomfort.",
    digestive: "Progesterone slows digestion, often causing constipation or discomfort.",
  },
};

interface CheckInLog {
  id: string;
  feeling_id: string;
  feeling_label: string;
  created_at: string;
}

interface FeelingCount {
  feeling_id: string;
  feeling_label: string;
  count: number;
}

interface Correlation {
  phase: string;
  phaseLabel: string;
  feelings: { feeling_id: string; feeling_label: string; count: number }[];
  total: number;
}

interface TrendData {
  feeling_id: string;
  feeling_label: string;
  currentCount: number;
  previousCount: number;
  trend: "up" | "down" | "same";
  percentChange: number;
}

export function FeelingPatterns() {
  const [logs, setLogs] = useState<CheckInLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [topFeelings, setTopFeelings] = useState<FeelingCount[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number }[]>([]);
  const [cycleCorrelations, setCycleCorrelations] = useState<Correlation[]>([]);
  const [lifeStage, setLifeStage] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch last 60 days for trend comparison (current month vs previous month)
      const sixtyDaysAgo = subDays(new Date(), 60).toISOString();
      
      // Fetch check-ins, wellness entries, and user profile in parallel
      const [checkInsResult, entriesResult, profileResult] = await Promise.all([
        supabase
          .from("quick_checkin_logs")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", sixtyDaysAgo)
          .order("created_at", { ascending: false }),
        supabase
          .from("wellness_entries")
          .select("entry_date, cycle_phase")
          .eq("user_id", user.id)
          .gte("entry_date", format(subDays(new Date(), 60), "yyyy-MM-dd")),
        supabase
          .from("user_wellness_profiles")
          .select("life_stage")
          .eq("user_id", user.id)
          .single()
      ]);

      if (checkInsResult.error) throw checkInsResult.error;

      const allCheckIns = checkInsResult.data || [];
      const entries = entriesResult.data || [];
      const profile = profileResult.data;

      // Split into current month and previous month
      const thirtyDaysAgo = subDays(new Date(), 30);
      const currentMonthCheckIns = allCheckIns.filter(c => new Date(c.created_at) >= thirtyDaysAgo);
      const previousMonthCheckIns = allCheckIns.filter(c => new Date(c.created_at) < thirtyDaysAgo);

      setLogs(currentMonthCheckIns);
      setLifeStage(profile?.life_stage || null);
      calculatePatterns(currentMonthCheckIns);
      calculateCorrelations(currentMonthCheckIns, entries);
      calculateTrends(currentMonthCheckIns, previousMonthCheckIns);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrends = (currentLogs: CheckInLog[], previousLogs: CheckInLog[]) => {
    // Count current month feelings
    const currentCounts: Record<string, { feeling_id: string; feeling_label: string; count: number }> = {};
    currentLogs.forEach(log => {
      if (!currentCounts[log.feeling_id]) {
        currentCounts[log.feeling_id] = { feeling_id: log.feeling_id, feeling_label: log.feeling_label, count: 0 };
      }
      currentCounts[log.feeling_id].count++;
    });

    // Count previous month feelings
    const previousCounts: Record<string, number> = {};
    previousLogs.forEach(log => {
      previousCounts[log.feeling_id] = (previousCounts[log.feeling_id] || 0) + 1;
    });

    // Calculate trends
    const trends: TrendData[] = Object.values(currentCounts)
      .map(current => {
        const prevCount = previousCounts[current.feeling_id] || 0;
        const diff = current.count - prevCount;
        const percentChange = prevCount > 0 ? Math.round((diff / prevCount) * 100) : (current.count > 0 ? 100 : 0);
        
        let trend: "up" | "down" | "same" = "same";
        if (diff > 0) trend = "up";
        else if (diff < 0) trend = "down";

        return {
          feeling_id: current.feeling_id,
          feeling_label: current.feeling_label,
          currentCount: current.count,
          previousCount: prevCount,
          trend,
          percentChange: Math.abs(percentChange),
        };
      })
      .filter(t => t.currentCount >= 2 || t.previousCount >= 2) // Only show meaningful trends
      .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
      .slice(0, 5);

    setTrendData(trends);
  };

  const calculateCorrelations = (checkIns: CheckInLog[], entries: { entry_date: string; cycle_phase: string | null }[]) => {
    // Create a map of dates to cycle phases
    const dateToPhase: Record<string, string> = {};
    entries.forEach(entry => {
      if (entry.cycle_phase) {
        dateToPhase[entry.entry_date] = entry.cycle_phase;
      }
    });

    // Group check-ins by cycle phase
    const phaseGroups: Record<string, { feeling_id: string; feeling_label: string }[]> = {};
    
    checkIns.forEach(log => {
      const logDate = format(new Date(log.created_at), "yyyy-MM-dd");
      const phase = dateToPhase[logDate];
      
      if (phase) {
        if (!phaseGroups[phase]) {
          phaseGroups[phase] = [];
        }
        phaseGroups[phase].push({
          feeling_id: log.feeling_id,
          feeling_label: log.feeling_label
        });
      }
    });

    // Calculate correlations
    const correlations: Correlation[] = [];
    
    Object.entries(phaseGroups).forEach(([phase, feelings]) => {
      const feelingCounts: Record<string, { feeling_id: string; feeling_label: string; count: number }> = {};
      
      feelings.forEach(f => {
        if (!feelingCounts[f.feeling_id]) {
          feelingCounts[f.feeling_id] = { ...f, count: 0 };
        }
        feelingCounts[f.feeling_id].count++;
      });

      const sortedFeelings = Object.values(feelingCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      if (sortedFeelings.length > 0) {
        correlations.push({
          phase,
          phaseLabel: cyclePhaseLabels[phase] || phase,
          feelings: sortedFeelings,
          total: feelings.length
        });
      }
    });

    setCycleCorrelations(correlations.sort((a, b) => b.total - a.total));
  };

  const calculatePatterns = (data: CheckInLog[]) => {
    // Count feelings
    const feelingCounts: Record<string, FeelingCount> = {};
    data.forEach(log => {
      if (!feelingCounts[log.feeling_id]) {
        feelingCounts[log.feeling_id] = {
          feeling_id: log.feeling_id,
          feeling_label: log.feeling_label,
          count: 0
        };
      }
      feelingCounts[log.feeling_id].count++;
    });

    // Sort by count and take top 5
    const sorted = Object.values(feelingCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setTopFeelings(sorted);

    // Calculate weekly data (last 7 days)
    const weekData: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const count = data.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= dayStart && logDate <= dayEnd;
      }).length;

      weekData.push({
        day: format(date, "EEE"),
        count
      });
    }
    setWeeklyData(weekData);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-mumtaz-lilac/10 to-mumtaz-sage/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-mumtaz-lilac" />
            How You've Been Feeling
          </CardTitle>
          <CardDescription>
            Track your daily feelings to see patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No check-ins yet. Use the "How are you feeling?" feature on your dashboard to start tracking patterns.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-mumtaz-lilac/10 to-mumtaz-sage/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-mumtaz-lilac" />
          How You've Been Feeling
        </CardTitle>
        <CardDescription>
          Your check-in patterns from the last 30 days ({logs.length} check-ins)
          {lifeStage && (
            <span className="block mt-1">
              Life stage: <Badge variant="outline" className="ml-1">{lifeStageLabels[lifeStage] || lifeStage}</Badge>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cycle Phase Correlations with Educational Insights */}
        {cycleCorrelations.length > 0 && (
          <TooltipProvider>
            <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border/50">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Moon className="h-4 w-4 text-mumtaz-sage" />
                Feelings by Cycle Phase
              </h4>
              <p className="text-xs text-muted-foreground">
                Understanding how your cycle affects how you feel
              </p>
              <div className="space-y-4">
                {cycleCorrelations.map((correlation) => (
                  <div key={correlation.phase} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{correlation.phaseLabel}</span>
                      <Badge variant="secondary" className="text-xs">
                        {correlation.total} check-ins
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {correlation.feelings.map((feeling) => {
                        const insight = cyclePhaseInsights[correlation.phase]?.[feeling.feeling_id];
                        return (
                          <UITooltip key={feeling.feeling_id}>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="outline" 
                                className="text-xs cursor-help flex items-center gap-1"
                                style={{ 
                                  borderColor: feelingColors[feeling.feeling_id] || "hsl(var(--border))",
                                  backgroundColor: `${feelingColors[feeling.feeling_id]?.replace(')', '/0.1)') || 'transparent'}`
                                }}
                              >
                                {feelingEmojis[feeling.feeling_id] || "❓"} {feeling.feeling_label} ({feeling.count})
                                {insight && <Info className="h-3 w-3 ml-0.5 opacity-60" />}
                              </Badge>
                            </TooltipTrigger>
                            {insight && (
                              <TooltipContent className="max-w-xs text-xs p-3">
                                <p className="font-medium mb-1">Why this happens:</p>
                                <p>{insight}</p>
                              </TooltipContent>
                            )}
                          </UITooltip>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic mt-2">
                <Sparkles className="h-3 w-3 inline mr-1" />
                Hover over feelings with <Info className="h-3 w-3 inline" /> to learn why they're common
              </p>
            </div>
          </TooltipProvider>
        )}

        {/* Monthly Trends Comparison */}
        {trendData.length > 0 && (
          <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border/50">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-mumtaz-lilac" />
              Monthly Trends
            </h4>
            <p className="text-xs text-muted-foreground">
              Comparing this month to last month
            </p>
            <div className="space-y-2">
              {trendData.map((trend) => (
                <div 
                  key={trend.feeling_id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <span>{feelingEmojis[trend.feeling_id] || "❓"}</span>
                    <span className="text-sm">{trend.feeling_label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {trend.previousCount} → {trend.currentCount}
                    </span>
                    <Badge 
                      variant={trend.trend === "down" ? "default" : trend.trend === "up" ? "destructive" : "secondary"}
                      className="text-xs flex items-center gap-1"
                    >
                      {trend.trend === "up" && <TrendingUp className="h-3 w-3" />}
                      {trend.trend === "down" && <TrendingDown className="h-3 w-3" />}
                      {trend.trend === "same" && <Minus className="h-3 w-3" />}
                      {trend.percentChange > 0 && `${trend.percentChange}%`}
                      {trend.trend === "up" ? " more" : trend.trend === "down" ? " less" : "stable"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {trendData.some(t => t.trend === "down") 
                ? "💚 Some feelings are improving — your practices may be helping!"
                : "Keep tracking to see trends over time"}
            </p>
          </div>
        )}

        {/* Weekly Check-in Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            This Week's Check-ins
          </h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  formatter={(value) => [`${value} check-ins`, "Count"]}
                  contentStyle={{ 
                    borderRadius: 8, 
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))"
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count > 0 ? "hsl(var(--mumtaz-lilac))" : "hsl(var(--muted))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Feelings */}
        {topFeelings.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Most Common Feelings
            </h4>
            <div className="space-y-2">
              {topFeelings.map((feeling) => (
                <div 
                  key={feeling.feeling_id}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg">
                    {feelingEmojis[feeling.feeling_id] || "❓"}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{feeling.feeling_label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {feeling.count}x
                      </Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${(feeling.count / topFeelings[0].count) * 100}%`,
                          backgroundColor: feelingColors[feeling.feeling_id] || "hsl(var(--primary))"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Check-ins */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          <h4 className="text-sm font-medium text-foreground">
            Recent Check-ins
          </h4>
          <div className="flex flex-wrap gap-2">
            {logs.slice(0, 10).map((log) => (
              <Badge 
                key={log.id}
                variant="outline" 
                className="text-xs"
                title={format(new Date(log.created_at), "PPp")}
              >
                {feelingEmojis[log.feeling_id] || "❓"} {log.feeling_label}
              </Badge>
            ))}
          </div>
          {logs.length > 10 && (
            <p className="text-xs text-muted-foreground">
              +{logs.length - 10} more check-ins this month
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
