package com.sajidbaba1.researchmanagementsystem.repository.gamification;

import com.sajidbaba1.researchmanagementsystem.entity.gamification.GamificationEventRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GamificationEventRuleRepository extends JpaRepository<GamificationEventRule, Long> {
    Optional<GamificationEventRule> findByEventTypeAndActiveTrue(String eventType);
}
