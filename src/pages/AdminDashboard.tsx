import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Users, TrendingUp, AlertTriangle, Download, Filter, Eye, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for admin overview
  const systemMetrics = [
    {
      title: "Active Freshers",
      value: "248",
      change: "+12%",
      trend: "up",
      description: "Currently in training"
    },
    {
      title: "Completion Rate",
      value: "94.5%",
      change: "+2.3%",
      trend: "up",
      description: "This month"
    },
    {
      title: "Average Score",
      value: "87.2",
      change: "+1.8%",
      trend: "up",
      description: "Across all assessments"
    },
    {
      title: "System Uptime",
      value: "99.9%",
      change: "0%",
      trend: "stable",
      description: "Last 30 days"
    }
  ];

  const freshersData = [
    {
      id: "MAV-2024-001",
      name: "Alex Johnson",
      department: "Software Engineering",
      progress: 85,
      status: "on-track",
      lastActivity: "2 hours ago",
      quizScore: "8.5/10",
      codingProgress: "75%"
    },
    {
      id: "MAV-2024-002",
      name: "Sarah Chen",
      department: "Data Science",
      progress: 92,
      status: "ahead",
      lastActivity: "1 hour ago",
      quizScore: "9.2/10",
      codingProgress: "85%"
    },
    {
      id: "MAV-2024-003",
      name: "Michael Rodriguez",
      department: "DevOps",
      progress: 68,
      status: "behind",
      lastActivity: "5 hours ago",
      quizScore: "7.1/10",
      codingProgress: "60%"
    },
    {
      id: "MAV-2024-004",
      name: "Emily Watson",
      department: "Frontend",
      progress: 78,
      status: "on-track",
      lastActivity: "30 minutes ago",
      quizScore: "8.0/10",
      codingProgress: "70%"
    },
    {
      id: "MAV-2024-005",
      name: "David Kim",
      department: "Backend",
      progress: 96,
      status: "ahead",
      lastActivity: "4 hours ago",
      quizScore: "9.5/10",
      codingProgress: "90%"
    }
  ];

  const systemQueues = [
    {
      name: "Assessment Queue",
      count: 23,
      avgLatency: "1.2s",
      errorRate: "0.1%",
      status: "healthy"
    },
    {
      name: "Profile Updates",
      count: 7,
      avgLatency: "0.8s",
      errorRate: "0%",
      status: "healthy"
    },
    {
      name: "Report Generation",
      count: 15,
      avgLatency: "3.1s",
      errorRate: "0.3%",
      status: "warning"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ahead":
        return <Badge className="bg-success/10 text-success border-success/20">Ahead</Badge>;
      case "on-track":
        return <Badge variant="outline">On Track</Badge>;
      case "behind":
        return <Badge variant="destructive">Behind</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getQueueStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-success";
      case "warning":
        return "text-warning";
      case "error":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const filteredFreshers = freshersData.filter(fresher =>
    fresher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fresher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fresher.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold">Admin Console</h1>
              <p className="text-muted-foreground">Training program management and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Reports
            </Button>
            <Button variant="premium" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </Button>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs ${
                      metric.trend === 'up' ? 'text-success' : 
                      metric.trend === 'down' ? 'text-destructive' : 
                      'text-muted-foreground'
                    }`}>
                      {metric.change}
                    </div>
                    <div className="text-xs text-muted-foreground">{metric.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fresher Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fresher Management</CardTitle>
                    <CardDescription>Search and monitor training progress</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, department, or ID..."
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
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-training-primary to-training-secondary flex items-center justify-center text-white font-medium">
                            {fresher.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{fresher.name}</div>
                            <div className="text-sm text-muted-foreground">{fresher.id} • {fresher.department}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-sm font-medium">{fresher.progress}% Complete</div>
                            <div className="text-xs text-muted-foreground">{fresher.lastActivity}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">{fresher.quizScore}</div>
                            <div className="text-xs text-muted-foreground">Quiz Score</div>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Queues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Queues</CardTitle>
                <CardDescription>Agentic framework monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemQueues.map((queue, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{queue.name}</span>
                      <div className={`w-2 h-2 rounded-full ${getQueueStatusColor(queue.status).replace('text-', 'bg-')}`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Queue</div>
                        <div className="font-medium">{queue.count}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Latency</div>
                        <div className="font-medium">{queue.avgLatency}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Errors</div>
                        <div className="font-medium">{queue.errorRate}</div>
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
                <Button variant="training" className="w-full gap-2">
                  <Users className="w-4 h-4" />
                  Generate Department Report
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <TrendingUp className="w-4 h-4" />
                  View Analytics Dashboard
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Export Training Data
                </Button>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">High latency detected</div>
                    <div className="text-muted-foreground">Report generation queue</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">3 freshers behind schedule</div>
                    <div className="text-muted-foreground">Require attention</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;