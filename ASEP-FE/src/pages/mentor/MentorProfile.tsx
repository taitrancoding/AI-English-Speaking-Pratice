import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import {
  getCurrentMentorProfile,
  updateCurrentMentorProfile,
  type MentorResponse,
  type MentorUpdate,
} from "@/lib/services/mentor";

const ProfileSchema = z.object({
  bio: z.string().optional().or(z.literal("")),
  skills: z.string().optional().or(z.literal("")),
  experienceYears: z.coerce.number().min(0, "Số năm kinh nghiệm phải >= 0").optional(),
  availabilityStatus: z.string().optional(),
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

const availabilityOptions = [
  { value: "AVAILABLE", label: "Có thể nhận học viên" },
  { value: "BUSY", label: "Đang bận" },
  { value: "INACTIVE", label: "Tạm dừng" },
];

const MentorProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<MentorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      bio: "",
      skills: "",
      experienceYears: 0,
      availabilityStatus: "AVAILABLE",
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCurrentMentorProfile();
        setProfile(data);
        reset({
          bio: data.bio ?? "",
          skills: data.skills ?? "",
          experienceYears: data.experienceYears ?? 0,
          availabilityStatus: data.availabilityStatus ?? "AVAILABLE",
        });
      } catch (err) {
        console.error("Failed to load mentor profile", err);
        setError(err instanceof Error ? err.message : "Không thể tải hồ sơ mentor.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [reset]);

  const onSubmit = async (values: ProfileFormData) => {
    setSaving(true);
    setError(null);
    try {
      const payload: MentorUpdate = {
        bio: values.bio,
        skills: values.skills,
        experienceYears: values.experienceYears,
        availabilityStatus: values.availabilityStatus,
      };
      const updated = await updateCurrentMentorProfile(payload);
      setProfile(updated);
      setIsEditing(false);
      toast({ title: "Đã cập nhật hồ sơ mentor" });
    } catch (err) {
      console.error("Failed to update mentor profile", err);
      setError(err instanceof Error ? err.message : "Không thể cập nhật hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang tải hồ sơ mentor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">Quản lý thông tin cá nhân và trạng thái mentor của bạn</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Thông tin</TabsTrigger>
          <TabsTrigger value="skills">Kỹ năng</TabsTrigger>
          <TabsTrigger value="availability">Trạng thái</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6 pb-6 border-b">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full flex items-center justify-center text-white text-3xl">
                  👩‍🏫
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{profile?.name || user?.name || "Mentor"}</h3>
                  <p className="text-muted-foreground">{profile?.email || user?.email}</p>
                  <Badge className="mt-2" variant="outline">
                    {profile?.availabilityStatus || "AVAILABLE"}
                  </Badge>
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <Label className="text-muted-foreground">Bio</Label>
                    <p className="mt-1">{profile?.bio || "Chưa cập nhật mô tả bản thân."}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                      <Label className="text-muted-foreground">Kinh nghiệm</Label>
                      <p className="mt-1">{profile?.experienceYears ?? 0} năm</p>
                  </div>
                  <div>
                      <Label className="text-muted-foreground">Trạng thái</Label>
                      <p className="mt-1">{profile?.availabilityStatus || "AVAILABLE"}</p>
                    </div>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Chỉnh sửa hồ sơ</Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <Label>Bio</Label>
                    <Textarea rows={4} placeholder="Giới thiệu bản thân..." {...register("bio")} />
                    {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>}
                  </div>
                  <div>
                    <Label>Kỹ năng nổi bật</Label>
                    <Textarea rows={3} placeholder="IELTS, Pronunciation..." {...register("skills")} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Số năm kinh nghiệm</Label>
                      <Input type="number" min={0} {...register("experienceYears")} />
                      {errors.experienceYears && (
                        <p className="text-sm text-red-500 mt-1">{errors.experienceYears.message}</p>
                      )}
                  </div>
                  <div>
                      <Label>Trạng thái</Label>
                      <select
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        {...register("availabilityStatus")}
                      >
                        {availabilityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Lưu thay đổi
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset({
                          bio: profile?.bio ?? "",
                          skills: profile?.skills ?? "",
                          experienceYears: profile?.experienceYears ?? 0,
                          availabilityStatus: profile?.availabilityStatus ?? "AVAILABLE",
                        });
                        setIsEditing(false);
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Kỹ năng & Chuyên môn</CardTitle>
              <CardDescription>Những gì bạn đang tập trung đào tạo</CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.skills ? (
                <div className="space-y-2">
                  {profile.skills.split(",").map((skill) => (
                    <Badge key={skill.trim()} variant="secondary" className="mr-2">
                      {skill.trim()}
                  </Badge>
                ))}
              </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa cập nhật kỹ năng.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái hoạt động</CardTitle>
              <CardDescription>Thông báo cho learner biết bạn có đang nhận học viên mới hay không</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Trạng thái hiện tại:{" "}
                <Badge variant="secondary">{profile?.availabilityStatus || "AVAILABLE"}</Badge>
              </p>
              <p>Bạn có thể thay đổi trạng thái trong phần chỉnh sửa hồ sơ để hiển thị cho learner.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorProfile;
