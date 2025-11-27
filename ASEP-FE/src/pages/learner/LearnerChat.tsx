import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentLearnerProfile } from "@/hooks/use-current-learner";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, Send, Users, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import apiClient from "@/lib/api";
import { listMyLearnerPackages } from "@/lib/services/learnerPackage";

interface ChatMessage {
  id: string;
  senderId: number;
  senderName: string;
  senderRole: "LEARNER" | "MENTOR";
  content: string;
  timestamp: string;
}

interface ChatContact {
  id: number;
  name: string;
  role: "LEARNER" | "MENTOR";
  email?: string;
}

export default function LearnerChat() {
  const { learner } = useCurrentLearnerProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        // Load mentors from packages
        const packages = await listMyLearnerPackages(0, 100);
        const mentorSet = new Map<number, ChatContact>();
        const learnerSet = new Map<number, ChatContact>();
        
        packages.content?.forEach((pkg) => {
          if (pkg.mentors && Array.isArray(pkg.mentors)) {
            pkg.mentors.forEach((mentor: any) => {
              if (mentor.id && mentor.name) {
                mentorSet.set(mentor.id, {
                  id: mentor.id,
                  name: mentor.name,
                  role: "MENTOR" as const,
                  email: mentor.email,
                });
              }
            });
          }
        });

        // Load other learners cho peer-to-peer chat (dùng learnerId = LearnerProfile.id)
        try {
          console.log("[LearnerChat] Fetching leaderboard for peer learners");
          // Try to get list of learners from leaderboard
          const response = await apiClient.get("/leaderboard", {
            params: { filter: "all", limit: 50 },
          });
          
          console.log("[LearnerChat] Leaderboard response:", response);
          console.log("[LearnerChat] Response data:", response.data);
          
          let data: any[] = [];
          if (Array.isArray(response.data)) {
            data = response.data;
          } else if (response.data?.content && Array.isArray(response.data.content)) {
            data = response.data.content;
          } else if (response.data && typeof response.data === 'object') {
            data = Object.values(response.data).find((v: any) => Array.isArray(v)) as any[] || [];
          }
          
          console.log("[LearnerChat] Parsed leaderboard data:", data);
          
          data.forEach((entry: any) => {
            if (entry.learnerId && entry.learnerId !== learner?.id) {
              learnerSet.set(entry.learnerId, {
                id: entry.learnerId,
                name: entry.learnerName || `Learner #${entry.learnerId}`,
                role: "LEARNER" as const,
              });
            }
          });
          
          console.log("[LearnerChat] Added", learnerSet.size, "peer learners");
        } catch (error: any) {
          // If API doesn't exist or fails, continue without learners
          console.error("[LearnerChat] Could not load other learners for chat", error);
          console.error("[LearnerChat] Error response:", error.response);
        }

        setContacts([...mentorSet.values(), ...learnerSet.values()]);
      } catch (error) {
        console.error("Failed to load contacts", error);
        toast({
          variant: "destructive",
          title: "Không thể tải danh sách liên hệ",
        });
      }
    };
    loadContacts();
  }, [toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    // Cần có learnerProfile.id để đồng bộ key với MentorChat
    if (!learner?.id || !selectedContact || !messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: learner.id,
      senderName: learner?.name || user?.name || "Bạn",
      senderRole: "LEARNER",
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");

    // Try to send via API if endpoint exists
    try {
      // For now, we'll use a simple approach - store messages locally
      // Backend endpoint needed: POST /api/v1/chat/message
      // {
      //   recipientId: selectedContact.id,
      //   recipientRole: selectedContact.role,
      //   content: newMessage.content,
      // }
      
      // Lưu vào localStorage bằng cặp (learnerId, contactId)
      const myId = learner.id;
      const contactId = selectedContact.id;
      const chatKey = `chat_${Math.min(myId, contactId)}_${Math.max(myId, contactId)}`;
      const existingMessages = JSON.parse(localStorage.getItem(chatKey) || "[]");
      existingMessages.push(newMessage);
      localStorage.setItem(chatKey, JSON.stringify(existingMessages));
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent("storage", {
        key: chatKey,
        newValue: JSON.stringify(existingMessages),
      }));
      
      toast({
        title: "Đã gửi tin nhắn",
        description: "Tin nhắn đã được lưu (chế độ tạm thời - cần backend để đồng bộ)",
      });
    } catch (error) {
      console.error("Failed to send message", error);
      toast({
        variant: "destructive",
        title: "Không thể gửi tin nhắn",
        description: "Vui lòng thử lại sau",
      });
    }
  };

  // Load messages từ localStorage khi đổi contact
  // Key dùng (learnerId, contactId) để đồng bộ với MentorChat
  useEffect(() => {
    if (selectedContact && learner?.id) {
      const myId = learner.id;
      const contactId = selectedContact.id;
      // Create bidirectional key (smaller ID first for consistency)
      const chatKey = `chat_${Math.min(myId, contactId)}_${Math.max(myId, contactId)}`;
      const savedMessages = JSON.parse(localStorage.getItem(chatKey) || "[]");
      setMessages(savedMessages);
    } else {
      setMessages([]);
    }
  }, [selectedContact, learner?.id, user?.id]);

  // Lắng nghe thay đổi từ tab khác (cùng key)
  useEffect(() => {
    if (!selectedContact || !learner?.id) return;
    
    const myId = learner.id;
    const contactId = selectedContact.id;
    const chatKey = `chat_${Math.min(myId, contactId)}_${Math.max(myId, contactId)}`;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === chatKey && e.newValue) {
        try {
          const newMessages = JSON.parse(e.newValue);
          setMessages(newMessages);
        } catch (error) {
          console.error("Failed to parse storage update", error);
        }
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [selectedContact, learner?.id, user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trò chuyện</h1>
        <p className="text-muted-foreground">
          Nhắn tin với mentor và các learner khác
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Contacts List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh bạ</CardTitle>
            <CardDescription>Chọn người để trò chuyện</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có liên hệ nào. Hãy đăng ký gói học để kết nối với mentor.
              </p>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center gap-2">
                    {contact.role === "MENTOR" ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <Users className="h-4 w-4 text-blue-500" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {contact.role === "MENTOR" ? "Mentor" : "Learner"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedContact ? `Trò chuyện với ${selectedContact.name}` : "Chọn người để trò chuyện"}
            </CardTitle>
            <CardDescription>
              {selectedContact
                ? `Đang trò chuyện với ${selectedContact.role === "MENTOR" ? "mentor" : "learner"}`
                : "Vui lòng chọn một liên hệ từ danh sách bên trái"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedContact ? (
              <>
                <div className="h-96 overflow-y-auto rounded-lg border bg-background p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                    </p>
                  )}
                  {messages.map((msg) => {
                    const isSelf = learner?.id != null && msg.senderId === learner.id;
                    const isMentor = msg.senderRole === "MENTOR";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                            isSelf
                              ? "bg-primary text-primary-foreground"
                              : isMentor
                                ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                                : "bg-muted"
                          }`}
                        >
                          {!isSelf && (
                            <p className="text-xs font-semibold opacity-80 mb-1">
                              {msg.senderName} {isMentor && <Badge variant="outline" className="ml-1 text-[10px]">Mentor</Badge>}
                            </p>
                          )}
                          <p className="whitespace-pre-line">{msg.content}</p>
                          <p className="text-[10px] opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage} disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chọn một liên hệ để bắt đầu trò chuyện</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

