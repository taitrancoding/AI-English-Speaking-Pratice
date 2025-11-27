import { useState, useEffect } from "react";
import { useUsers } from "@/contexts/UserContext";
import { UserForm } from "@/components/forms/UserForm";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Plus, Edit, Trash2 } from "lucide-react";

export default function Users() {
  const { users, loading, error, fetchUsers, createUser, updateUser, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    console.log("[Users page] Calling fetchUsers on mount");
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const nameOrEmail = (user.name || user.email || "").toString();
    const matchesSearch = nameOrEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const userRole = (user.role || "").toString().toLowerCase();
    const matchesRole = roleFilter === "all" || userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddUser = async (data: any) => {
    await createUser(data);
  };

  const handleEditUser = (user: (typeof users)[0]) => {
    setSelectedUser(user);
    setIsEdit(true);
    setFormOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateUser = async (data: any) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, data);
    }
  };

  const handleDeleteClick = (user: (typeof users)[0]) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      setDeleteOpen(false);
      setSelectedUser(null);
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
          <strong>⏳ Loading...</strong> Fetching users from API...
        </div>
      )}
      {!loading && users.length === 0 && !error && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          <strong>⚠️ No data:</strong> No users found. Backend may not have data or API may not be responding.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage all system users ({users.length})</p>
        </div>
        <Button
          onClick={() => {
            setIsEdit(false);
            setSelectedUser(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="learner">Learner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={((user.role || "").toString().toLowerCase() === "admin") ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={(user.status || "").toString().toUpperCase() === "ACTIVE" ? "default" : "secondary"}
                    className={(user.status || "").toString().toUpperCase() === "ACTIVE" ? "bg-green-500 text-white" : ""}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* User Form Dialog */}
      <UserForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={isEdit ? handleUpdateUser : handleAddUser}
        initialData={
          isEdit && selectedUser
            ? {
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role as "ADMIN" | "MENTOR" | "LEARNER",
                status: (selectedUser.status || "ACTIVE") as "ACTIVE" | "DISABLED",
                password: "",
              }
            : undefined
        }
        isEdit={isEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa User</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa user <strong>{selectedUser?.name}</strong>? Hành động này không thể hoàn tác.
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
