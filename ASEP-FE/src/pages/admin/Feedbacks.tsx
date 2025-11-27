import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FeedbackForm } from "@/components/forms/FeedbackForm";
import { useFeedbackContext } from "@/hooks/use-feedback-context";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import apiClient from "@/lib/api";

interface MentorFeedbackDisplay {
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

export default function Feedbacks() {
  const { feedbacks, loading, error, fetchFeedbacks, createFeedback, updateFeedback, deleteFeedback } = useFeedbackContext();
  const [mentorIdInput, setMentorIdInput] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<(typeof feedbacks)[number] | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mentorFeedbacks, setMentorFeedbacks] = useState<MentorFeedbackDisplay[]>([]);
  const [loadingMentorFeedbacks, setLoadingMentorFeedbacks] = useState(false);

  const fetchMentorFeedbacks = useCallback(async (mentorId: number) => {
    setLoadingMentorFeedbacks(true);
    try {
      const response = await apiClient.get(`/mentor-feedback/mentor/${mentorId}`);
      setMentorFeedbacks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch mentor feedbacks", error);
      setMentorFeedbacks([]);
    } finally {
      setLoadingMentorFeedbacks(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMentorId !== null) {
      fetchFeedbacks(selectedMentorId).catch(() => undefined);
      fetchMentorFeedbacks(selectedMentorId);
    }
  }, [fetchFeedbacks, fetchMentorFeedbacks, selectedMentorId]);

  const handleLoad = () => {
    const id = Number(mentorIdInput);
    if (!Number.isNaN(id) && id > 0) {
      setSelectedMentorId(id);
    }
  };

  const handleCreate = async (payload: Parameters<typeof createFeedback>[0]) => {
    await createFeedback(payload);
    if (payload.mentorId !== selectedMentorId) {
      setSelectedMentorId(payload.mentorId);
    }
  };

  const handleUpdate = async (payload: Parameters<typeof updateFeedback>[1]) => {
    if (!selectedFeedback) return;
    await updateFeedback(selectedFeedback.id, payload);
    setSelectedFeedback(null);
    setIsEdit(false);
  };

  const handleDelete = async () => {
    if (!selectedFeedback) return;
    await deleteFeedback(selectedFeedback.id);
    setDeleteOpen(false);
    setSelectedFeedback(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phản hồi mentor</h1>
          <p className="text-muted-foreground">
            Nhập Mentor ID để tải phản hồi. {selectedMentorId && `Đang xem mentor #${selectedMentorId}.`}
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Nhập Mentor ID..."
            value={mentorIdInput}
            onChange={(e) => setMentorIdInput(e.target.value)}
            className="sm:w-40"
          />
          <Button onClick={handleLoad} disabled={!mentorIdInput}>
            Tải phản hồi
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsEdit(false);
              setSelectedFeedback(null);
              setFormOpen(true);
            }}
          >
            Thêm phản hồi
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
          Đang tải phản hồi...
        </div>
      )}

      {!loading && selectedMentorId && feedbacks.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-600">
          Chưa có phản hồi nào cho mentor #{selectedMentorId}.
        </div>
      )}

      {/* Mentor Feedbacks (new format) */}
      {selectedMentorId && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Mentor Feedbacks (Hệ thống)</h2>
          {loadingMentorFeedbacks && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
              Đang tải mentor feedbacks...
            </div>
          )}
          {!loadingMentorFeedbacks && mentorFeedbacks.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-600">
              Chưa có mentor feedback nào cho mentor #{selectedMentorId}.
            </div>
          )}
          {!loadingMentorFeedbacks && mentorFeedbacks.length > 0 && (
            <div className="grid gap-4">
              {mentorFeedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Mentor Feedback #{feedback.id}
                      </CardTitle>
                      <CardDescription>
                        Mentor #{feedback.mentorId} · Learner: {feedback.learnerName || `#${feedback.learnerId}`}
                        {feedback.practiceSessionId && ` · Session #${feedback.practiceSessionId}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {feedback.isImmediate && <Badge variant="default">Immediate</Badge>}
                      {feedback.feedbackDate && (
                        <Badge variant="outline">
                          {new Date(feedback.feedbackDate).toLocaleDateString("vi-VN")}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {feedback.pronunciationErrors && (
                      <div>
                        <p className="font-medium">Lỗi phát âm</p>
                        <p className="text-muted-foreground">{feedback.pronunciationErrors}</p>
                      </div>
                    )}
                    {feedback.grammarErrors && (
                      <div>
                        <p className="font-medium">Lỗi ngữ pháp</p>
                        <p className="text-muted-foreground">{feedback.grammarErrors}</p>
                      </div>
                    )}
                    {feedback.vocabularyIssues && (
                      <div>
                        <p className="font-medium">Vấn đề từ vựng</p>
                        <p className="text-muted-foreground">{feedback.vocabularyIssues}</p>
                      </div>
                    )}
                    {feedback.clarityGuidance && (
                      <div>
                        <p className="font-medium">Hướng dẫn diễn đạt</p>
                        <p className="text-muted-foreground">{feedback.clarityGuidance}</p>
                      </div>
                    )}
                    {feedback.overallFeedback && (
                      <div>
                        <p className="font-medium">Feedback tổng thể</p>
                        <p className="text-muted-foreground">{feedback.overallFeedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legacy Feedbacks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Legacy Feedbacks</h2>
        <div className="grid gap-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id}>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Feedback #{feedback.id}
                  </CardTitle>
                  <CardDescription>
                    Mentor #{feedback.mentorId} · Learner #{feedback.learnerId}
                  </CardDescription>
                </div>
                {feedback.rating !== undefined && (
                  <Badge variant="outline">Điểm: {feedback.rating.toFixed(1)}</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {feedback.pronunciationComment && (
                  <div>
                    <p className="font-medium">Phát âm</p>
                    <p className="text-muted-foreground">{feedback.pronunciationComment}</p>
                  </div>
                )}
                {feedback.grammarComment && (
                  <div>
                    <p className="font-medium">Ngữ pháp</p>
                    <p className="text-muted-foreground">{feedback.grammarComment}</p>
                  </div>
                )}
                {feedback.improvementSuggestion && (
                  <div>
                    <p className="font-medium">Gợi ý cải thiện</p>
                    <p className="text-muted-foreground">{feedback.improvementSuggestion}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedFeedback(feedback);
                      setIsEdit(true);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => {
                      setSelectedFeedback(feedback);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <FeedbackForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open && isEdit) {
            setSelectedFeedback(null);
            setIsEdit(false);
          }
        }}
        isEdit={isEdit}
        initialData={
          isEdit && selectedFeedback
            ? {
                mentorId: selectedFeedback.mentorId,
                learnerId: selectedFeedback.learnerId,
                sessionId: selectedFeedback.sessionId,
                rating: selectedFeedback.rating,
                pronunciationComment: selectedFeedback.pronunciationComment,
                grammarComment: selectedFeedback.grammarComment,
                improvementSuggestion: selectedFeedback.improvementSuggestion,
              }
            : selectedMentorId
            ? { mentorId: selectedMentorId, learnerId: 0 }
            : undefined
        }
        onSubmit={isEdit ? handleUpdate : handleCreate}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phản hồi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phản hồi #{selectedFeedback?.id}? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Xóa
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
