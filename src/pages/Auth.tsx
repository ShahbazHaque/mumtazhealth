import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/Logo";
import { ArrowLeft, KeyRound, Mail, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { usePageMeta } from "@/hooks/usePageMeta";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });
const usernameSchema = z.string().trim().min(3, { message: "Username must be at least 3 characters" }).max(50);

const PROD_ORIGIN = "https://mumtazhealth.lovable.app";
const RESEND_COOLDOWN_SECONDS = 60;

function getAuthRedirectBase() {
  // Requirement: always use production URL for auth emails (avoid localhost).
  return PROD_ORIGIN;
}

export default function Auth() {
  usePageMeta({
    title: "Sign in | Mumtaz Health",
    description: "Sign in to Mumtaz Health to access your wellness tracker, daily practices, and insights.",
    canonicalPath: "/auth",
  });

  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const authBase = getAuthRedirectBase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${authBase}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetEmail = useCallback(async () => {
    if (resendCooldown > 0 || !email) return;
    
    setLoading(true);
    try {
      emailSchema.parse(email);
      const authBase = getAuthRedirectBase();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${authBase}/reset-password`,
      });

      if (error) {
        console.error("Resend reset email error:", error);
        throw error;
      }

      toast.success("Reset link sent! Check your inbox.");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to resend. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [email, resendCooldown]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      emailSchema.parse(email);

      const authBase = getAuthRedirectBase();

      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${authBase}/reset-password`,
        });

        if (error) {
          // Required: log Supabase error from reset call
          console.error("resetPasswordForEmail error", {
            name: error.name,
            status: error.status,
            message: error.message,
          });
          throw error;
        }

        // Required: don't confirm whether email exists
        toast.success("If this email exists, we’ve sent a reset link.");
        setResetEmailSent(true);
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      } else if (isLogin) {
        // Special passwordless flow for admin email
        if (email.toLowerCase() === "mumtazhaque07@gmail.com") {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${authBase}/`,
            },
          });

          if (error) throw error;
          toast.success("Magic link sent! Check your email to log in.");
        } else {
          passwordSchema.parse(password);

          const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            if (error.message.includes("Invalid login credentials")) {
              throw new Error("Invalid email or password");
            }
            throw error;
          }

          if (data.user) {
            toast.success("Welcome back!");
            navigate("/");
          }
        }
      } else {
        passwordSchema.parse(password);
        usernameSchema.parse(username);

        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
            emailRedirectTo: `${authBase}/auth`,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error("This email is already registered");
          }
          throw error;
        }

        if (data.user) {
          toast.success("Account created! Welcome!");
          navigate("/");
        }
      }
    } catch (error) {
      // Required: friendly reset error + ask to try again
      if (isResetPassword) {
        if (error instanceof z.ZodError) {
          toast.error(error.errors[0].message);
        } else {
          console.error("Password reset request failed", error);
          toast.error("We couldn’t send the reset link. Please try again in a moment.");
        }
        return;
      }

      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pb-32">
      <Card className="w-full max-w-md border-mumtaz-lilac/20 shadow-xl">
        <CardHeader className="space-y-4 text-center pt-8">
          <Logo size="md" className="mx-auto" />
          <CardTitle className="text-3xl font-bold text-mumtaz-plum">
            {isResetPassword ? "Reset Password" : isAdminLogin ? "Admin Access" : isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="font-accent">
            {isResetPassword
              ? "Enter your email to receive a password reset link"
              : isAdminLogin
                ? "Administrator login - access all user data and settings"
                : isLogin
                  ? "Enter your credentials to access your wellness tracker"
                  : "Join us to start your holistic wellness journey"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {!isLogin && !isResetPassword && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {!isResetPassword && email.toLowerCase() !== "mumtazhaque07@gmail.com" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12"
                />
                {/* Remember Me & Forgot Password - below password field */}
                {isLogin && !isAdminLogin && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                          disabled={loading}
                          className="border-mumtaz-lilac/50 data-[state=checked]:bg-mumtaz-lilac data-[state=checked]:border-mumtaz-lilac"
                        />
                        <Label htmlFor="rememberMe" className="text-sm font-normal text-muted-foreground cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-sm text-mumtaz-lilac hover:text-mumtaz-plum font-medium"
                        onClick={() => setIsResetPassword(true)}
                        disabled={loading}
                      >
                        <KeyRound className="w-3.5 h-3.5 mr-1" />
                        Forgot password?
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLogin && email.toLowerCase() === "mumtazhaque07@gmail.com" && (
              <div className="p-3 bg-wellness-sage/10 border border-wellness-sage/20 rounded-md">
                <p className="text-sm text-wellness-sage">🔓 Passwordless admin access - a magic link will be sent to your email</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button
              type="submit"
              className={`w-full h-12 text-base ${isAdminLogin ? "bg-destructive hover:bg-destructive/90" : "bg-wellness-taupe hover:bg-wellness-taupe/90"}`}
              disabled={loading}
            >
              {loading ? "Please wait..." : isResetPassword ? "Send Reset Link" : isAdminLogin ? "Admin Sign In" : isLogin ? "Sign In" : "Sign Up"}
            </Button>

            {!isResetPassword && (
              <>
                {/* Google Sign In */}
                {!isAdminLogin && (
                  <>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 gap-3 border-border hover:bg-accent"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </>
                )}

                {!isAdminLogin && (
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setIsLogin(!isLogin)} disabled={loading}>
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </Button>
                )}

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-wellness-taupe/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{isAdminLogin ? "or" : "admin"}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant={isAdminLogin ? "outline" : "secondary"}
                  className="w-full"
                  onClick={() => {
                    setIsAdminLogin(!isAdminLogin);
                    setIsLogin(true);
                  }}
                  disabled={loading}
                >
                  {isAdminLogin ? "Back to User Login" : "Admin Login"}
                </Button>
              </>
            )}

            {isResetPassword && (
              <div className="space-y-4">
                <div className="p-4 bg-mumtaz-lilac/10 border border-mumtaz-lilac/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-mumtaz-lilac mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {resetEmailSent 
                        ? "Check your inbox and spam folder for the reset link."
                        : "If this email exists in our system, we'll send you a password reset link."}
                    </p>
                  </div>
                </div>
                
                {resetEmailSent && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 gap-2 border-mumtaz-lilac/30 hover:bg-mumtaz-lilac/10"
                    onClick={handleResendResetEmail}
                    disabled={loading || resendCooldown > 0}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    {resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Reset Email"}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 gap-2 border-mumtaz-lilac/30 hover:bg-mumtaz-lilac/10"
                  onClick={() => {
                    setIsResetPassword(false);
                    setResetEmailSent(false);
                  }}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Button>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
