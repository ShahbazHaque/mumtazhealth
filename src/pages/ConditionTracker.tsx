import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Calendar, TrendingUp, Plus, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { symptomTrackingSchema, validateInput, truncateText } from "@/lib/validation";

type ConditionType = "pcos" | "endometriosis" | "pmdd" | "irregular" | "arthritis" | "general";

interface SymptomEntry {
  id: string;
  condition_type: ConditionType;
  entry_date: string;
  pain_level: number;
  symptoms: string[];
  notes: string | null;
}

const PCOS_SYMPTOMS = [
  "Irregular periods",
  "Acne",
  "Weight gain",
  "Hair loss",
  "Excess facial/body hair",
  "Mood swings",
  "Fatigue",
  "Sleep issues",
  "Difficulty conceiving",
];

const ENDOMETRIOSIS_SYMPTOMS = [
  "Pelvic pain",
  "Heavy bleeding",
  "Pain during periods",
  "Pain during intercourse",
  "Pain with bowel movements",
  "Pain with urination",
  "Fatigue",
  "Nausea",
  "Lower back pain",
];

const PMDD_SYMPTOMS = [
  "Severe mood swings",
  "Depression",
  "Anxiety",
  "Irritability",
  "Difficulty concentrating",
  "Fatigue",
  "Changes in appetite",
  "Sleep problems",
  "Physical symptoms (bloating, breast tenderness)",
];

const IRREGULAR_SYMPTOMS = [
  "Spotting between periods",
  "Very heavy flow",
  "Very light flow",
  "Missed periods",
  "Very long cycles",
  "Very short cycles",
  "Severe cramps",
  "Clotting",
];

export default function ConditionTracker() {
  const [selectedCondition, setSelectedCondition] = useState<ConditionType>("pcos");
  const [painLevel, setPainLevel] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [entryDate, setEntryDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    fetchEntries();
  }, [selectedCondition]);

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("condition_symptom_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("condition_type", selectedCondition)
        .gte("entry_date", thirtyDaysAgo)
        .order("entry_date", { ascending: false });

      if (error) throw error;
      setEntries((data || []) as SymptomEntry[]);
    } catch (error: any) {
      console.error("Error fetching entries:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to track symptoms");
        return;
      }

      // Validate input before saving
      const validation = validateInput(symptomTrackingSchema, {
        condition_type: selectedCondition,
        pain_level: painLevel,
        notes: notes.trim() || null,
        symptoms: selectedSymptoms.slice(0, 50).map(s => truncateText(s, 100)),
      });

      if (!validation.success) {
        toast.error((validation as { success: false; error: string }).error);
        setLoading(false);
        return;
      }

      const validatedData = validation.data;

      const { error } = await supabase
        .from("condition_symptom_tracking")
        .upsert({
          user_id: user.id,
          condition_type: validatedData.condition_type,
          entry_date: entryDate,
          pain_level: validatedData.pain_level,
          symptoms: validatedData.symptoms,
          notes: validatedData.notes,
        }, { onConflict: 'user_id,condition_type,entry_date' });

      if (error) throw error;

      toast.success("Symptoms logged successfully");
      setPainLevel(0);
      setSelectedSymptoms([]);
      setNotes("");
      fetchEntries();
    } catch (error: any) {
      toast.error(error.message || "Failed to log symptoms");
    } finally {
      setLoading(false);
    }
  };

  const getSymptomsList = () => {
    switch (selectedCondition) {
      case "pcos":
        return PCOS_SYMPTOMS;
      case "endometriosis":
        return ENDOMETRIOSIS_SYMPTOMS;
      case "pmdd":
        return PMDD_SYMPTOMS;
      case "irregular":
        return IRREGULAR_SYMPTOMS;
      default:
        return [];
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const chartData = entries
    .slice()
    .reverse()
    .map(entry => ({
      date: format(new Date(entry.entry_date), "MMM dd"),
      painLevel: entry.pain_level,
      symptomCount: entry.symptoms.length,
    }));

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent mb-2">
          Condition Symptom Tracker
        </h1>
        <p className="text-muted-foreground">
          Track your symptoms and pain levels to identify patterns and better manage your condition
        </p>
      </div>

      <div className="mb-6">
        <Label htmlFor="condition-select" className="text-base mb-2 block">Select Condition</Label>
        <Select value={selectedCondition} onValueChange={(value) => setSelectedCondition(value as ConditionType)}>
          <SelectTrigger id="condition-select" className="w-full max-w-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pcos">PCOS (Polycystic Ovary Syndrome)</SelectItem>
            <SelectItem value="endometriosis">Endometriosis</SelectItem>
            <SelectItem value="pmdd">PMDD (Premenstrual Dysphoric Disorder)</SelectItem>
            <SelectItem value="irregular">Irregular or Heavy Periods</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="log" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="log" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Log Symptoms
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            View Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Log Today's Symptoms</CardTitle>
                <CardDescription>
                  Track your symptoms and pain levels to help identify patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="entry-date">Entry Date</Label>
                  <input
                    id="entry-date"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    max={format(new Date(), "yyyy-MM-dd")}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">
                      Pain Level: <span className="font-bold text-primary">{painLevel}/10</span>
                    </Label>
                    <Slider
                      value={[painLevel]}
                      onValueChange={(value) => setPainLevel(value[0])}
                      max={10}
                      step={1}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>No Pain</span>
                      <span>Mild</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                      <span>Worst Pain</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Symptoms Experienced</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getSymptomsList().map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <Checkbox
                          id={symptom}
                          checked={selectedSymptoms.includes(symptom)}
                          onCheckedChange={() => toggleSymptom(symptom)}
                        />
                        <Label
                          htmlFor={symptom}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {symptom}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Note any triggers, activities, or additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">{notes.length}/1000 characters</p>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Log Symptoms"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Pain Level Trends (Last 30 Days)
              </CardTitle>
              <CardDescription>
                Track how your pain levels change over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="painLevel"
                      stroke="hsl(var(--wellness-lilac))"
                      strokeWidth={2}
                      name="Pain Level"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No entries yet. Start logging your symptoms to see trends.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>Your symptom log from the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length > 0 ? (
                <div className="space-y-4">
                  {entries.slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(entry.entry_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          Pain: {entry.pain_level}/10
                        </span>
                      </div>
                      {entry.symptoms.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm text-muted-foreground">Symptoms: </span>
                          <span className="text-sm">{entry.symptoms.join(", ")}</span>
                        </div>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground italic">{entry.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No entries yet. Start tracking your symptoms to see your history.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
