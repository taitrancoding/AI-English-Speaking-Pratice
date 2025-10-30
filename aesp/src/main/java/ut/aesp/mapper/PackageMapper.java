package ut.aesp.mapper;

import org.mapstruct.Mapper;

import ut.aesp.dto.packagee.PackageResponse;
import ut.aesp.dto.packagee.PackageRequest;

@Mapper(componentModel = "spring")
public interface PackageMapper {

  Package toEntity(PackageRequest dto);

  PackageResponse toResponse(PackageResponse entity);

}