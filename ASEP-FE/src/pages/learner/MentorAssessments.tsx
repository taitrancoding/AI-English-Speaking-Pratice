import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";
import { listMyLearnerPackages } from "@/lib/services/learnerPackage";
import apiClient from "@/lib/api";
import { FileText, TrendingUp, Calendar, Award } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Assessment {
  id: number;
  learnerId: number;
  learnerName: string;
  mentorId: number;
  mentorName?: string;
  assessedLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  speakingScore: number;
  listeningScore: number;
  readingScore: number;
  writingScore: number;
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  assessmentDate?: string;
  nextAssessmentDate?: string;
}

interface MentorInfo {
  id: number;
  name: string;
  email?: string;
}

export default function MentorAssessments() {
  const { learner } = useCurrentLearnerProfile();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [mentors, setMentors] = useState<MentorInfo[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMentors = async () => {
      try {
        const packages = await listMyLearnerPackages(0, 100);
        const mentorSet = new Map<number, MentorInfo>();
        
        packages.content?.forEach((pkg) => {
          if (pkg.mentors && Array.isArray(pkg.mentors)) {
            pkg.mentors.forEach((mentor: any) => {
              if (mentor.id && mentor.name) {
                mentorSet.set(mentor.id, {
                  id: mentor.id,
                  name: mentor.name,
                  email: mentor.email,
                });
              }
            });
          }
        });

        setMentors(Array.from(mentorSet.values()));
        if (mentorSet.size > 0 && !selectedMentorId) {
          setSelectedMentorId(Array.from(mentorSet.values())[0].id);
        }
      } catch (error) {
        console.error("Failed to load mentors", error);
      }
    };
    loadMentors();
  }, []);

  const fetchAssessments = useCallback(async () => {
    if (!learner?.id) {
      console.log("[MentorAssessments] No learner.id, skipping fetch");
      return;
    }
    setLoading(true);
    try {
      console.log("[MentorAssessments] Fetching assessments for learner.id:", learner.id);
      const response = await apiClient.get(`/assessments/learner/${learner.id}`);
      console.log("[MentorAssessments] API Response:", response);
      console.log("[MentorAssessments] Response data:", response.data);
      console.log("[MentorAssessments] Response data type:", typeof response.data);
      console.log("[MentorAssessments] Is array?", Array.isArray(response.data));
      
      let allAssessments: Assessment[] = [];
      if (Array.isArray(response.data)) {
        allAssessments = response.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        allAssessments = response.data.content;
      } else if (response.data && typeof response.data === 'object') {
        // Try to extract array from response
        allAssessments = Object.values(response.data).find((v: any) => Array.isArray(v)) as Assessment[] || [];
      }

      console.log("[MentorAssessments] Parsed assessments:", allAssessments);
      console.log("[MentorAssessments] Count:", allAssessments.length);

      // Nếu chọn mentor cụ thể thì lọc theo mentorId, ngược lại hiển thị tất cả
      if (selectedMentorId) {
        allAssessments = allAssessments.filter((a) => a.mentorId === selectedMentorId);
        console.log("[MentorAssessments] Filtered by mentorId", selectedMentorId, ":", allAssessments.length);
      }

      setAssessments(allAssessments);
    } catch (error: any) {
      console.error("[MentorAssessments] Failed to fetch assessments", error);
      console.error("[MentorAssessments] Error response:", error.response);
      console.error("[MentorAssessments] Error status:", error.response?.status);
      console.error("[MentorAssessments] Error data:", error.response?.data);
      toast({
        variant: "destructive",
        title: "Không thể tải assessments",
        description: error.response?.data?.message || error.message || "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  }, [learner?.id, selectedMentorId, mentors, toast]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const selectedMentor = mentors.find((m) => m.id === selectedMentorId);

  const calculateAverage = (assessment: Assessment) => {
    return (assessment.speakingScore + assessment.listeningScore + assessment.readingScore + assessment.writingScore) / 4;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đánh giá từ Mentor</h1>
        <p className="text-muted-foreground">
          Xem đánh giá trình độ từ mentor của bạn (chỉ mentor trong gói đã đăng ký)
        </p>
      </div>

      {mentors.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Bạn chưa đăng ký gói nào có mentor. Hãy đăng ký gói học để nhận đánh giá từ mentor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Chọn Mentor</CardTitle>
              <CardDescription>Xem đánh giá từ mentor cụ thể</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedMentorId ? String(selectedMentorId) : ""}
                onValueChange={(value) => setSelectedMentorId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mentor" />
                </SelectTrigger>
                <SelectContent>
                  {mentors.map((mentor) => (
                    <SelectItem key={mentor.id} value={String(mentor.id)}>
                      {mentor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {loading && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
              Đang tải assessments...
            </div>
          )}

          {!loading && assessments.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {selectedMentor
                    ? `Chưa có đánh giá nào từ ${selectedMentor.name}`
                    : "Chưa có đánh giá nào"}
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && assessments.length > 0 && (
            <div className="space-y-4">
              {assessments.map((assessment) => {
                const avgScore = calculateAverage(assessment);
                return (
                  <Card key={assessment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Đánh giá từ {assessment.mentorName || `Mentor #${assessment.mentorId}`}
                          </CardTitle>
                          <CardDescription>
                            {assessment.assessmentDate
                              ? new Date(assessment.assessmentDate).toLocaleDateString("vi-VN")
                              : "Chưa có ngày"}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="text-lg px-3 py-1">
                            {avgScore.toFixed(1)}/100
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Trình độ: {assessment.assessedLevel}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Speaking</span>
                            <span className="text-sm font-bold">{assessment.speakingScore}/100</span>
                          </div>
                          <Progress value={assessment.speakingScore} />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Listening</span>
                            <span className="text-sm font-bold">{assessment.listeningScore}/100</span>
                          </div>
                          <Progress value={assessment.listeningScore} />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Reading</span>
                            <span className="text-sm font-bold">{assessment.readingScore}/100</span>
                          </div>
                          <Progress value={assessment.readingScore} />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Writing</span>
                            <span className="text-sm font-bold">{assessment.writingScore}/100</span>
                          </div>
                          <Progress value={assessment.writingScore} />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                        {assessment.strengths && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <p className="font-semibold">Điểm mạnh</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {assessment.strengths}
                            </p>
                          </div>
                        )}
                        {assessment.weaknesses && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="h-4 w-4 text-amber-500" />
                              <p className="font-semibold">Điểm yếu</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {assessment.weaknesses}
                            </p>
                          </div>
                        )}
                        {assessment.recommendations && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <p className="font-semibold">Đề xuất</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {assessment.recommendations}
                            </p>
                          </div>
                        )}
                      </div>

                      {assessment.nextAssessmentDate && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            Đánh giá tiếp theo:{" "}
                            <span className="font-semibold">
                              {new Date(assessment.nextAssessmentDate).toLocaleDateString("vi-VN")}
                            </span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

