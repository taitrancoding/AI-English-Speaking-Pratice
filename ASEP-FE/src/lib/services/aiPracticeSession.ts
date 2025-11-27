import axiosClient from "../api";

// Lấy session của learner đang đăng nhập
export const getMyPracticeSessions = (page = 0, size = 10) =>
  axiosClient.get(`/ai/practice/me?page=${page}&size=${size}`);

// Alias cho getMyPracticeSessions
export const listMySessions = getMyPracticeSessions;

// Gửi text từ learner sang backend để Gemini chấm điểm và trả lời ngay
export const submitAiEvaluation = async (payload: {
  learnerId: number;
  topic: string;
  scenario: string;
  targetLevel: string;
  speechText: string;
}) => {
  const response = await axiosClient.post(`/ai/evaluation`, {
    learnerId: payload.learnerId,
    topic: payload.topic,
    scenario: payload.scenario,
    targetLevel: payload.targetLevel,
    speechText: payload.speechText,
  });
  return response.data;
};

// Gửi audio + text + đánh giá sang backend để Gemini chấm điểm (legacy)
export const evaluatePracticeSession = (payload: any) =>
  axiosClient.post(`/ai/evaluation`, payload);
