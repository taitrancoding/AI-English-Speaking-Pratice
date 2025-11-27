import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFeedbackContext } from "@/hooks/use-feedback-context";
import { MessageCircle } from "lucide-react";

const MentorFeedback: React.FC = () => {
  const { feedbacks, loading, error, fetchFeedbacks } = useFeedbackContext();
  const [mentorIdInput, setMentorIdInput] = useState("");
  const [activeMentorId, setActiveMentorId] = useState<number | null>(null);

  useEffect(() => {
    if (activeMentorId) {
      fetchFeedbacks(activeMentorId).catch(() => undefined);
    }
  }, [fetchFeedbacks, activeMentorId]);

  const handleLoad = () => {
    const id = Number(mentorIdInput);
    if (!Number.isNaN(id) && id > 0) {
      setActiveMentorId(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phản hồi từ learner</h1>
          <p className="text-muted-foreground">
            Nhập Mentor ID để xem phản hồi gần nhất từ học viên.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Mentor ID của bạn..."
            value={mentorIdInput}
            onChange={(e) => setMentorIdInput(e.target.value)}
            className="sm:w-48"
          />
          <Button onClick={handleLoad} disabled={!mentorIdInput}>
            Tải phản hồi
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
          Đang tải phản hồi...
        </div>
      )}

      {!loading && activeMentorId && feedbacks.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-600">
          Chưa có phản hồi nào cho mentor #{activeMentorId}.
        </div>
      )}

      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id}>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                Learner #{feedback.learnerId}
              </CardTitle>
              {feedback.rating !== undefined && (
                <Badge variant="secondary">Đánh giá: {feedback.rating.toFixed(1)}</Badge>
              )}
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
                  <p className="font-semibold">Đề xuất cải thiện</p>
                  <p className="text-muted-foreground">{feedback.improvementSuggestion}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MentorFeedback;
