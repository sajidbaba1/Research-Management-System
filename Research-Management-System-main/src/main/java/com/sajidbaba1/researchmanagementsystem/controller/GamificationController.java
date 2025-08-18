package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.dto.gamification.GamificationEventRequest;
import com.sajidbaba1.researchmanagementsystem.dto.gamification.GamificationSummaryDTO;
import com.sajidbaba1.researchmanagementsystem.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    private final GamificationService service;

    public GamificationController(GamificationService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ResponseEntity<GamificationSummaryDTO> summary(@RequestParam("userId") Long userId) {
        return ResponseEntity.ok(service.getSummary(userId));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> leaderboard(@RequestParam(value = "period", defaultValue = "weekly") String period) {
        return ResponseEntity.ok(service.getLeaderboard(period));
    }

    @PostMapping("/event")
    public ResponseEntity<Integer> record(@RequestBody GamificationEventRequest req) {
        int award = service.recordEvent(req.getUserId(), req.getEventType());
        return ResponseEntity.ok(award);
    }
}
