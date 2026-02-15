import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, Sparkles, BookOpen, Target, Star, X, School } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  Lock,
  User,
  Sparkles,
  BookOpen,
  Target,
  Star,
  UserCircle,
  X,
  School,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type AuthMode = "signin" | "register";
type UserRole = "admin" | "user";

export function LoginPanel() {
  const [submitting, setSubmitting] = useState(false);
  const { loginWithGoogle, authError, clearAuthError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authError) return;

    toast({
      title: "Authentication failed",
      description: authError,
      variant: "destructive",
    });

    clearAuthError();
  }, [authError, clearAuthError, toast]);

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [className, setClassName] = useState("");
  const [board, setBoard] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const googleProfile = useMemo(
    () => ({ role, name: name || email.split("@")[0] || "User", class: className, board }),
    [role, name, className, board, email],
  );

  const handleAuth = async () => {
    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Please enter email and password.",
        variant: "destructive",
      });
      return;
    }

    if (mode === "register") {
      if (!name) {
        toast({
          title: "Missing details",
          description: "Please add your display name.",
          variant: "destructive",
        });
        return;
      }

      if (role === "user" && (!className || !board)) {
        toast({
          title: "Missing details",
          description: "Students must select class and board.",
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === "signin") {
        await loginWithEmail(email, password);
        toast({ title: "Signed in", description: "Welcome back!" });
      } else {
        const { user } = await registerWithEmail({
          email,
          password,
          role,
          name,
          className: role === "user" ? className : undefined,
          board: role === "user" ? board : undefined,
        });

        toast({
          title: "Registration successful",
          description: user?.identities?.length
            ? "Your account has been created."
            : "Account exists. Please verify your email if required and sign in.",
        });

        setMode("signin");
      }
    } catch (error: unknown) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle(mode === "register" ? googleProfile : { role, name: "User" });
    } catch (error: unknown) {
      toast({
        title: "Google authentication failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-yellow-50"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-yellow-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-200 rounded-full opacity-25 animate-bounce delay-500"></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      <div className="absolute top-10 left-10 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse delay-1500"></div>
      <div className="absolute bottom-10 right-10 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-bounce delay-2500"></div>

      <div className="absolute top-32 left-20 animate-float delay-1000">
        <Sparkles className="h-8 w-8 text-yellow-400 opacity-60" />
      </div>
      <div className="absolute top-48 right-32 animate-float delay-2000">
        <BookOpen className="h-6 w-6 text-blue-400 opacity-60" />
      </div>
      <div className="absolute bottom-32 left-32 animate-float delay-500">
        <Target className="h-7 w-7 text-green-400 opacity-60" />
      </div>
      <div className="absolute bottom-48 right-20 animate-float delay-1500">
        <Star className="h-6 w-6 text-purple-400 opacity-60" />
      </div>
      <div className="absolute top-1/3 left-10 animate-float delay-2500">
        <School className="h-8 w-8 text-green-400 opacity-50" />
      </div>
      <div className="absolute top-1/4 right-12 animate-float delay-3000">
        <Star className="h-5 w-5 text-yellow-400 opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-sm group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000 animate-glow-breathe"></div>
        <Card className="relative bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl text-gray-800">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-gray-600 hover:bg-white/40 hover:text-gray-900 rounded-full"
            onClick={() => navigate("/")}
          >
            <X className="h-5 w-5" />
          </Button>
          <CardHeader className="text-center p-8 pb-4">
            <div className="flex justify-center mb-4">
              <img
                src="/lovable-uploads/ae5781fb-b384-4333-b465-3fca780bb394.png"
                alt="Classes Logo"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/60 shadow-lg animate-float"
              />
            </div>
            <CardTitle className="text-3xl font-bold tracking-wider text-gray-900">Mihir Classes</CardTitle>
            <p className="text-sm text-gray-700 mt-2">
              Continue with Google to access Student or Admin panel.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-8 pb-8">
            <Button
              onClick={handleGoogleSignIn}
              variant="default"
              {mode === "signin" ? "Sign in with Email or Google" : "Register as Student or Admin"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-8 pb-8">
            <div className="grid grid-cols-2 gap-2">
              <Button variant={mode === "signin" ? "default" : "outline"} onClick={() => setMode("signin")}>
                Sign In
              </Button>
              <Button variant={mode === "register" ? "default" : "outline"} onClick={() => setMode("register")}>
                Register
              </Button>
            </div>

            {mode === "register" && (
              <>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500/70" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="pl-10"
                  />
                </div>

                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Student</SelectItem>
                  </SelectContent>
                </Select>

                {role === "user" && (
                  <>
                    <Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class" />
                    <Select value={board} onValueChange={setBoard}>
                      <SelectTrigger>
                        <SelectValue placeholder="Board" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="State Board">State Board</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500/70" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500/70" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="pl-10"
              />
            </div>

            <Button onClick={handleAuth} className="w-full" disabled={submitting}>
              {mode === "signin" ? "Sign In" : "Create Account"}
            </Button>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full flex items-center gap-2"
              disabled={submitting}
            >
              <User className="h-4 w-4" />
              Continue with Google
            </Button>
            <p className="text-center text-xs text-gray-600">
              Admin panel opens only for allowed admin Google accounts.
            </p>

            <Label className="block text-center text-xs text-gray-600">
              For Google register, select role first and then continue.
            </Label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
