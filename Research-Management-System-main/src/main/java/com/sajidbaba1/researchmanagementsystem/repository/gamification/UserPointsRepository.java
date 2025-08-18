package com.sajidbaba1.researchmanagementsystem.repository.gamification;

import com.sajidbaba1.researchmanagementsystem.entity.gamification.UserPoints;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPointsRepository extends JpaRepository<UserPoints, Long> {
    Optional<UserPoints> findByUserId(Long userId);
}
