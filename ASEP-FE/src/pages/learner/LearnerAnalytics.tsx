import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";
import { useToast } from "@/components/ui/use-toast";
import * as practiceService from "@/lib/services/aiPracticeSession";
import { Trophy, Flame, Target, TrendingUp, Calendar, Award } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface SessionData {
  id: number;
  topic: string;
  pronunciationScore: number;
  grammarScore: number;
  vocabularyScore: number;
  createdAt: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function LearnerAnalytics() {
  const { learner, isLoading } = useCurrentLearnerProfile();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await practiceService.listMySessions(0, 100);
        const data = response.data?.content || response.data || [];
        setSessions(
          data.map((item: any) => ({
            id: item.id,
            topic: item.topic || "Unknown",
            pronunciationScore: item.pronunciationScore || 0,
            grammarScore: item.grammarScore || 0,
            vocabularyScore: item.vocabularyScore || 0,
            createdAt: item.createdAt,
          }))
        );

        // Calculate streak
        const sortedSessions = [...data]
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        let currentStreak = 0;
        let lastDate: Date | null = null;
        
        for (const session of sortedSessions) {
          const sessionDate = new Date(session.createdAt);
          sessionDate.setHours(0, 0, 0, 0);
          
          if (!lastDate) {
            lastDate = sessionDate;
            currentStreak = 1;
          } else {
            const diffDays = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              currentStreak++;
              lastDate = sessionDate;
            } else if (diffDays > 1) {
              break;
            }
          }
        }
        
        setStreak(currentStreak);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          variant: "destructive",
          title: "Không thể tải dữ liệu",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Heat map data (last 30 days)
  const heatMapData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split("T")[0];
    
    const daySessions = sessions.filter((s) => {
      const sessionDate = new Date(s.createdAt).toISOString().split("T")[0];
      return sessionDate === dateStr;
    });
    
    return {
      date: date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" }),
      count: daySessions.length,
      intensity: daySessions.length > 0 ? Math.min(daySessions.length * 20, 100) : 0,
    };
  });

  // Topic distribution
  const topicDistribution = sessions.reduce((acc, s) => {
    acc[s.topic] = (acc[s.topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topicChartData = Object.entries(topicDistribution)
    .map(([name, value]) => ({ name, value }))
    .slice(0, 5);

  // Weekly performance
  const weeklyPerformance = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    
    const daySessions = sessions.filter((s) => {
      const sessionDate = new Date(s.createdAt).toISOString().split("T")[0];
      return sessionDate === dateStr;
    });
    
    const avgScore =
      daySessions.length > 0
        ? daySessions.reduce((sum, s) => {
            return sum + (s.pronunciationScore + s.grammarScore + s.vocabularyScore) / 3;
          }, 0) / daySessions.length
        : 0;
    
    return {
      day: date.toLocaleDateString("vi-VN", { weekday: "short" }),
      score: avgScore,
      sessions: daySessions.length,
    };
  });

  const overallAvg =
    sessions.length > 0
      ? sessions.reduce((sum, s) => {
          return sum + (s.pronunciationScore + s.grammarScore + s.vocabularyScore) / 3;
        }, 0) / sessions.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Phân tích chi tiết về hiệu suất học tập của bạn
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuỗi luyện tập</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak} ngày</div>
            <p className="text-xs text-muted-foreground">Liên tiếp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng buổi luyện tập</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">Buổi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAvg.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Tất cả kỹ năng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learner?.aiScore?.toFixed(1) || 0}/100</div>
            <p className="text-xs text-muted-foreground">Tổng thể</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList>
          <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
          <TabsTrigger value="weekly">Tuần này</TabsTrigger>
          <TabsTrigger value="topics">Chủ đề</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Heat Map - 30 ngày qua</CardTitle>
              <CardDescription>Số buổi luyện tập mỗi ngày</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {heatMapData.map((day, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded border flex flex-col items-center justify-center text-xs"
                    style={{
                      backgroundColor: day.intensity > 0
                        ? `rgba(34, 197, 94, ${day.intensity / 100})`
                        : "transparent",
                    }}
                    title={`${day.date}: ${day.count} buổi`}
                  >
                    <div className="font-medium">{day.count}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {day.date.split(" ")[0]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Ít hơn</span>
                <div className="flex gap-1">
                  {[0, 25, 50, 75, 100].map((intensity) => (
                    <div
                      key={intensity}
                      className="w-3 h-3 rounded border"
                      style={{
                        backgroundColor: intensity > 0
                          ? `rgba(34, 197, 94, ${intensity / 100})`
                          : "transparent",
                      }}
                    />
                  ))}
                </div>
                <span>Nhiều hơn</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất tuần này</CardTitle>
              <CardDescription>Điểm trung bình và số buổi luyện tập</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sessions" fill="#8884d8" name="Số buổi" />
                  <Bar yAxisId="right" dataKey="score" fill="#82ca9d" name="Điểm TB" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân bố chủ đề</CardTitle>
              <CardDescription>Các chủ đề bạn đã luyện tập</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topicChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topicChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


