// import { useCallback, useEffect, useRef, useState } from "react";

// export type AiChatMessage = {
//   id: string;
//   role: "user" | "assistant" | "system";
//   content: string;
//   streaming?: boolean;
// };

// const DEFAULT_WS_URL = import.meta.env.VITE_AI_CHAT_WS_URL ?? "ws://localhost:8080/ws/ai-chat";

// export function useAiChat(wsUrl: string = DEFAULT_WS_URL) {
//   const wsRef = useRef<WebSocket | null>(null);
//   const [messages, setMessages] = useState<AiChatMessage[]>([]);
//   const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");

//   const connect = useCallback(() => {
//     if (!wsUrl) {
//       console.warn("AI chat websocket URL is not configured");
//       return;
//     }
//     setStatus("connecting");
//     const socket = new WebSocket(wsUrl);
//     wsRef.current = socket;

//     socket.onopen = () => setStatus("connected");
//     socket.onclose = () => {
//       setStatus("disconnected");
//       wsRef.current = null;
//     };
//     socket.onerror = () => setStatus("disconnected");
//     socket.onmessage = (event) => {
//       try {
//         const payload = JSON.parse(event.data);
//         if (payload.type === "partial") {
//           setMessages((prev) => {
//             const updated = [...prev];
//             const last = updated[updated.length - 1];
//             if (last && last.streaming) {
//               last.content += payload.content;
//             } else {
//               updated.push({
//                 id: crypto.randomUUID(),
//                 role: "assistant",
//                 content: payload.content,
//                 streaming: true,
//               });
//             }
//             return [...updated];
//           });
//         } else {
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: crypto.randomUUID(),
//               role: (payload.role as AiChatMessage["role"]) || "assistant",
//               content: payload.content ?? "",
//               streaming: false,
//             },
//           ]);
//         }
//       } catch (err) {
//         console.error("Invalid AI chat event", err);
//       }
//     };
//   }, [wsUrl]);

//   useEffect(() => {
//     connect();
//     return () => {
//       wsRef.current?.close();
//     };
//   }, [connect]);

//   const sendTextMessage = useCallback((content: string) => {
//     if (!content.trim()) return;
//     setMessages((prev) => [
//       ...prev,
//       { id: crypto.randomUUID(), role: "user", content, streaming: false },
//     ]);
//     wsRef.current?.send(JSON.stringify({ type: "text", content }));
//   }, []);

//   const sendAudioMessage = useCallback((base64Audio: string) => {
//     if (!base64Audio) return;
//     setMessages((prev) => [
//       ...prev,
//       { id: crypto.randomUUID(), role: "user", content: "[Gửi audio]", streaming: false },
//     ]);
//     wsRef.current?.send(JSON.stringify({ type: "audio", content: base64Audio }));
//   }, []);

//   return {
//     messages,
//     status,
//     sendTextMessage,
//     sendAudioMessage,
//   };
// }

