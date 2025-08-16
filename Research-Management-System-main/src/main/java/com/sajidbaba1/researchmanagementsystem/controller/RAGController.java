package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.service.RAGService;
import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.fasterxml.jackson.databind.ObjectMapper;

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
            @RequestParam Long projectId,
            @RequestParam(required = false) Long documentId) {
        try {
            RAGService.AIResponse response = ragService.searchAndAnswer(query, projectId, documentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamAnswer(
            @RequestParam String query,
            @RequestParam Long projectId,
            @RequestParam(required = false) Long documentId) {
        SseEmitter emitter = new SseEmitter(0L);
        new Thread(() -> {
            try {
                RAGService.AIResponse ai = ragService.searchAndAnswer(query, projectId, documentId);
                String answer = ai != null && ai.getAnswer() != null ? ai.getAnswer() : "";
                // Stream in modest chunks to simulate token streaming
                int chunkSize = 240;
                for (int i = 0; i < answer.length(); i += chunkSize) {
                    int end = Math.min(answer.length(), i + chunkSize);
                    String chunk = answer.substring(i, end);
                    emitter.send(SseEmitter.event().data(chunk));
                }
                // Send final payload with metadata
                ObjectMapper mapper = new ObjectMapper();
                String finalJson = mapper.writeValueAsString(ai);
                emitter.send(SseEmitter.event().name("done").data(finalJson));
                emitter.complete();
            } catch (Exception ex) {
                try { emitter.completeWithError(ex); } catch (Exception ignore) {}
            }
        }).start();
        return emitter;
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

    @PostMapping("/index-document")
    public ResponseEntity<Map<String, Object>> indexDocument(@RequestParam Long documentId) {
        try {
            ProjectDocument document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            boolean ok = ragService.processAndIndexDocument(document);

            Map<String, Object> response = new HashMap<>();
            response.put("success", ok);
            response.put("message", ok ? "Document indexed successfully" : "Failed to index document");
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
