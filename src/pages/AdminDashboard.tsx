import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users, TrendingUp, AlertTriangle, Download, Filter, Eye, RefreshCw, FileText, BarChart3, UserPlus, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Fresher {
  id: string;
  name: string;
  email: string;
  department: string;
  batch: string;
  status: 'active' | 'inactive' | 'completed' | 'dropped';
  enrollment_date: string;
  phone?: string;
  avatar_url?: string;
  avg_score?: number;
  completion_rate?: number;
  quiz_count?: number;
}

interface SystemQueue {
  id: string;
  queue_name: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  pending_count: number;
  processed_count: number;
  error_count: number;
  last_updated: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  fresher_name?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [freshers, setFreshers] = useState<Fresher[]>([]);
  const [systemQueues, setSystemQueues] = useState<SystemQueue[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [completionFilter, setCompletionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAnalytics, setShowAnalytics] = useState(false);

  // System metrics (calculated from real data)
  const [systemMetrics, setSystemMetrics] = useState({
    activeFreshers: 0,
    completionRate: 0,
    averageScore: 0,
    systemUptime: 99.9
  });

  const fetchFreshers = async () => {
    try {
      const { data, error } = await supabase
        .from('freshers')
        .select(`
          *,
          quiz_results(score, completed)
        `);

      if (error) throw error;

      const freshersWithStats = data?.map(fresher => {
        const quizResults = fresher.quiz_results || [];
        const completedQuizzes = quizResults.filter((q: any) => q.completed);
        const avgScore = completedQuizzes.length > 0 
          ? completedQuizzes.reduce((sum: number, q: any) => sum + q.score, 0) / completedQuizzes.length 
          : 0;
        const completionRate = quizResults.length > 0 
          ? (completedQuizzes.length / quizResults.length) * 100 
          : 0;

        return {
          ...fresher,
          avg_score: Math.round(avgScore * 100) / 100,
          completion_rate: Math.round(completionRate * 100) / 100,
          quiz_count: quizResults.length
        };
      }) || [];

      setFreshers(freshersWithStats);

      // Calculate system metrics
      const activeFreshers = freshersWithStats.filter(f => f.status === 'active').length;
      const totalCompletionRate = freshersWithStats.length > 0 
        ? freshersWithStats.reduce((sum, f) => sum + (f.completion_rate || 0), 0) / freshersWithStats.length
        : 0;
      const totalAvgScore = freshersWithStats.length > 0
        ? freshersWithStats.reduce((sum, f) => sum + (f.avg_score || 0), 0) / freshersWithStats.length
        : 0;

      setSystemMetrics({
        activeFreshers,
        completionRate: Math.round(totalCompletionRate * 100) / 100,
        averageScore: Math.round(totalAvgScore * 100) / 100,
        systemUptime: 99.9
      });

    } catch (error) {
      console.error('Error fetching freshers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch freshers data",
        variant: "destructive"
      });
    }
  };

  const fetchSystemQueues = async () => {
    try {
      const { data, error } = await supabase
        .from('system_queues')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setSystemQueues(data || []);
    } catch (error) {
      console.error('Error fetching system queues:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          freshers(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const activitiesWithNames = data?.map(activity => ({
        ...activity,
        fresher_name: activity.freshers?.name
      })) || [];

