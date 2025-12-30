import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { KeyRound, Mail, Shield, LogOut, Smartphone, Monitor, Globe } from "lucide-react";
import { Session } from "@supabase/supabase-js";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });

interface SessionInfo {
  id: string;
  created_at: string;
  user_agent?: string;
  ip?: string;
  isCurrent: boolean;
}

export function AccountSettings() {
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCurrentEmail(user.email);
        setEmail(user.email);
      }

      // Fetch current session info
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessions([{
          id: session.access_token.slice(-8),
          created_at: new Date(session.expires_at! * 1000 - 3600000).toISOString(),
          user_agent: navigator.userAgent,
          isCurrent: true,
        }]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);

    try {
      emailSchema.parse(email);

      if (email === currentEmail) {
        toast.info("This is already your current email");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        email: email,
      });

      if (error) throw error;

      toast.success("Confirmation email sent to your new address. Please check your inbox.");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        console.error("Email update error:", error);
        toast.error(error.message || "Failed to update email");
      }
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);

    try {
      passwordSchema.parse(newPassword);

      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        console.error("Password update error:", error);
        toast.error(error.message || "Failed to update password");
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleSignOutAll = async () => {
    setLoadingSessions(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
      toast.success("Signed out from all devices");
      window.location.href = "/auth";
    } catch (error) {
      console.error("Sign out all error:", error);
      toast.error("Failed to sign out from all devices");
    } finally {
      setLoadingSessions(false);
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Globe className="w-4 h-4" />;
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const getDeviceName = (userAgent?: string) => {
    if (!userAgent) return "Unknown device";
    if (/iphone/i.test(userAgent)) return "iPhone";
    if (/ipad/i.test(userAgent)) return "iPad";
    if (/android/i.test(userAgent)) return "Android device";
    if (/mac/i.test(userAgent)) return "Mac";
    if (/windows/i.test(userAgent)) return "Windows PC";
    if (/linux/i.test(userAgent)) return "Linux";
    return "Unknown device";
  };

  return (
    <div className="space-y-6">
      {/* Change Email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Change Email
          </CardTitle>
          <CardDescription>
            Update your email address. A confirmation will be sent to the new email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">New Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loadingEmail}
              />
            </div>
            <Button
              type="submit"
              disabled={loadingEmail || email === currentEmail}
              className="w-full sm:w-auto"
            >
              {loadingEmail ? "Sending..." : "Update Email"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            Choose a strong password with at least 6 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loadingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loadingPassword}
              />
            </div>
            <Button
              type="submit"
              disabled={loadingPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-auto"
            >
              {loadingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage devices where you're signed in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions found.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {getDeviceIcon(session.user_agent)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {getDeviceName(session.user_agent)}
                        {session.isCurrent && (
                          <span className="ml-2 text-xs text-primary font-normal">(Current)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Active since {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <Button
              variant="destructive"
              onClick={handleSignOutAll}
              disabled={loadingSessions}
              className="w-full sm:w-auto gap-2"
            >
              <LogOut className="w-4 h-4" />
              {loadingSessions ? "Signing out..." : "Sign Out All Devices"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will sign you out from all devices, including this one.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
