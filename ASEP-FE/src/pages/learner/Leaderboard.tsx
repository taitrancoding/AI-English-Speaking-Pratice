import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";
import apiClient from "@/lib/api";

interface LeaderboardEntry {
  rank: number;
  learnerId: number;
  learnerName: string;
  aiScore: number;
  totalSessions: number;
  streak: number;
}

export default function Leaderboard() {
  const { learner } = useCurrentLearnerProfile();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "weekly" | "monthly">("all");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        console.log("[Leaderboard] Fetching leaderboard with filter:", filter);
        const response = await apiClient.get("/leaderboard", {
          params: { filter, limit: 10 },
        });
        
        console.log("[Leaderboard] API Response:", response);
        console.log("[Leaderboard] Response data:", response.data);
        console.log("[Leaderboard] Response data type:", typeof response.data);
        console.log("[Leaderboard] Is array?", Array.isArray(response.data));
        
        // Handle both array and object response
        let data: any[] = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data?.content && Array.isArray(response.data.content)) {
          data = response.data.content;
        } else if (response.data && typeof response.data === 'object') {
          // Try to extract array from response
          data = Object.values(response.data).find((v: any) => Array.isArray(v)) as any[] || [];
        }
        
        console.log("[Leaderboard] Parsed data:", data);
        console.log("[Leaderboard] Count:", data.length);
        
        const leaderboardData = (data || []).map((entry: any) => ({
          rank: entry.rank || 0,
          learnerId: entry.learnerId,
          learnerName: entry.learnerName || `Learner #${entry.learnerId}`,
          aiScore: entry.aiScore || 0,
          totalSessions: entry.totalSessions || 0,
          streak: entry.streak || 0,
        }));

        console.log("[Leaderboard] Mapped leaderboard data:", leaderboardData);
        setLeaderboard(leaderboardData);
      } catch (error: any) {
        console.error("[Leaderboard] Failed to fetch leaderboard:", error);
        console.error("[Leaderboard] Error response:", error.response);
        console.error("[Leaderboard] Error status:", error.response?.status);
        console.error("[Leaderboard] Error data:", error.response?.data);
        // Fallback to empty if API fails
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const currentUserRank = leaderboard.findIndex((entry) => entry.learnerId === learner?.id) + 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng xếp hạng</h1>
        <p className="text-muted-foreground">
          Xem vị trí của bạn trong cộng đồng học viên
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("weekly")}
          className={`px-4 py-2 rounded-md ${
            filter === "weekly" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          Tuần này
        </button>
        <button
          onClick={() => setFilter("monthly")}
          className={`px-4 py-2 rounded-md ${
            filter === "monthly" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          Tháng này
        </button>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          <Card className="mt-8">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-2">
                <Medal className="h-8 w-8 text-gray-400" />
              </div>
              <Avatar className="mx-auto mb-2">
                <AvatarFallback>
                  {leaderboard[1].learnerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold">{leaderboard[1].learnerName}</p>
              <p className="text-2xl font-bold text-gray-400">{leaderboard[1].aiScore.toFixed(1)}</p>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="border-yellow-500 border-2">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-2">
                <Trophy className="h-10 w-10 text-yellow-500" />
              </div>
              <Avatar className="mx-auto mb-2 h-16 w-16">
                <AvatarFallback className="text-lg">
                  {leaderboard[0].learnerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold text-lg">{leaderboard[0].learnerName}</p>
              <p className="text-3xl font-bold text-yellow-500">{leaderboard[0].aiScore.toFixed(1)}</p>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="mt-8">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-2">
                <Award className="h-8 w-8 text-amber-600" />
              </div>
              <Avatar className="mx-auto mb-2">
                <AvatarFallback>
                  {leaderboard[2].learnerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold">{leaderboard[2].learnerName}</p>
              <p className="text-2xl font-bold text-amber-600">{leaderboard[2].aiScore.toFixed(1)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Bảng xếp hạng đầy đủ</CardTitle>
          <CardDescription>Top 10 học viên xuất sắc</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center py-8">Đang tải...</p>}
          {!loading && leaderboard.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</p>
          )}
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.learnerId}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  entry.learnerId === learner?.id ? "bg-primary/10 border-primary" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank) || (
                      <span className="font-bold text-muted-foreground">#{entry.rank}</span>
                    )}
                  </div>
                  <Avatar>
                    <AvatarFallback>
                      {entry.learnerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {entry.learnerName}
                      {entry.learnerId === learner?.id && (
                        <Badge variant="secondary" className="ml-2">Bạn</Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.totalSessions} buổi • {entry.streak} ngày liên tiếp
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{entry.aiScore.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">AI Score</p>
                </div>
              </div>
            ))}
          </div>

          {currentUserRank > 10 && (
            <div className="mt-4 p-4 rounded-lg border bg-muted">
              <p className="text-center text-muted-foreground">
                Vị trí của bạn: <strong>#{currentUserRank}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

