package com.sajidbaba1.researchmanagementsystem.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import com.sajidbaba1.researchmanagementsystem.entity.TeamMember;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectDocumentRepository;
import com.sajidbaba1.researchmanagementsystem.repository.ResearchProjectRepository;
import com.sajidbaba1.researchmanagementsystem.repository.TeamMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

@Service
public class RAGService {

    private final String groqApiKey;
    private final RestTemplate restTemplate;
    private final ProjectDocumentRepository documentRepository;
    private final ResearchProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    
    @Value("${pinecone.api.key:}")
    private String pineconeApiKey;

    @Value("${pinecone.index.name:}")
    private String pineconeIndexName;

    @Value("${pinecone.host:}")
    private String pineconeHost;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public RAGService(@Value("${groq.api.key:}") String groqApiKey, 
                     RestTemplate restTemplate,
                     ProjectDocumentRepository documentRepository,
                     ResearchProjectRepository projectRepository,
                     TeamMemberRepository teamMemberRepository) {
        this.groqApiKey = groqApiKey;
        this.restTemplate = restTemplate;
        this.documentRepository = documentRepository;
        this.projectRepository = projectRepository;
        this.teamMemberRepository = teamMemberRepository;
        
        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            System.err.println("⚠️  WARNING: groq.api.key is not configured. AI features will be disabled.");
        }
    }

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
        private List<String> sources;
        private String query;

        public AIResponse(String answer, List<String> sources, String query) {
            this.answer = answer;
            this.sources = sources;
            this.query = query;
        }

        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
        public List<String> getSources() { return sources; }
        public void setSources(List<String> sources) { this.sources = sources; }
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
    }

    public AIResponse searchAndAnswer(String query, Long projectId) {
        return searchAndAnswer(query, projectId, null);
    }

    public AIResponse searchAndAnswer(String query, Long projectId, Long documentId) {
        try {
            StringBuilder responseBuilder = new StringBuilder();
            List<String> sources = new ArrayList<>();

            // First try semantic search via Pinecone for the selected project namespace
            try {
                float[] qVec = embedQueryWithGemini(query);
                float[] q748 = resizeVectors(Collections.singletonList(qVec), 748).get(0);
                List<Map<String, Object>> matches = queryPinecone(q748, projectId, documentId, 5);
                if (matches != null && !matches.isEmpty()) {
                    responseBuilder.append("Top semantic matches from project documents:\n");
                    int k = Math.min(3, matches.size());
                    for (int i = 0; i < k; i++) {
                        Map<String, Object> m = matches.get(i);
                        Map<String, Object> meta = (Map<String, Object>) m.get("metadata");
                        String fileName = meta != null && meta.get("fileName") != null ? meta.get("fileName").toString() : "document";
                        String chunk = meta != null && meta.get("chunk") != null ? meta.get("chunk").toString() : "";
                        responseBuilder.append("- ").append(fileName).append(": ").append(chunk).append("\n\n");
                        sources.add(fileName);
                    }
                    return new AIResponse(responseBuilder.toString(), sources, query);
                }
            } catch (Exception e) {
                // Fallback silently to keyword search if Pinecone/Gemini fails
                System.err.println("Semantic search failed, falling back: " + e.getMessage());
            }

            // Search projects
            List<ResearchProject> projects = projectRepository.findAll();
            List<ResearchProject> relevantProjects = searchProjects(query, projects);

            // Search team members
            List<TeamMember> teamMembers = teamMemberRepository.findAll();
            List<TeamMember> relevantMembers = searchTeamMembers(query, teamMembers);

            // Search documents
            List<ProjectDocument> documents = documentRepository.findAll();
            List<ProjectDocument> relevantDocuments = searchDocuments(query, documents);

            // Build response based on search results
            if (!relevantProjects.isEmpty()) {
                responseBuilder.append("Found ").append(relevantProjects.size()).append(" relevant projects:\n");
                for (ResearchProject project : relevantProjects) {
                    responseBuilder.append("- ").append(project.getTitle()).append(" (Status: ").append(project.getStatus()).append(")\n");
                    sources.add("Project: " + project.getTitle());
                }
            }

            if (!relevantMembers.isEmpty()) {
                responseBuilder.append("\nFound ").append(relevantMembers.size()).append(" relevant team members:\n");
                for (TeamMember member : relevantMembers) {
                    responseBuilder.append("- ").append(member.getName()).append(" (Role: ").append(member.getRole()).append(")\n");
                    sources.add("Team Member: " + member.getName());
                }
            }

            if (!relevantDocuments.isEmpty()) {
                responseBuilder.append("\nFound ").append(relevantDocuments.size()).append(" relevant documents:\n");
                for (ProjectDocument doc : relevantDocuments) {
                    responseBuilder.append("- ").append(doc.getFileName()).append("\n");
                    sources.add("Document: " + doc.getFileName());
                }
            }

            if (responseBuilder.length() == 0) {
                responseBuilder.append("No specific matches found. However, I can provide general information about your research management system.\n");
                responseBuilder.append("You have ").append(projects.size()).append(" projects, ")
                        .append(teamMembers.size()).append(" team members, and ")
                        .append(documents.size()).append(" documents in your system.");
            }

            return new AIResponse(responseBuilder.toString(), sources, query);

        } catch (Exception e) {
            return new AIResponse("Error processing query: " + e.getMessage(), Collections.emptyList(), query);
        }
    }

    public Map<String, Object> getProjectInsights(Long projectId) {
        Map<String, Object> insights = new HashMap<>();
        
        try {
            Optional<ResearchProject> projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isPresent()) {
                ResearchProject project = projectOpt.get();
                
                insights.put("projectTitle", project.getTitle());
                insights.put("status", project.getStatus());
                insights.put("description", project.getDescription());
                
                // Get team members for this project
                List<TeamMember> members = teamMemberRepository.findAll().stream()
                        .filter(member -> member.getProjectId() != null && member.getProjectId().equals(projectId))
                        .collect(Collectors.toList());
                insights.put("teamSize", members.size());
                insights.put("teamMembers", members);
                
                // Get documents for this project
                List<ProjectDocument> docs = documentRepository.findAll().stream()
                        .filter(doc -> doc.getProjectId() != null && doc.getProjectId().equals(projectId))
                        .collect(Collectors.toList());
                insights.put("documentCount", docs.size());
                insights.put("documents", docs);
                
            } else {
                insights.put("error", "Project not found");
            }
        } catch (Exception e) {
            insights.put("error", e.getMessage());
        }
        
        return insights;
    }

    public boolean processDocumentForRAG(ProjectDocument document) {
        try {
            // In a real implementation, this would:
            // 1. Extract text content from the document
            // 2. Index the content for search
            // 3. Store embeddings for semantic search
            // 4. Update the document record with processing status
            
            System.out.println("Processing document for RAG: " + document.getFileName());
            
            // Mark document as processed
            document.setStatus("PROCESSED");
            documentRepository.save(document);
            
            return true;
        } catch (Exception e) {
            System.err.println("Error processing document for RAG: " + e.getMessage());
            return false;
        }
    }

    // ===== New: Full processing (extract -> embed via Gemini -> upsert to Pinecone) =====
    public boolean processAndIndexDocument(ProjectDocument document) {
        try {
            String text = extractText(document);
            if (text == null || text.isEmpty()) {
                // fallback to filename to ensure at least one vector written
                text = document.getFileName() != null ? document.getFileName() : ("doc-" + document.getId());
            }

            List<String> chunks = chunk(text, 1000);
            List<float[]> vectors = embedWithGemini(chunks);
            // Truncate or pad to 748 dims to match index
            List<float[]> resized = resizeVectors(vectors, 748);
            upsertToPinecone(document.getProjectId(), document.getId(), document.getFileName(), chunks, resized);

            document.setStatus("PROCESSED");
            documentRepository.save(document);
            return true;
        } catch (Exception e) {
            System.err.println("Pinecone index error: " + e.getMessage());
            return false;
        }
    }

    private String extractText(ProjectDocument doc) throws Exception {
        // Naive read as UTF-8 text. For PDFs/Docs, integrate a parser (e.g., PDFBox) if needed.
        try {
            return Files.readString(Paths.get(doc.getFilePath()), StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Fallback: return empty to avoid crashing
            return "";
        }
    }

    private List<String> chunk(String text, int size) {
        List<String> chunks = new ArrayList<>();
        if (text == null) return chunks;
        int i = 0;
        while (i < text.length()) {
            int end = Math.min(text.length(), i + size);
            chunks.add(text.substring(i, end));
            i = end;
        }
        return chunks;
    }

    private List<float[]> embedWithGemini(List<String> chunks) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new RuntimeException("Gemini API key not configured");
        }
        String url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedText?key=" + geminiApiKey;

        List<float[]> vectors = new ArrayList<>();
        for (String chunk : chunks) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("text", chunk);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw new RuntimeException("Gemini embedding failed: " + resp.getStatusCode());
            }
            // Response shape: { embedding: { values: [..] } } (primary)
            // or { embedding: { value: [..] } } (legacy) or { embeddings: [ { values: [] } ] }
            Map body = resp.getBody();
            List<Double> values = null;
            if (body.get("embedding") instanceof Map) {
                Map emb = (Map) body.get("embedding");
                Object arrVals = emb.get("values");
                Object arrVal = emb.get("value");
                if (arrVals instanceof List) values = (List<Double>) arrVals;
                else if (arrVal instanceof List) values = (List<Double>) arrVal;
            } else if (body.get("embeddings") instanceof List) {
                List list = (List) body.get("embeddings");
                if (!list.isEmpty() && list.get(0) instanceof Map) {
                    Map first = (Map) list.get(0);
                    Object vals = first.get("values");
                    if (vals instanceof List) values = (List<Double>) vals;
                }
            }
            if (values == null) throw new RuntimeException("Unexpected Gemini embedding response");

            float[] vector = new float[values.size()];
            for (int i = 0; i < values.size(); i++) vector[i] = values.get(i).floatValue();
            vectors.add(vector);
        }
        return vectors;
    }

    private List<float[]> resizeVectors(List<float[]> vectors, int targetDim) {
        List<float[]> out = new ArrayList<>();
        for (float[] v : vectors) {
            float[] r = new float[targetDim];
            int copy = Math.min(targetDim, v.length);
            System.arraycopy(v, 0, r, 0, copy);
            // remaining stay 0 if v shorter; if v longer, truncated
            out.add(r);
        }
        return out;
    }

    private float[] embedQueryWithGemini(String text) throws Exception {
        List<float[]> res = embedWithGemini(Collections.singletonList(text));
        if (res.isEmpty()) throw new RuntimeException("Failed to embed query");
        return res.get(0);
    }

    private List<Map<String, Object>> queryPinecone(float[] vector, Long projectId, Long documentId, int topK) throws Exception {
        if (pineconeApiKey == null || pineconeApiKey.isBlank()) {
            throw new RuntimeException("Pinecone API key not configured");
        }
        if (pineconeHost == null || pineconeHost.isBlank()) {
            throw new RuntimeException("Pinecone host not configured");
        }
        String url = pineconeHost + "/query";

        Map<String, Object> payload = new HashMap<>();
        payload.put("vector", vector);
        payload.put("topK", topK);
        payload.put("namespace", String.valueOf(projectId));
        payload.put("includeMetadata", true);
        if (documentId != null) {
            Map<String, Object> filter = new HashMap<>();
            filter.put("documentId", documentId);
            payload.put("filter", filter);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Api-Key", pineconeApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Pinecone query failed: " + resp.getStatusCode());
        }
        Object matches = resp.getBody().get("matches");
        if (matches instanceof List) {
            return (List<Map<String, Object>>) matches;
        }
        return Collections.emptyList();
    }

    private void upsertToPinecone(Long projectId, Long documentId, String fileName, List<String> chunks, List<float[]> vectors) {
        if (pineconeApiKey == null || pineconeApiKey.isBlank()) {
            throw new RuntimeException("Pinecone API key not configured");
        }
        if (pineconeHost == null || pineconeHost.isBlank()) {
            throw new RuntimeException("Pinecone host not configured");
        }

        String url = pineconeHost + "/vectors/upsert";

        List<Map<String, Object>> vecs = new ArrayList<>();
        for (int i = 0; i < vectors.size(); i++) {
            Map<String, Object> meta = new HashMap<>();
            meta.put("projectId", projectId);
            meta.put("documentId", documentId);
            meta.put("fileName", fileName);
            meta.put("chunk", chunks.get(i));

            Map<String, Object> v = new HashMap<>();
            v.put("id", documentId + ":" + i);
            v.put("values", vectors.get(i));
            v.put("metadata", meta);
            vecs.add(v);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("vectors", vecs);
        payload.put("namespace", String.valueOf(projectId));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Api-Key", pineconeApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Pinecone upsert failed: " + resp.getStatusCode());
        }
    }

    private List<ResearchProject> searchProjects(String query, List<ResearchProject> projects) {
        String lowerQuery = query.toLowerCase();
        return projects.stream()
                .filter(project -> 
                        project.getTitle().toLowerCase().contains(lowerQuery) ||
                        (project.getDescription() != null && project.getDescription().toLowerCase().contains(lowerQuery)) ||
                        project.getStatus().toLowerCase().contains(lowerQuery))
                .collect(Collectors.toList());
    }

    private List<TeamMember> searchTeamMembers(String query, List<TeamMember> members) {
        String lowerQuery = query.toLowerCase();
        return members.stream()
                .filter(member -> 
                        member.getName().toLowerCase().contains(lowerQuery) ||
                        member.getRole().toLowerCase().contains(lowerQuery) ||
                        (member.getEmail() != null && member.getEmail().toLowerCase().contains(lowerQuery)))
                .collect(Collectors.toList());
    }

    private List<ProjectDocument> searchDocuments(String query, List<ProjectDocument> documents) {
        String lowerQuery = query.toLowerCase();
        return documents.stream()
                .filter(doc -> 
                        doc.getFileName().toLowerCase().contains(lowerQuery) ||
                        (doc.getDescription() != null && doc.getDescription().toLowerCase().contains(lowerQuery)))
                .collect(Collectors.toList());
    }
}
