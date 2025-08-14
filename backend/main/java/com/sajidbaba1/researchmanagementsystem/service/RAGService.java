package com.sajidbaba1.researchmanagementsystem.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RAGService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${pinecone.api.key:}")
    private String pineconeApiKey;

    @Autowired
    private ProjectDocumentRepository documentRepository;

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class SearchResult {
        private String content;
        private String fileName;
        private double relevance;
        private String context;

        public SearchResult(String content, String fileName, double relevance, String context) {
            this.content = content;
            this.fileName = fileName;
            this.relevance = relevance;
            this.context = context;
        }

        public String getContent() { return content; }
        public String getFileName() { return fileName; }
        public double getRelevance() { return relevance; }
        public String getContext() { return context; }
    }

    public static class AIResponse {
        private String answer;
        private List<SearchResult> sources;
        private String query;

        public AIResponse(String answer, List<SearchResult> sources, String query) {
            this.answer = answer;
            this.sources = sources;
            this.query = query;
        }

        public String getAnswer() { return answer; }
        public List<SearchResult> getSources() { return sources; }
        public String getQuery() { return query; }
    }

    public AIResponse searchAndAnswer(String query, Long projectId) {
        try {
            // Step 1: Search relevant documents
            List<SearchResult> relevantDocs = searchDocuments(query, projectId);
            
            // Step 2: Generate context from relevant documents
            String context = buildContext(relevantDocs);
            
            // Step 3: Generate AI response using Groq API
            String aiResponse = generateAIResponse(query, context);
            
            return new AIResponse(aiResponse, relevantDocs, query);
            
        } catch (Exception e) {
            throw new RuntimeException("Error processing RAG query", e);
        }
    }

    private List<SearchResult> searchDocuments(String query, Long projectId) {
        List<ProjectDocument> documents = documentRepository.findByProjectId(projectId);
        
        return documents.stream()
                .filter(doc -> doc.getDescription() != null)
                .map(doc -> new SearchResult(
                        doc.getDescription(),
                        doc.getFileName(),
                        calculateRelevance(doc.getDescription(), query),
                        extractRelevantSnippet(doc.getDescription(), query)
                ))
                .filter(result -> result.getRelevance() > 0.1)
                .sorted((a, b) -> Double.compare(b.getRelevance(), a.getRelevance()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private String buildContext(List<SearchResult> results) {
        return results.stream()
                .map(result -> String.format("From %s: %s", result.getFileName(), result.getContext()))
                .collect(Collectors.joining("\n\n"));
    }

    private String generateAIResponse(String query, String context) {
        String prompt = buildPrompt(query, context);
        
        Map<String, Object> request = new HashMap<>();
        request.put("model", "mixtral-8x7b-32768");
        request.put("messages", Arrays.asList(
                Map.of("role", "system", "content", "You are a helpful AI assistant for research document analysis."),
                Map.of("role", "user", "content", prompt)
        ));
        request.put("max_tokens", 1000);
        request.put("temperature", 0.7);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + groqApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions",
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
            
            throw new RuntimeException("Failed to get AI response");
            
        } catch (Exception e) {
            return "I understand you're asking about: " + query + ". However, I need more specific information from the documents to provide a comprehensive answer. Please check if the relevant documents are uploaded to the project.";
        }
    }

    private String buildPrompt(String query, String context) {
        return String.format(
                "Based on the following research documents, please answer this question: %s\n\n" +
                "Context from documents:\n%s\n\n" +
                "Please provide a clear, concise answer based on the provided context. If the context doesn't contain enough information, please mention that.",
                query, context
        );
    }

    private double calculateRelevance(String content, String query) {
        if (content == null || query == null) return 0.0;
        
        String lowerContent = content.toLowerCase();
        String lowerQuery = query.toLowerCase();
        
        String[] queryWords = lowerQuery.split("\\s+");
        int matches = 0;
        
        for (String word : queryWords) {
            if (lowerContent.contains(word)) {
                matches++;
            }
        }
        
        return (double) matches / queryWords.length;
    }

    private String extractRelevantSnippet(String content, String query) {
        if (content == null || content.length() < 200) return content;
        
        String lowerContent = content.toLowerCase();
        String lowerQuery = query.toLowerCase();
        
        int index = lowerContent.indexOf(lowerQuery);
        if (index == -1) {
            return content.substring(0, Math.min(200, content.length())) + "...";
        }
        
        int start = Math.max(0, index - 50);
        int end = Math.min(content.length(), index + 150);
        
        return content.substring(start, end) + "...";
    }

    public Map<String, Object> getProjectInsights(Long projectId) {
        List<ProjectDocument> documents = documentRepository.findByProjectId(projectId);
        
        Map<String, Object> insights = new HashMap<>();
        insights.put("totalDocuments", documents.size());
        insights.put("documentTypes", getDocumentTypeStats(documents));
        insights.put("recentActivity", getRecentActivity(documents));
        insights.put("keyTopics", extractKeyTopics(documents));
        
        return insights;
    }

    private Map<String, Integer> getDocumentTypeStats(List<ProjectDocument> documents) {
        return documents.stream()
                .collect(Collectors.groupingBy(
                        ProjectDocument::getFileType,
                        Collectors.summingInt(doc -> 1)
                ));
    }

    private List<Map<String, Object>> getRecentActivity(List<ProjectDocument> documents) {
        return documents.stream()
                .sorted((a, b) -> b.getUploadDate().compareTo(a.getUploadDate()))
                .limit(5)
                .map(doc -> Map.of(
                        "fileName", doc.getFileName(),
                        "uploadDate", doc.getUploadDate(),
                        "uploadedBy", doc.getUploadedBy()
                ))
                .collect(Collectors.toList());
    }

    private List<String> extractKeyTopics(List<ProjectDocument> documents) {
        return documents.stream()
                .map(ProjectDocument::getDescription)
                .filter(desc -> desc != null && !desc.isEmpty())
                .flatMap(desc -> Arrays.stream(desc.split("\\s+")))
                .filter(word -> word.length() > 4)
                .collect(Collectors.groupingBy(word -> word.toLowerCase(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}
