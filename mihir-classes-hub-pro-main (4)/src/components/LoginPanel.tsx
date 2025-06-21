
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";

export function LoginPanel() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();
  const { data: studentsData } = useSupabaseData("students");

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
      // Check if user exists in students database with matching credentials
      const student = studentsData.find(s => s.username === name && s.password === userPassword);
      if (!student) {
        toast({
          title: "Error",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return;
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Mihir Classes</CardTitle>
          <p className="text-sm sm:text-base text-gray-600">Management System Login</p>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div>
            <Label htmlFor="name" className="text-sm">{role === "user" ? "Username" : "Name"}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === "user" ? "Enter your username" : "Enter your name"}
              className="text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="role" className="text-sm">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    User
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === "admin" && (
            <div>
              <Label htmlFor="password" className="text-sm">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                className="text-sm"
              />
            </div>
          )}

          {role === "user" && (
            <div>
              <Label htmlFor="userPassword" className="text-sm">Password</Label>
              <Input
                id="userPassword"
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Enter your password"
                className="text-sm"
              />
            </div>
          )}

          <Button onClick={handleLogin} className="w-full text-sm">
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
