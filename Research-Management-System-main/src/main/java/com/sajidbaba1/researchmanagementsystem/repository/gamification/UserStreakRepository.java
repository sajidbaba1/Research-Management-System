package com.sajidbaba1.researchmanagementsystem.repository.gamification;

import com.sajidbaba1.researchmanagementsystem.entity.gamification.UserStreak;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserStreakRepository extends JpaRepository<UserStreak, Long> {
    Optional<UserStreak> findByUserIdAndStreakType(Long userId, String streakType);
}
