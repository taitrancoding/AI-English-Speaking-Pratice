import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import * as progressReportService from "@/lib/services/progressReport";

const MentorReports = () => {
  const [learnerIdInput, setLearnerIdInput] = useState("");
  const [activeLearnerId, setActiveLearnerId] = useState<number | null>(null);
  const [reports, setReports] = useState<progressReportService.ProgressReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeLearnerId) {
      setLoading(true);
      setError(null);
      progressReportService
        .listByLearner(activeLearnerId)
        .then((response) => setReports(response.content ?? []))
        .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải báo cáo"))
        .finally(() => setLoading(false));
    }
  }, [activeLearnerId]);

  const handleLoad = () => {
    const id = Number(learnerIdInput);
    if (!Number.isNaN(id) && id > 0) {
      setActiveLearnerId(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
          <h1 className="text-3xl font-bold tracking-tight">Theo dõi tiến độ học viên</h1>
          <p className="text-muted-foreground">
            Nhập Learner ID để xem các báo cáo đã sinh. Mentors có thể sử dụng dữ liệu này để chuẩn bị buổi học tiếp theo.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Learner ID..."
            value={learnerIdInput}
            onChange={(e) => setLearnerIdInput(e.target.value)}
            className="sm:w-48"
          />
          <Button onClick={handleLoad} disabled={!learnerIdInput}>
            Tải báo cáo
          </Button>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
          Đang tải báo cáo...
            </div>
      )}

      {!loading && activeLearnerId && reports.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-600">
          Chưa có báo cáo nào cho learner #{activeLearnerId}.
            </div>
      )}

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg">
                Learner #{report.learnerId} · Tuần {report.weekStart} → {report.weekEnd}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Sinh lúc {report.generatedAt ? new Date(report.generatedAt).toLocaleString("vi-VN") : "—"}
      </div>
        </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Số buổi trong tuần</p>
                  <p className="text-lg font-semibold">{report.totalSessions}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-xs text-muted-foreground">Phát âm</p>
                    <p className="text-lg font-semibold">{report.avgPronunciation}</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-xs text-muted-foreground">Ngữ pháp</p>
                    <p className="text-lg font-semibold">{report.avgGrammar}</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-xs text-muted-foreground">Từ vựng</p>
                    <p className="text-lg font-semibold">{report.avgVocabulary}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                <p className="font-semibold text-muted-foreground">Ghi chú cải thiện</p>
                <p className="mt-2 whitespace-pre-line text-muted-foreground">
                  {report.improvementNotes || "Chưa có ghi chú."}
                </p>
          </div>
        </CardContent>
            <div className="border-t p-4 text-sm text-muted-foreground">
              <Badge variant="outline">Report #{report.id}</Badge>
            </div>
      </Card>
        ))}
      </div>
    </div>
  );
};

export default MentorReports;

