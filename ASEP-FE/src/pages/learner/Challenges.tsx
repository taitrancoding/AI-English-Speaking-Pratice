import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Clock, Award } from "lucide-react";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "special";
  target: number;
  current: number;
  reward: string;
  status: "available" | "in_progress" | "completed";
  deadline?: string;
}

export default function Challenges() {
  const { learner } = useCurrentLearnerProfile();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    // Mock challenges - TODO: Replace with actual API
    setChallenges([
      {
        id: 1,
        title: "Luyện tập 7 ngày liên tiếp",
        description: "Hoàn thành ít nhất 1 buổi luyện tập mỗi ngày trong 7 ngày",
        type: "weekly",
        target: 7,
        current: learner?.totalPracticeSessions || 0,
        reward: "Badge 'Dedicated Learner'",
        status: "in_progress",
      },
      {
        id: 2,
        title: "Đạt điểm phát âm 8.0",
        description: "Đạt điểm phát âm trung bình 8.0 trong 5 buổi luyện tập",
        type: "special",
        target: 5,
        current: 2,
        reward: "Badge 'Pronunciation Master'",
        status: "in_progress",
      },
      {
        id: 3,
        title: "Luyện tập 30 phút",
        description: "Tổng thời gian luyện tập đạt 30 phút trong tuần này",
        type: "weekly",
        target: 30,
        current: learner?.totalPracticeMinutes || 0,
        reward: "100 điểm thưởng",
        status: "in_progress",
      },
      {
        id: 4,
        title: "Thử thách chủ đề mới",
        description: "Luyện tập với 3 chủ đề khác nhau trong tuần này",
        type: "weekly",
        target: 3,
        current: 1,
        reward: "Badge 'Explorer'",
        status: "available",
      },
    ]);
  }, [learner]);

  const handleStartChallenge = (challengeId: number) => {
    toast({
      title: "Bắt đầu thử thách",
      description: "Chúc bạn may mắn!",
    });
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: "in_progress" } : c))
    );
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "daily":
        return <Clock className="h-5 w-5" />;
      case "weekly":
        return <Target className="h-5 w-5" />;
      case "monthly":
        return <Trophy className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getProgress = (challenge: Challenge) => {
    return Math.min((challenge.current / challenge.target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Speaking Challenges</h1>
        <p className="text-muted-foreground">
          Tham gia các thử thách để cải thiện kỹ năng và nhận phần thưởng
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {challenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getChallengeIcon(challenge.type)}
                  <CardTitle>{challenge.title}</CardTitle>
                </div>
                <Badge
                  variant={
                    challenge.status === "completed"
                      ? "default"
                      : challenge.status === "in_progress"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {challenge.status === "completed"
                    ? "Hoàn thành"
                    : challenge.status === "in_progress"
                    ? "Đang làm"
                    : "Có sẵn"}
                </Badge>
              </div>
              <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tiến độ</span>
                  <span>
                    {challenge.current}/{challenge.target}
                  </span>
                </div>
                <Progress value={getProgress(challenge)} />
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">Phần thưởng:</span>
                <span className="font-medium">{challenge.reward}</span>
              </div>

              {challenge.status === "available" && (
                <Button
                  className="w-full"
                  onClick={() => handleStartChallenge(challenge.id)}
                >
                  Bắt đầu thử thách
                </Button>
              )}

              {challenge.status === "in_progress" && (
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/learner/practice">Tiếp tục luyện tập</Link>
                </Button>
              )}

              {challenge.status === "completed" && (
                <div className="flex items-center gap-2 text-green-600">
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Đã hoàn thành!</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rewards Section */}
      <Card>
        <CardHeader>
          <CardTitle>Phần thưởng của bạn</CardTitle>
          <CardDescription>Các badge và thành tích đã đạt được</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: "Beginner", earned: true },
              { name: "Dedicated", earned: false },
              { name: "Master", earned: false },
              { name: "Explorer", earned: false },
            ].map((badge, index) => (
              <div
                key={index}
                className={`flex flex-col items-center p-4 rounded-lg border ${
                  badge.earned ? "bg-primary/10 border-primary" : "opacity-50"
                }`}
              >
                <Award className={`h-8 w-8 ${badge.earned ? "text-primary" : "text-muted-foreground"}`} />
                <p className="mt-2 text-sm font-medium">{badge.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


