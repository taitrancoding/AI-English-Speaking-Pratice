import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Mail } from "lucide-react";
import { listMyLearners, type MentorLearnerSummary } from "@/lib/services/mentor";
import { useToast } from "@/components/ui/use-toast";

const MentorLearners: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [learners, setLearners] = useState<MentorLearnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLearners = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listMyLearners(0, 50);
        setLearners(response.content);
      } catch (err) {
        console.error("Failed to load mentor learners", err);
        const message = err instanceof Error ? err.message : "Không thể tải danh sách học viên.";
        setError(message);
        toast({ variant: "destructive", title: "Lỗi", description: message });
      } finally {
        setLoading(false);
    }
  };
    fetchLearners();
  }, [toast]);

  const filteredLearners = useMemo(
    () =>
      learners.filter(
    (learner) =>
          learner.learnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          learner.learnerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [learners, searchTerm]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Learners</h1>
        <p className="text-muted-foreground mt-2">Manage and monitor your assigned learners</p>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Learners Table */}
      {loading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Đang tải danh sách học viên...</p>
          </CardContent>
        </Card>
      )}

      {!loading && (
        <>
      <div className="space-y-4">
        {filteredLearners.map((learner) => (
              <Card key={`${learner.learnerId}-${learner.packageId}`} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{learner.learnerName || "Learner"}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{learner.learnerEmail || "Chưa cập nhật email"}</span>
                      </div>
                    </div>
                    <Badge variant="outline">{learner.paymentStatus || "PENDING"}</Badge>
              </div>

                  <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div>
                      <p className="text-muted-foreground">Gói đang học</p>
                      <p className="font-medium">{learner.packageName || `Package #${learner.packageId}`}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {learner.packageDescription || "Chưa có mô tả"}
                      </p>
                </div>
                <div>
                      <p className="text-muted-foreground">Ngày đăng ký</p>
                      <p className="font-medium">
                        {learner.purchaseDate ? new Date(learner.purchaseDate).toLocaleDateString("vi-VN") : "—"}
                      </p>
                </div>
                <div>
                      <p className="text-muted-foreground">Hết hạn</p>
                      <p className="font-medium">
                        {learner.expireDate ? new Date(learner.expireDate).toLocaleDateString("vi-VN") : "—"}
                      </p>
                </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                      Gửi phản hồi
                  </Button>
                  <Button variant="outline" size="sm">
                      Xem lịch sử
                  </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLearners.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Không tìm thấy học viên phù hợp với tìm kiếm.</p>
          </CardContent>
        </Card>
          )}
        </>
      )}
    </div>
  );
};

export default MentorLearners;
