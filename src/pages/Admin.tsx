import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Calendar } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  user_id: string;
}

interface WellnessEntry {
  id: string;
  entry_date: string;
  cycle_phase: string | null;
  emotional_state: string | null;
  physical_symptoms: string | null;
  daily_practices: any;
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [entries, setEntries] = useState<WellnessEntry[]>([]);
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
    }
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (!data) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }
    
    setIsAdmin(true);
    loadProfiles();
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('username');
    
    if (error) {
      console.error('Error loading profiles:', error);
      toast.error('Error loading user profiles');
      return;
    }
    
    setProfiles(data || []);
  };

  const loadUserEntries = async (userId: string) => {
    const { data, error } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error loading entries:', error);
      toast.error('Error loading wellness entries');
      return;
    }
    
    setEntries(data || []);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (userId) {
      loadUserEntries(userId);
    } else {
      setEntries([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wellness-beige">
        <div className="text-wellness-taupe text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-wellness-beige">
      <div className="max-w-6xl mx-auto p-4">
        <Card className="mb-6 bg-wellness-warm border-wellness-taupe/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-wellness-taupe">
                Admin Dashboard
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all user wellness entries
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="border-wellness-taupe/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tracker
            </Button>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select User</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedUserId} onValueChange={handleUserSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user to view their data" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.user_id}>
                    {profile.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedUserId && entries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-wellness-taupe">Recent Entries (Last 10)</h2>
            {entries.map((entry) => (
              <Card key={entry.id} className="border-wellness-taupe/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-wellness-taupe" />
                      {new Date(entry.entry_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardTitle>
                    {entry.cycle_phase && (
                      <span className="px-3 py-1 bg-wellness-pink rounded-full text-sm font-medium">
                        {entry.cycle_phase}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entry.emotional_state && (
                    <div>
                      <p className="text-sm font-medium text-wellness-taupe">Emotional State:</p>
                      <p className="text-sm text-muted-foreground">{entry.emotional_state}</p>
                    </div>
                  )}
                  {entry.physical_symptoms && (
                    <div>
                      <p className="text-sm font-medium text-wellness-taupe">Physical Symptoms:</p>
                      <p className="text-sm text-muted-foreground">{entry.physical_symptoms}</p>
                    </div>
                  )}
                  {entry.daily_practices && Object.keys(entry.daily_practices).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-wellness-taupe mb-2">Daily Practices:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(entry.daily_practices).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center gap-2 text-muted-foreground">
                            <span className={value?.status ? "text-green-600" : "text-gray-400"}>
                              {value?.status ? "✓" : "○"}
                            </span>
                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedUserId && entries.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No wellness entries found for this user.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
