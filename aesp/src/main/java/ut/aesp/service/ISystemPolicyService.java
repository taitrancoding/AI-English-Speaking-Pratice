package ut.aesp.service;

import ut.aesp.dto.policy.SystemPolicyRequest;
import ut.aesp.dto.policy.SystemPolicyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ISystemPolicyService {
  SystemPolicyResponse create(SystemPolicyRequest payload);

  SystemPolicyResponse get(Long id);

  SystemPolicyResponse update(Long id, SystemPolicyRequest payload);

  void delete(Long id);

  Page<SystemPolicyResponse> list(Pageable pageable);

}
