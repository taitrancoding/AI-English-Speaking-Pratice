import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, BookOpen, MessageSquare } from "lucide-react";
import { useMentor } from "@/contexts/MentorContext";
import { useAuth } from "@/hooks/use-auth";
import apiClient from "@/lib/api";

const MentorDashboard: React.FC = () => {
  const { mentors, fetchMentors } = useMentor();
  const { user } = useAuth();
  const [currentMentor, setCurrentMentor] = useState<(typeof mentors)[0] | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insights, setInsights] = useState({
    activeLearners: 0,
    sessionsThisWeek: 0,
    feedbackGiven: 0,
    resourcesShared: 0,
  });
  const [recentLearners, setRecentLearners] = useState<
    { id: number; name: string; level: string; lastSession: string }[]
  >([]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  useEffect(() => {
    // Find current mentor by email
    if (mentors.length > 0 && user?.email) {
      const found = mentors.find(m => m.email === user.email);
      if (found) {
        setCurrentMentor(found);
      }
    }
  }, [mentors, user?.email]);

  const loadMentorInsights = useCallback(async () => {
    setLoadingInsights(true);
    setInsightsError(null);
    try {
      const [assessmentsRes, feedbackRes, resourcesRes] = await Promise.all([
        apiClient.get("/assessments/mentor/me"),
        apiClient.get("/mentor-feedback/mentor/me"),
        apiClient.get("/mentor-resources/mentor/me"),
      ]);

      const assessments = Array.isArray(assessmentsRes.data) ? assessmentsRes.data : [];
      const feedbacks = Array.isArray(feedbackRes.data) ? feedbackRes.data : [];
      const resources = Array.isArray(resourcesRes.data) ? resourcesRes.data : [];

      const learnerIds = new Set<number>();
      assessments.forEach((assessment) => {
        if (assessment?.learnerId) learnerIds.add(assessment.learnerId);
      });
      feedbacks.forEach((feedback) => {
        if (feedback?.learnerId) learnerIds.add(feedback.learnerId);
      });

      const sessionsThisWeek = assessments.filter((assessment) => {
        if (!assessment?.assessmentDate) return false;
        const date = new Date(assessment.assessmentDate);
        const diff = Date.now() - date.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000 && diff >= 0;
      }).length;

      const sortedAssessments = assessments
        .filter((a) => a?.assessmentDate)
        .sort(
          (a, b) =>
            new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
        )
        .slice(0, 4)
        .map((item) => ({
          id: item.learnerId,
          name: item.learnerName || `Learner #${item.learnerId}`,
          level: item.assessedLevel || "—",
          lastSession: item.assessmentDate
            ? new Date(item.assessmentDate).toLocaleDateString("vi-VN")
            : "—",
        }));

      setInsights({
        activeLearners: learnerIds.size,
        sessionsThisWeek,
        feedbackGiven: feedbacks.length,
        resourcesShared: resources.length,
      });
      setRecentLearners(
        sortedAssessments.length > 0
          ? sortedAssessments
          : feedbacks.slice(0, 4).map((feedback) => ({
              id: feedback.learnerId,
              name: feedback.learnerName || `Learner #${feedback.learnerId}`,
              level: feedback.isImmediate ? "Immediate feedback" : "Feedback",
              lastSession: feedback.feedbackDate
                ? new Date(feedback.feedbackDate).toLocaleDateString("vi-VN")
                : "—",
            }))
      );
    } catch (error) {
      console.error("Failed to load mentor insights", error);
      setInsightsError(
        error instanceof Error ? error.message : "Không thể tải dữ liệu dashboard"
      );
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  useEffect(() => {
    loadMentorInsights();
  }, [loadMentorInsights]);

  const stats = [
    {
      icon: Users,
      label: "Active Learners",
      value: (currentMentor?.totalStudents ?? insights.activeLearners).toString(),
      color: "bg-blue-100",
    },
    {
      icon: Calendar,
      label: "Sessions This Week",
      value: insights.sessionsThisWeek.toString(),
      color: "bg-purple-100",
    },
    {
      icon: BookOpen,
      label: "Feedback Given",
      value: insights.feedbackGiven.toString(),
      color: "bg-green-100",
    },
    {
      icon: MessageSquare,
      label: "Resources Shared",
      value: insights.resourcesShared.toString(),
      color: "bg-pink-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Mentor! 👋</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening with your learners today</p>
        {insightsError && (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {insightsError}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Learners */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Learners</CardTitle>
          <CardDescription>Your most active learners this week</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInsights && (
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu gần đây...</p>
          )}
          {!loadingInsights && recentLearners.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Chưa có hoạt động nào gần đây. Hãy tạo assessment hoặc feedback đầu tiên của bạn!
            </p>
          )}
          <div className="space-y-4">
            {recentLearners.map((learner) => (
              <div
                key={`${learner.id}-${learner.lastSession}`}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
              >
                <div className="flex-1">
                  <h4 className="font-semibold">{learner.name}</h4>
                  <p className="text-sm text-muted-foreground">{learner.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Last session</p>
                  <p className="text-sm font-medium">{learner.lastSession}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-4">
          <Users className="w-6 h-6 mb-2" />
          <span>My Learners</span>
        </Button>
        <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-4">
          <Calendar className="w-6 h-6 mb-2" />
          <span>Schedule</span>
        </Button>
        <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-4">
          <MessageSquare className="w-6 h-6 mb-2" />
          <span>Feedback</span>
        </Button>
        <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-4">
          <BookOpen className="w-6 h-6 mb-2" />
          <span>Resources</span>
        </Button>
      </div>
    </div>
  );
};

export default MentorDashboard;
