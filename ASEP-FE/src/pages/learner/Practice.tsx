import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useToast } from "@/components/ui/use-toast";
import * as practiceService from "@/lib/services/aiPracticeSession";
import { submitAiEvaluation } from "@/lib/services/aiPracticeSession";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";

// ====================== TYPES =========================

type EvaluationRubric = {
  pronunciation: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
};

type EvaluationResponse = {
  transcript: string;
  feedback: string;
  rubric: EvaluationRubric;
  ttsAudioBase64?: string;
};

type PracticeSessionItem = {
  id: number;
  topic: string;
  aiFeedback: string;
  pronunciationScore: number;
  createdAt: string;
};

// ======================================================

const TARGET_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const PracticeVoice = () => {
  const { toast } = useToast();
  const { learner, isLoading: learnerLoading } = useCurrentLearnerProfile();
  const learnerId = learner?.id ?? 0;

  const [topic, setTopic] = useState("");
  const [scenario, setScenario] = useState("");
  const [targetLevel, setTargetLevel] = useState("B1");

  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousTranscript, setPreviousTranscript] = useState("");

  const [history, setHistory] = useState<PracticeSessionItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const isSpeechSupported = SpeechRecognition.browserSupportsSpeechRecognition();

  // ================== Load history =====================
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await practiceService.listMySessions(0, 10);
      // Handle both Page response and direct array
      const content = response.data?.content ?? response.data ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (Array.isArray(content) ? content : []).map((item: any) => ({
        id: item.id ?? 0,
        topic: item.topic ?? "",
        aiFeedback: item.aiFeedback ?? "",
        pronunciationScore: item.pronunciationScore ?? 0,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : "",
      })) as PracticeSessionItem[];

      setHistory(sessions);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Không thể tải lịch sử" });
    } finally {
      setHistoryLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ================== Recording =======================
  const handleStartRecording = () => {
    resetTranscript();
    setPreviousTranscript("");
    setEvaluation(null);
    SpeechRecognition.startListening({ continuous: true });
  };
  
  const handleStopRecording = async () => {
    SpeechRecognition.stopListening();
    // Auto-submit when stopping if there's transcript
    if (transcript.trim() && topic.trim() && scenario.trim()) {
      await handleSubmit();
    }
  };
  const handleSubmit = useCallback(async () => {
    if (!transcript.trim() || !topic.trim() || !scenario.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Nhập topic, scenario và nói vào micro.",
      });
      return;
    }

    if (!learnerId || learnerId === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không tìm thấy thông tin learner. Vui lòng đăng nhập lại.",
      });
      return;
    }

    setIsSubmitting(true);
    setEvaluation(null);

    try {
      const response = await submitAiEvaluation({
        learnerId,
        topic,
        scenario,
        targetLevel,
        speechText: transcript,
      });

      // Response is already data from submitAiEvaluation
      const rubric = response.rubric ?? {};
      const normalizedEval: EvaluationResponse = {
        transcript: response.transcript ?? transcript,
        feedback: response.feedback ?? "",
        rubric: {
          pronunciation: rubric.pronunciation ?? 0,
          fluency: rubric.fluency ?? 0,
          grammar: rubric.grammar ?? 0,
          vocabulary: rubric.vocabulary ?? 0,
        },
        ttsAudioBase64: response.ttsAudioBase64,
      };

      setEvaluation(normalizedEval);
      await loadHistory();

      toast({ title: "Đánh giá hoàn tất" });

      // Don't reset topic/scenario to allow continuous conversation
      // Only reset transcript for next turn
      setPreviousTranscript(transcript);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Đánh giá thất bại" });
    } finally {
      setIsSubmitting(false);
    }
  }, [transcript, topic, scenario, targetLevel, learnerId, toast, loadHistory, learner]);

  // Auto-submit when speech stops (after 2 seconds of silence)
  useEffect(() => {
    if (!listening && transcript.trim() && transcript !== previousTranscript) {
      const timer = setTimeout(async () => {
        if (transcript.trim() && topic.trim() && scenario.trim() && !isSubmitting) {
          setPreviousTranscript(transcript);
          await handleSubmit();
        }
      }, 2000); // Wait 2 seconds after speech stops

      return () => clearTimeout(timer);
    }
  }, [listening, transcript, previousTranscript, topic, scenario, isSubmitting, handleSubmit]);

  // ================== Submit evaluation =================
  

  // ================== Render ===========================
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">AI Practice Voice</h1>

      {/* Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Thiết lập phiên luyện tập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Chủ đề</label>
            <input
              className="border rounded p-2 w-full"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Giới thiệu bản thân..."
            />
          </div>

          <div>
            <label>Bối cảnh / Tình huống</label>
            <input
              className="border rounded p-2 w-full"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Phỏng vấn..."
            />
          </div>

          <div className="flex gap-2 mt-2">
            {TARGET_LEVELS.map((level) => (
              <Button
                key={level}
                variant={targetLevel === level ? "default" : "outline"}
                onClick={() => setTargetLevel(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recording */}
      <Card>
        <CardHeader>
          <CardTitle>Ghi âm và chuyển sang text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={listening ? handleStopRecording : handleStartRecording}
              disabled={!isSpeechSupported}
            >
              {listening ? "Dừng ghi" : "Bắt đầu ghi"}
            </Button>

            <Button variant="outline" onClick={resetTranscript}>
              Reset transcript
            </Button>
          </div>

          {!isSpeechSupported && (
            <p className="text-red-500">Browser không hỗ trợ Speech Recognition</p>
          )}

          <p className="border rounded p-2 min-h-[50px]">{transcript || "Transcript sẽ hiện ở đây"}</p>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || !transcript || !topic || !scenario}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi để AI đánh giá"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                resetTranscript();
                setEvaluation(null);
                setTopic("");
                setScenario("");
                setTargetLevel("B1");
              }}
            >
              Bắt đầu lại
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {evaluation && (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả luyện tập</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded p-2 bg-muted/20">
              <p className="text-xs">Transcript</p>
              <p>{evaluation.transcript}</p>
            </div>

            <div className="border rounded p-2 bg-muted/20">
              <p className="text-xs">Feedback</p>
              <p>{evaluation.feedback}</p>
            </div>

            {evaluation.rubric && (
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(evaluation.rubric).map(([key, value]) => (
                  <div key={key} className="border p-2 text-center rounded">
                    <p className="text-xs">{key}</p>
                    <p>{(value as number).toFixed(1)}</p>
                  </div>
                ))}
              </div>
            )}

            {evaluation.ttsAudioBase64 && (
              <audio controls src={`data:audio/mp3;base64,${evaluation.ttsAudioBase64}`} autoPlay />
            )}
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử luyện tập</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading && <p>Đang tải...</p>}

          {!historyLoading && history.length === 0 && <p>Chưa có lịch sử.</p>}

          {!historyLoading && history.length > 0 && (
            <ScrollArea className="h-64">
              {history.map((session) => (
                <div key={session.id} className="border rounded p-2 mb-2">
                  <div className="flex justify-between">
                    <p>{session.topic}</p>
                    <Badge>{(session.pronunciationScore ?? 0).toFixed(1)}</Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {session.createdAt && new Date(session.createdAt).toLocaleString()}
                  </p>

                  {session.aiFeedback && (
                    <p className="text-sm line-clamp-3">{session.aiFeedback}</p>
                  )}
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeVoice;
