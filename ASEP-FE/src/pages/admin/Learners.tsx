import { useState, useEffect } from "react";
import { useLearners } from "@/contexts/LearnerContext";
import { LearnerForm } from "@/components/forms/LearnerForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Learners() {
  const { learners, loading, error, fetchLearners, addLearner, updateLearner, removeLearner } = useLearners();
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<(typeof learners)[0] | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    console.log("[Learners page] Calling fetchLearners on mount");
    fetchLearners();
  }, [fetchLearners]);

  const filtered = learners.filter((l) =>
    (l.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddLearner = async (data: any) => {
    await addLearner(data);
  };

  const handleEditLearner = (learner: (typeof learners)[0]) => {
    setSelectedLearner(learner);
    setIsEdit(true);
    setFormOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateLearner = async (data: any) => {
    if (selectedLearner) {
      await updateLearner(selectedLearner.id, data);
      setFormOpen(false);
      setSelectedLearner(null);
      setIsEdit(false);
      await fetchLearners(); // Refresh list
    }
  };

  const handleDeleteClick = (learner: (typeof learners)[0]) => {
    setSelectedLearner(learner);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedLearner) {
      await removeLearner(selectedLearner.id);
      setDeleteOpen(false);
      setSelectedLearner(null);
      await fetchLearners(); // Refresh list
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      {loading && (
        <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
          <strong>⏳ Loading...</strong> Fetching learners from API...
        </div>
      )}
      {!loading && learners.length === 0 && !error && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          <strong>⚠️ No data:</strong> No learners found. Backend may not have data or API may not be responding.
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learners</h1>
          <p className="text-muted-foreground">
            Manage learners and track their progress
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEdit(false);
            setSelectedLearner(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Learner
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search learners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Learner</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>AI Score</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((learner) => (
              <TableRow key={learner.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {learner.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{learner.name}</span>
                  </div>
                </TableCell>

                <TableCell>{learner.email}</TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      learner.aiScore >= 90
                        ? "bg-success text-success-foreground"
                        : learner.aiScore >= 80
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                  >
                    {learner.aiScore}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">{learner.package}</Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={learner.progress} className="w-[100px]" />
                    <span className="text-sm text-muted-foreground">
                      {learner.progress}%
                    </span>
                  </div>
                </TableCell>

                {/* Action Buttons */}
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClick(learner)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditLearner(learner)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Learner Form Dialog */}
      <LearnerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={isEdit ? handleUpdateLearner : handleAddLearner}
        initialData={
          isEdit && selectedLearner
            ? {
                name: selectedLearner.name,
                email: selectedLearner.email,
                password: "",
                englishLevel: selectedLearner.englishLevel as "beginner" | "intermediate" | "advanced",
                goals: selectedLearner.goals || "",
                preferences: selectedLearner.preferences || "",
              }
            : undefined
        }
        isEdit={isEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Learner</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa learner <strong>{selectedLearner?.name}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600">
              Xóa
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
