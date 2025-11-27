// package ut.aesp.mapper;

// import org.springframework.stereotype.Component;
// import ut.aesp.dto.session.AiPracticeSessionResponse;
// import ut.aesp.model.AiPracticeSession;

// @Component
// public class AiPracticeSessionMapper {

// public AiPracticeSessionResponse toResponse(AiPracticeSession s) {
// AiPracticeSessionResponse r = new AiPracticeSessionResponse();
// r.setId(s.getId());
// r.setLearnerId(s.getLearner().getId());
// r.setTopic(s.getTopic());
// r.setScenario(s.getScenario());
// r.setDurationMinutes(s.getDurationMinutes());
// r.setPronunciationScore(s.getPronunciationScore());
// r.setGrammarScore(s.getGrammarScore());
// r.setVocabularyScore(s.getVocabularyScore());
// r.setAiFeedback(s.getAiFeedback());
// r.setAiVersion(s.getAiVersion());
// r.setAudioUrl(s.getAudioUrl());
// return r;
// }
// }
