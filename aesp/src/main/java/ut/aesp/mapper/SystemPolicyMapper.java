package ut.aesp.mapper;

import org.mapstruct.Mapper;
import ut.aesp.dto.policy.SystemPolicyRequest;
import ut.aesp.dto.policy.SystemPolicyResponse;
import ut.aesp.model.SystemPolicy;

@Mapper(componentModel = "spring")
public interface SystemPolicyMapper {

  SystemPolicy toEntity(SystemPolicyRequest dto);

  SystemPolicyResponse toResponse(SystemPolicy entity);

}
