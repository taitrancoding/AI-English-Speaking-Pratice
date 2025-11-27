// import React, { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Play, Clock, TrendingUp } from "lucide-react";

// interface Session {
//   id: number;
//   title: string;
//   description: string;
//   duration: number;
//   difficulty: "Easy" | "Medium" | "Hard";
//   status: "completed" | "in-progress" | "pending";
//   score?: number;
//   date?: string;
// }

// const PracticeSessions: React.FC = () => {
//   const [sessions] = useState<Session[]>([
//     {
//       id: 1,
//       title: "Daily English Practice",
//       description: "Improve your speaking skills with AI feedback",
//       duration: 15,
//       difficulty: "Easy",
//       status: "pending",
//     },
//     {
//       id: 2,
//       title: "Business English Conversation",
//       description: "Practice professional communication",
//       duration: 20,
//       difficulty: "Medium",
//       status: "in-progress",
//     },
//     {
//       id: 3,
//       title: "Pronunciation Masterclass",
//       description: "Focus on pronunciation accuracy",
//       duration: 25,
//       difficulty: "Hard",
//       status: "completed",
//       score: 88,
//       date: "2025-11-14",
//     },
//     {
//       id: 4,
//       title: "Vocabulary Building",
//       description: "Learn 20 new words in context",
//       duration: 18,
//       difficulty: "Easy",
//       status: "completed",
//       score: 92,
//       date: "2025-11-13",
//     },
//   ]);

//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case "Easy":
//         return "bg-green-100 text-green-800";
//       case "Medium":
//         return "bg-yellow-100 text-yellow-800";
//       case "Hard":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "completed":
//         return "bg-blue-100 text-blue-800";
//       case "in-progress":
//         return "bg-purple-100 text-purple-800";
//       case "pending":
//         return "bg-gray-100 text-gray-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Practice Sessions</h1>
//         <p className="text-muted-foreground mt-2">
//           Improve your skills with interactive practice sessions
//         </p>
//       </div>

//       <div className="grid gap-4">
//         {sessions.map((session) => (
//           <Card key={session.id} className="hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <CardTitle>{session.title}</CardTitle>
//                   <CardDescription className="mt-1">{session.description}</CardDescription>
//                 </div>
//                 <Badge variant="outline" className={getStatusColor(session.status)}>
//                   {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-wrap items-center gap-4 justify-between">
//                 <div className="flex flex-wrap gap-4">
//                   <div className="flex items-center gap-2 text-sm">
//                     <Clock className="w-4 h-4" />
//                     <span>{session.duration} mins</span>
//                   </div>
//                   <Badge className={getDifficultyColor(session.difficulty)}>
//                     {session.difficulty}
//                   </Badge>
//                   {session.score && (
//                     <div className="flex items-center gap-2 text-sm">
//                       <TrendingUp className="w-4 h-4" />
//                       <span>Score: {session.score}%</span>
//                     </div>
//                   )}
//                   {session.date && <span className="text-xs text-muted-foreground">{session.date}</span>}
//                 </div>
//                 <Button variant="default" size="sm">
//                   <Play className="w-4 h-4 mr-2" />
//                   {session.status === "completed" ? "Review" : "Start"}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default PracticeSessions;
