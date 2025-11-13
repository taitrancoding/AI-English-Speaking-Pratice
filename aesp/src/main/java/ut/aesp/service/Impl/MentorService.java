package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.mentor.MentorRequest;
import ut.aesp.dto.mentor.MentorResponse;
import ut.aesp.dto.mentor.MentorUpdate;
import ut.aesp.enums.AvailabilityStatus;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.MentorMapper;
import ut.aesp.model.Mentor;
import ut.aesp.repository.MentorRepository;
import ut.aesp.repository.UserRepository;
import ut.aesp.service.IMentorService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class MentorService implements IMentorService {

  private final MentorRepository repo;
  private final MentorMapper mapper;
  private final UserRepository userRepository;

  @Override
  public MentorResponse create(MentorRequest payload) {
    var user = userRepository.findById(payload.getUserId())
        .orElseThrow(() -> new ResourceNotFoundException("User", "id", payload.getUserId()));
    Mentor m = mapper.toEntity(payload);
    m.setUser(user);
    var saved = repo.save(m);
    return mapper.toResponse(saved);
  }

  @Override
  public MentorResponse get(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", id));
  }

  @Override
  public MentorResponse update(Long id, MentorUpdate payload) {
    Mentor m = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", id));
    if (payload.getBio() != null)
      m.setBio(payload.getBio());
    if (payload.getSkills() != null)
      m.setSkills(payload.getSkills());
    if (payload.getExperienceYears() != null)
      m.setExperienceYears(payload.getExperienceYears());
    if (payload.getAvailabilityStatus() != null)
      m.setAvailabilityStatus(AvailabilityStatus.valueOf(payload.getAvailabilityStatus()));
    var updated = repo.save(m);
    return mapper.toResponse(updated);
  }

  @Override
  public void delete(Long id) {
    Mentor m = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", id));
    repo.delete(m);
  }

  @Override
  public Page<MentorResponse> list(Pageable pageable) {
    return repo.findAll(pageable).map(mapper::toResponse);
  }
}
