import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Award, BookOpen, Code, FileText, Trophy, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Quiz from "@/components/Quiz";

const FresherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [overallProgress, setOverallProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [fresherData, setFresherData] = useState({
    name: "Loading...",
    id: "",
    department: "",
    joinDate: "",
    currentPhase: "Foundation Training"
  });
  const [quizStats, setQuizStats] = useState({
    completed: 0,
    total: 20,
    avgScore: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch fresher data from database
  const fetchFresherData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Get fresher profile
      const { data: fresher, error: fresherError } = await supabase
        .from('freshers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fresherError) throw fresherError;

      // Get quiz results
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('fresher_id', fresher.id);

      if (quizError) throw quizError;

      const completedQuizzes = quizResults?.filter(q => q.completed) || [];
      const avgScore = completedQuizzes.length > 0 
        ? completedQuizzes.reduce((sum, q) => sum + q.score, 0) / completedQuizzes.length 
        : 0;

      setFresherData({
        name: fresher.name,
        id: `MAV-${fresher.id.slice(0, 8)}`,
        department: fresher.department,
        joinDate: new Date(fresher.enrollment_date).toLocaleDateString(),
        currentPhase: "Foundation Training"
      });

      setQuizStats({
        completed: completedQuizzes.length,
        total: 20,
        avgScore: Math.round(avgScore * 100) / 100
      });

    } catch (error: any) {
      console.error('Error fetching fresher data:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFresherData();
  }, []);

  const trainingModules = [
    {
      id: 1,
      title: "Daily Quiz",
      status: "completed",
      score: "8/10",
      lastUpdated: "Today",
      icon: BookOpen,
      color: "success"
    },
    {
      id: 2,
      title: "Coding Challenge",
      status: "in-progress",
      score: "3/5 completed",
      lastUpdated: "2 hours ago",
      icon: Code,
      color: "warning"
    },
    {
      id: 3,
      title: "Assignment Submission",
      status: "pending",
      score: "Not started",
      lastUpdated: "Due in 3 days",
      icon: FileText,
      color: "pending"
    },
    {
      id: 4,
      title: "Certification",
      status: "in-progress",
      score: "70% complete",
      lastUpdated: "Yesterday",
      icon: Award,
      color: "warning"
    }
  ];

  const workflowSteps = [
    { label: "Profile Updated", completed: true },
    { label: "Daily Quiz Completed", completed: true },
    { label: "Coding Challenge Submitted", completed: false, current: true },
    { label: "Assignment Submitted", completed: false },
    { label: "Certification Completed", completed: false }
  ];

  useEffect(() => {
    const completedSteps = workflowSteps.filter(step => step.completed).length;
    const progress = (completedSteps / workflowSteps.length) * 100;
    setOverallProgress(progress);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-warning" />;
      default:
        return <AlertCircle className="w-5 h-5 text-progress-pending" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: fresher } = await supabase
        .from('freshers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (fresher) {
        await supabase
          .from('quiz_results')
          .insert({
            fresher_id: fresher.id,
            score: score,
            total_questions: totalQuestions,
            correct_answers: score,
            completed: true
          });

        // Refresh data
        fetchFresherData();
        
        toast({
          title: "Quiz Completed!",
          description: `You scored ${score}/${totalQuestions}`,
        });
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz result",
        variant: "destructive"
      });
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (showQuiz) {
    return <Quiz onComplete={handleQuizComplete} onClose={handleCloseQuiz} />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Training Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {fresherData.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{fresherData.currentPhase}</Badge>
            <div className="text-right text-sm">
              <div className="font-medium">{fresherData.id}</div>
              <div className="text-muted-foreground">{fresherData.department}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-training-primary" />
                  Overall Training Progress
                </CardTitle>
                <CardDescription>
                  Your current progress through the Mavericks training program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{overallProgress}% Complete</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                  
                  {/* Workflow Steps */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Current Workflow</h4>
                    <div className="space-y-3">
                      {workflowSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            step.completed 
                              ? 'bg-success' 
                              : step.current 
                                ? 'bg-warning animate-pulse' 
                                : 'bg-progress-pending'
                          }`} />
                          <span className={`text-sm ${
                            step.completed ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </span>
                          {step.completed && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
                          {step.current && <Clock className="w-4 h-4 text-warning ml-auto" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Modules */}
            <div className="grid md:grid-cols-2 gap-4">
              {trainingModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Card key={module.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            module.color === 'success' ? 'bg-success/10' :
                            module.color === 'warning' ? 'bg-warning/10' :
                            'bg-muted'
                          }`}>
                            <IconComponent className={`w-4 h-4 ${
                              module.color === 'success' ? 'text-success' :
                              module.color === 'warning' ? 'text-warning' :
                              'text-muted-foreground'
                            }`} />
                          </div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                        </div>
                        {getStatusIcon(module.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Score</span>
                          <span className="text-sm font-medium">{module.score}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Last Updated</span>
                          <span className="text-sm">{module.lastUpdated}</span>
                        </div>
                        <Badge variant={getStatusBadgeVariant(module.status)} className="w-fit">
                          {module.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex justify-between">
                   <span className="text-sm text-muted-foreground">Quizzes Completed</span>
                   <span className="font-medium">{quizStats.completed}/{quizStats.total}</span>
                 </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Coding Challenges</span>
                  <span className="font-medium">8/12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Assignments</span>
                  <span className="font-medium">5/8</span>
                </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Score</span>
                    <span className="font-medium">{quizStats.avgScore}/100</span>
                  </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">React Assignment</div>
                    <div className="text-xs text-muted-foreground">Due in 3 days</div>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium text-sm">AWS Certification</div>
                    <div className="text-xs text-muted-foreground">Due in 1 week</div>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button variant="training" className="w-full" onClick={handleStartQuiz}>
                Start Today's Quiz
              </Button>
              <Button variant="outline" className="w-full">
                View Learning Resources
              </Button>
              <Button variant="ghost" className="w-full">
                Contact Mentor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FresherDashboard;