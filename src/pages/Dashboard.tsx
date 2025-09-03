import { useEffect, useState } from 'react';
import { Users, BookOpen, UserCheck, Award, TrendingUp, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Student, Course, Registration, Result } from '@/types';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalRegistrations: number;
  totalResults: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    totalResults: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, we'd have a dashboard endpoint
      // For demo, we'll use mock data
      const mockStats = {
        totalStudents: 1247,
        totalCourses: 85,
        totalRegistrations: 3421,
        totalResults: 2156,
      };
      
      const mockRecentRegistrations: Registration[] = [
        {
          id: 1,
          student: { id: 1, studentNumber: 'S001', name: 'Alice Johnson', email: 'alice@example.com', role: 'student' },
          course: { id: 1, title: 'Introduction to Computer Science', code: 'CS101', credits: 3, instructor: 'Dr. Smith' },
          registrationDate: '2024-01-15',
        },
        {
          id: 2,
          student: { id: 2, studentNumber: 'S002', name: 'Bob Wilson', email: 'bob@example.com', role: 'student' },
          course: { id: 2, title: 'Advanced Mathematics', code: 'MATH201', credits: 4, instructor: 'Prof. Davis' },
          registrationDate: '2024-01-14',
        },
      ];

      setStats(mockStats);
      setRecentRegistrations(mockRecentRegistrations);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      description: 'Active enrolled students',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12 this month',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses.toLocaleString(),
      description: 'Available courses',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3 this month',
    },
    {
      title: 'Registrations',
      value: stats.totalRegistrations.toLocaleString(),
      description: 'Course registrations',
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+145 this month',
    },
    {
      title: 'Results Recorded',
      value: stats.totalResults.toLocaleString(),
      description: 'Graded assessments',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+89 this week',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the University Course Management System
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Academic Calendar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">{stat.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Latest course registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRegistrations.map((registration) => (
                <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{registration.student.name}</p>
                    <p className="text-sm text-muted-foreground">{registration.course.title}</p>
                    <p className="text-xs text-muted-foreground">{registration.registrationDate}</p>
                  </div>
                  <Badge variant="secondary">{registration.course.code}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add New Student
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Register Student
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Record Result
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}