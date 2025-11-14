package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.Package;
import ut.aesp.enums.PackageStatus;

import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {

  List<Package> findAllByStatus(PackageStatus status);

  Object save(java.lang.Package p);
}
