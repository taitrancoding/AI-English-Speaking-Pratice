import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, MessageSquare, AlertCircle, BookOpen, Lightbulb } from "lucide-react";
import apiClient from "@/lib/api";
import { listMyLearners, type MentorLearnerSummary } from "@/lib/services/mentor";

interface MentorFeedback {
  id: number;
  learnerId: number;
  learnerName: string;
  practiceSessionId: number | null;
  pronunciationErrors: string;
  grammarErrors: string;
  vocabularyIssues: string;
  clarityGuidance: string;
  conversationTopics: string;
  vocabularySuggestions: string;
  nativeSpeakerTips: string;
  overallFeedback: string;
  feedbackDate: string;
  isImmediate: boolean;
}

export default function MentorFeedbackPage() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<MentorFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<MentorFeedback | null>(null);
  const [mentorLearners, setMentorLearners] = useState<MentorLearnerSummary[]>([]);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [formData, setFormData] = useState({
    learnerId: 0,
    practiceSessionId: null as number | null,
    pronunciationErrors: "",
    grammarErrors: "",
    vocabularyIssues: "",
    clarityGuidance: "",
    conversationTopics: "",
    vocabularySuggestions: "",
    nativeSpeakerTips: "",
    overallFeedback: "",
    isImmediate: true,
  });

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/mentor-feedback/mentor/me");
      setFeedbacks(response.data || []);
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
      toast({
        variant: "destructive",
        title: "Không thể tải feedbacks",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFeedbacks();
    const loadMentorLearners = async () => {
      setLoadingLearners(true);
      try {
        const response = await listMyLearners(0, 100);
        setMentorLearners(response.content);
      } catch (error) {
        console.error("Failed to load mentor learners", error);
      } finally {
        setLoadingLearners(false);
      }
    };
    loadMentorLearners();
  }, [fetchFeedbacks]);

  const handleSubmit = async () => {
    if (!formData.learnerId) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập Learner ID",
      });
      return;
    }

    try {
      await apiClient.post("/mentor-feedback", formData);
      toast({
        title: "Đã tạo feedback",
        description: "Feedback đã được lưu thành công",
      });
      setFormOpen(false);
      resetForm();
      fetchFeedbacks();
    } catch (error: any) {
      console.error("Failed to create feedback:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo feedback",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      learnerId: 0,
      practiceSessionId: null,
      pronunciationErrors: "",
      grammarErrors: "",
      vocabularyIssues: "",
      clarityGuidance: "",
      conversationTopics: "",
      vocabularySuggestions: "",
      nativeSpeakerTips: "",
      overallFeedback: "",
      isImmediate: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Feedback</h1>
          <p className="text-muted-foreground">
            Chỉ ra lỗi, hướng dẫn và đưa ra phản hồi cho học viên
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo Feedback mới</DialogTitle>
              <DialogDescription>
                Chỉ ra lỗi và đưa ra hướng dẫn chi tiết cho học viên
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="learnerId">Học viên *</Label>
                  {loadingLearners ? (
                    <p className="text-sm text-muted-foreground">Đang tải danh sách học viên...</p>
                  ) : mentorLearners.length === 0 ? (
                    <p className="text-sm text-amber-600">Bạn chưa có học viên nào. Vui lòng đợi học viên đăng ký gói có bạn.</p>
                  ) : (
                    <Select
                      value={formData.learnerId ? String(formData.learnerId) : ""}
                      onValueChange={(value) => {
                        const learnerId = parseInt(value);
                        if (!isNaN(learnerId) && learnerId > 0) {
                          setFormData({ ...formData, learnerId });
                        }
                      }}
                    >
                      <SelectTrigger id="learnerId">
                        <SelectValue placeholder="Chọn học viên" />
                      </SelectTrigger>
                      <SelectContent>
                        {mentorLearners.map((learner) => (
                          <SelectItem key={learner.learnerId} value={String(learner.learnerId)}>
                            {learner.learnerName || `Learner #${learner.learnerId}`} ({learner.learnerEmail || "No email"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practiceSessionId">Practice Session ID (Optional)</Label>
                  <Input
                    id="practiceSessionId"
                    type="number"
                    value={formData.practiceSessionId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        practiceSessionId: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>

              <Tabs defaultValue="errors" className="w-full">
                <TabsList>
                  <TabsTrigger value="errors">Lỗi</TabsTrigger>
                  <TabsTrigger value="guidance">Hướng dẫn</TabsTrigger>
                  <TabsTrigger value="suggestions">Đề xuất</TabsTrigger>
                  <TabsTrigger value="overall">Tổng thể</TabsTrigger>
                </TabsList>

                <TabsContent value="errors" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pronunciationErrors">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Lỗi phát âm
                    </Label>
                    <Textarea
                      id="pronunciationErrors"
                      value={formData.pronunciationErrors}
                      onChange={(e) => setFormData({ ...formData, pronunciationErrors: e.target.value })}
                      placeholder="Chỉ ra các lỗi phát âm..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grammarErrors">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Lỗi ngữ pháp
                    </Label>
                    <Textarea
                      id="grammarErrors"
                      value={formData.grammarErrors}
                      onChange={(e) => setFormData({ ...formData, grammarErrors: e.target.value })}
                      placeholder="Chỉ ra các lỗi ngữ pháp..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vocabularyIssues">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Cách dùng từ không tự nhiên
                    </Label>
                    <Textarea
                      id="vocabularyIssues"
                      value={formData.vocabularyIssues}
                      onChange={(e) => setFormData({ ...formData, vocabularyIssues: e.target.value })}
                      placeholder="Chỉ ra các vấn đề về từ vựng, cách dùng từ không tự nhiên..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="guidance" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clarityGuidance">
                      <MessageSquare className="inline h-4 w-4 mr-1" />
                      Hướng dẫn diễn đạt rõ ràng và tự tin
                    </Label>
                    <Textarea
                      id="clarityGuidance"
                      value={formData.clarityGuidance}
                      onChange={(e) => setFormData({ ...formData, clarityGuidance: e.target.value })}
                      placeholder="Hướng dẫn cách diễn đạt rõ ràng và tự tin hơn..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conversationTopics">
                      <BookOpen className="inline h-4 w-4 mr-1" />
                      Chủ đề và tình huống hội thoại thực tế
                    </Label>
                    <Textarea
                      id="conversationTopics"
                      value={formData.conversationTopics}
                      onChange={(e) => setFormData({ ...formData, conversationTopics: e.target.value })}
                      placeholder="Cung cấp các chủ đề và tình huống hội thoại thực tế..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vocabularySuggestions">
                      <Lightbulb className="inline h-4 w-4 mr-1" />
                      Đề xuất học từ vựng, collocation và idioms
                    </Label>
                    <Textarea
                      id="vocabularySuggestions"
                      value={formData.vocabularySuggestions}
                      onChange={(e) => setFormData({ ...formData, vocabularySuggestions: e.target.value })}
                      placeholder="Đề xuất cách học từ vựng, collocation và thành ngữ..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nativeSpeakerTips">
                      <MessageSquare className="inline h-4 w-4 mr-1" />
                      Kinh nghiệm giao tiếp với người bản xứ
                    </Label>
                    <Textarea
                      id="nativeSpeakerTips"
                      value={formData.nativeSpeakerTips}
                      onChange={(e) => setFormData({ ...formData, nativeSpeakerTips: e.target.value })}
                      placeholder="Chia sẻ kinh nghiệm giao tiếp với người bản xứ..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="overall" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="overallFeedback">Feedback tổng thể</Label>
                    <Textarea
                      id="overallFeedback"
                      value={formData.overallFeedback}
                      onChange={(e) => setFormData({ ...formData, overallFeedback: e.target.value })}
                      placeholder="Feedback tổng thể về buổi luyện tập..."
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isImmediate"
                      checked={formData.isImmediate}
                      onChange={(e) => setFormData({ ...formData, isImmediate: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isImmediate" className="cursor-pointer">
                      Immediate feedback (phản hồi ngay lập tức sau buổi luyện tập)
                    </Label>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setFormOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit}>Lưu Feedback</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Feedbacks</CardTitle>
          <CardDescription>Tất cả feedbacks bạn đã tạo</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center py-8">Đang tải...</p>}
          {!loading && feedbacks.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Chưa có feedback nào</p>
          )}
          {!loading && feedbacks.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Lỗi phát âm</TableHead>
                  <TableHead>Lỗi ngữ pháp</TableHead>
                  <TableHead>Immediate</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">{feedback.learnerName}</TableCell>
                    <TableCell>
                      {feedback.practiceSessionId ? (
                        <Badge variant="outline">#{feedback.practiceSessionId}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {feedback.pronunciationErrors ? (
                        <Badge variant="destructive">Có</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {feedback.grammarErrors ? (
                        <Badge variant="destructive">Có</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {feedback.isImmediate ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {feedback.feedbackDate
                        ? new Date(feedback.feedbackDate).toLocaleDateString("vi-VN")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFeedback(feedback)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Feedback Detail Dialog */}
      {selectedFeedback && (
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Feedback chi tiết</DialogTitle>
              <DialogDescription>
                Feedback cho {selectedFeedback.learnerName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedFeedback.pronunciationErrors && (
                <div>
                  <Label className="font-semibold">Lỗi phát âm:</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedFeedback.pronunciationErrors}</p>
                </div>
              )}
              {selectedFeedback.grammarErrors && (
                <div>
                  <Label className="font-semibold">Lỗi ngữ pháp:</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedFeedback.grammarErrors}</p>
                </div>
              )}
              {selectedFeedback.vocabularyIssues && (
                <div>
                  <Label className="font-semibold">Vấn đề từ vựng:</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedFeedback.vocabularyIssues}</p>
                </div>
              )}
              {selectedFeedback.clarityGuidance && (
                <div>
                  <Label className="font-semibold">Hướng dẫn diễn đạt:</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedFeedback.clarityGuidance}</p>
                </div>
              )}
              {selectedFeedback.conversationTopics && (
                <div>
                  <Label className="font-semibold">Chủ đề hội thoại:</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedFeedback.conversationTopics}</p>
                </div>
              )}
              {selectedFeedback.vocabularySuggestions && (
                <div>
                  <Label className="font-semibold">Đề xuất từ vựng:</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedFeedback.vocabularySuggestions}</p>
                </div>
              )}
              {selectedFeedback.nativeSpeakerTips && (
                <div>
                  <Label className="font-semibold">Kinh nghiệm giao tiếp:</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedFeedback.nativeSpeakerTips}</p>
                </div>
              )}
              {selectedFeedback.overallFeedback && (
                <div>
                  <Label className="font-semibold">Feedback tổng thể:</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedFeedback.overallFeedback}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


