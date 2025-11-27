package ut.aesp.service.Impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.peer.PeerPracticeRequest;
import ut.aesp.dto.peer.PeerPracticeResponse;
import ut.aesp.enums.EnglishLevel;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.model.LearnerProfile;
import ut.aesp.model.PeerPracticeSession;
import ut.aesp.repository.LearnerProfileRepository;
import ut.aesp.repository.PeerPracticeSessionRepository;
import ut.aesp.service.IPeerPracticeService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class PeerPracticeService implements IPeerPracticeService {

  private final PeerPracticeSessionRepository sessionRepository;
  private final LearnerProfileRepository learnerProfileRepository;

  @Override
  public PeerPracticeResponse findMatch(Long learnerId, PeerPracticeRequest request) {
    LearnerProfile learner = learnerProfileRepository.findById(learnerId)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", learnerId));

    // Find available learners with similar level
    EnglishLevel targetLevel = request.getPreferredLevel() != null
        ? EnglishLevel.valueOf(request.getPreferredLevel())
        : learner.getEnglishLevel();

    List<LearnerProfile> availableLearners = learnerProfileRepository.findAll().stream()
        .filter(l -> !l.getId().equals(learnerId))
        .filter(l -> {
          // Check if learner has active session
          List<PeerPracticeSession> activeSessions = sessionRepository
              .findAllByLearner1IdOrLearner2Id(l.getId(), l.getId())
              .stream()
              .filter(s -> s.getStatus() == PeerPracticeSession.SessionStatus.ACTIVE)
              .toList();
          return activeSessions.isEmpty();
        })
        .filter(l -> {
          // Match by similar level (same level or adjacent)
          EnglishLevel lLevel = l.getEnglishLevel();
          if (lLevel == null) return false;
          return lLevel == targetLevel
              || (targetLevel == EnglishLevel.BEGINNER && lLevel == EnglishLevel.INTERMEDIATE)
              || (targetLevel == EnglishLevel.INTERMEDIATE && (lLevel == EnglishLevel.BEGINNER || lLevel == EnglishLevel.ADVANCED))
              || (targetLevel == EnglishLevel.ADVANCED && lLevel == EnglishLevel.INTERMEDIATE);
        })
        .limit(10)
        .collect(Collectors.toList());

    if (availableLearners.isEmpty()) {
      throw new RuntimeException("No matching partner found. Please try again later.");
    }

    // Select first available learner (can be improved with better matching algorithm)
    LearnerProfile partner = availableLearners.get(0);

    // Create session
    return createSession(learnerId, partner.getId(), request);
  }

  @Override
  public PeerPracticeResponse createSession(Long learner1Id, Long learner2Id, PeerPracticeRequest request) {
    LearnerProfile learner1 = learnerProfileRepository.findById(learner1Id)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", learner1Id));
    LearnerProfile learner2 = learnerProfileRepository.findById(learner2Id)
        .orElseThrow(() -> new ResourceNotFoundException("LearnerProfile", "id", learner2Id));

    PeerPracticeSession session = new PeerPracticeSession();
    session.setLearner1(learner1);
    session.setLearner2(learner2);
    session.setTopic(request.getTopic());
    session.setScenario(request.getScenario());
    session.setStartTime(LocalDateTime.now());
    session.setStatus(PeerPracticeSession.SessionStatus.ACTIVE);

    PeerPracticeSession saved = sessionRepository.save(session);

    return toResponse(saved);
  }

  @Override
  public PeerPracticeResponse getActiveSession(Long learnerId) {
    List<PeerPracticeSession> sessions = sessionRepository.findAllByLearner1IdOrLearner2Id(learnerId, learnerId);
    PeerPracticeSession activeSession = sessions.stream()
        .filter(s -> s.getStatus() == PeerPracticeSession.SessionStatus.ACTIVE)
        .findFirst()
        .orElseThrow(() -> new ResourceNotFoundException("ActivePeerPracticeSession", "learnerId", learnerId));

    return toResponse(activeSession);
  }

  @Override
  public void endSession(Long sessionId, Long learnerId) {
    PeerPracticeSession session = sessionRepository.findById(sessionId)
        .orElseThrow(() -> new ResourceNotFoundException("PeerPracticeSession", "id", sessionId));

    if (!session.getLearner1().getId().equals(learnerId) && !session.getLearner2().getId().equals(learnerId)) {
      throw new RuntimeException("You are not authorized to end this session");
    }

    session.setEndTime(LocalDateTime.now());
    if (session.getStartTime() != null && session.getEndTime() != null) {
      long minutes = java.time.Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
      session.setDurationMinutes((int) minutes);
    }
    session.setStatus(PeerPracticeSession.SessionStatus.COMPLETED);
    sessionRepository.save(session);
  }

  @Override
  public List<PeerPracticeResponse> getSessionHistory(Long learnerId) {
    List<PeerPracticeSession> sessions = sessionRepository.findAllByLearner1IdOrLearner2Id(learnerId, learnerId);
    return sessions.stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  private PeerPracticeResponse toResponse(PeerPracticeSession session) {
    PeerPracticeResponse response = new PeerPracticeResponse();
    response.setId(session.getId());
    response.setLearner1Id(session.getLearner1().getId());
    response.setLearner1Name(session.getLearner1().getUser() != null
        ? session.getLearner1().getUser().getName()
        : session.getLearner1().getName());
    response.setLearner2Id(session.getLearner2().getId());
    response.setLearner2Name(session.getLearner2().getUser() != null
        ? session.getLearner2().getUser().getName()
        : session.getLearner2().getName());
    response.setTopic(session.getTopic());
    response.setScenario(session.getScenario());
    response.setStartTime(session.getStartTime());
    response.setEndTime(session.getEndTime());
    response.setDurationMinutes(session.getDurationMinutes());
    response.setStatus(session.getStatus() != null ? session.getStatus().name() : null);
    response.setAiFeedback(session.getAiFeedback());
    response.setWebsocketUrl("/ws/peer-practice/" + session.getId());
    return response;
  }
}


