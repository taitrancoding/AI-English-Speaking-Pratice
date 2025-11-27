package ut.aesp.mapper;

import org.mapstruct.Mapper;

import ut.aesp.dto.packagee.PackageResponse;
import ut.aesp.dto.packagee.PackageRequest;
import ut.aesp.model.Package;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ut.aesp.dto.packagee.PackageRequest;
import ut.aesp.dto.packagee.PackageResponse;
import ut.aesp.model.Package;

@Mapper(componentModel = "spring")
public interface PackageMapper {

  @Mapping(target = "mentors", ignore = true)
  Package toEntity(PackageRequest dto);

  @Mapping(target = "mentors", ignore = true)
  PackageResponse toResponse(Package saved);

}