import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { TrendingUp, Calendar, Heart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

export function FeelingPatterns() {
  const [logs, setLogs] = useState<CheckInLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [topFeelings, setTopFeelings] = useState<FeelingCount[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number }[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch last 30 days of check-ins
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      const { data, error } = await supabase
        .from("quick_checkin_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setLogs(data);
        calculatePatterns(data);
      }
    } catch (error) {
      console.error("Error fetching check-in logs:", error);
    } finally {
      setLoading(false);
    }
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
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              {topFeelings.map((feeling, index) => (
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
