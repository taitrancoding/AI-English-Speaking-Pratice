package ut.aesp.service;

import ut.aesp.dto.peer.PeerPracticeRequest;
import ut.aesp.dto.peer.PeerPracticeResponse;

import java.util.List;

public interface IPeerPracticeService {
  /**
   * Find a matching partner for peer practice
   */
  PeerPracticeResponse findMatch(Long learnerId, PeerPracticeRequest request);

  /**
   * Create a peer practice session
   */
  PeerPracticeResponse createSession(Long learner1Id, Long learner2Id, PeerPracticeRequest request);

  /**
   * Get active session for a learner
   */
  PeerPracticeResponse getActiveSession(Long learnerId);

  /**
   * End a session
   */
  void endSession(Long sessionId, Long learnerId);

  /**
   * Get session history for a learner
   */
  List<PeerPracticeResponse> getSessionHistory(Long learnerId);
}


