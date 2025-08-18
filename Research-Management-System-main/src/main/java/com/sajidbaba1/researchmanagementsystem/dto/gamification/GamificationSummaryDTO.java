package com.sajidbaba1.researchmanagementsystem.dto.gamification;

import java.util.List;

public class GamificationSummaryDTO {
    private Long userId;
    private int totalPoints;
    private int level;
    private int currentStreak;
    private int longestStreak;
    private List<String> badges;

    public GamificationSummaryDTO() {}

    public GamificationSummaryDTO(Long userId, int totalPoints, int level, int currentStreak, int longestStreak, List<String> badges) {
        this.userId = userId;
        this.totalPoints = totalPoints;
        this.level = level;
        this.currentStreak = currentStreak;
        this.longestStreak = longestStreak;
        this.badges = badges;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    public List<String> getBadges() { return badges; }
    public void setBadges(List<String> badges) { this.badges = badges; }
}
