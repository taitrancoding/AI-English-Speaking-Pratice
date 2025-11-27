import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";
import { listMyLearnerPackages, type LearnerPackage } from "@/lib/services/learnerPackage";
import * as progressReportService from "@/lib/services/progressReport";
import { listMySessions } from "@/lib/services/aiPracticeSession";
import {
  Award,
  BarChart3,
  BookOpen,
  Flame,
  Play,
  RefreshCcw,
  Target,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

const quickActions = [
  {
    icon: Play,
    title: "AI Practice Studio",
    description: "Luyện nói & chấm điểm bằng Gemini",
    url: "/learner/practice",
    color: "from-pink-500 to-pink-700",
  },
  {
    icon: MessageSquare,
    title: "Mentor Feedbacks",
    description: "Xem feedback từ mentor",
    url: "/learner/mentor-feedbacks",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: BookOpen,
    title: "Mentor Resources",
    description: "Tài liệu học tập từ mentor",
    url: "/learner/mentor-resources",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    icon: Target,
    title: "Mentor Assessments",
    description: "Đánh giá trình độ từ mentor",
    url: "/learner/mentor-assessments",
    color: "from-amber-500 to-amber-700",
  },
  {
    icon: BarChart3,
    title: "Progress Reports",
    description: "Theo dõi báo cáo mentor gửi",
    url: "/learner/reports",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    icon: MessageSquare,
    title: "Chat",
    description: "Trò chuyện với mentor và learner",
    url: "/learner/chat",
    color: "from-cyan-500 to-cyan-700",
  },
];

const LearnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { learner, isLoading: learnerLoading } = useCurrentLearnerProfile();
  const [packages, setPackages] = useState<LearnerPackage[]>([]);
  const [reports, setReports] = useState<progressReportService.ProgressReport[]>([]);
  const [sessions, setSessions] = useState<practiceService.AiPracticeSession[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!learner?.id) return;
    setLoading(true);
    try {
      const [pkgRes, reportRes, sessionRes] = await Promise.all([
        listMyLearnerPackages(0, 4),
        progressReportService.listMine(0, 3),
        listMySessions(0, 5),
      ]);
      setPackages(pkgRes.content ?? []);
      setReports(reportRes.content ?? []);
      setSessions(sessionRes.content ?? []);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Không thể tải dữ liệu dashboard",
        description: "Vui lòng thử lại hoặc liên hệ hỗ trợ.",
      });
    } finally {
      setLoading(false);
    }
  }, [learner?.id, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = useMemo(
    () => [
      {
        icon: Flame,
        label: "Thời gian luyện tập",
        value: learner?.totalPracticeMinutes
          ? `${learner.totalPracticeMinutes} phút`
          : "Chưa có dữ liệu",
        bg: "bg-orange-100",
        color: "text-orange-600",
      },
      {
        icon: TrendingUp,
        label: "Điểm AI trung bình",
        value: learner?.aiScore ? `${learner.aiScore.toFixed(1)} / 100` : "Đang đo lường",
        bg: "bg-blue-100",
        color: "text-blue-600",
      },
      {
        icon: Award,
        label: "Buổi luyện tập",
        value: learner?.totalPracticeSessions ?? sessions.length,
        bg: "bg-purple-100",
        color: "text-purple-600",
      },
    ],
    [learner, sessions.length]
  );

  const weeklyActivity = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);
    const activityMap = new Map<
      string,
      { sessions: number; minutes: number; latestFeedback?: string }
    >();

    sessions.forEach((session) => {
      if (!session.createdAt) return;
      const createdDate = new Date(session.createdAt);
      if (createdDate < weekAgo) return;
      const dayLabel = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(createdDate);
      const current = activityMap.get(dayLabel) ?? { sessions: 0, minutes: 0 };
      current.sessions += 1;
      current.minutes += session.durationMinutes ?? 0;
      current.latestFeedback = session.aiFeedback ?? current.latestFeedback;
      activityMap.set(dayLabel, current);
    });

    return Array.from(activityMap.entries()).map(([day, value]) => ({
      day,
      ...value,
    }));
  }, [sessions]);

  const isBusy = learnerLoading || loading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Chào mừng trở lại, {user?.name || "Learner"} 👋
          </h1>
          <p className="text-muted-foreground">
            Gemini đang theo dõi tiến độ của bạn mỗi buổi luyện tập. Cập nhật mới nhất được tổng hợp ngay bên dưới.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardData}
          disabled={isBusy || !learner?.id}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Làm mới dữ liệu
        </Button>
      </div>

      {isBusy && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-32 w-full" />
          ))}
        </div>
      )}

      {!isBusy && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx}>
                  <CardContent className="flex items-start justify-between pt-6">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">Lối tắt</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} to={action.url} className="group">
                    <Card className="h-full transition hover:-translate-y-1 hover:shadow-lg">
                      <CardContent className="pt-6">
                        <div
                          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} text-white transition group-hover:scale-110`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động trong tuần</CardTitle>
                <CardDescription>Các buổi Gemini ghi nhận 7 ngày gần nhất</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklyActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground">Bạn chưa có buổi luyện tập nào tuần này.</p>
                )}
                {weeklyActivity.map((item) => (
                  <div
                    key={item.day}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium capitalize">{item.day}</p>
                      <p className="text-muted-foreground">
                        {item.sessions} buổi • {item.minutes || 0} phút
                      </p>
                    </div>
                    {item.latestFeedback && (
                      <Badge variant="secondary" className="max-w-[220px] truncate">
                        {item.latestFeedback}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gói học đã mua</CardTitle>
                <CardDescription>Nhấn để xem chi tiết quyền lợi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {packages.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Bạn chưa mua gói nào. Truy cập mục My Packages để đăng ký.
                  </p>
                )}
                {packages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    to="/learner/packages"
                    className="flex items-center justify-between rounded-lg border p-3 text-sm transition hover:bg-muted/60"
                  >
                    <div>
                      <p className="font-semibold">{pkg.packageName || `Gói #${pkg.packageId}`}</p>
                      <p className="text-muted-foreground">
                        Hết hạn:{" "}
                        {pkg.expireDate
                          ? new Date(pkg.expireDate).toLocaleDateString("vi-VN")
                          : "—"}
                      </p>
                    </div>
                    <Badge variant="outline">{pkg.paymentStatus || "PENDING"}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* <Card>
              <CardHeader>
                <CardTitle>Học lộ trình cùng Gemini</CardTitle>
                <CardDescription>
                  Những đoạn hội thoại gần nhất sẽ hiển thị trong Learning Path
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Khi bạn hoàn thành một buổi luyện tập AI, lịch sử sẽ hiển thị ở đây.
                  </p>
                )}
                {sessions.map((session) => (
                  <div key={session.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{session.topic}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.createdAt
                            ? new Date(session.createdAt).toLocaleString("vi-VN")
                            : "—"}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {(session.pronunciationScore ?? 0).toFixed(1)}/10
                      </Badge>
                    </div>
                    {session.aiFeedback && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {session.aiFeedback}
                      </p>
                    )}
                  </div>
                ))}
                <Button asChild variant="outline" size="sm">
                  <Link to="/learner/learning-path">Xem toàn bộ lịch sử</Link>
                </Button>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>Báo cáo tiến độ mới nhất</CardTitle>
                <CardDescription>Mentor hoặc hệ thống đã tạo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Chưa có báo cáo nào. Mentor sẽ gửi báo cáo sau vài buổi học.
                  </p>
                )}
                {reports.map((report) => (
                  <Link
                    key={report.id}
                    to="/learner/reports"
                    className="rounded-lg border p-3 text-sm transition hover:bg-muted/60"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        Tuần {report.weekStart} → {report.weekEnd}
                      </p>
                      <Badge variant="outline">{report.totalSessions} buổi</Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground line-clamp-2">
                      {report.improvementNotes || "Chưa có ghi chú thêm."}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white">
            <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Giữ nhịp luyện tập cùng Gemini 🎯</h3>
                <p className="text-white/80">
                  Mỗi buổi luyện nói giúp AI cá nhân hóa lộ trình của bạn. Bắt đầu ngay để duy trì streak!
                </p>
              </div>
              <Button asChild className="bg-white text-purple-700 hover:bg-white/90">
                <Link to="/learner/practice">Luyện tập ngay</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default LearnerDashboard;
