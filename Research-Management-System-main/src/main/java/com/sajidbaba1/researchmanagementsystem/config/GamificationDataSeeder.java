package com.sajidbaba1.researchmanagementsystem.config;

import com.sajidbaba1.researchmanagementsystem.entity.gamification.BadgeDefinition;
import com.sajidbaba1.researchmanagementsystem.entity.gamification.GamificationEventRule;
import com.sajidbaba1.researchmanagementsystem.repository.gamification.BadgeDefinitionRepository;
import com.sajidbaba1.researchmanagementsystem.repository.gamification.GamificationEventRuleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class GamificationDataSeeder implements CommandLineRunner {

    private final GamificationEventRuleRepository ruleRepo;
    private final BadgeDefinitionRepository badgeRepo;

    public GamificationDataSeeder(GamificationEventRuleRepository ruleRepo,
                                  BadgeDefinitionRepository badgeRepo) {
        this.ruleRepo = ruleRepo;
        this.badgeRepo = badgeRepo;
    }

    @Override
    public void run(String... args) {
        seedRules();
        seedBadges();
    }

    private void seedRules() {
        List<GamificationEventRule> defaults = Arrays.asList(
                rule("MILESTONE_COMPLETED", 50, null, 10),
                rule("ON_TIME_SUBMISSION", 30, 3600, 20),
                rule("RISK_REDUCED", 25, 1800, 20),
                rule("DOCUMENT_UPLOADED", 10, 300, 50),
                rule("PEER_REVIEW", 15, 600, 40)
        );
        for (GamificationEventRule r : defaults) {
            ruleRepo.findByEventTypeAndActiveTrue(r.getEventType()).orElseGet(() -> ruleRepo.save(r));
        }
    }

    private GamificationEventRule rule(String type, int pts, Integer cooldown, Integer daily) {
        GamificationEventRule r = new GamificationEventRule();
        r.setEventType(type);
        r.setPoints(pts);
        r.setCooldownSeconds(cooldown);
        r.setDailyCap(daily);
        r.setActive(true);
        return r;
    }

    private void seedBadges() {
        badge("ON_TIME_CHAMPION", "On-time Champion", "Consistently submits on time");
        badge("RISK_BUSTER", "Risk Buster", "Actively reduces project risk");
        badge("DOCUMENTATION_PRO", "Documentation Pro", "Uploads and maintains documents");
        badge("CONSISTENCY_STREAK", "Consistency Streak", "7+ days of continuous activity");
    }

    private void badge(String code, String name, String desc) {
        if (badgeRepo.findByCodeAndActiveTrue(code).isEmpty()) {
            BadgeDefinition b = new BadgeDefinition();
            b.setCode(code);
            b.setName(name);
            b.setDescription(desc);
            b.setActive(true);
            badgeRepo.save(b);
        }
    }
}
