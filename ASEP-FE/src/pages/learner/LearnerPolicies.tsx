import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePolicy } from "@/contexts/PolicyContext";
import { Shield } from "lucide-react";

export default function LearnerPolicies() {
  const { policies, loading, error, fetchPolicies } = usePolicy();

  useEffect(() => {
    fetchPolicies().catch(() => undefined);
  }, [fetchPolicies]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chính sách học viên</h1>
        <p className="text-muted-foreground">
          Đọc kỹ các điều khoản để đảm bảo trải nghiệm học tập an toàn và hiệu quả.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      {loading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
          Đang tải chính sách...
        </div>
      )}

      <div className="space-y-4">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{policy.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Áp dụng từ:{" "}
                  {policy.updatedAt
                    ? new Date(policy.updatedAt).toLocaleDateString("vi-VN")
                    : policy.createdAt
                    ? new Date(policy.createdAt).toLocaleDateString("vi-VN")
                    : "Không xác định"}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{policy.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

