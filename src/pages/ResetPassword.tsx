import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/Logo";
import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user arrived via password reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      }
    };
    
    checkSession();

    // Listen for auth state changes (e.g., when user clicks reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      passwordSchema.parse(password);
      
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Password updated successfully!");
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 pb-32">
        <Card className="w-full max-w-md border-mumtaz-lilac/20 shadow-xl">
          <CardHeader className="space-y-4 text-center pt-8">
            <Logo size="md" className="mx-auto" />
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-wellness-sage/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-wellness-sage" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-mumtaz-plum">
              Password Updated!
            </CardTitle>
            <CardDescription className="font-accent text-base">
              Your password has been successfully changed. You will be redirected to your dashboard shortly.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-8">
            <Button
              onClick={() => navigate("/")}
              className="bg-wellness-taupe hover:bg-wellness-taupe/90"
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 pb-32">
        <Card className="w-full max-w-md border-mumtaz-lilac/20 shadow-xl">
          <CardHeader className="space-y-4 text-center pt-8">
            <Logo size="md" className="mx-auto" />
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-mumtaz-lilac/20 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-mumtaz-lilac" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-mumtaz-plum">
              Check Your Email
            </CardTitle>
            <CardDescription className="font-accent text-base leading-relaxed">
              If you requested a password reset, we've sent you an email with a secure link. Please check your inbox and click the link to set your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="gap-2 border-mumtaz-lilac/30 hover:bg-mumtaz-lilac/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pb-32">
      <Card className="w-full max-w-md border-mumtaz-lilac/20 shadow-xl">
        <CardHeader className="space-y-4 text-center pt-8">
          <Logo size="md" className="mx-auto" />
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-mumtaz-lilac/20 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-mumtaz-lilac" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-mumtaz-plum">
            Create New Password
          </CardTitle>
          <CardDescription className="font-accent text-base">
            Enter your new password below. Make sure it's at least 6 characters long.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-12"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button 
              type="submit" 
              className="w-full h-12 bg-wellness-taupe hover:bg-wellness-taupe/90 text-base"
              disabled={loading}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="w-full gap-2"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
