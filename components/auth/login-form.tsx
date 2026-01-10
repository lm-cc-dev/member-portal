"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, AlertCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match for signup
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        // Sign up with email/password
        // Name will be pulled from Baserow during the auth hook
        const result = await signUp.email({
          email,
          password,
          name: email.split("@")[0], // Temporary name, will be updated from Baserow
          callbackURL: "/profile",
        });

        if (result.error) {
          // Better Auth returns the error in different places depending on the error type
          const errorMessage = result.error.message ||
                              (result.error as any).body?.message ||
                              "Sign up failed";
          setError(errorMessage);
        } else {
          // Success - redirect to profile
          router.push("/profile");
          router.refresh();
        }
      } else {
        // Login with email/password
        const result = await signIn.email({
          email,
          password,
          callbackURL: "/profile",
        });

        if (result.error) {
          setError(result.error.message || "Login failed");
        } else {
          // Success - redirect to profile
          router.push("/profile");
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl font-bold text-center">
          {mode === "login" ? "Sign In" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === "login"
            ? "Sign in to access your member portal"
            : "Register Member Portal Account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
                minLength={8}
              />
            </div>
            {mode === "signup" && (
              <p className="text-xs text-neutral-500">
                Must be at least 8 characters
              </p>
            )}
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10"
                  minLength={8}
                />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {/* Make Samira's name clickable without showing the email */}
                {error.includes('samira@collaborationcircle.com') ? (
                  <>
                    Not a registered Member. Please contact{' '}
                    <a
                      href="mailto:samira@collaborationcircle.com"
                      className="underline hover:text-red-800 font-medium"
                    >
                      Samira
                    </a>
                    {' '}to apply.
                  </>
                ) : (
                  error
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>

          {mode === "signup" && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                Must be an active member to register
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setConfirmPassword("");
              }}
              className="text-sm"
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
