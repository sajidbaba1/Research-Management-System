package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.dto.AIQueryRequest;
import com.sajidbaba1.researchmanagementsystem.dto.AIQueryResponse;
import com.sajidbaba1.researchmanagementsystem.service.AIService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/query")
    public ResponseEntity<AIQueryResponse> queryAI(@Valid @RequestBody AIQueryRequest request) {
        AIQueryResponse response = aiService.queryAI(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    public ResponseEntity<AIQueryResponse> chat(@Valid @RequestBody AIQueryRequest request) {
        AIQueryResponse response = aiService.chat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggestions/{projectId}")
    public ResponseEntity<List<String>> getSuggestions(@PathVariable Long projectId) {
        List<String> suggestions = aiService.getSuggestions(projectId);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/analyze")
    public ResponseEntity<AIQueryResponse> analyzeProject(@Valid @RequestBody AIQueryRequest request) {
        AIQueryResponse response = aiService.analyzeProject(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommendations/{projectId}")
    public ResponseEntity<List<String>> getRecommendations(@PathVariable Long projectId) {
        List<String> recommendations = aiService.getRecommendations(projectId);
        return ResponseEntity.ok(recommendations);
    }
}
