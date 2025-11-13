package ut.aesp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.LearnerPackage.LearnerPackageRequest;
import ut.aesp.dto.LearnerPackage.LearnerPackageResponse;
import ut.aesp.model.LearnerPackage;

@Mapper(componentModel = "spring")
public interface LearnerPackageMapper {
  // @Mapping(target = "learner.id", ignore = true)
  // @Mapping(target = "packageEntity.id", source = "packageId")
  @Mapping(target = "learner", ignore = true)
  @Mapping(target = "packageEntity", ignore = true)
  @Mapping(target = "purchaseDate", ignore = true)
  @Mapping(target = "priceAtPurchase", ignore = true)
  @Mapping(target = "expireDate", ignore = true)
  @Mapping(target = "paymentStatus", ignore = true)
  LearnerPackage toEntity(LearnerPackageRequest dto);

  @Mapping(target = "learnerId", source = "learner.id")
  @Mapping(target = "packageId", source = "packageEntity.id")
  LearnerPackageResponse toResponse(LearnerPackage entity);

}
