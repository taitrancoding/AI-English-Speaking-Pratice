package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.policy.SystemPolicyRequest;
import ut.aesp.dto.policy.SystemPolicyResponse;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.SystemPolicyMapper;
import ut.aesp.model.SystemPolicy;
import ut.aesp.repository.SystemPolicyRepository;
import ut.aesp.service.ISystemPolicyService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class SystemPolicyService implements ISystemPolicyService {

  SystemPolicyRepository repo;
  SystemPolicyMapper mapper;

  @Override
  public SystemPolicyResponse create(SystemPolicyRequest payload) {
    SystemPolicy p = mapper.toEntity(payload);
    var saved = repo.save(p);
    return mapper.toResponse(saved);
  }

  @Override
  public SystemPolicyResponse get(Long id) {
    return repo.findById(id).map(mapper::toResponse)
        .orElseThrow(() -> new ResourceNotFoundException("SystemPolicy", "id", id));
  }

  @Override
  public SystemPolicyResponse update(Long id, SystemPolicyRequest payload) {
    SystemPolicy p = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("SystemPolicy", "id", id));
    if (payload.getTitle() != null)
      p.setTitle(payload.getTitle());
    if (payload.getContent() != null)
      p.setContent(payload.getContent());
    var updated = repo.save(p);
    return mapper.toResponse(updated);
  }

  @Override
  public void delete(Long id) {
    SystemPolicy p = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("SystemPolicy", "id", id));
    repo.delete(p);
  }

  @Override
  public Page<SystemPolicyResponse> list(Pageable pageable) {
    return repo.findAll(pageable).map(mapper::toResponse);
  }
}
