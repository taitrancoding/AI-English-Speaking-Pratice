import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, RefreshCcw, Trash2, Edit, ExternalLink, Loader2 } from "lucide-react";
import { ReportForm } from "@/components/forms/ReportForm";
import * as reportService from "@/lib/services/report";
import type { Report, ReportPayload } from "@/lib/services/report";

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.listReports();
      setReports(response.content ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách báo cáo";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const lastUpdated = useMemo(() => {
    if (reports.length === 0) return null;
    return reports
      .map((report) => (report.generatedAt ? new Date(report.generatedAt).getTime() : 0))
      .reduce((max, current) => Math.max(max, current), 0);
  }, [reports]);

  const handleCreate = async (payload: ReportPayload) => {
    await reportService.createReport(payload);
    await fetchReports();
  };

  const handleUpdate = async (payload: ReportPayload) => {
    if (!selectedReport) return;
    await reportService.updateReport(selectedReport.id, payload);
    await fetchReports();
    setSelectedReport(null);
    setIsEdit(false);
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    await reportService.deleteReport(selectedReport.id);
    await fetchReports();
    setSelectedReport(null);
    setDeleteOpen(false);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "Chưa có dữ liệu";
    const date = new Date(value);
    return date.toLocaleString("vi-VN");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo hệ thống</h1>
          <p className="text-muted-foreground">
            Quản lý các báo cáo được sinh từ backend. {reports.length > 0 && `Hiện có ${reports.length} báo cáo.`}
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Cập nhật gần nhất: {new Date(lastUpdated).toLocaleString("vi-VN")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReports} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Làm mới
          </Button>
          <Button
            onClick={() => {
              setFormOpen(true);
              setIsEdit(false);
              setSelectedReport(null);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo báo cáo
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && reports.length === 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
          Đang tải báo cáo...
        </div>
      )}

      {!loading && reports.length === 0 && !error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-600">
          Chưa có báo cáo nào. Hãy tạo báo cáo đầu tiên!
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="flex flex-col justify-between">
              <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    {report.reportType}
                  </CardTitle>
                  <CardDescription>Admin ID: {report.adminId}</CardDescription>
                </div>
                <Badge variant="outline">#{report.id}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Sinh lúc: {formatDate(report.generatedAt)}</p>
              </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="text-muted-foreground">Tóm tắt:</p>
                <p className="mt-1 whitespace-pre-line">{report.dataSummary || "Không có tóm tắt."}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tệp đính kèm:</span>
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Mở file
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedReport(report);
                    setIsEdit(true);
                    setFormOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={() => {
                    setSelectedReport(report);
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

      <ReportForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open && isEdit) {
            setSelectedReport(null);
            setIsEdit(false);
          }
        }}
        isEdit={isEdit}
        initialData={
          isEdit && selectedReport
            ? {
                adminId: selectedReport.adminId,
                reportType: selectedReport.reportType,
                fileUrl: selectedReport.fileUrl,
                dataSummary: selectedReport.dataSummary,
              }
            : undefined
        }
        onSubmit={isEdit ? handleUpdate : handleCreate}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa báo cáo <strong>{selectedReport?.reportType}</strong>? Hành động này không thể hoàn tác.
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
