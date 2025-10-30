package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.LearnerPackage.LearnerPackageRequest;
import ut.aesp.dto.LearnerPackage.LearnerPackageResponse;
import ut.aesp.model.LearnerPackage;

@Mapper(componentModel = "spring")
public interface LearnerPackageMapper {
  @Mapping(target = "learner.id", source = "learnerId")
  @Mapping(target = "packageEntity.id", source = "packageId")
  LearnerPackage toEntity(LearnerPackageRequest dto);

  @Mapping(target = "learnerId", source = "learner.id")
  @Mapping(target = "packageId", source = "packageEntity.id")
  LearnerPackageResponse toResponse(LearnerPackage entity);
}
