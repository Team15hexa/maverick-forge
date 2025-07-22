import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Settings, Users, TrendingUp } from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-training-primary to-training-secondary">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Mavericks Training Hub
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive onboarding and training platform for new Mavericks. 
            Choose your role to access your personalized dashboard.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Fresher Card */}
          <Card className="relative overflow-hidden group hover:shadow-[var(--shadow-elegant)] transition-all duration-300 border-2 hover:border-training-primary/30">
            <div className="absolute inset-0 bg-gradient-to-br from-training-primary/5 to-training-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-success to-success-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Fresher Candidate</CardTitle>
                  <CardDescription>Access your personalized training dashboard</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span>Daily Quiz Status & Progress</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span>Coding Challenge Tracking</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-training-primary" />
                  <span>Assignment Submissions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-training-secondary" />
                  <span>Certification Progress</span>
                </div>
              </div>
              <Button 
                variant="training" 
                size="lg" 
                className="w-full mt-6"
                onClick={() => navigate('/fresher-dashboard')}
              >
                Access Fresher Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Administrator Card */}
          <Card className="relative overflow-hidden group hover:shadow-[var(--shadow-elegant)] transition-all duration-300 border-2 hover:border-primary/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-glow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Administrator</CardTitle>
                  <CardDescription>Manage training programs and monitor progress</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Fresher Search & Filtering</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span>System Performance Monitoring</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span>Progress Report Generation</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span>Advanced Analytics Dashboard</span>
                </div>
              </div>
              <Button 
                variant="premium" 
                size="lg" 
                className="w-full mt-6"
                onClick={() => navigate('/admin-dashboard')}
              >
                Access Admin Console
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">250+</div>
            <div className="text-muted-foreground">Active Trainees</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">95%</div>
            <div className="text-muted-foreground">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-training-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Support Available</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;