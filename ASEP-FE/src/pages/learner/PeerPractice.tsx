import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";
import * as peerPracticeService from "@/lib/services/peerPractice";
import { Users, MessageSquare, Mic, Video, X, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import apiClient from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { PeerPracticeSession } from "@/lib/services/peerPractice";

type PeerChatMessage = {
  id: string;
  senderId?: number;
  senderName: string;
  content: string;
  type: "message" | "ai-feedback" | "system";
  timestamp?: string;
};

export default function PeerPractice() {
  const { learner } = useCurrentLearnerProfile();
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [activeSession, setActiveSession] = useState<PeerPracticeSession | null>(null);
  const [topic, setTopic] = useState("");
  const [scenario, setScenario] = useState("");
  const [preferredLevel, setPreferredLevel] = useState("INTERMEDIATE");
  const [enableAiFeedback, setEnableAiFeedback] = useState(true);

  const [messages, setMessages] = useState<PeerChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [wsStatus, setWsStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [requestingFeedback, setRequestingFeedback] = useState(false);
  const stompRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const pushMessage = useCallback((message: PeerChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleInboundMessage = useCallback(
    (raw: IMessage, fallbackType: PeerChatMessage["type"] = "message") => {
      try {
        const payload = raw.body ? JSON.parse(raw.body) : {};
        const type = (payload.type as PeerChatMessage["type"]) || fallbackType;
        if (type === "ai-feedback") {
          setRequestingFeedback(false);
        }
        pushMessage({
          id: crypto.randomUUID(),
          senderId: payload.senderId,
          senderName:
            payload.senderName || (type === "ai-feedback" ? "AI Assistant" : "Partner"),
          content: payload.content || "",
          type,
          timestamp: payload.timestamp || new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to parse peer practice message", error);
      }
    },
    [pushMessage]
  );

  const disconnectWebSocket = useCallback(() => {
    if (stompRef.current) {
      stompRef.current.deactivate();
      stompRef.current = null;
    }
    setWsStatus("disconnected");
  }, []);

  const checkActiveSession = useCallback(async () => {
    try {
      const session = await peerPracticeService.getActiveSession();
      setActiveSession(session);
      // Connect WebSocket after session is set
      if (session?.id) {
        // Use setTimeout to avoid circular dependency
        setTimeout(() => {
          if (stompRef.current) {
            disconnectWebSocket();
          }
          const client = new Client({
            webSocketFactory: () => {
              const apiBase = apiClient.defaults.baseURL ?? window.location.origin;
              let wsUrl = "/ws";
              try {
                const parsed = new URL(apiBase);
                const trimmedPath = parsed.pathname.replace(/\/api(\/v1)?$/, "").replace(/\/$/, "");
                wsUrl = `${parsed.origin}${trimmedPath}${trimmedPath ? "" : ""}/ws`;
              } catch (error) {
                console.warn("Falling back to relative websocket URL", error);
              }
              return new SockJS(wsUrl);
            },
            reconnectDelay: 5000,
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
            debug: () => {},
          });

          client.onConnect = () => {
            setWsStatus("connected");
            client.subscribe(`/topic/peer-practice/${session.id}`, (msg) =>
              handleInboundMessage(msg, "message")
            );
            client.subscribe(`/topic/peer-practice/${session.id}/ai`, (msg) =>
              handleInboundMessage(msg, "ai-feedback")
            );
            pushMessage({
              id: crypto.randomUUID(),
              senderName: "System",
              content: "Đã kết nối tới phòng chat.",
              type: "system",
              timestamp: new Date().toISOString(),
            });
          };

          client.onStompError = (frame) => {
            console.error("STOMP error", frame);
            setWsStatus("disconnected");
            pushMessage({
              id: crypto.randomUUID(),
              senderName: "System",
              content: "Không thể kết nối tới phòng chat. Vui lòng thử lại.",
              type: "system",
            });
          };

          client.onWebSocketClose = () => {
            setWsStatus("disconnected");
          };

          client.activate();
          stompRef.current = client;
        }, 100);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Failed to check active session:", error);
      }
      setActiveSession(null);
      setMessages([]);
      disconnectWebSocket();
    }
  }, [disconnectWebSocket, handleInboundMessage, pushMessage, token]);

  const connectWebSocket = useCallback(
    (session: PeerPracticeSession) => {
      if (!session?.id) return;
      disconnectWebSocket();
      setMessages([]);
      setWsStatus("connecting");

      const apiBase = apiClient.defaults.baseURL ?? window.location.origin;
      let wsUrl = "/ws";
      try {
        const parsed = new URL(apiBase);
        const trimmedPath = parsed.pathname.replace(/\/api(\/v1)?$/, "").replace(/\/$/, "");
        wsUrl = `${parsed.origin}${trimmedPath}${trimmedPath ? "" : ""}/ws`;
      } catch (error) {
        console.warn("Falling back to relative websocket URL", error);
      }

      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 5000,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
        debug: () => {
          /* noop to avoid noisy logs */
        },
      });

      client.onConnect = () => {
        setWsStatus("connected");
        client.subscribe(`/topic/peer-practice/${session.id}`, (msg) =>
          handleInboundMessage(msg, "message")
        );
        client.subscribe(`/topic/peer-practice/${session.id}/ai`, (msg) =>
          handleInboundMessage(msg, "ai-feedback")
        );
        pushMessage({
          id: crypto.randomUUID(),
          senderName: "System",
          content: "Đã kết nối tới phòng chat.",
          type: "system",
          timestamp: new Date().toISOString(),
        });
      };

      client.onStompError = (frame) => {
        console.error("STOMP error", frame);
        setWsStatus("disconnected");
        pushMessage({
          id: crypto.randomUUID(),
          senderName: "System",
          content: "Không thể kết nối tới phòng chat. Vui lòng thử lại.",
          type: "system",
        });
      };

      client.onWebSocketClose = () => {
        setWsStatus("disconnected");
      };

      client.activate();
      stompRef.current = client;
    },
    [disconnectWebSocket, handleInboundMessage, pushMessage, token]
  );

  // Use ref to avoid circular dependency
  const connectWebSocketRef = useRef(connectWebSocket);
  connectWebSocketRef.current = connectWebSocket;

  const checkActiveSession = useCallback(async () => {
    try {
      const session = await peerPracticeService.getActiveSession();
      setActiveSession(session);
      if (session?.id && connectWebSocketRef.current) {
        connectWebSocketRef.current(session);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Failed to check active session:", error);
      }
      setActiveSession(null);
      setMessages([]);
      disconnectWebSocket();
    }
  }, [disconnectWebSocket]);

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  useEffect(() => {
    checkActiveSession();
  }, [checkActiveSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFindMatch = async () => {
    if (!topic.trim() || !scenario.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập topic và scenario",
      });
      return;
    }

    setIsFindingMatch(true);
    try {
      const session = await peerPracticeService.findMatch({
        topic,
        scenario,
        preferredLevel,
        enableAiFeedback,
      });

      setActiveSession(session);
      // Connect WebSocket using the function
      if (session?.id && connectWebSocketRef.current) {
        connectWebSocketRef.current(session);
      }
      toast({
        title: "Đã tìm thấy partner!",
        description: `Bạn đã được match với ${session.learner2Name}`,
      });
    } catch (error: any) {
      console.error("Failed to find match:", error);
      toast({
        variant: "destructive",
        title: "Không tìm thấy partner",
        description: error.response?.data?.message || "Vui lòng thử lại sau",
      });
    } finally {
      setIsFindingMatch(false);
    }
  };

  const sendChatMessage = () => {
    if (!activeSession || !chatInput.trim()) return;
    if (!stompRef.current || !stompRef.current.connected) {
      toast({
        variant: "destructive",
        title: "Chưa kết nối chat",
        description: "Đang thử kết nối lại tới phòng chat. Vui lòng đợi giây lát.",
      });
      return;
    }

    const payload = {
      sessionId: activeSession.id,
      senderId: learner?.id ?? user?.id ?? 0,
      senderName: learner?.name || user?.name || "Bạn",
      content: chatInput.trim(),
      type: "message",
    };

    stompRef.current.publish({
      destination: `/app/peer-practice/${activeSession.id}/message`,
      body: JSON.stringify(payload),
    });

    pushMessage({
      ...payload,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    });
    setChatInput("");
  };

  const requestAiFeedback = () => {
    if (!activeSession) return;
    if (!stompRef.current || !stompRef.current.connected) {
      toast({
        variant: "destructive",
        title: "Chưa kết nối chat",
        description: "Không thể gửi yêu cầu AI khi chưa kết nối phòng chat.",
      });
      return;
    }

    setRequestingFeedback(true);
    const payload = {
      sessionId: activeSession.id,
      senderId: learner?.id ?? user?.id ?? 0,
      senderName: learner?.name || user?.name || "Bạn",
      content: "Request AI feedback",
      type: "ai-feedback",
    };

    stompRef.current.publish({
      destination: `/app/peer-practice/${activeSession.id}/ai-feedback`,
      body: JSON.stringify(payload),
    });

    pushMessage({
      id: crypto.randomUUID(),
      senderName: "System",
      content: "Đã gửi yêu cầu AI feedback...",
      type: "system",
      timestamp: new Date().toISOString(),
    });
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      await peerPracticeService.endSession(activeSession.id);
      disconnectWebSocket();
      setMessages([]);
      setChatInput("");
      setRequestingFeedback(false);
      setActiveSession(null);
      toast({
        title: "Đã kết thúc session",
        description: "Cảm ơn bạn đã tham gia luyện tập!",
      });
    } catch (error: any) {
      console.error("Failed to end session:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể kết thúc session",
      });
    }
  };

  if (activeSession) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peer Practice Session</h1>
          <p className="text-muted-foreground">
            Đang luyện tập với {activeSession.learner1Id === learner?.id
              ? activeSession.learner2Name
              : activeSession.learner1Name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Session đang hoạt động</CardTitle>
                <CardDescription>
                  Topic: {activeSession.topic} | Scenario: {activeSession.scenario}
                </CardDescription>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Partner</p>
                  <p className="text-sm text-muted-foreground">
                    {activeSession.learner1Id === learner?.id
                      ? activeSession.learner2Name
                      : activeSession.learner1Name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Topic</p>
                  <p className="text-sm text-muted-foreground">{activeSession.topic}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted">
              <p className="text-sm font-medium mb-2">Hướng dẫn:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Bắt đầu cuộc hội thoại về chủ đề: {activeSession.topic}</li>
                <li>Kịch bản: {activeSession.scenario}</li>
                <li>AI sẽ cung cấp feedback real-time nếu được bật</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Mic className="mr-2 h-4 w-4" />
                Voice Chat
              </Button>
              <Button variant="outline" className="flex-1">
                <Video className="mr-2 h-4 w-4" />
                Video Call
              </Button>
              <Button variant="destructive" onClick={handleEndSession}>
                <X className="mr-2 h-4 w-4" />
                End Session
              </Button>
            </div>

            {enableAiFeedback && (
              <div className="border rounded-lg p-4 bg-primary/5">
                <p className="text-sm font-medium mb-2">AI Feedback:</p>
                <p className="text-sm text-muted-foreground">
                  AI đang theo dõi và sẽ cung cấp feedback về phát âm, ngữ pháp và từ vựng.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Trò chuyện trực tiếp</CardTitle>
              <Badge
                variant={
                  wsStatus === "connected"
                    ? "default"
                    : wsStatus === "connecting"
                      ? "secondary"
                      : "destructive"
                }
              >
                {wsStatus === "connected"
                  ? "Đang kết nối"
                  : wsStatus === "connecting"
                    ? "Đang kết nối..."
                    : "Mất kết nối"}
              </Badge>
            </div>
            <CardDescription>
              Nhắn tin với partner và nhờ AI góp ý theo thời gian thực
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 overflow-y-auto rounded-lg border bg-background p-3">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Chưa có tin nhắn nào. Hãy gửi lời chào tới partner nhé!
                </p>
              )}
              {messages.map((msg) => {
                const isSelf = msg.senderId && learner?.id ? msg.senderId === learner.id : false;
                const isSystem = msg.type === "system";
                const isAi = msg.type === "ai-feedback";
                return (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${
                      isSystem ? "justify-center" : isSelf ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                        isSystem
                          ? "bg-muted text-muted-foreground"
                          : isAi
                            ? "bg-amber-100 text-amber-900"
                            : isSelf
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                      }`}
                    >
                      {!isSystem && (
                        <p className="text-xs font-semibold opacity-80">{msg.senderName}</p>
                      )}
                      <p className="whitespace-pre-line">{msg.content}</p>
                      {msg.timestamp && (
                        <p className="mt-1 text-[10px] opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                placeholder={
                  wsStatus === "connected"
                    ? "Nhập tin nhắn..."
                    : "Đang chờ kết nối phòng chat..."
                }
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                disabled={wsStatus !== "connected"}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  onClick={sendChatMessage}
                  disabled={wsStatus !== "connected" || !chatInput.trim()}
                >
                  Gửi
                </Button>
                <Button
                  variant="outline"
                  onClick={requestAiFeedback}
                  disabled={wsStatus !== "connected" || requestingFeedback}
                >
                  {requestingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Nhờ AI góp ý
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Peer-to-Peer Practice</h1>
        <p className="text-muted-foreground">
          Luyện tập nói với các học viên khác có sự hỗ trợ của AI
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm Partner để Luyện tập</CardTitle>
          <CardDescription>
            Chọn topic và scenario, hệ thống sẽ tìm partner phù hợp với trình độ của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="Ví dụ: Travel, Business, Daily Life"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scenario">Scenario</Label>
            <Input
              id="scenario"
              placeholder="Ví dụ: Booking a hotel, Job interview, Ordering food"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Preferred Level</Label>
            <Select value={preferredLevel} onValueChange={setPreferredLevel}>
              <SelectTrigger id="level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="aiFeedback"
              checked={enableAiFeedback}
              onChange={(e) => setEnableAiFeedback(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="aiFeedback" className="cursor-pointer">
              Enable AI Feedback (Real-time grammar, vocabulary, pronunciation)
            </Label>
          </div>

          <Button
            onClick={handleFindMatch}
            disabled={isFindingMatch}
            className="w-full"
            size="lg"
          >
            {isFindingMatch ? "Đang tìm partner..." : "Tìm Partner"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lợi ích của Peer Practice</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Luyện tập với người thật trong môi trường an toàn</li>
            <li>• Nhận feedback real-time từ AI về phát âm và ngữ pháp</li>
            <li>• Cải thiện kỹ năng giao tiếp và tự tin</li>
            <li>• Học từ các lỗi và cách diễn đạt của partner</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

