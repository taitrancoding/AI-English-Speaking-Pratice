package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.feedback.MentorFeedbackRequest;
import ut.aesp.dto.feedback.MentorFeedbackResponse;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.MentorFeedbackMapper;
import ut.aesp.model.Mentor;
import ut.aesp.model.LearnerProfile;
import ut.aesp.model.MentorFeedback;
import ut.aesp.repository.MentorFeedbackRepository;
import ut.aesp.repository.MentorRepository;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.repository.AiPracticeSessionRepository;
import ut.aesp.service.IMentorFeedbackService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class MentorFeedbackService implements IMentorFeedbackService {

  private final MentorFeedbackRepository repo;
  private final MentorFeedbackMapper mapper;
  private final MentorRepository mentorRepository;
  private final LearnerProfileRepository learnerProfileRepository;
  private final AiPracticeSessionRepository sessionRepository;

  @Override
  public MentorFeedbackResponse create(MentorFeedbackRequest payload) {
    System.out.println(
        "🟢 Creating feedback for mentorId=" + payload.getMentorId() + ", learnerId=" + payload.getLearnerId());

    Mentor mentor = mentorRepository.findById(payload.getMentorId())
        .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", payload.getMentorId()));

    LearnerProfile learner = learnerProfileRepository.findById(payload.getLearnerId())
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", payload.getLearnerId()));

    MentorFeedback mf = mapper.toEntity(payload);
    mf.setMentor(mentor);
    System.out.println("Setting learner for feedback: " + learner.getId());
    mf.setLearner(learner);
    System.out.println("Learner set successfully.");
    mf.setPronunciationComment(payload.getPronunciationComment());
    System.out.println("Pronunciation comment set: " + payload.getPronunciationComment());
    mf.setGrammarComment(payload.getGrammarComment());
    System.out.println("Grammar comment set: " + payload.getGrammarComment());
    mf.setImprovementSuggestion(payload.getImprovementSuggestion());
    System.out.println("Improvement suggestion set: " + payload.getImprovementSuggestion());
    mf.setRating(payload.getRating());

    if (payload.getSessionId() != null) {
      var session = sessionRepository.findById(payload.getSessionId())
          .orElseThrow(() -> new ResourceNotFoundException("AiPracticeSession", "id", payload.getSessionId()));
      mf.setSession(session);
    }

    var saved = repo.save(mf);
    System.out.println("Creating new feedback for mentorId=" + payload.getMentorId()
        + ", learnerId=" + payload.getLearnerId()
        + ", sessionId=" + payload.getSessionId());

    return mapper.toResponse(saved);
  }

  @Override
  public MentorFeedbackResponse get(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("MentorFeedback", "id", id));
  }

  @Override
  public MentorFeedbackResponse update(Long id, MentorFeedbackRequest request) {

    MentorFeedback existing = repo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("MentorFeedback", "id", id));

    if (request.getMentorId() != null) {
      Mentor mentor = mentorRepository.findById(request.getMentorId())
          .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", request.getMentorId()));
      existing.setMentor(mentor);
    }

    if (request.getLearnerId() != null) {
      LearnerProfile learner = learnerProfileRepository.findById(request.getLearnerId())
          .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", request.getLearnerId()));
      existing.setLearner(learner);
    }

    if (request.getSessionId() != null) {
      var session = sessionRepository.findById(request.getSessionId())
          .orElseThrow(() -> new ResourceNotFoundException("AiPracticeSession", "id", request.getSessionId()));
      existing.setSession(session);
    }

    if (request.getPronunciationComment() != null)
      existing.setPronunciationComment(request.getPronunciationComment());
    if (request.getGrammarComment() != null)
      existing.setGrammarComment(request.getGrammarComment());
    if (request.getImprovementSuggestion() != null)
      existing.setImprovementSuggestion(request.getImprovementSuggestion());
    if (request.getRating() != null)
      existing.setRating(request.getRating());

    var updated = repo.save(existing);
    return mapper.toResponse(updated);
  }

  @Override
  public void delete(Long id) {
    var mf = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("MentorFeedback", "id", id));
    repo.delete(mf);
  }

  @Override
  public Page<MentorFeedbackResponse> listByMentor(Long mentorId, Pageable pageable) {
    Mentor m = mentorRepository.findById(mentorId)
        .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", mentorId));
    return repo.findAllByMentor(m, pageable).map(mapper::toResponse);
  }
}
