import { useEffect, useState } from "react";
import { usePolicy } from "@/contexts/PolicyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PolicyForm } from "@/components/forms/PolicyForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Plus, Pencil, Trash2 } from "lucide-react";

export default function Policies() {
  const { policies, loading, error, fetchPolicies, createPolicy, updatePolicy, deletePolicy } = usePolicy();
  const [formOpen, setFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const activePolicy = selectedPolicyId ? policies.find((p) => p.id === selectedPolicyId) : undefined;

  return (
    <div className="space-y-6">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Policies</h1>
          <p className="text-muted-foreground">
            Tạo và cập nhật các chính sách mà mọi vai trò cần tuân thủ.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEdit(false);
            setSelectedPolicyId(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo chính sách
        </Button>
      </div>

      {!loading && policies.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-600">
          Chưa có chính sách nào, hãy tạo mới!
        </div>
      )}

      <div className="space-y-4">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{policy.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">{policy.content}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSelectedPolicyId(policy.id);
                    setIsEdit(true);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    setSelectedPolicyId(policy.id);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Cập nhật lần cuối:{" "}
              {policy.updatedAt
                ? new Date(policy.updatedAt).toLocaleString("vi-VN")
                : policy.createdAt
                ? new Date(policy.createdAt).toLocaleString("vi-VN")
                : "Không xác định"}
            </CardContent>
          </Card>
        ))}
      </div>

      <PolicyForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open && isEdit) {
            setSelectedPolicyId(null);
            setIsEdit(false);
          }
        }}
        isEdit={isEdit}
        initialData={
          isEdit && activePolicy
            ? { title: activePolicy.title, content: activePolicy.content }
            : undefined
        }
        onSubmit={async (values) => {
          if (isEdit && activePolicy) {
            await updatePolicy(activePolicy.id, values);
          } else {
            await createPolicy(values);
          }
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa chính sách</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chắc chắn muốn xóa chính sách <strong>{activePolicy?.title}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (activePolicy) {
                  await deletePolicy(activePolicy.id);
                }
                setDeleteOpen(false);
                setSelectedPolicyId(null);
              }}
            >
              Xóa
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
