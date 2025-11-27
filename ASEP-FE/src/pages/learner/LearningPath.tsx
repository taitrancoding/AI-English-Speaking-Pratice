// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Loader2, MessageSquare, Play } from "lucide-react";
// import * as practiceService from "@/lib/services/aiPracticeSession";
// import { useToast } from "@/components/ui/use-toast";
// import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";

// const LearningPath: React.FC = () => {
//   const { toast } = useToast();
//   const { learner } = useCurrentLearnerProfile();
//   const [sessions, setSessions] = useState<practiceService.AiPracticeSession[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");

//   const fetchSessions = useCallback(async () => {
//     if (!learner) return;
//     setLoading(true);
//     try {
//       const response = await practiceService.listMySessions(0, 50);
//       setSessions(response.content ?? []);
//     } catch (error) {
//       console.error(error);
//       toast({
//         variant: "destructive",
//         title: "Không thể tải lịch sử hội thoại",
//         description: "Vui lòng thử lại.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   }, [learner, toast]);

//   useEffect(() => {
//     fetchSessions();
//   }, [fetchSessions]);

//   const filteredSessions = useMemo(() => {
//     if (!search.trim()) return sessions;
//     return sessions.filter((session) => {
//       const keyword = search.toLowerCase();
//       return (
//         session.topic.toLowerCase().includes(keyword) ||
//         session.scenario?.toLowerCase().includes(keyword) ||
//         session.aiFeedback?.toLowerCase().includes(keyword)
//       );
//     });
//   }, [sessions, search]);

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Learning Path</h1>
//           <p className="text-muted-foreground mt-2">
//             Lộ trình này được xây dựng từ các cuộc hội thoại AI đã lưu trên backend.
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Input
//             placeholder="Tìm theo topic, scenario..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full md:w-72"
//           />
//           <Button variant="outline" onClick={fetchSessions} disabled={loading}>
//             <Loader2 className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
//             Làm mới
//           </Button>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Lịch sử hội thoại với Gemini</CardTitle>
//           <CardDescription>
//             Dùng lại transcript, feedback và điểm số để ôn tập cùng mentor.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {loading && <p className="text-sm text-muted-foreground">Đang tải...</p>}
//           {!loading && filteredSessions.length === 0 && (
//             <p className="text-sm text-muted-foreground">
//               Chưa có dữ liệu. Hãy hoàn thành một buổi luyện tập tại AI Practice Studio.
//             </p>
//           )}

//           {!loading && filteredSessions.length > 0 && (
//             <ScrollArea className="h-[600px] pr-4">
//               <div className="space-y-4">
//                 {filteredSessions.map((session) => (
//                   <Card key={session.id} className="border border-muted">
//                     <CardHeader className="pb-2">
//                       <div className="flex items-start justify-between gap-3">
//                         <div>
//                           <CardTitle className="text-lg">{session.topic}</CardTitle>
//                           <p className="text-xs text-muted-foreground">
//                             {session.createdAt
//                               ? new Date(session.createdAt).toLocaleString("vi-VN")
//                               : "Không rõ thời gian"}
//                           </p>
//                         </div>
//                         <Badge variant="secondary">
//                           {(session.grammarScore ?? 0).toFixed(1)} / 10 grammar
//                         </Badge>
//                       </div>
//                       {session.scenario && (
//                         <p className="mt-3 text-sm text-muted-foreground">{session.scenario}</p>
//                       )}
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       <div className="grid gap-2 md:grid-cols-4">
//                         <div className="rounded-lg border p-3 text-center text-sm">
//                           <p className="text-xs uppercase text-muted-foreground">Pronunciation</p>
//                           <p className="text-lg font-semibold">
//                             {(session.pronunciationScore ?? 0).toFixed(1)}
//                           </p>
//                         </div>
//                         <div className="rounded-lg border p-3 text-center text-sm">
//                           <p className="text-xs uppercase text-muted-foreground">Grammar</p>
//                           <p className="text-lg font-semibold">
//                             {(session.grammarScore ?? 0).toFixed(1)}
//                           </p>
//                         </div>
//                         <div className="rounded-lg border p-3 text-center text-sm">
//                           <p className="text-xs uppercase text-muted-foreground">Vocabulary</p>
//                           <p className="text-lg font-semibold">
//                             {(session.vocabularyScore ?? 0).toFixed(1)}
//                           </p>
//                         </div>
//                         <div className="rounded-lg border p-3 text-center text-sm">
//                           <p className="text-xs uppercase text-muted-foreground">Duration</p>
//                           <p className="text-lg font-semibold">
//                             {session.durationMinutes ?? 15} phút
//                           </p>
//                         </div>
//                       </div>

//                       {session.aiFeedback && (
//                         <div className="rounded-lg border bg-muted/50 p-3 text-sm">
//                           <p className="text-xs font-semibold text-muted-foreground">AI Feedback</p>
//                           <p className="mt-2 whitespace-pre-line">{session.aiFeedback}</p>
//                         </div>
//                       )}

//                       <div className="flex flex-wrap gap-2">
//                         <Button asChild variant="outline" size="sm">
//                           <Link to={`/learner/practice?topic=${encodeURIComponent(session.topic)}`}>
//                             <Play className="mr-2 h-4 w-4" />
//                             Ôn lại chủ đề
//                           </Link>
//                         </Button>
//                         <Badge variant="outline" className="flex items-center gap-1 text-xs">
//                           <MessageSquare className="h-3.5 w-3.5" />
//                           Gemini {session.aiVersion || "v1"}
//                         </Badge>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </ScrollArea>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default LearningPath;
