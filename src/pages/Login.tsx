import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Hardcoded credentials
  const credentials = {
    admin: { email: "admin@mavericks.com", password: "admin123" },
    fresher: { email: "fresher@mavericks.com", password: "fresher123" }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple credential check
    if (email === credentials.admin.email && password === credentials.admin.password) {
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("isAuthenticated", "true");
      toast({ title: "Welcome Admin!", description: "Redirecting to admin dashboard..." });
      setTimeout(() => navigate("/admin-dashboard"), 1000);
    } else if (email === credentials.fresher.email && password === credentials.fresher.password) {
      localStorage.setItem("userRole", "fresher");
      localStorage.setItem("isAuthenticated", "true");
      toast({ title: "Welcome Fresher!", description: "Redirecting to your dashboard..." });
      setTimeout(() => navigate("/fresher-dashboard"), 1000);
    } else {
      toast({ 
        title: "Login Failed", 
        description: "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-training-primary to-training-secondary">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Mavericks Training</CardTitle>
          </div>
          <CardDescription>
            Sign in to access your training dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              variant="training"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Demo Credentials:</h4>
            <div className="text-xs space-y-1">
              <div><strong>Admin:</strong> admin@mavericks.com / admin123</div>
              <div><strong>Fresher:</strong> fresher@mavericks.com / fresher123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;