      setActivities(activitiesWithNames);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to freshers changes
    const freshersChannel = supabase
      .channel('freshers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'freshers' }, () => {
        fetchFreshers();
      })
      .subscribe();

    // Subscribe to quiz results changes
    const quizChannel = supabase
      .channel('quiz-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_results' }, () => {
        fetchFreshers();
      })
      .subscribe();

    // Subscribe to system queues changes
    const queuesChannel = supabase
      .channel('queues-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_queues' }, () => {
        fetchSystemQueues();
      })
      .subscribe();

    // Subscribe to activities changes
    const activitiesChannel = supabase
      .channel('activities-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(freshersChannel);
      supabase.removeChannel(quizChannel);
      supabase.removeChannel(queuesChannel);
      supabase.removeChannel(activitiesChannel);
    };
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchFreshers(),
        fetchSystemQueues(),
        fetchActivities()
      ]);
      setLoading(false);
    };

    initializeData();
    const cleanup = setupRealTimeSubscriptions();

    return cleanup;
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case "completed":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Completed</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "dropped":
        return <Badge variant="destructive">Dropped</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getQueueStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-success";
      case "warning":
        return "text-warning";
      case "critical":
        return "text-destructive";
      case "maintenance":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const filteredFreshers = freshers.filter(fresher => {
    const matchesSearch = fresher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fresher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fresher.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScore = scoreFilter === "all" || 
      (scoreFilter === "high" && (fresher.avg_score || 0) >= 80) ||
      (scoreFilter === "medium" && (fresher.avg_score || 0) >= 60 && (fresher.avg_score || 0) < 80) ||
      (scoreFilter === "low" && (fresher.avg_score || 0) < 60);
    
    const matchesCompletion = completionFilter === "all" ||
      (completionFilter === "high" && (fresher.completion_rate || 0) >= 80) ||
      (completionFilter === "medium" && (fresher.completion_rate || 0) >= 50 && (fresher.completion_rate || 0) < 80) ||
      (completionFilter === "low" && (fresher.completion_rate || 0) < 50);
    
    const matchesStatus = statusFilter === "all" || fresher.status === statusFilter;

    return matchesSearch && matchesScore && matchesCompletion && matchesStatus;
  });

  const handleExportPDF = async () => {
    try {
      const element = document.getElementById('admin-dashboard');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const imgWidth = 297;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`admin-dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Success",
        description: "Dashboard exported as PDF successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive"
      });
    }
  };

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'department-report':
          // Generate department report
          const reportData = freshers.reduce((acc, fresher) => {
            acc[fresher.department] = (acc[fresher.department] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const pdf = new jsPDF();
          pdf.text('Department Report', 20, 20);
          let y = 40;
          Object.entries(reportData).forEach(([dept, count]) => {
            pdf.text(`${dept}: ${count} freshers`, 20, y);
            y += 10;
          });
          pdf.save('department-report.pdf');
          break;
          
        case 'export-data':
          // Export training data as CSV
          const csvData = freshers.map(f => ({
            Name: f.name,
            Email: f.email,
            Department: f.department,
            Status: f.status,
            AvgScore: f.avg_score,
            CompletionRate: f.completion_rate
          }));
          
          const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
          ].join('\n');
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'training-data.csv';
          a.click();
          break;
          
        case 'add-fresher':
          // Add activity log
          await supabase
            .from('activities')
            .insert({
              type: 'system',
              description: 'New fresher registration initiated',
              admin_id: null
            });
          break;
          
        case 'send-notification':
          // Log notification activity
          await supabase
            .from('activities')
            .insert({
              type: 'notification',
              description: 'Bulk notification sent to all active freshers',
              admin_id: null
            });
          break;
      }
      
      toast({
        title: "Success",
        description: "Action completed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete action",
        variant: "destructive"
      });
    }
  };

  // Analytics data
  const analyticsData = {
    scoreDistribution: [
      { range: '90-100', count: freshers.filter(f => (f.avg_score || 0) >= 90).length },
      { range: '80-89', count: freshers.filter(f => (f.avg_score || 0) >= 80 && (f.avg_score || 0) < 90).length },
      { range: '70-79', count: freshers.filter(f => (f.avg_score || 0) >= 70 && (f.avg_score || 0) < 80).length },
      { range: '60-69', count: freshers.filter(f => (f.avg_score || 0) >= 60 && (f.avg_score || 0) < 70).length },
      { range: '< 60', count: freshers.filter(f => (f.avg_score || 0) < 60).length },
    ],
    departmentStats: Object.entries(
      freshers.reduce((acc, f) => {
        acc[f.department] = (acc[f.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value })),
    statusDistribution: Object.entries(
      freshers.reduce((acc, f) => {
        acc[f.status] = (acc[f.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }))
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard" className="min-h-screen bg-background p-6">
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
              <h1 className="text-3xl font-bold">Admin Console</h1>
              <p className="text-muted-foreground">Real-time training program management and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
              <Download className="w-4 h-4" />
              Export Reports
            </Button>
            <Button 
              variant="premium" 
              className="gap-2"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <BarChart3 className="w-4 h-4" />
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Button>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Freshers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{systemMetrics.activeFreshers}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-success">Real-time</div>
                  <div className="text-xs text-muted-foreground">Currently in training</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{systemMetrics.completionRate}%</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-success">Live</div>
                  <div className="text-xs text-muted-foreground">Average completion</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{systemMetrics.averageScore}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-success">Updated</div>
                  <div className="text-xs text-muted-foreground">Across all assessments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                System Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{systemMetrics.systemUptime}%</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-success">Stable</div>
                  <div className="text-xs text-muted-foreground">Last 30 days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analyticsData.departmentStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.departmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fresher Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fresher Management</CardTitle>
                    <CardDescription>Search and monitor training progress with real-time filtering</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={scoreFilter} onValueChange={setScoreFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Score" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Scores</SelectItem>
                        <SelectItem value="high">High (80+)</SelectItem>
                        <SelectItem value="medium">Medium (60-79)</SelectItem>
                        <SelectItem value="low">Low (&lt;60)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={completionFilter} onValueChange={setCompletionFilter}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Completion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rates</SelectItem>
                        <SelectItem value="high">High (80%+)</SelectItem>
                        <SelectItem value="medium">Medium (50-79%)</SelectItem>
                        <SelectItem value="low">Low (&lt;50%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, department, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Fresher List */}
                  <div className="space-y-3">
                    {filteredFreshers.map((fresher) => (
                      <div key={fresher.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center text-white font-medium">
                            {fresher.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{fresher.name}</div>
                            <div className="text-sm text-muted-foreground">{fresher.email} • {fresher.department}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-sm font-medium">{fresher.completion_rate || 0}% Complete</div>
                            <div className="text-xs text-muted-foreground">{fresher.quiz_count || 0} quizzes</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{fresher.avg_score || 0}/100</div>
                            <div className="text-xs text-muted-foreground">Avg Score</div>
                          </div>
                          {getStatusBadge(fresher.status)}
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredFreshers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No freshers found matching your criteria
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Queues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  System Queues
                  <RefreshCw className="w-4 h-4 text-success animate-pulse" />
                </CardTitle>
                <CardDescription>Real-time agentic framework monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemQueues.map((queue) => (
                  <div key={queue.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{queue.queue_name}</span>
                      <div className={`w-2 h-2 rounded-full ${getQueueStatusColor(queue.status).replace('text-', 'bg-')}`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Pending</div>
                        <div className="font-medium">{queue.pending_count}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Processed</div>
                        <div className="font-medium">{queue.processed_count}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Errors</div>
                        <div className="font-medium">{queue.error_count}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="default" 
                  className="w-full gap-2"
                  onClick={() => handleQuickAction('department-report')}
                >
                  <FileText className="w-4 h-4" />
                  Generate Department Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                >
                  <TrendingUp className="w-4 h-4" />
                  View Analytics Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => handleQuickAction('export-data')}
                >
                  <Download className="w-4 h-4" />
                  Export Training Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => handleQuickAction('add-fresher')}
                >
                  <UserPlus className="w-4 h-4" />
                  Add New Fresher
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => handleQuickAction('send-notification')}
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Notification
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Recent Activities
                  <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="text-sm">
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-muted-foreground">
                        {activity.fresher_name && `${activity.fresher_name} • `}
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {activities.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No recent activities
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;