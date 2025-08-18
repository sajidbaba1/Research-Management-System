package com.sajidbaba1.researchmanagementsystem.repository.gamification;

import com.sajidbaba1.researchmanagementsystem.entity.gamification.BadgeDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BadgeDefinitionRepository extends JpaRepository<BadgeDefinition, Long> {
    Optional<BadgeDefinition> findByCodeAndActiveTrue(String code);
}
