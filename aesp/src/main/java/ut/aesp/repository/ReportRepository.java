package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.model.Report;
import ut.aesp.model.User;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

  List<Report> findAllByAdmin(User admin);
}
