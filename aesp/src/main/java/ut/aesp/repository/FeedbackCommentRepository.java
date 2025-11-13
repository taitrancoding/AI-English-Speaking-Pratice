package ut.aesp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import ut.aesp.model.FeedbackComment;
import ut.aesp.model.User;

import java.util.List;

@Repository
public interface FeedbackCommentRepository extends JpaRepository<FeedbackComment, Long> {

  List<FeedbackComment> findAllByUser(User user);

  Page<FeedbackComment> findAllByUser(User user, Pageable pageable);

  List<FeedbackComment> findAllByTargetTypeAndTargetId(String targetType, Integer targetId);

}
