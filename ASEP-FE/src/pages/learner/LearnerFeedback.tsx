import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FeedbackForm } from "@/components/forms/FeedbackForm";
import { FeedbackCommentForm } from "@/components/forms/FeedbackCommentForm";
import { useFeedbackContext } from "@/hooks/use-feedback-context";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import {
  createFeedbackComment,
  updateFeedbackComment,
  deleteFeedbackComment,
  listFeedbackCommentsByUser,
  type FeedbackComment,
  type FeedbackCommentPayload,
} from "@/lib/services/feedbackComment";

const LearnerFeedback = () => {
  const { feedbacks, loading, error, fetchFeedbacks, createFeedback } = useFeedbackContext();
  const { toast } = useToast();
  const { user } = useAuth();
  const [mentorIdInput, setMentorIdInput] = useState("");
  const [activeMentorId, setActiveMentorId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<FeedbackComment | null>(null);
  const [generalComments, setGeneralComments] = useState<FeedbackComment[]>([]);

  useEffect(() => {
    if (activeMentorId) {
      fetchFeedbacks(activeMentorId).catch(() => undefined);
    }
  }, [fetchFeedbacks, activeMentorId]);

  const fetchGeneralComments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await listFeedbackCommentsByUser(user.id);
      setGeneralComments(response.content ?? []);
    } catch (err) {
      console.error("Failed to fetch general feedback", err);
      toast({
        variant: "destructive",
        title: "Không thể tải phản hồi chung",
        description: "Vui lòng thử lại sau.",
      });
    }
  }, [toast, user?.id]);

  useEffect(() => {
    fetchGeneralComments();
  }, [fetchGeneralComments]);

  const handleLoad = () => {
    const id = Number(mentorIdInput);
    if (!Number.isNaN(id) && id > 0) {
      setActiveMentorId(id);
    }
  };

  const handleCreate = async (payload: Parameters<typeof createFeedback>[0]) => {
    await createFeedback(payload);
    if (payload.mentorId !== activeMentorId) {
      setActiveMentorId(payload.mentorId);
      setMentorIdInput(String(payload.mentorId));
    }
  };

  const handleSaveGeneralFeedback = async (values: FeedbackCommentPayload) => {
    try {
      if (editingComment) {
        await updateFeedbackComment(editingComment.id, values);
        toast({ title: "Đã cập nhật phản hồi" });
      } else {
        await createFeedbackComment({
          ...values,
          userName: values.userName || user?.name || "Learner",
        });
        toast({ title: "Đã gửi phản hồi chung" });
      }
      setEditingComment(null);
      setCommentModalOpen(false);
      await fetchGeneralComments();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Không thể lưu phản hồi",
        description: "Vui lòng thử lại.",
      });
    }
  };

  const handleDeleteGeneralFeedback = async (id: number) => {
    try {
      await deleteFeedbackComment(id);
      await fetchGeneralComments();
      toast({ title: "Đã xóa phản hồi" });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Không thể xóa phản hồi",
        description: "Vui lòng thử lại.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gửi phản hồi cho Mentor</h1>
          <p className="text-muted-foreground">
            Bạn có thể gửi đánh giá sau mỗi buổi học và xem lại phản hồi đã gửi theo Mentor ID.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Mentor ID muốn xem..."
            value={mentorIdInput}
            onChange={(e) => setMentorIdInput(e.target.value)}
            className="sm:w-48"
          />
          <Button onClick={handleLoad} disabled={!mentorIdInput}>
            Xem phản hồi đã gửi
          </Button>
          <Button onClick={() => setFormOpen(true)}>Gửi phản hồi</Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
          Đang tải phản hồi...
        </div>
      )}

      {!loading && activeMentorId && feedbacks.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-600">
          Bạn chưa gửi phản hồi nào cho mentor #{activeMentorId}.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id}>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                Mentor #{feedback.mentorId}
              </CardTitle>
              {feedback.rating !== undefined && <Badge variant="secondary">Điểm: {feedback.rating.toFixed(1)}</Badge>}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {feedback.pronunciationComment && (
                <div>
                  <p className="font-semibold">Phát âm</p>
                  <p className="text-muted-foreground">{feedback.pronunciationComment}</p>
                </div>
              )}
              {feedback.grammarComment && (
                <div>
                  <p className="font-semibold">Ngữ pháp</p>
                  <p className="text-muted-foreground">{feedback.grammarComment}</p>
                </div>
              )}
              {feedback.improvementSuggestion && (
                <div>
                  <p className="font-semibold">Gợi ý cải thiện</p>
                  <p className="text-muted-foreground">{feedback.improvementSuggestion}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Phản hồi chung tới hệ thống / mentor</CardTitle>
            <p className="text-sm text-muted-foreground">Chia sẻ góp ý để đội ngũ cải thiện trải nghiệm của bạn.</p>
          </div>
          <Button
            onClick={() => {
              setEditingComment(null);
              setCommentModalOpen(true);
            }}
          >
            Gửi phản hồi
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {generalComments.length === 0 && <p className="text-sm text-muted-foreground">Bạn chưa có phản hồi nào.</p>}
          {generalComments.map((comment) => (
            <div key={comment.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{comment.targetType}</p>
                  <p className="text-muted-foreground text-xs">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString("vi-VN") : "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingComment(comment);
                      setCommentModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteGeneralFeedback(comment.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line">{comment.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <FeedbackForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        initialData={activeMentorId ? { mentorId: activeMentorId, learnerId: 0 } : undefined}
      />

      <FeedbackCommentForm
        open={commentModalOpen}
        onOpenChange={(open) => {
          setCommentModalOpen(open);
          if (!open) {
            setEditingComment(null);
          }
        }}
        isEdit={!!editingComment}
        initialData={
          editingComment
            ? {
                userName: editingComment.userName ?? user?.name ?? "",
                content: editingComment.content,
                targetType: editingComment.targetType,
                targetId: editingComment.targetId ?? undefined,
                rating: editingComment.rating ?? undefined,
              }
            : {
                userName: user?.name ?? "",
                content: "",
                targetType: "SYSTEM",
                rating: 5,
              }
        }
        onSubmit={handleSaveGeneralFeedback}
      />
    </div>
  );
};

export default LearnerFeedback;

