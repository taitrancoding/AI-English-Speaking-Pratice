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

  MentorFeedbackRepository repo;
  MentorFeedbackMapper mapper;
  MentorRepository mentorRepository;
  LearnerProfileRepository learnerProfileRepository;
  AiPracticeSessionRepository sessionRepository;

  @Override
  public MentorFeedbackResponse create(MentorFeedbackRequest payload) {
    Mentor mentor = mentorRepository.findById(payload.getMentorId())
        .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", payload.getMentorId()));
    LearnerProfile learner = learnerProfileRepository.findById(payload.getLearnerId())
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", payload.getLearnerId()));
    MentorFeedback mf = mapper.toEntity(payload);
    mf.setMentor(mentor);
    mf.setLearner(learner);
    if (payload.getSessionId() != null) {
      var s = sessionRepository.findById(payload.getSessionId())
          .orElseThrow(() -> new ResourceNotFoundException("AiPracticeSession", "id", payload.getSessionId()));
      mf.setSession(s);
    }
    var saved = repo.save(mf);
    return mapper.toResponse(saved);
  }

  @Override
  public MentorFeedbackResponse get(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("MentorFeedback", "id", id));
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
