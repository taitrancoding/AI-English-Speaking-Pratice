import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";

const Schedule: React.FC = () => {
  const [view, setView] = useState<"week" | "list">("list");

  const sessions = [
    {
      id: 1,
      learner: "Alice Johnson",
      date: "2025-11-16",
      time: "14:00",
      duration: 60,
      topic: "Pronunciation Practice",
      status: "scheduled",
    },
    {
      id: 2,
      learner: "Bob Smith",
      date: "2025-11-16",
      time: "15:30",
      duration: 45,
      topic: "Grammar Review",
      status: "scheduled",
    },
    {
      id: 3,
      learner: "Carol White",
      date: "2025-11-17",
      time: "10:00",
      duration: 60,
      topic: "Conversation",
      status: "scheduled",
    },
    {
      id: 4,
      learner: "David Lee",
      date: "2025-11-17",
      time: "16:00",
      duration: 30,
      topic: "Follow-up Discussion",
      status: "completed",
    },
  ];

  const getStatusColor = (status: string) => {
    return status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground mt-2">Manage your upcoming sessions and sessions history</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Week
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            <Users className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {view === "list" ? (
        // List View
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{session.learner}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{session.topic}</p>

                    <div className="flex gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{session.time}</span>
                      </div>
                      <span className="text-muted-foreground">
                        Duration: {session.duration} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status === "completed" ? "Completed" : "Scheduled"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {session.status === "completed" ? "View Summary" : "Join"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Week View
        <Card>
          <CardHeader>
            <CardTitle>This Week's Schedule</CardTitle>
            <CardDescription>Nov 16 - Nov 22, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <p className="text-sm font-semibold text-center mb-3">{day}</p>
                  <div className="space-y-2">
                    {sessions
                      .filter((s) => {
                        const date = new Date(s.date);
                        const dayOffset = date.getDay();
                        return dayOffset === idx || dayOffset === (idx === 0 ? 1 : idx + 1);
                      })
                      .map((s) => (
                        <div
                          key={s.id}
                          className="bg-blue-50 p-2 rounded text-xs hover:bg-blue-100 cursor-pointer"
                        >
                          <p className="font-semibold">{s.time}</p>
                          <p className="text-muted-foreground truncate">{s.learner}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {sessions.filter((s) => s.status === "scheduled").length}
            </p>
            <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {sessions.filter((s) => s.status === "completed").length}
            </p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {sessions.reduce((acc, s) => acc + s.duration, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Minutes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;
