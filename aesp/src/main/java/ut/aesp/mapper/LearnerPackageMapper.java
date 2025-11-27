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
  @Mapping(target = "learnerName", expression = "java(entity.getLearner().getUser() != null ? entity.getLearner().getUser().getName() : entity.getLearner().getName())")
  @Mapping(target = "packageId", source = "packageEntity.id")
  @Mapping(target = "packageName", source = "packageEntity.name")
  @Mapping(target = "packageDescription", source = "packageEntity.description")
  @Mapping(target = "packageDurationDays", source = "packageEntity.durationDays")
  @Mapping(target = "paymentStatus", expression = "java(entity.getPaymentStatus() != null ? entity.getPaymentStatus().name() : null)")
  LearnerPackageResponse toResponse(LearnerPackage entity);

}
