package ut.aesp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ut.aesp.dto.mentor.MentorRequest;
import ut.aesp.dto.mentor.MentorResponse;

public interface IMentorService {
  MentorResponse create(MentorRequest payload);

  MentorResponse get(Long id);

  MentorResponse update(Long id, MentorRequest payload);

  void delete(Long id);

  Page<MentorResponse> list(Pageable pageable);
}
