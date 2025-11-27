package ut.aesp.service.Impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.mentor.AssessmentRequest;
import ut.aesp.dto.mentor.AssessmentResponse;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.model.Assessment;
import ut.aesp.model.LearnerProfile;
import ut.aesp.model.Mentor;
import ut.aesp.repository.AssessmentRepository;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.repository.MentorRepository;
import ut.aesp.service.IAssessmentService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class AssessmentService implements IAssessmentService {

  private final AssessmentRepository assessmentRepository;
  private final LearnerProfileRepository learnerProfileRepository;
  private final MentorRepository mentorRepository;

  @Override
  public AssessmentResponse createAssessment(Long mentorId, AssessmentRequest request) {
    Mentor mentor = mentorRepository.findById(mentorId)
        .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", mentorId));
    
    LearnerProfile learner = learnerProfileRepository.findById(request.getLearnerId())
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", request.getLearnerId()));

    Assessment assessment = new Assessment();
    assessment.setLearner(learner);
    assessment.setMentor(mentor);
    assessment.setAssessedLevel(request.getAssessedLevel());
    assessment.setSpeakingScore(request.getSpeakingScore());
    assessment.setListeningScore(request.getListeningScore());
    assessment.setReadingScore(request.getReadingScore());
    assessment.setWritingScore(request.getWritingScore());
    assessment.setStrengths(request.getStrengths());
    assessment.setWeaknesses(request.getWeaknesses());
    assessment.setRecommendations(request.getRecommendations());
    assessment.setAssessmentDate(LocalDateTime.now());
    assessment.setNextAssessmentDate(LocalDateTime.now().plusMonths(3)); // Next assessment in 3 months

    // Update learner's level based on assessment
    if (request.getAssessedLevel() != null) {
      learner.setEnglishLevel(request.getAssessedLevel());
      learnerProfileRepository.save(learner);
    }

    Assessment saved = assessmentRepository.save(assessment);
    return toResponse(saved);
  }

  @Override
  public AssessmentResponse getAssessment(Long id) {
    Assessment assessment = assessmentRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));
    return toResponse(assessment);
  }

  @Override
  public List<AssessmentResponse> getAssessmentsByLearner(Long learnerId) {
    return assessmentRepository.findAllByLearnerId(learnerId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Override
  public List<AssessmentResponse> getAssessmentsByMentor(Long mentorId) {
    return assessmentRepository.findAllByMentorId(mentorId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Override
  public AssessmentResponse getLatestAssessment(Long learnerId) {
    Assessment assessment = assessmentRepository.findFirstByLearnerIdOrderByAssessmentDateDesc(learnerId)
        .orElseThrow(() -> new ResourceNotFoundException("Assessment", "learnerId", learnerId));
    return toResponse(assessment);
  }

  private AssessmentResponse toResponse(Assessment assessment) {
    AssessmentResponse response = new AssessmentResponse();
    response.setId(assessment.getId());
    response.setLearnerId(assessment.getLearner().getId());
    response.setLearnerName(assessment.getLearner().getUser() != null
        ? assessment.getLearner().getUser().getName()
        : assessment.getLearner().getName());
    response.setMentorId(assessment.getMentor().getId());
    response.setMentorName(assessment.getMentor().getUser() != null
        ? assessment.getMentor().getUser().getName()
        : null);
    response.setAssessedLevel(assessment.getAssessedLevel());
    response.setSpeakingScore(assessment.getSpeakingScore());
    response.setListeningScore(assessment.getListeningScore());
    response.setReadingScore(assessment.getReadingScore());
    response.setWritingScore(assessment.getWritingScore());
    response.setStrengths(assessment.getStrengths());
    response.setWeaknesses(assessment.getWeaknesses());
    response.setRecommendations(assessment.getRecommendations());
    response.setAssessmentDate(assessment.getAssessmentDate());
    response.setNextAssessmentDate(assessment.getNextAssessmentDate());
    return response;
  }
}


