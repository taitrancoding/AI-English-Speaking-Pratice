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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Eye, Calendar } from "lucide-react";
import apiClient from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { listMyLearners, type MentorLearnerSummary } from "@/lib/services/mentor";

interface Assessment {
  id: number;
  learnerId: number;
  learnerName: string;
  assessedLevel: string;
  speakingScore: number;
  listeningScore: number;
  readingScore: number;
  writingScore: number;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  assessmentDate: string;
  nextAssessmentDate: string;
}

export default function Assessments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<number | null>(null);
  const [mentorLearners, setMentorLearners] = useState<MentorLearnerSummary[]>([]);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [formData, setFormData] = useState({
    learnerId: 0,
    assessedLevel: "BEGINNER",
    speakingScore: 0,
    listeningScore: 0,
    readingScore: 0,
    writingScore: 0,
    strengths: "",
    weaknesses: "",
    recommendations: "",
  });

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/assessments/mentor/me");
      setAssessments(response.data || []);
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
      toast({
        variant: "destructive",
        title: "Không thể tải assessments",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAssessments();
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
  }, [fetchAssessments]);

  const handleSubmit = async () => {
    if (!formData.learnerId) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn học viên",
      });
      return;
    }

    try {
      await apiClient.post("/assessments", formData);
      toast({
        title: "Đã tạo assessment",
        description: "Assessment đã được lưu thành công",
      });
      setFormOpen(false);
      resetForm();
      fetchAssessments();
    } catch (error: any) {
      console.error("Failed to create assessment:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo assessment",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      learnerId: 0,
      assessedLevel: "BEGINNER",
      speakingScore: 0,
      listeningScore: 0,
      readingScore: 0,
      writingScore: 0,
      strengths: "",
      weaknesses: "",
      recommendations: "",
    });
    setSelectedLearner(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments & Leveling</h1>
          <p className="text-muted-foreground">
            Tổ chức đánh giá và phân cấp trình độ cho học viên
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo Assessment mới</DialogTitle>
              <DialogDescription>
                Đánh giá và phân cấp trình độ cho học viên
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                <Label htmlFor="assessedLevel">Trình độ đánh giá</Label>
                <Select
                  value={formData.assessedLevel}
                  onValueChange={(value) => setFormData({ ...formData, assessedLevel: value })}
                >
                  <SelectTrigger id="assessedLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speakingScore">Speaking Score (0-100)</Label>
                  <Input
                    id="speakingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.speakingScore}
                    onChange={(e) => setFormData({ ...formData, speakingScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listeningScore">Listening Score (0-100)</Label>
                  <Input
                    id="listeningScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.listeningScore}
                    onChange={(e) => setFormData({ ...formData, listeningScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readingScore">Reading Score (0-100)</Label>
                  <Input
                    id="readingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.readingScore}
                    onChange={(e) => setFormData({ ...formData, readingScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="writingScore">Writing Score (0-100)</Label>
                  <Input
                    id="writingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.writingScore}
                    onChange={(e) => setFormData({ ...formData, writingScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strengths">Điểm mạnh</Label>
                <Textarea
                  id="strengths"
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  placeholder="Nhập điểm mạnh của học viên..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weaknesses">Điểm yếu</Label>
                <Textarea
                  id="weaknesses"
                  value={formData.weaknesses}
                  onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                  placeholder="Nhập điểm yếu cần cải thiện..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Đề xuất</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  placeholder="Đề xuất cách học tập và cải thiện..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setFormOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit}>Lưu Assessment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Assessments</CardTitle>
          <CardDescription>Tất cả assessments bạn đã tạo</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center py-8">Đang tải...</p>}
          {!loading && assessments.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Chưa có assessment nào</p>
          )}
          {!loading && assessments.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Trình độ</TableHead>
                  <TableHead>Speaking</TableHead>
                  <TableHead>Listening</TableHead>
                  <TableHead>Reading</TableHead>
                  <TableHead>Writing</TableHead>
                  <TableHead>Ngày đánh giá</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">{assessment.learnerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{assessment.assessedLevel}</Badge>
                    </TableCell>
                    <TableCell>{assessment.speakingScore}/100</TableCell>
                    <TableCell>{assessment.listeningScore}/100</TableCell>
                    <TableCell>{assessment.readingScore}/100</TableCell>
                    <TableCell>{assessment.writingScore}/100</TableCell>
                    <TableCell>
                      {assessment.assessmentDate
                        ? new Date(assessment.assessmentDate).toLocaleDateString("vi-VN")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
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
    </div>
  );
}


