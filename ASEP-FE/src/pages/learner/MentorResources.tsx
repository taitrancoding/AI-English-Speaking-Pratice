import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { listMyLearnerPackages } from "@/lib/services/learnerPackage";
import apiClient from "@/lib/api";
import { BookOpen, Video, Headphones, Link as LinkIcon, FileText, ExternalLink, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MentorResource {
  id: number;
  title: string;
  description?: string;
  resourceType: "DOCUMENT" | "VIDEO" | "AUDIO" | "LINK" | "EXERCISE";
  category: "GRAMMAR" | "VOCABULARY" | "PRONUNCIATION" | "CONVERSATION";
  targetLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  fileUrl?: string;
  externalUrl?: string;
  isPublic: boolean;
  mentorId: number;
  mentorName?: string;
  createdAt?: string;
}

interface MentorInfo {
  id: number;
  name: string;
  email?: string;
}

const resourceTypeIcons = {
  DOCUMENT: FileText,
  VIDEO: Video,
  AUDIO: Headphones,
  LINK: LinkIcon,
  EXERCISE: BookOpen,
};

const resourceTypeLabels = {
  DOCUMENT: "Tài liệu",
  VIDEO: "Video",
  AUDIO: "Audio",
  LINK: "Liên kết",
  EXERCISE: "Bài tập",
};

export default function MentorResources() {
  const { toast } = useToast();
  const [resources, setResources] = useState<MentorResource[]>([]);
  const [mentors, setMentors] = useState<MentorInfo[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");

  useEffect(() => {
    const loadMentors = async () => {
      try {
        const packages = await listMyLearnerPackages(0, 100);
        const mentorSet = new Map<number, MentorInfo>();
        
        packages.content?.forEach((pkg) => {
          if (pkg.mentors && Array.isArray(pkg.mentors)) {
            pkg.mentors.forEach((mentor: any) => {
              if (mentor.id && mentor.name) {
                mentorSet.set(mentor.id, {
                  id: mentor.id,
                  name: mentor.name,
                  email: mentor.email,
                });
              }
            });
          }
        });

        setMentors(Array.from(mentorSet.values()));
        if (mentorSet.size > 0 && !selectedMentorId) {
          setSelectedMentorId(Array.from(mentorSet.values())[0].id);
        }
      } catch (error) {
        console.error("Failed to load mentors", error);
      }
    };
    loadMentors();
  }, []);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      console.log("[MentorResources] Fetching public resources");
      // Fetch public resources
      const publicRes = await apiClient.get("/mentor-resources/public");
      console.log("[MentorResources] API Response:", publicRes);
      console.log("[MentorResources] Response data:", publicRes.data);
      console.log("[MentorResources] Response data type:", typeof publicRes.data);
      console.log("[MentorResources] Is array?", Array.isArray(publicRes.data));
      
      let publicResources: MentorResource[] = [];
      if (Array.isArray(publicRes.data)) {
        publicResources = publicRes.data;
      } else if (publicRes.data && Array.isArray(publicRes.data.content)) {
        publicResources = publicRes.data.content;
      } else if (publicRes.data && typeof publicRes.data === 'object') {
        // Try to extract array from response
        publicResources = Object.values(publicRes.data).find((v: any) => Array.isArray(v)) as MentorResource[] || [];
      }

      console.log("[MentorResources] Parsed resources:", publicResources);
      console.log("[MentorResources] Count:", publicResources.length);

      // Lọc theo mentor được chọn (nếu có), mặc định hiển thị tất cả public resources
      let filteredResources: MentorResource[] = publicResources;

      if (selectedMentorId) {
        filteredResources = filteredResources.filter((r) => r.mentorId === selectedMentorId);
        console.log("[MentorResources] Filtered by mentorId", selectedMentorId, ":", filteredResources.length);
      }

      // Apply category and level filters
      if (categoryFilter !== "ALL") {
        filteredResources = filteredResources.filter((r: MentorResource) => r.category === categoryFilter);
        console.log("[MentorResources] Filtered by category", categoryFilter, ":", filteredResources.length);
      }
      if (levelFilter !== "ALL") {
        filteredResources = filteredResources.filter((r: MentorResource) => r.targetLevel === levelFilter);
        console.log("[MentorResources] Filtered by level", levelFilter, ":", filteredResources.length);
      }

      setResources(filteredResources);
    } catch (error: any) {
      console.error("[MentorResources] Failed to fetch resources", error);
      console.error("[MentorResources] Error response:", error.response);
      console.error("[MentorResources] Error status:", error.response?.status);
      console.error("[MentorResources] Error data:", error.response?.data);
      toast({
        variant: "destructive",
        title: "Không thể tải resources",
        description: error.response?.data?.message || error.message || "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedMentorId, categoryFilter, levelFilter, mentors, toast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tài liệu từ Mentor</h1>
        <p className="text-muted-foreground">
          Xem tài liệu học tập từ mentor của bạn (chỉ mentor trong gói đã đăng ký)
        </p>
      </div>

      {mentors.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Bạn chưa đăng ký gói nào có mentor. Hãy đăng ký gói học để truy cập tài liệu từ mentor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Chọn Mentor</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedMentorId ? String(selectedMentorId) : ""}
                  onValueChange={(value) => setSelectedMentorId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={String(mentor.id)}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả</SelectItem>
                    <SelectItem value="GRAMMAR">Ngữ pháp</SelectItem>
                    <SelectItem value="VOCABULARY">Từ vựng</SelectItem>
                    <SelectItem value="PRONUNCIATION">Phát âm</SelectItem>
                    <SelectItem value="CONVERSATION">Hội thoại</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trình độ</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả</SelectItem>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {loading && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-600">
              Đang tải resources...
            </div>
          )}

          {!loading && resources.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Chưa có tài liệu nào</p>
              </CardContent>
            </Card>
          )}

          {!loading && resources.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => {
                const Icon = resourceTypeIcons[resource.resourceType];
                return (
                  <Card key={resource.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                        </div>
                        <Badge variant="outline">
                          {resourceTypeLabels[resource.resourceType]}
                        </Badge>
                      </div>
                      <CardDescription>
                        {resource.mentorName || `Mentor #${resource.mentorId}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{resource.category}</Badge>
                        <Badge variant="outline">{resource.targetLevel}</Badge>
                      </div>
                      <div className="flex gap-2">
                        {resource.fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.fileUrl, "_blank")}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Tải xuống
                          </Button>
                        )}
                        {resource.externalUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.externalUrl, "_blank")}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Mở liên kết
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

