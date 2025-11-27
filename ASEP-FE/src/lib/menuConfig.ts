import { UserRole } from "@/schemas/User";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Package,
  FileText,
  Shield,
  MessageSquare,
  Calendar,
  Zap,
  CreditCard,
  Trophy,
  Target,
  TrendingUp,
} from "lucide-react";

export interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

// Admin menu items - full access to all features
export const adminMenuItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Mentors", url: "/admin/mentors", icon: GraduationCap },
  { title: "Learners", url: "/admin/learners", icon: BookOpen },
  { title: "Packages", url: "/admin/packages", icon: Package },
  { title: "Transactions", url: "/admin/transactions", icon: CreditCard },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "System Policies", url: "/admin/policies", icon: Shield },
  { title: "Feedbacks", url: "/admin/feedbacks", icon: MessageSquare },
];

// Learner menu items - access to personal resources
export const learnerMenuItems: MenuItem[] = [
  { title: "Dashboard", url: "/learner", icon: LayoutDashboard },
  { title: "AI Practice Studio", url: "/learner/practice", icon: Zap },
  { title: "Peer Practice", url: "/learner/peer-practice", icon: Users },
  { title: "My Progress", url: "/learner/progress", icon: LayoutDashboard },
  { title: "Analytics", url: "/learner/analytics", icon: TrendingUp },
  { title: "Leaderboard", url: "/learner/leaderboard", icon: Trophy },
  { title: "Challenges", url: "/learner/challenges", icon: Target },
  { title: "Compare Packages", url: "/learner/compare-packages", icon: Package },
  // { title: "Learning Path", url: "/learner/learning-path", icon: BookOpen },
  { title: "My Packages", url: "/learner/packages", icon: Package },
  { title: "Progress Reports", url: "/learner/reports", icon: FileText },
  { title: "Mentor Feedbacks", url: "/learner/mentor-feedbacks", icon: MessageSquare, description: "Feedback từ mentor" },
  { title: "Mentor Resources", url: "/learner/mentor-resources", icon: BookOpen, description: "Tài liệu từ mentor" },
  { title: "Mentor Assessments", url: "/learner/mentor-assessments", icon: Target, description: "Đánh giá từ mentor" },
  { title: "Chat", url: "/learner/chat", icon: MessageSquare, description: "Trò chuyện với mentor" },
  { title: "Feedback", url: "/learner/feedback", icon: MessageSquare },
  { title: "Policies", url: "/learner/policies", icon: Shield },
  { title: "My Profile", url: "/learner/profile", icon: Users },
];

// Mentor menu items - access to teaching resources
export const mentorMenuItems: MenuItem[] = [
  { title: "Dashboard", url: "/mentor", icon: LayoutDashboard },
  { title: "My Learners", url: "/mentor/learners", icon: BookOpen },
  { title: "Assessments", url: "/mentor/assessments", icon: Target },
  { title: "Resources", url: "/mentor/resources", icon: Package },
  { title: "Feedback", url: "/mentor/feedback", icon: MessageSquare },
  { title: "Chat", url: "/mentor/chat", icon: MessageSquare, description: "Trò chuyện với learner" },
  { title: "My Profile", url: "/mentor/profile", icon: Users },
  { title: "Reports", url: "/mentor/reports", icon: FileText },
  { title: "Policies", url: "/mentor/policies", icon: Shield },
];

// Get menu items based on role
export function getMenuItemsByRole(role: UserRole): MenuItem[] {
  switch (role) {
    case UserRole.ADMIN:
      return adminMenuItems;
    case UserRole.LEARNER:
      return learnerMenuItems;
    case UserRole.MENTOR:
      return mentorMenuItems;
    default:
      return [];
  }
}
