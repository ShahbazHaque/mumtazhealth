import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });
const usernameSchema = z.string().trim().min(3, { message: "Username must be at least 3 characters" }).max(50);

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      emailSchema.parse(email);
      
      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        toast.success("Password reset email sent! Check your inbox.");
        setIsResetPassword(false);
      } else if (isLogin) {
        // Special passwordless flow for admin email
        if (email.toLowerCase() === "mumtazhaque07@gmail.com") {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
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
            emailRedirectTo: `${window.location.origin}/`,
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
    <div className="min-h-screen flex items-center justify-center bg-wellness-beige p-4">
      <Card className="w-full max-w-md border-wellness-taupe/20 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-wellness-taupe">
            {isResetPassword ? "Reset Password" : isAdminLogin ? "Admin Access" : isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isResetPassword 
              ? "Enter your email to receive a password reset link"
              : isAdminLogin
                ? "Administrator login - access all user data and settings"
                : isLogin 
                  ? "Enter your credentials to access your wellness tracker" 
                  : "Join us to start your holistic wellness journey"
            }
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
                />
              </div>
            )}
            
            {isLogin && email.toLowerCase() === "mumtazhaque07@gmail.com" && (
              <div className="p-3 bg-wellness-sage/10 border border-wellness-sage/20 rounded-md">
                <p className="text-sm text-wellness-sage">
                  🔓 Passwordless admin access - a magic link will be sent to your email
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className={`w-full ${isAdminLogin ? 'bg-destructive hover:bg-destructive/90' : 'bg-wellness-taupe hover:bg-wellness-taupe/90'}`}
              disabled={loading}
            >
              {loading ? "Please wait..." : isResetPassword ? "Send Reset Link" : isAdminLogin ? "Admin Sign In" : isLogin ? "Sign In" : "Sign Up"}
            </Button>
            
            {!isResetPassword && (
              <>
                {!isAdminLogin && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsLogin(!isLogin)}
                    disabled={loading}
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </Button>
                )}
                
                {isLogin && !isAdminLogin && (
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-wellness-taupe"
                    onClick={() => setIsResetPassword(true)}
                    disabled={loading}
                  >
                    Forgot password?
                  </Button>
                )}
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-wellness-taupe/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {isAdminLogin ? "or" : "admin"}
                    </span>
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
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsResetPassword(false)}
                disabled={loading}
              >
                Back to sign in
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
