// src/pages/admin/Mentors.tsx
import { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Star, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMentor } from "@/contexts/MentorContext";
import { MentorForm } from "@/components/forms/MentorForm";

export default function Mentors() {
  const [searchTerm, setSearchTerm] = useState("");
  const { mentors, loading, error, fetchMentors, addMentor, updateMentor, deleteMentor } = useMentor();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<(typeof mentors)[0] | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    console.log("[Mentors page] Calling fetchMentors on mount");
    fetchMentors();
  }, [fetchMentors]);

  const filteredMentors = mentors.filter((m) =>
    (m.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddMentor = async (data: any) => {
    await addMentor(data);
  };

  const handleEditMentor = (mentor: (typeof mentors)[0]) => {
    setSelectedMentor(mentor);
    setIsEdit(true);
    setFormOpen(true);  
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateMentor = async (data: any) => {
    if (selectedMentor) {
      await updateMentor(selectedMentor.id, data);
      setFormOpen(false);
      setSelectedMentor(null);
      setIsEdit(false);
      await fetchMentors(); // Refresh list
    }
  };

  const handleDeleteClick = (mentor: (typeof mentors)[0]) => {
    setSelectedMentor(mentor);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedMentor) {
      await deleteMentor(selectedMentor.id);
      setDeleteOpen(false);
      setSelectedMentor(null);
      await fetchMentors(); // Refresh list
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
          <strong>⏳ Loading...</strong> Fetching mentors from API...
        </div>
      )}
      {!loading && mentors.length === 0 && !error && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          <strong>⚠️ No data:</strong> No mentors found. Backend may not have data or API may not be responding.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentors</h1>
          <p className="text-muted-foreground">Manage mentor profiles and status ({mentors.length})</p>
        </div>
        <Button
          onClick={() => {
            setIsEdit(false);
            setSelectedMentor(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Mentor
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search mentors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentor</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMentors.map((mentor) => (
              <TableRow key={mentor.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {mentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{mentor.name}</span>
                  </div>
                </TableCell>
                <TableCell>{mentor.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{mentor.rating}</span>
                  </div>
                </TableCell>
                <TableCell>{mentor.totalStudents}</TableCell>
                <TableCell>
                  <Badge
                    variant={mentor.status === "Active" ? "default" : "secondary"}
                    className={
                      mentor.status === "Active"
                        ? "bg-green-500 text-white"
                        : "bg-gray-400 text-white"
                    }
                  >
                    {mentor.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(mentor)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditMentor(mentor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mentor Form Dialog */}
      <MentorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={isEdit ? handleUpdateMentor : handleAddMentor}
        initialData={
          isEdit && selectedMentor
            ? {
                name: selectedMentor.name,
                email: selectedMentor.email,
                password: "",
                bio: selectedMentor.bio || "",
                skills: selectedMentor.skills || "",
                experienceYears: selectedMentor.experienceYears || 0,
                availabilityStatus: selectedMentor.availabilityStatus as "available" | "busy" | "inactive",
              }
            : undefined
        }
        isEdit={isEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Mentor</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mentor <strong>{selectedMentor?.name}</strong>? Hành động này không thể hoàn tác.
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
