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
import { Plus, Edit, Trash2, ExternalLink, FileText, Video, Music, Link as LinkIcon } from "lucide-react";
import apiClient from "@/lib/api";

interface MentorResource {
  id: number;
  title: string;
  description: string;
  resourceType: string;
  fileUrl: string;
  externalUrl: string;
  category: string;
  targetLevel: string;
  isPublic: boolean;
  createdAt: string;
}

export default function MentorResources() {
  const { toast } = useToast();
  const [resources, setResources] = useState<MentorResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resourceType: "DOCUMENT",
    fileUrl: "",
    externalUrl: "",
    category: "GRAMMAR",
    targetLevel: "BEGINNER",
    isPublic: false,
  });

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/mentor-resources/mentor/me");
      setResources(response.data || []);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      toast({
        variant: "destructive",
        title: "Không thể tải resources",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập title",
      });
      return;
    }

    try {
      await apiClient.post("/mentor-resources", formData);
      toast({
        title: "Đã tạo resource",
        description: "Resource đã được lưu thành công",
      });
      setFormOpen(false);
      resetForm();
      fetchResources();
    } catch (error: any) {
      console.error("Failed to create resource:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo resource",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa resource này?")) return;

    try {
      await apiClient.delete(`/mentor-resources/${id}`);
      toast({
        title: "Đã xóa resource",
      });
      fetchResources();
    } catch (error: any) {
      console.error("Failed to delete resource:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa resource",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      resourceType: "DOCUMENT",
      fileUrl: "",
      externalUrl: "",
      category: "GRAMMAR",
      targetLevel: "BEGINNER",
      isPublic: false,
    });
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "AUDIO":
        return <Music className="h-4 w-4" />;
      case "LINK":
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources Management</h1>
          <p className="text-muted-foreground">
            Cung cấp tài liệu liên quan khi học viên cần
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm Resource mới</DialogTitle>
              <DialogDescription>
                Tạo tài liệu học tập cho học viên
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resourceType">Resource Type</Label>
                  <Select
                    value={formData.resourceType}
                    onValueChange={(value) => setFormData({ ...formData, resourceType: value })}
                  >
                    <SelectTrigger id="resourceType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOCUMENT">Document</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="LINK">Link</SelectItem>
                      <SelectItem value="EXERCISE">Exercise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRAMMAR">Grammar</SelectItem>
                      <SelectItem value="VOCABULARY">Vocabulary</SelectItem>
                      <SelectItem value="PRONUNCIATION">Pronunciation</SelectItem>
                      <SelectItem value="CONVERSATION">Conversation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetLevel">Target Level</Label>
                <Select
                  value={formData.targetLevel}
                  onValueChange={(value) => setFormData({ ...formData, targetLevel: value })}
                >
                  <SelectTrigger id="targetLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileUrl">File URL</Label>
                <Input
                  id="fileUrl"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="URL to uploaded file..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="externalUrl">External URL</Label>
                <Input
                  id="externalUrl"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  placeholder="External link..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Public (visible to all learners)
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setFormOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit}>Lưu Resource</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Resources</CardTitle>
          <CardDescription>Tất cả resources bạn đã tạo</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center py-8">Đang tải...</p>}
          {!loading && resources.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Chưa có resource nào</p>
          )}
          {!loading && resources.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Public</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.resourceType)}
                        <span>{resource.resourceType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{resource.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{resource.targetLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      {resource.isPublic ? (
                        <Badge variant="default">Public</Badge>
                      ) : (
                        <Badge variant="outline">Private</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {resource.externalUrl && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(resource.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
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
