package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.dto.gamification.GamificationSummaryDTO;
import com.sajidbaba1.researchmanagementsystem.entity.gamification.*;
import com.sajidbaba1.researchmanagementsystem.repository.gamification.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GamificationService {

    private final GamificationEventRuleRepository ruleRepo;
    private final GamificationEventRepository eventRepo;
    private final UserPointsRepository pointsRepo;
    private final UserBadgeRepository userBadgeRepo;
    private final BadgeDefinitionRepository badgeDefRepo;
    private final UserStreakRepository streakRepo;

    public GamificationService(GamificationEventRuleRepository ruleRepo,
                               GamificationEventRepository eventRepo,
                               UserPointsRepository pointsRepo,
                               UserBadgeRepository userBadgeRepo,
                               BadgeDefinitionRepository badgeDefRepo,
                               UserStreakRepository streakRepo) {
        this.ruleRepo = ruleRepo;
        this.eventRepo = eventRepo;
        this.pointsRepo = pointsRepo;
        this.userBadgeRepo = userBadgeRepo;
        this.badgeDefRepo = badgeDefRepo;
        this.streakRepo = streakRepo;
    }

    @Transactional
    public int recordEvent(Long userId, String eventType) {
        Objects.requireNonNull(userId, "userId required");
        Objects.requireNonNull(eventType, "eventType required");

        int awarded = 0;
        Optional<GamificationEventRule> ruleOpt = ruleRepo.findByEventTypeAndActiveTrue(eventType);
        if (ruleOpt.isPresent()) {
            GamificationEventRule rule = ruleOpt.get();
            if (canAward(userId, rule)) {
                awarded = rule.getPoints();
                addPoints(userId, awarded);
                GamificationEvent e = new GamificationEvent();
                e.setUserId(userId);
                e.setEventType(eventType);
                e.setPointsAwarded(awarded);
                eventRepo.save(e);

                updateBadges(userId);
            }
        }

        // Update daily streak for ANY activity
        updateDailyStreak(userId, "DAILY_ACTIVITY");

        return awarded;
    }

    public GamificationSummaryDTO getSummary(Long userId) {
        UserPoints up = pointsRepo.findByUserId(userId).orElseGet(() -> {
            UserPoints u = new UserPoints();
            u.setUserId(userId);
            u.setTotalPoints(0);
            u.setLevel(1);
            return pointsRepo.save(u);
        });

        UserStreak streak = streakRepo.findByUserIdAndStreakType(userId, "DAILY_ACTIVITY").orElse(null);
        int current = streak != null ? streak.getCurrentCount() : 0;
        int longest = streak != null ? streak.getLongestCount() : 0;

        List<String> badges = userBadgeRepo.findByUserId(userId)
                .stream().map(UserBadge::getBadgeCode).collect(Collectors.toList());

        return new GamificationSummaryDTO(userId, up.getTotalPoints(), up.getLevel(), current, longest, badges);
    }

    public List<Map<String, Object>> getLeaderboard(String period) {
        Instant now = Instant.now();
        Instant start;
        if ("weekly".equalsIgnoreCase(period)) {
            start = now.minus(Duration.ofDays(7));
        } else {
            start = now.minus(Duration.ofDays(30));
        }
        List<Object[]> rows = eventRepo.sumPointsByUserBetween(start, now);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("userId", r[0]);
            m.put("points", r[1]);
            out.add(m);
        }
        return out;
    }

    private boolean canAward(Long userId, GamificationEventRule rule) {
        // daily cap check
        if (rule.getDailyCap() != null && rule.getDailyCap() > 0) {
            Instant startOfDay = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant endOfDay = startOfDay.plus(Duration.ofDays(1)).minusMillis(1);
            long todayCount = eventRepo.countByUserIdAndEventTypeAndCreatedAtBetween(userId, rule.getEventType(), startOfDay, endOfDay);
            if (todayCount >= rule.getDailyCap()) return false;
        }
        // cooldown check
        if (rule.getCooldownSeconds() != null && rule.getCooldownSeconds() > 0) {
            Instant cutoff = Instant.now().minusSeconds(rule.getCooldownSeconds());
            List<GamificationEvent> list = eventRepo.findByUserId(userId);
            for (int i = list.size() - 1; i >= 0 && i >= list.size() - 20; i--) {
                GamificationEvent e = list.get(i);
                if (rule.getEventType().equals(e.getEventType()) && e.getCreatedAt().isAfter(cutoff)) {
                    return false;
                }
            }
        }
        return true;
    }

    private void addPoints(Long userId, int pts) {
        UserPoints up = pointsRepo.findByUserId(userId).orElseGet(() -> {
            UserPoints u = new UserPoints();
            u.setUserId(userId);
            u.setLevel(1);
            u.setTotalPoints(0);
            return u;
        });
        up.setTotalPoints(up.getTotalPoints() + pts);
        int level = 1 + (up.getTotalPoints() / 500);
        up.setLevel(level);
        pointsRepo.save(up);
    }

    private void updateDailyStreak(Long userId, String streakType) {
        LocalDate today = LocalDate.now();
        UserStreak streak = streakRepo.findByUserIdAndStreakType(userId, streakType).orElseGet(() -> {
            UserStreak s = new UserStreak();
            s.setUserId(userId);
            s.setStreakType(streakType);
            s.setCurrentCount(0);
            s.setLongestCount(0);
            return s;
        });
        LocalDate last = streak.getLastActiveDate();
        if (last == null) {
            streak.setCurrentCount(1);
        } else if (last.plusDays(1).equals(today)) {
            streak.setCurrentCount(streak.getCurrentCount() + 1);
        } else if (last.isEqual(today)) {
            // already counted today
        } else {
            streak.setCurrentCount(1);
        }
        streak.setLastActiveDate(today);
        streak.setLongestCount(Math.max(streak.getLongestCount(), streak.getCurrentCount()));
        streakRepo.save(streak);
        // Badge for 7-day streak
        if (streak.getCurrentCount() >= 7) awardBadge(userId, "CONSISTENCY_STREAK");
    }

    private void updateBadges(Long userId) {
        List<GamificationEvent> all = eventRepo.findByUserId(userId);
        long onTime = all.stream().filter(e -> "ON_TIME_SUBMISSION".equals(e.getEventType())).count();
        if (onTime >= 5) awardBadge(userId, "ON_TIME_CHAMPION");
        long riskRed = all.stream().filter(e -> "RISK_REDUCED".equals(e.getEventType())).count();
        if (riskRed >= 3) awardBadge(userId, "RISK_BUSTER");
        long docs = all.stream().filter(e -> "DOCUMENT_UPLOADED".equals(e.getEventType())).count();
        if (docs >= 10) awardBadge(userId, "DOCUMENTATION_PRO");
    }

    private void awardBadge(Long userId, String badgeCode) {
        if (userBadgeRepo.existsByUserIdAndBadgeCode(userId, badgeCode)) return;
        Optional<BadgeDefinition> def = badgeDefRepo.findByCodeAndActiveTrue(badgeCode);
        if (def.isEmpty()) return;
        UserBadge ub = new UserBadge();
        ub.setUserId(userId);
        ub.setBadgeCode(badgeCode);
        userBadgeRepo.save(ub);
    }
}
