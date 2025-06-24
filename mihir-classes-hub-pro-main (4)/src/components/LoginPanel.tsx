import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Camera, Lock, User, Sparkles, BookOpen, Target, Star, UserCircle, X, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";

export function LoginPanel() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();
  const { data: studentsData } = useSupabaseData("students");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!name || !role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (role === "admin") {
      if (adminPassword !== "Mihir010105Classes@2010") {
        toast({
          title: "Error",
          description: "Invalid admin password",
          variant: "destructive",
        });
        return;
      }
    } else if (role === "user") {
      const student = studentsData.find(s => s.username === name && s.password === userPassword);
      if (!student) {
        toast({
          title: "Error",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return;
      }
      login(role as "admin" | "user", name, student.class, student.board);
      toast({
        title: "Success",
        description: `Welcome User ${name}!`,
      });
      return;
    }

    console.log("LoginPanel - attempting login with:", { role, name });
    
    try {
      login(role as "admin" | "user", name);
      
      toast({
        title: "Success",
        description: `Welcome ${role === "admin" ? "Admin" : "User"} ${name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Landing Page Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-yellow-50"></div>
      
      {/* Animated Background Shapes from Landing Page */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-yellow-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-200 rounded-full opacity-25 animate-bounce delay-500"></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      <div className="absolute top-10 left-10 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse delay-1500"></div>
      <div className="absolute bottom-10 right-10 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-bounce delay-2500"></div>
      
      {/* Floating Icons from Landing Page */}
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
      <div className="absolute bottom-1/4 left-1/4 animate-float delay-3500">
        <Star className="h-5 w-5 text-pink-400 opacity-60" />
      </div>

      {/* Additional decorative lines from Landing Page */}
      <div className="absolute top-1/4 left-0 w-2 h-24 bg-gradient-to-b from-blue-400 to-transparent opacity-30"></div>
      <div className="absolute bottom-1/4 right-0 w-2 h-32 bg-gradient-to-t from-yellow-400 to-transparent opacity-30"></div>

      {/* Glass Morphism Card (adapted for light background) */}
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
          <CardHeader className="text-center p-8">
            <div className="flex justify-center mb-4">
              <img
                src="/lovable-uploads/ae5781fb-b384-4333-b465-3fca780bb394.png"
                alt="Classes Logo"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/60 shadow-lg animate-float"
              />
            </div>
            <CardTitle className="text-3xl font-bold tracking-wider text-gray-900">
              Mihir Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500/70" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "user" ? "Username" : "Name"}
                className="pl-10 pr-4 py-2 w-full bg-white/40 border-0 border-b-2 border-gray-400/30 focus:border-b-blue-500 focus:ring-0 rounded-none transition-colors duration-300 placeholder:text-gray-600/70 text-gray-800"
              />
            </div>
            
            <div className="relative">
              <Label htmlFor="role" className="sr-only">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full bg-white/40 border-0 border-b-2 border-gray-400/30 focus:border-b-blue-500 focus:ring-0 rounded-none transition-colors duration-300 text-gray-800 [&>span]:text-gray-600/90">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 backdrop-blur-md border-gray-200 text-gray-800">
                  <SelectItem value="admin" className="focus:bg-blue-100">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="user" className="focus:bg-blue-100">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "admin" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500/70" />
                <Input
                  id="password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Admin Password"
                  className="pl-10 pr-4 py-2 w-full bg-white/40 border-0 border-b-2 border-gray-400/30 focus:border-b-blue-500 focus:ring-0 rounded-none transition-colors duration-300 placeholder:text-gray-600/70 text-gray-800"
                />
              </div>
            )}

            {role === "user" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500/70" />
                <Input
                  id="userPassword"
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Password"
                  className="pl-10 pr-4 py-2 w-full bg-white/40 border-0 border-b-2 border-gray-400/30 focus:border-b-blue-500 focus:ring-0 rounded-none transition-colors duration-300 placeholder:text-gray-600/70 text-gray-800"
                />
              </div>
            )}

            <Button 
              onClick={handleLogin} 
              className="w-full text-lg font-semibold bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
