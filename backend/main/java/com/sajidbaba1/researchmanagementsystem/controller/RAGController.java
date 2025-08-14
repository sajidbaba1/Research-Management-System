package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.service.RAGService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rag")
public class RAGController {

    @Autowired
    private RAGService ragService;

    @PostMapping("/search")
    public ResponseEntity<RAGService.AIResponse> searchAndAnswer(
            @RequestParam String query,
            @RequestParam Long projectId) {
        try {
            RAGService.AIResponse response = ragService.searchAndAnswer(query, projectId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/insights/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectInsights(@PathVariable Long projectId) {
        try {
            Map<String, Object> insights = ragService.getProjectInsights(projectId);
            return ResponseEntity.ok(insights);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/summarize")
    public ResponseEntity<RAGService.AIResponse> summarizeDocument(
            @RequestParam Long documentId,
            @RequestParam String query) {
        try {
            // This would integrate with document summarization
            RAGService.AIResponse response = new RAGService.AIResponse(
                    "Document summarization feature coming soon",
                    java.util.Collections.emptyList(),
                    query
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
