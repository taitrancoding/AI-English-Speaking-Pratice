import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";
import { useToast } from "@/components/ui/use-toast";
import * as practiceService from "@/lib/services/aiPracticeSession";
import { TrendingUp, Target, Award, Calendar } from "lucide-react";
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
} from "recharts";

interface PracticeSession {
  id: number;
  topic: string;
  pronunciationScore: number;
  grammarScore: number;
  vocabularyScore: number;
  createdAt: string;
}

export default function LearnerProgress() {
  const { learner, isLoading } = useCurrentLearnerProfile();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const response = await practiceService.listMySessions(0, 50);
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
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        toast({
          variant: "destructive",
          title: "Không thể tải dữ liệu",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [toast]);

  const chartData = sessions
    .slice(-10)
    .map((s, index) => ({
      name: `Session ${index + 1}`,
      pronunciation: s.pronunciationScore,
      grammar: s.grammarScore,
      vocabulary: s.vocabularyScore,
      average: (s.pronunciationScore + s.grammarScore + s.vocabularyScore) / 3,
    }));

  const weeklyData = sessions
    .filter((s) => {
      const date = new Date(s.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    })
    .reduce((acc, s) => {
      const date = new Date(s.createdAt).toLocaleDateString("vi-VN");
      if (!acc[date]) {
        acc[date] = { date, count: 0, avgScore: 0 };
      }
      acc[date].count++;
      acc[date].avgScore +=
        (s.pronunciationScore + s.grammarScore + s.vocabularyScore) / 3;
      return acc;
    }, {} as Record<string, { date: string; count: number; avgScore: number }>);

  const weeklyChartData = Object.values(weeklyData).map((d) => ({
    date: d.date,
    sessions: d.count,
    avgScore: d.avgScore / d.count,
  }));

  const overallProgress = learner?.aiScore || 0;
  const pronunciationAvg =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.pronunciationScore, 0) / sessions.length
      : 0;
  const grammarAvg =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.grammarScore, 0) / sessions.length
      : 0;
  const vocabularyAvg =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.vocabularyScore, 0) / sessions.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tiến độ học tập</h1>
        <p className="text-muted-foreground">
          Theo dõi và phân tích tiến độ luyện tập của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm tổng thể</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}/100</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phát âm</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pronunciationAvg.toFixed(1)}/10</div>
            <Progress value={(pronunciationAvg / 10) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngữ pháp</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grammarAvg.toFixed(1)}/10</div>
            <Progress value={(grammarAvg / 10) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ vựng</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vocabularyAvg.toFixed(1)}/10</div>
            <Progress value={(vocabularyAvg / 10) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trend">Xu hướng</TabsTrigger>
          <TabsTrigger value="weekly">Tuần này</TabsTrigger>
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng điểm số</CardTitle>
              <CardDescription>10 buổi luyện tập gần nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pronunciation"
                    stroke="#8884d8"
                    name="Phát âm"
                  />
                  <Line
                    type="monotone"
                    dataKey="grammar"
                    stroke="#82ca9d"
                    name="Ngữ pháp"
                  />
                  <Line
                    type="monotone"
                    dataKey="vocabulary"
                    stroke="#ffc658"
                    name="Từ vựng"
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#ff7300"
                    name="Trung bình"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động tuần này</CardTitle>
              <CardDescription>Số buổi luyện tập và điểm trung bình</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sessions" fill="#8884d8" name="Số buổi" />
                  <Bar
                    yAxisId="right"
                    dataKey="avgScore"
                    fill="#82ca9d"
                    name="Điểm TB"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết các buổi luyện tập</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <p>Đang tải...</p>}
              {!loading && sessions.length === 0 && (
                <p className="text-muted-foreground">Chưa có buổi luyện tập nào</p>
              )}
              <div className="space-y-2">
                {sessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between border rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">{session.topic}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        P: {session.pronunciationScore.toFixed(1)}
                      </Badge>
                      <Badge variant="outline">G: {session.grammarScore.toFixed(1)}</Badge>
                      <Badge variant="outline">
                        V: {session.vocabularyScore.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


