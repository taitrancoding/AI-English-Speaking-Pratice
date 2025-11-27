package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ut.aesp.enums.EnglishLevel;
import ut.aesp.model.MentorResource;

import java.util.List;

@Repository
public interface MentorResourceRepository extends JpaRepository<MentorResource, Long> {
  List<MentorResource> findAllByMentorId(Long mentorId);
  
  List<MentorResource> findAllByIsPublicTrue();
  
  List<MentorResource> findAllByCategoryAndTargetLevel(String category, EnglishLevel targetLevel);
}

