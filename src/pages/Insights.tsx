import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, TrendingUp, Calendar, Activity, Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navigation } from "@/components/Navigation";
import { DoshaLearningJourney } from "@/components/DoshaLearningJourney";
import { FeelingPatterns } from "@/components/FeelingPatterns";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";

interface Insight {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'positive';
}

interface Prediction {
  title: string;
  description: string;
  timing: string;
}

interface Correlation {
  factor1: string;
  factor2: string;
  relationship: string;
  strength: 'weak' | 'moderate' | 'strong';
}

interface AnalysisData {
  insights: Insight[];
  predictions: Prediction[];
  correlations: Correlation[];
  message?: string;
}

export default function Insights() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    setLoading(false);
    return () => subscription.unsubscribe();
  }, [navigate]);

  const analyzeInsights = async () => {
    if (!user) return;
    
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-wellness-insights', {
        body: {}
      });

      if (error) {
        console.error('Error analyzing insights:', error);
        toast.error(error.message || 'Failed to analyze insights');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAnalysisData(data);
      toast.success('Insights generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'positive':
        return 'default';
      case 'warning':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'text-green-600 border-green-600';
      case 'moderate':
        return 'text-amber-600 border-amber-600';
      default:
        return 'text-gray-600 border-gray-600';
    }
  };

  // Integrate with global loading indicator
  useGlobalLoading(loading);

  if (loading) {
    return <PageLoadingSkeleton variant="simple" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 animate-fade-in">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tracker">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Wellness Insights
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover patterns and predictions in your wellness journey
              </p>
            </div>
          </div>
          <Button 
            onClick={analyzeInsights} 
            disabled={analyzing}
            size="lg"
            className="gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Insights
              </>
            )}
          </Button>
        </div>

        {!analysisData ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to unlock your insights?</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Click "Generate Insights" to analyze your wellness data and discover personalized patterns, 
                correlations, and predictions powered by AI.
              </p>
            </CardContent>
          </Card>
        ) : analysisData.message ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Getting Started</AlertTitle>
            <AlertDescription>{analysisData.message}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-8">
            {/* Key Insights */}
            {analysisData.insights && analysisData.insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Key Insights
                  </CardTitle>
                  <CardDescription>Patterns discovered in your wellness data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisData.insights.map((insight, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-lg border bg-card/50">
                      {getSeverityIcon(insight.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant={getSeverityVariant(insight.severity)} className="text-xs">
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Predictions */}
            {analysisData.predictions && analysisData.predictions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Predictions & Recommendations
                  </CardTitle>
                  <CardDescription>What to expect in your upcoming cycle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisData.predictions.map((prediction, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-primary/5">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{prediction.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {prediction.timing}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{prediction.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Correlations */}
            {analysisData.correlations && analysisData.correlations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Practice Correlations
                  </CardTitle>
                  <CardDescription>How your habits affect your wellbeing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisData.correlations.map((correlation, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <span className="font-medium">{correlation.factor1}</span>
                          <span className="text-muted-foreground">↔</span>
                          <span className="font-medium">{correlation.factor2}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{correlation.relationship}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getStrengthColor(correlation.strength)}`}>
                        {correlation.strength}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Feeling Patterns Section */}
        <div className="mt-8">
          <FeelingPatterns />
        </div>

        {/* Dosha Learning Journey Section */}
        <div className="mt-8">
          <DoshaLearningJourney />
        </div>
      </div>
    </div>
  );
}
