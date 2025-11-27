import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/AdminLayout";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Mentors from "./pages/admin/Mentors";
import Learners from "./pages/admin/Learners";
import Packages from "./pages/admin/Packages";
import Transactions from "./pages/admin/Transactions";
import Reports from "./pages/admin/Reports";
import Policies from "./pages/admin/Policies";
import Feedbacks from "./pages/admin/Feedbacks";

// Learner Pages
import LearnerDashboard from "./pages/learner/LearnerDashboard";
// import LearningPath from "./pages/learner/LearningPath";
import LearnerProfile from "./pages/learner/LearnerProfile";
import Practice from "./pages/learner/Practice";
import LearnerReports from "./pages/learner/LearnerReports";
import LearnerPackages from "./pages/learner/LearnerPackages";
import LearnerPolicies from "./pages/learner/LearnerPolicies";
import LearnerFeedback from "./pages/learner/LearnerFeedback";
import LearnerProgress from "./pages/learner/LearnerProgress";
import ComparePackages from "./pages/learner/ComparePackages";
import LearnerAnalytics from "./pages/learner/LearnerAnalytics";
import Leaderboard from "./pages/learner/Leaderboard";
import Challenges from "./pages/learner/Challenges";
import PeerPractice from "./pages/learner/PeerPractice";
import LearnerChat from "./pages/learner/LearnerChat";
import MentorFeedbacks from "./pages/learner/MentorFeedbacks";
import MentorResources from "./pages/learner/MentorResources";
import MentorAssessments from "./pages/learner/MentorAssessments";

// Mentor Pages
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorLearners from "./pages/mentor/MentorLearners";
import MentorProfile from "./pages/mentor/MentorProfile";
import MentorResources from "./pages/mentor/MentorResources";
import MentorFeedback from "./pages/mentor/MentorFeedback";
import MentorFeedbackPage from "./pages/mentor/MentorFeedbackPage";
import Assessments from "./pages/mentor/Assessments";
import MentorReports from "./pages/mentor/MentorReports";
import MentorPolicies from "./pages/mentor/MentorPolicies";
import MentorChat from "./pages/mentor/MentorChat";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { LearnerProvider } from "./contexts/LearnerContext";
import { MentorProvider } from "./contexts/MentorContext"; 
import { UserProvider } from "./contexts/UserContext"; 
import { PackageProvider } from "./contexts/PackageContext"; 
import { PolicyProvider } from "./contexts/PolicyContext"; 

import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DashboardProvider>
            <FeedbackProvider>
              <LearnerProvider>
                <MentorProvider>
                  <PackageProvider>
                    <PolicyProvider>
                      <UserProvider>
                        <Toaster />
                        <Sonner />

                        <BrowserRouter>
                          <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Navigate to="/login" />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/index" element={<Index />} />

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminLayout />}>
                              <Route index element={<Dashboard />} />
                              <Route path="users" element={<Users />} />
                              <Route path="mentors" element={<Mentors />} />
                              <Route path="learners" element={<Learners />} />
                              <Route path="packages" element={<Packages />} />
                              <Route path="transactions" element={<Transactions />} />
                              <Route path="reports" element={<Reports />} />
                              <Route path="policies" element={<Policies />} />
                              <Route path="feedbacks" element={<Feedbacks />} />
                            </Route>

                            {/* Learner Routes */}
                            <Route path="/learner" element={<AdminLayout />}>
                              <Route index element={<LearnerDashboard />} />
                              {/* <Route path="learning-path" element={<LearningPath />} /> */}
                              <Route path="profile" element={<LearnerProfile />} />
                              <Route path="practice" element={<Practice />} />
                              <Route path="progress" element={<LearnerProgress />} />
                              <Route path="analytics" element={<LearnerAnalytics />} />
                              <Route path="leaderboard" element={<Leaderboard />} />
                              <Route path="challenges" element={<Challenges />} />
                              <Route path="peer-practice" element={<PeerPractice />} />
                              <Route path="compare-packages" element={<ComparePackages />} />
                              <Route path="reports" element={<LearnerReports />} />
                              <Route path="packages" element={<LearnerPackages />} />
                              <Route path="feedback" element={<LearnerFeedback />} />
                              <Route path="mentor-feedbacks" element={<MentorFeedbacks />} />
                              <Route path="mentor-resources" element={<MentorResources />} />
                              <Route path="mentor-assessments" element={<MentorAssessments />} />
                              <Route path="policies" element={<LearnerPolicies />} />
                              <Route path="chat" element={<LearnerChat />} />
                              {/* <Route path="ai-chat" element={<AiConversation />} /> */}
                            </Route>

                            {/* Mentor Routes */}
                            <Route path="/mentor" element={<AdminLayout />}>
                              <Route index element={<MentorDashboard />} />
                              <Route path="learners" element={<MentorLearners />} />
                              <Route path="assessments" element={<Assessments />} />
                              <Route path="resources" element={<MentorResources />} />
                              <Route path="feedback" element={<MentorFeedbackPage />} />
                              <Route path="profile" element={<MentorProfile />} />
                              <Route path="reports" element={<MentorReports />} />
                              <Route path="policies" element={<MentorPolicies />} />
                              <Route path="chat" element={<MentorChat />} />
                            </Route>

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </BrowserRouter>
                      </UserProvider>
                    </PolicyProvider>
                  </PackageProvider>
                </MentorProvider>
              </LearnerProvider>
            </FeedbackProvider>
          </DashboardProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
