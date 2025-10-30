package ut.aesp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ut.aesp.dto.packagee.PackageRequest;
import ut.aesp.dto.packagee.PackageResponse;

public interface IPackageService {
  PackageResponse create(PackageRequest payload);

  PackageResponse get(Long id);

  PackageResponse update(Long id, PackageRequest payload);

  void delete(Long id);

  Page<PackageResponse> list(Pageable pageable);
}
