import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";
import { useLearners } from "@/contexts/LearnerContext";
import * as userService from "@/lib/services/user";

const LearnerProfile: React.FC = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const { learner, isLoading, refresh } = useCurrentLearnerProfile();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    englishLevel: "BEGINNER",
    goals: "",
    preferences: "",
  });

  useEffect(() => {
    if (!learner) return;
    setFormState({
      name: learner.name || user?.name || "",
      englishLevel: learner.englishLevel?.toUpperCase() || learner.proficiencyLevel || "BEGINNER",
      goals: learner.goals || learner.learningGoal || "",
      preferences: learner.preferences || learner.preferredLearningStyle || "",
    });
  }, [learner, user?.name]);

  const stats = useMemo(
    () => [
      { label: "Practice minutes", value: learner?.totalPracticeMinutes ?? 0 },
      { label: "AI score", value: learner?.aiScore ? `${learner.aiScore.toFixed(1)}/100` : "—" },
      { label: "Sessions", value: learner?.totalPracticeSessions ?? 0 },
    ],
    [learner]
  );

  const handleSave = async () => {
    if (!learner) return;
    setSaving(true);
    try {
      // Use /me endpoint for current learner
      const { updateMyLearnerProfile } = await import("@/lib/services/learner");
      await updateMyLearnerProfile({
        proficiencyLevel: formState.englishLevel?.toUpperCase() as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined,
        learningGoal: formState.goals || undefined,
        preferredLearningStyle: formState.preferences || undefined,
      });
      
      // Update user name if changed
      if (formState.name && learner.userId && formState.name !== user?.name) {
        await userService.updateUser(learner.userId, { name: formState.name });
        updateAuthUser({ name: formState.name });
      }
      
      toast({ title: "Đã cập nhật hồ sơ" });
      setIsEditing(false);
      
      // Refresh learner profile
      if (refresh) {
        await refresh();
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast({
        variant: "destructive",
        title: "Không thể lưu hồ sơ",
        description: error?.response?.data?.message || error?.message || "Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">Quản lý thông tin và mục tiêu học tập dựa trên dữ liệu backend.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Preferences</TabsTrigger>
          <TabsTrigger value="goals">Learning Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Dựa theo Learner Profile trong backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6 border-b pb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 to-indigo-400 text-3xl">
                  👨‍🎓
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{formState.name || user?.name || "Learner"}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">Level: {formState.englishLevel}</Badge>
                    <Badge variant="secondary">Learner #{learner?.id ?? "?"}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} disabled={isLoading}>
                  Chỉnh sửa hồ sơ
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={formState.name} onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled />
                  </div>
                  <div>
                    <Label>CEFR Level</Label>
                    <Input
                      value={formState.englishLevel}
                      onChange={(e) => setFormState((prev) => ({ ...prev, englishLevel: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                      Huỷ
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>Được đồng bộ với trường `preferredLearningStyle`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={4}
                value={formState.preferences}
                placeholder="Ví dụ: Học qua tình huống thực tế, thích mentor sửa lỗi chi tiết..."
                onChange={(e) => setFormState((prev) => ({ ...prev, preferences: e.target.value }))}
              />
              <Button onClick={handleSave} disabled={saving}>
                Lưu preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Goals</CardTitle>
              <CardDescription>Đồng bộ với trường `goals` trong backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={5}
                placeholder="Ví dụ: Đạt IELTS 7.5 trong 6 tháng..."
                value={formState.goals}
                onChange={(e) => setFormState((prev) => ({ ...prev, goals: e.target.value }))}
              />
              <Button onClick={handleSave} disabled={saving}>
                Lưu mục tiêu
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearnerProfile;
