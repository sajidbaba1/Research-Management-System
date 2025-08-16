package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.service.RAGService;
import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/rag")
@CrossOrigin(origins = "*")
public class RAGController {

    @Autowired
    private RAGService ragService;

    @Autowired
    private ProjectDocumentRepository documentRepository;

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

    @PostMapping("/process-document")
    public ResponseEntity<Map<String, Object>> processDocumentForRAG(@RequestBody Map<String, Object> request) {
        try {
            Long documentId = Long.valueOf(request.get("documentId").toString());
            String fileName = request.get("fileName").toString();
            String filePath = request.get("filePath").toString();
            String fileType = request.get("fileType").toString();

            // Get the document
            ProjectDocument document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // Process document for RAG
            boolean processed = ragService.processDocumentForRAG(document);

            Map<String, Object> response = new HashMap<>();
            response.put("success", processed);
            response.put("message", processed ? "Document processed for RAG successfully" : "Failed to process document");
            response.put("documentId", documentId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
