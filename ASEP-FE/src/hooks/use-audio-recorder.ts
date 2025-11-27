// import { useCallback, useEffect, useRef, useState } from "react";

// type RecorderState = "idle" | "recording" | "stopped" | "error";

// export function useAudioRecorder() {
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const chunksRef = useRef<BlobPart[]>([]);
//   const [state, setState] = useState<RecorderState>("idle");
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const reset = useCallback(() => {
//     setAudioBlob(null);
//     chunksRef.current = [];
//     setState("idle");
//   }, []);

//   const startRecording = useCallback(async () => {
//     setError(null);
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       chunksRef.current = [];

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           chunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = () => {
//         const blob = new Blob(chunksRef.current, { type: "audio/webm" });
//         setAudioBlob(blob);
//         setState("stopped");
//       };

//       mediaRecorder.start();
//       setState("recording");
//     } catch (err) {
//       console.error("Failed to start recording", err);
//       setError("Không thể truy cập micro. Vui lòng kiểm tra quyền của trình duyệt.");
//       setState("error");
//     }
//   }, []);

//   const stopRecording = useCallback(() => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
//       mediaRecorderRef.current.stop();
//       mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
//     }
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (mediaRecorderRef.current) {
//         mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   return {
//     state,
//     audioBlob,
//     error,
//     startRecording,
//     stopRecording,
//     reset,
//   };
// }

