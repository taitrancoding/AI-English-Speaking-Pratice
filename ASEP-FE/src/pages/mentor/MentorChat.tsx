import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, Send, Users } from "lucide-react";
import apiClient from "@/lib/api";
import { listMyLearners, getCurrentMentorProfile, type MentorLearnerSummary } from "@/lib/services/mentor";

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
  role: "LEARNER";
  email?: string;
}

export default function MentorChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentorProfileId, setMentorProfileId] = useState<number | null>(null);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load mentor profile để lấy mentor.id (dùng cho key chat)
    const loadMentorProfile = async () => {
      try {
        const profile = await getCurrentMentorProfile();
        setMentorProfileId(profile.id);
      } catch (error) {
        console.error("Failed to load mentor profile", error);
        toast({
          variant: "destructive",
          title: "Không thể tải profile mentor",
        });
      }
    };

    loadMentorProfile();
  }, [toast]);

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      try {
        const response = await listMyLearners(0, 100);

        // Dedupe learners by learnerId (một learner có thể thuộc nhiều package)
        const learnerMap = new Map<number, ChatContact>();
        response.content.forEach((learner) => {
          if (!learner.learnerId) return;
          if (learnerMap.has(learner.learnerId)) return;

          learnerMap.set(learner.learnerId, {
            id: learner.learnerId,
            name: learner.learnerName || `Learner #${learner.learnerId}`,
            role: "LEARNER" as const,
            email: learner.learnerEmail || undefined,
          });
        });

        setContacts(Array.from(learnerMap.values()));
      } catch (error) {
        console.error("Failed to load contacts", error);
        toast({
          variant: "destructive",
          title: "Không thể tải danh sách học viên",
        });
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, [toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!selectedContact || !messageInput.trim() || !mentorProfileId) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: mentorProfileId,
      senderName: user?.name || "Mentor",
      senderRole: "MENTOR",
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
      
      // Lưu vào localStorage, dùng cặp (mentorId, learnerId)
      const myId = mentorProfileId;
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

  // Load messages from localStorage when contact changes
  // Use bidirectional key so both sides can see messages
  useEffect(() => {
    if (selectedContact && mentorProfileId) {
      const myId = mentorProfileId;
      const contactId = selectedContact.id;
      // Create bidirectional key (smaller ID first for consistency)
      const chatKey = `chat_${Math.min(myId, contactId)}_${Math.max(myId, contactId)}`;
      const savedMessages = JSON.parse(localStorage.getItem(chatKey) || "[]");
      setMessages(savedMessages);
    } else {
      setMessages([]);
    }
  }, [selectedContact, user?.id]);

  // Listen for new messages from other tabs/windows
  useEffect(() => {
    if (!selectedContact || !mentorProfileId) return;
    
    const myId = mentorProfileId;
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
  }, [selectedContact, user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trò chuyện với học viên</h1>
        <p className="text-muted-foreground">
          Nhắn tin với các học viên của bạn
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Contacts List */}
        <Card>
          <CardHeader>
            <CardTitle>Học viên của tôi</CardTitle>
            <CardDescription>Chọn học viên để trò chuyện</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Đang tải...</p>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có học viên nào. Hãy đợi học viên đăng ký gói có bạn.
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
                    <Users className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.email || "No email"}</p>
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
              {selectedContact ? `Trò chuyện với ${selectedContact.name}` : "Chọn học viên để trò chuyện"}
            </CardTitle>
            <CardDescription>
              {selectedContact
                ? `Đang trò chuyện với học viên`
                : "Vui lòng chọn một học viên từ danh sách bên trái"}
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
                    const isSelf = msg.senderRole === "MENTOR";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                            isSelf
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {!isSelf && (
                            <p className="text-xs font-semibold opacity-80 mb-1">
                              {msg.senderName}
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
                  <p>Chọn một học viên để bắt đầu trò chuyện</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

