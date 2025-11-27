import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";
import { listMyLearnerPackages } from "@/lib/services/learnerPackage";
import apiClient from "@/lib/api";
import { MessageSquare, AlertCircle, BookOpen, Lightbulb, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MentorFeedback {
  id: number;
  learnerId: number;
  learnerName: string;
  mentorId: number;
  mentorName?: string;
  practiceSessionId: number | null;
  pronunciationErrors?: string;
  grammarErrors?: string;
  vocabularyIssues?: string;
  clarityGuidance?: string;
  conversationTopics?: string;
  vocabularySuggestions?: string;
  nativeSpeakerTips?: string;
  overallFeedback?: string;
  feedbackDate?: string;
  isImmediate: boolean;
}

interface MentorInfo {
  id: number;
  name: string;
  email?: string;
}

export default function MentorFeedbacks() {
  const { learner } = useCurrentLearnerProfile();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<MentorFeedback[]>([]);
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

  const fetchFeedbacks = useCallback(async () => {
    if (!learner?.id) {
      console.log("[MentorFeedbacks] No learner.id, skipping fetch");
      return;
    }
    setLoading(true);
    try {
      console.log("[MentorFeedbacks] Fetching feedbacks for learner.id:", learner.id);
      const response = await apiClient.get(`/mentor-feedback/learner/${learner.id}`);
      console.log("[MentorFeedbacks] API Response:", response);
      console.log("[MentorFeedbacks] Response data:", response.data);
      console.log("[MentorFeedbacks] Response data type:", typeof response.data);
      console.log("[MentorFeedbacks] Is array?", Array.isArray(response.data));
      
      let allFeedbacks: MentorFeedback[] = [];
      if (Array.isArray(response.data)) {
        allFeedbacks = response.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        allFeedbacks = response.data.content;
      } else if (response.data && typeof response.data === 'object') {
        // Try to extract array from response
        allFeedbacks = Object.values(response.data).find((v: any) => Array.isArray(v)) as MentorFeedback[] || [];
      }

      console.log("[MentorFeedbacks] Parsed feedbacks:", allFeedbacks);
      console.log("[MentorFeedbacks] Count:", allFeedbacks.length);

      // Nếu chọn mentor cụ thể thì lọc theo mentorId, ngược lại hiển thị tất cả
      if (selectedMentorId) {
        allFeedbacks = allFeedbacks.filter((fb) => fb.mentorId === selectedMentorId);
        console.log("[MentorFeedbacks] Filtered by mentorId", selectedMentorId, ":", allFeedbacks.length);
      }

      setFeedbacks(allFeedbacks);
    } catch (error: any) {
      console.error("[MentorFeedbacks] Failed to fetch feedbacks", error);
      console.error("[MentorFeedbacks] Error response:", error.response);
      console.error("[MentorFeedbacks] Error status:", error.response?.status);
      console.error("[MentorFeedbacks] Error data:", error.response?.data);
      toast({
        variant: "destructive",
        title: "Không thể tải feedbacks",
        description: error.response?.data?.message || error.message || "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  }, [learner?.id, selectedMentorId, mentors, toast]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const selectedMentor = mentors.find((m) => m.id === selectedMentorId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback từ Mentor</h1>
        <p className="text-muted-foreground">
          Xem feedback chi tiết từ mentor của bạn (chỉ mentor trong gói đã đăng ký)
        </p>
      </div>

      {mentors.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Bạn chưa đăng ký gói nào có mentor. Hãy đăng ký gói học để nhận feedback từ mentor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Chọn Mentor</CardTitle>
              <CardDescription>Xem feedback từ mentor cụ thể</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mentors.map((mentor) => (
                  <Badge
                    key={mentor.id}
                    variant={selectedMentorId === mentor.id ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2"
                    onClick={() => setSelectedMentorId(mentor.id)}
                  >
                    {mentor.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
              Đang tải feedbacks...
            </div>
          )}

          {!loading && feedbacks.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {selectedMentor
                    ? `Chưa có feedback nào từ ${selectedMentor.name}`
                    : "Chưa có feedback nào"}
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && feedbacks.length > 0 && (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Feedback từ {feedback.mentorName || `Mentor #${feedback.mentorId}`}
                      </CardTitle>
                      <div className="flex gap-2">
                        {feedback.isImmediate && <Badge variant="default">Immediate</Badge>}
                        {feedback.feedbackDate && (
                          <Badge variant="outline">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(feedback.feedbackDate).toLocaleDateString("vi-VN")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {feedback.practiceSessionId && `Session #${feedback.practiceSessionId}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="errors" className="w-full">
                      <TabsList>
                        <TabsTrigger value="errors">Lỗi</TabsTrigger>
                        <TabsTrigger value="guidance">Hướng dẫn</TabsTrigger>
                        <TabsTrigger value="suggestions">Đề xuất</TabsTrigger>
                        <TabsTrigger value="overall">Tổng thể</TabsTrigger>
                      </TabsList>

                      <TabsContent value="errors" className="space-y-4">
                        {feedback.pronunciationErrors && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <p className="font-semibold">Lỗi phát âm</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {feedback.pronunciationErrors}
                            </p>
                          </div>
                        )}
                        {feedback.grammarErrors && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <p className="font-semibold">Lỗi ngữ pháp</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {feedback.grammarErrors}
                            </p>
                          </div>
                        )}
                        {feedback.vocabularyIssues && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <p className="font-semibold">Vấn đề từ vựng</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {feedback.vocabularyIssues}
                            </p>
                          </div>
                        )}
                        {!feedback.pronunciationErrors && !feedback.grammarErrors && !feedback.vocabularyIssues && (
                          <p className="text-sm text-muted-foreground">Không có lỗi nào được ghi nhận</p>
                        )}
                      </TabsContent>

                      <TabsContent value="guidance" className="space-y-4">
                        {feedback.clarityGuidance && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                              <p className="font-semibold">Hướng dẫn diễn đạt</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {feedback.clarityGuidance}
                            </p>
                          </div>
                        )}
                        {feedback.conversationTopics && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <p className="font-semibold">Chủ đề hội thoại</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {feedback.conversationTopics}
                            </p>
                          </div>
                        )}
                        {!feedback.clarityGuidance && !feedback.conversationTopics && (
                          <p className="text-sm text-muted-foreground">Chưa có hướng dẫn</p>
                        )}
                      </TabsContent>

                      <TabsContent value="suggestions" className="space-y-4">
                        {feedback.vocabularySuggestions && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-amber-500" />
                              <p className="font-semibold">Đề xuất từ vựng</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {feedback.vocabularySuggestions}
                            </p>
                          </div>
                        )}
                        {feedback.nativeSpeakerTips && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-amber-500" />
                              <p className="font-semibold">Kinh nghiệm giao tiếp</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {feedback.nativeSpeakerTips}
                            </p>
                          </div>
                        )}
                        {!feedback.vocabularySuggestions && !feedback.nativeSpeakerTips && (
                          <p className="text-sm text-muted-foreground">Chưa có đề xuất</p>
                        )}
                      </TabsContent>

                      <TabsContent value="overall">
                        {feedback.overallFeedback ? (
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {feedback.overallFeedback}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Chưa có feedback tổng thể</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

