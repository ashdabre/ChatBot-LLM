// src/components/AuthPage.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Mail, Lock, Chrome, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface AuthPageProps {
  onLogin: (user: User | null) => void;
  onContinueAsGuest: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onContinueAsGuest }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Load session once on mount & listen for changes
  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        onLogin(data.session.user);
      }
      setLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          onLogin(session.user);
        } else {
          setUser(null);
          onLogin(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [onLogin]);

  // ✅ Email/password sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      alert("Login failed: " + (error?.message || "Unknown error"));
    } else {
      setUser(data.user);
      onLogin(data.user);
    }
    setLoading(false);
  };

  // ✅ Google sign-in
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) alert("Google sign-in failed: " + error.message);
  };

  // ✅ Full logout
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    onLogin(null);
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        Loading...
      </div>
    );
  }

  // ✅ Logged-in view
  if (user) {
    const displayName =
      (user.user_metadata?.full_name as string) || user.email || "User";
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-subtle">
        <Card className="glass border-white/20 backdrop-blur-glass w-full max-w-md text-center">
          <CardHeader>
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full mx-auto mb-4"
              />
            )}
            <CardTitle className="text-2xl font-bold text-foreground">
              Hello, {displayName} 👋
            </CardTitle>
            <CardDescription>User ID: {user.id}</CardDescription>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full h-12"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 📝 Login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Mind Whisper
            </h1>
            <p className="text-sm text-muted-foreground -mt-1">AI Companion</p>
          </div>
        </div>

        <Card className="glass border-white/20 backdrop-blur-glass">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display font-bold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              variant="outline"
              className="w-full h-12 border-white/20 hover:bg-white/10"
              onClick={handleGoogleSignIn}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <div className="relative">
              <Separator className="bg-white/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-background px-4 text-sm text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 glass border-white/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 glass border-white/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="default" className="w-full h-12">
                Sign In
              </Button>
            </form>

            <Button
              variant="ghost"
              className="w-full h-12"
              onClick={onContinueAsGuest}
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
