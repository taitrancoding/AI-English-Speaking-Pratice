package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.session.AiPracticeSessionRequest;
import ut.aesp.dto.session.AiPracticeSessionResponse;
import ut.aesp.model.AiPracticeSession;

@Mapper(componentModel = "spring")
public interface AiPracticeSessionMapper {

  AiPracticeSession toEntity(AiPracticeSessionRequest dto);

  @Mapping(target = "learnerId", source = "learner.id")
  AiPracticeSessionResponse toResponse(AiPracticeSession entity);

}