package ut.aesp.service.Impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.mentor.MentorFeedbackRequest;
import ut.aesp.dto.mentor.MentorFeedbackResponse;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.model.AiPracticeSession;
import ut.aesp.model.LearnerProfile;
import ut.aesp.model.Mentor;
import ut.aesp.model.MentorFeedback;
import ut.aesp.repository.AiPracticeSessionRepository;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.repository.MentorFeedbackRepository;
import ut.aesp.repository.MentorRepository;
import ut.aesp.service.IMentorFeedbackService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class MentorFeedbackService implements IMentorFeedbackService {

  private final MentorFeedbackRepository feedbackRepository;
  private final LearnerProfileRepository learnerProfileRepository;
  private final MentorRepository mentorRepository;
  private final AiPracticeSessionRepository sessionRepository;

  @Override
  public MentorFeedbackResponse createFeedback(Long mentorId, MentorFeedbackRequest request) {
    Mentor mentor = mentorRepository.findById(mentorId)
        .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", mentorId));
    
    LearnerProfile learner = learnerProfileRepository.findById(request.getLearnerId())
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", request.getLearnerId()));

    MentorFeedback feedback = new MentorFeedback();
    feedback.setLearner(learner);
    feedback.setMentor(mentor);
    
    if (request.getPracticeSessionId() != null) {
      AiPracticeSession session = sessionRepository.findById(request.getPracticeSessionId())
          .orElse(null);
      feedback.setPracticeSession(session);
    }
    
    feedback.setPronunciationErrors(request.getPronunciationErrors());
    feedback.setGrammarErrors(request.getGrammarErrors());
    feedback.setVocabularyIssues(request.getVocabularyIssues());
    feedback.setClarityGuidance(request.getClarityGuidance());
    feedback.setConversationTopics(request.getConversationTopics());
    feedback.setVocabularySuggestions(request.getVocabularySuggestions());
    feedback.setNativeSpeakerTips(request.getNativeSpeakerTips());
    feedback.setOverallFeedback(request.getOverallFeedback());
    feedback.setIsImmediate(request.getIsImmediate() != null ? request.getIsImmediate() : true);
    feedback.setFeedbackDate(LocalDateTime.now());

    MentorFeedback saved = feedbackRepository.save(feedback);
    return toResponse(saved);
  }

  @Override
  public MentorFeedbackResponse getFeedback(Long id) {
    MentorFeedback feedback = feedbackRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("MentorFeedback", "id", id));
    return toResponse(feedback);
  }

  @Override
  public List<MentorFeedbackResponse> getFeedbacksByLearner(Long learnerId) {
    return feedbackRepository.findAllByLearnerId(learnerId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Override
  public List<MentorFeedbackResponse> getFeedbacksByMentor(Long mentorId) {
    return feedbackRepository.findAllByMentorId(mentorId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Override
  public List<MentorFeedbackResponse> getImmediateFeedbacks(Long learnerId) {
    return feedbackRepository.findAllByLearnerIdAndIsImmediateTrue(learnerId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  private MentorFeedbackResponse toResponse(MentorFeedback feedback) {
    MentorFeedbackResponse response = new MentorFeedbackResponse();
    response.setId(feedback.getId());
    response.setLearnerId(feedback.getLearner().getId());
    response.setLearnerName(feedback.getLearner().getUser() != null
        ? feedback.getLearner().getUser().getName()
        : feedback.getLearner().getName());
    response.setMentorId(feedback.getMentor().getId());
    response.setMentorName(feedback.getMentor().getUser() != null
        ? feedback.getMentor().getUser().getName()
        : null);
    response.setPracticeSessionId(feedback.getPracticeSession() != null
        ? feedback.getPracticeSession().getId()
        : null);
    response.setPronunciationErrors(feedback.getPronunciationErrors());
    response.setGrammarErrors(feedback.getGrammarErrors());
    response.setVocabularyIssues(feedback.getVocabularyIssues());
    response.setClarityGuidance(feedback.getClarityGuidance());
    response.setConversationTopics(feedback.getConversationTopics());
    response.setVocabularySuggestions(feedback.getVocabularySuggestions());
    response.setNativeSpeakerTips(feedback.getNativeSpeakerTips());
    response.setOverallFeedback(feedback.getOverallFeedback());
    response.setFeedbackDate(feedback.getFeedbackDate());
    response.setIsImmediate(feedback.getIsImmediate());
    return response;
  }
}
