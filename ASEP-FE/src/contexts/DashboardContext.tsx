import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Users, GraduationCap, BookOpen, Package } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/schemas/User";
import * as userService from "@/lib/services/user";
import * as mentorService from "@/lib/services/mentor";
import * as learnerService from "@/lib/services/learner";

// ==== Types ====
export interface Stat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export interface Activity {
  title: string;
  timestamp: string;
  type: string;
}

export interface Metric {
  label: string;
  value: string;
  status: "success" | "warning" | "error";
}

interface DashboardContextType {
  stats: Stat[];
  activities: Activity[];
  metrics: Metric[];
  loading: boolean;
}

// ==== Context ====
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
};

// ==== Provider ====
export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stat[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset whenever user changes
    setLoading(true);

    if (!user) {
      setStats([]);
      setActivities([]);
      setMetrics([]);
      setLoading(false);
      return;
    }

    if (user.role !== UserRole.ADMIN) {
      setStats([]);
      setActivities([]);
      setMetrics([]);
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch real data from API
        const [usersRes, mentorsRes, learnersRes] = await Promise.all([
          userService.listUsers(0, 1),
          mentorService.listMentors(0, 1),
          learnerService.listLearnerProfiles(0, 1),
        ]);

        const totalUsers = usersRes.totalElements || 0;
        const totalMentors = mentorsRes.totalElements || 0;
        const totalLearners = learnersRes.totalElements || 0;

        const data = {
          stats: [
            {
              title: "Total Users",
              value: totalUsers.toString(),
              change: "+12.5%",
              trend: "up" as const,
              icon: Users,
            },
            {
              title: "Active Mentors",
              value: totalMentors.toString(),
              change: "+8.2%",
              trend: "up" as const,
              icon: GraduationCap,
            },
            {
              title: "Active Learners",
              value: totalLearners.toString(),
              change: "+15.3%",
              trend: "up" as const,
              icon: BookOpen,
            },
            {
              title: "Package Sales",
              value: "892",
              change: "-3.1%",
              trend: "down" as const,
              icon: Package,
            },
          ],
          activities: [
            { title: "New user registered", timestamp: "2 minutes ago", type: "user" },
            { title: "Package purchased", timestamp: "15 minutes ago", type: "package" },
            { title: "Mentor approved", timestamp: "1 hour ago", type: "mentor" },
            { title: "Feedback submitted", timestamp: "2 hours ago", type: "feedback" },
          ],
          metrics: [
            { label: "API Response Time", value: "145ms", status: "success" as const },
            { label: "Database Load", value: "42%", status: "success" as const },
            { label: "Active Sessions", value: "1,234", status: "success" as const },
            { label: "Error Rate", value: "0.02%", status: "success" as const },
          ],
        };

        setStats(data.stats);
        setActivities(data.activities);
        setMetrics(data.metrics);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to mock data if API fails
        const fallbackData = {
          stats: [
            {
              title: "Total Users",
              value: "0",
              change: "+0%",
              trend: "up" as const,
              icon: Users,
            },
            {
              title: "Active Mentors",
              value: "0",
              change: "+0%",
              trend: "up" as const,
              icon: GraduationCap,
            },
            {
              title: "Active Learners",
              value: "0",
              change: "+0%",
              trend: "up" as const,
              icon: BookOpen,
            },
            {
              title: "Package Sales",
              value: "0",
              change: "+0%",
              trend: "down" as const,
              icon: Package,
            },
          ],
          activities: [
            { title: "Waiting for data...", timestamp: "Just now", type: "user" },
          ],
          metrics: [
            { label: "API Response Time", value: "--", status: "warning" as const },
            { label: "Database Load", value: "--", status: "warning" as const },
            { label: "Active Sessions", value: "--", status: "warning" as const },
            { label: "Error Rate", value: "--", status: "warning" as const },
          ],
        };
        setStats(fallbackData.stats);
        setActivities(fallbackData.activities);
        setMetrics(fallbackData.metrics);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <DashboardContext.Provider value={{ stats, activities, metrics, loading }}>
      {children}
    </DashboardContext.Provider>
  );
};
