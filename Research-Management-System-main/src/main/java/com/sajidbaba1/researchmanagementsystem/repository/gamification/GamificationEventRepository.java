package com.sajidbaba1.researchmanagementsystem.repository.gamification;

import com.sajidbaba1.researchmanagementsystem.entity.gamification.GamificationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface GamificationEventRepository extends JpaRepository<GamificationEvent, Long> {

    long countByUserIdAndEventTypeAndCreatedAtBetween(Long userId, String eventType, Instant start, Instant end);

    @Query("select e.userId, sum(e.pointsAwarded) as pts from GamificationEvent e where e.createdAt between :start and :end group by e.userId order by pts desc")
    List<Object[]> sumPointsByUserBetween(@Param("start") Instant start, @Param("end") Instant end);

    List<GamificationEvent> findByUserId(Long userId);
}
