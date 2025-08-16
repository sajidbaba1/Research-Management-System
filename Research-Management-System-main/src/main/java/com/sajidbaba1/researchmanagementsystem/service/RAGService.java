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

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.File;

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
        private List<Map<String, Object>> citations;

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
        public List<Map<String, Object>> getCitations() { return citations; }
        public void setCitations(List<Map<String, Object>> citations) { this.citations = citations; }
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
                // Expand query to improve recall (safe fallback to original if expansion fails)
                List<String> queries = new ArrayList<>();
                queries.add(query);
                try {
                    List<String> expanded = expandQueryVariants(query);
                    if (expanded != null) {
                        for (String qv : expanded) if (qv != null && !qv.isBlank()) queries.add(qv);
                    }
                } catch (Exception ignore) {}

                // Recall generously then rerank to top-10
                List<Map<String, Object>> pool = new ArrayList<>();
                for (String q : queries) {
                    float[] qVec = embedQueryWithGemini(q);
                    float[] q748 = resizeVectors(Collections.singletonList(qVec), 748).get(0);
                    List<Map<String, Object>> chunks = queryPinecone(q748, projectId, documentId, 50);
                    if (chunks != null) pool.addAll(chunks);
                }

                // Deduplicate by id if present
                Map<String, Map<String, Object>> uniq = new LinkedHashMap<>();
                for (Map<String, Object> m : pool) {
                    String id = String.valueOf(m.getOrDefault("id", UUID.randomUUID().toString()));
                    uniq.putIfAbsent(id, m);
                }
                List<Map<String, Object>> matches = new ArrayList<>(uniq.values());
                if (!matches.isEmpty()) {
                    try {
                        matches = rerankWithGemini(query, matches, 10);
                    } catch (Exception re) {
                        // If rerank fails, fallback to first 10
                        if (matches.size() > 10) matches = matches.subList(0, 10);
                    }
                }
                if (matches != null && !matches.isEmpty()) {
                    // Build a concise answer using Gemini 1.5 Flash on the top chunks
                    int k = Math.min(3, matches.size());
                    List<String> topChunks = new ArrayList<>();
                    List<Map<String, Object>> citations = new ArrayList<>();
                    for (int i = 0; i < k; i++) {
                        Map<String, Object> m = matches.get(i);
                        Map<String, Object> meta = (Map<String, Object>) m.get("metadata");
                        String fileName = meta != null && meta.get("fileName") != null ? meta.get("fileName").toString() : "document";
                        String chunk = meta != null && meta.get("chunk") != null ? meta.get("chunk").toString() : "";
                        // Truncate overly long chunks for prompt efficiency
                        if (chunk.length() > 1200) chunk = chunk.substring(0, 1200);
                        topChunks.add("[" + (i+1) + "] " + fileName + "\n" + chunk);
                        if (!sources.contains(fileName)) sources.add(fileName);

                        Map<String, Object> cite = new HashMap<>();
                        cite.put("index", i + 1);
                        cite.put("fileName", fileName);
                        cite.put("snippet", chunk);
                        if (meta != null && meta.get("page") != null) cite.put("page", meta.get("page"));
                        citations.add(cite);
                    }

                    try {
                        String nice = generateAnswerFromChunks(query, topChunks);
                        if (nice != null && !nice.isBlank()) {
                            AIResponse ai = new AIResponse(nice, sources, query);
                            ai.setCitations(citations);
                            return ai;
                        }
                    } catch (Exception ge) {
                        System.err.println("Gemini synthesis failed: " + ge.getMessage());
                    }

                    // Fallback to listing matches (formatted)
                    responseBuilder.append("## Top semantic matches\n\n");
                    for (int i = 0; i < topChunks.size(); i++) {
                        responseBuilder.append("- ").append(topChunks.get(i)).append("\n\n");
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

    // Compose a clean, readable markdown answer using Gemini 1.5 Flash
    private String generateAnswerFromChunks(String query, List<String> topChunks) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isBlank()) return null;
        String model = "gemini-1.5-flash";
        String url = "https://generativelanguage.googleapis.com/v1/models/" + model + ":generateContent?key=" + geminiApiKey;

        // Build a compact, formatting-oriented prompt
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a helpful assistant answering questions from provided document excerpts.\n");
        prompt.append("- Answer in the user's language.\n");
        prompt.append("- Return SECTIONS exactly in this order: \n");
        prompt.append("  1) Summary \n  2) Key points (bulleted) \n  3) Steps/Formula (bulleted, if applicable) \n  4) Sources (as [1], [2], etc.)\n");
        prompt.append("- Use concise markdown with short headings and bullet points.\n");
        prompt.append("- Every claim must be grounded in the provided chunks; if not answerable, say so.\n\n");
        prompt.append("User question: \n" + query + "\n\n");
        prompt.append("Context chunks:\n");
        for (int i = 0; i < topChunks.size(); i++) {
            prompt.append(topChunks.get(i)).append("\n\n");
        }

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt.toString());
        Map<String, Object> content = new HashMap<>();
        content.put("role", "user");
        content.put("parts", Collections.singletonList(part));
        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", Collections.singletonList(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Gemini generateContent failed: " + resp.getStatusCode());
        }

        Map body = resp.getBody();
        Object candsObj = body.get("candidates");
        if (!(candsObj instanceof List)) return null;
        List cands = (List) candsObj;
        if (cands.isEmpty()) return null;
        Object first = cands.get(0);
        if (!(first instanceof Map)) return null;
        Map firstMap = (Map) first;
        Object cObj = firstMap.get("content");
        if (!(cObj instanceof Map)) return null;
        Map cMap = (Map) cObj;
        Object partsObj = cMap.get("parts");
        if (!(partsObj instanceof List)) return null;
        List partsList = (List) partsObj;
        StringBuilder out = new StringBuilder();
        for (Object p : partsList) {
            if (p instanceof Map) {
                Object t = ((Map) p).get("text");
                if (t != null) out.append(t.toString());
            }
        }
        return out.toString().trim();
    }

    // Expand user query with a few variants (synonyms/phrases). Fallback-safe.
    private List<String> expandQueryVariants(String query) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isBlank()) return Collections.emptyList();
        String model = "gemini-1.5-flash";
        String url = "https://generativelanguage.googleapis.com/v1/models/" + model + ":generateContent?key=" + geminiApiKey;

        String ask = "Generate up to 3 brief alternative phrasings or keyword variants for this query.\n" +
                "Return them as a numbered list, one per line, no explanations. Query: \n" + query;

        Map<String, Object> part = new HashMap<>();
        part.put("text", ask);
        Map<String, Object> content = new HashMap<>();
        content.put("role", "user");
        content.put("parts", Collections.singletonList(part));
        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", Collections.singletonList(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return Collections.emptyList();
        Map body = resp.getBody();
        Object candsObj = body.get("candidates");
        if (!(candsObj instanceof List)) return Collections.emptyList();
        List cands = (List) candsObj;
        if (cands.isEmpty()) return Collections.emptyList();
        Object first = cands.get(0);
        if (!(first instanceof Map)) return Collections.emptyList();
        Map firstMap = (Map) first;
        Object cObj = firstMap.get("content");
        if (!(cObj instanceof Map)) return Collections.emptyList();
        Map cMap = (Map) cObj;
        Object partsObj = cMap.get("parts");
        if (!(partsObj instanceof List)) return Collections.emptyList();
        List partsList = (List) partsObj;
        StringBuilder out = new StringBuilder();
        for (Object p : partsList) {
            if (p instanceof Map) {
                Object t = ((Map) p).get("text");
                if (t != null) out.append(t.toString());
            }
        }
        String[] lines = out.toString().split("\n");
        List<String> variants = new ArrayList<>();
        for (String line : lines) {
            String s = line.replaceFirst("^\\s*\\d+\\)\\s*", "").trim();
            if (!s.isBlank()) variants.add(s);
        }
        return variants;
    }

    // Rerank candidate chunks using Gemini with the original query; return topN
    private List<Map<String, Object>> rerankWithGemini(String query, List<Map<String, Object>> candidates, int topN) throws Exception {
        if (candidates == null || candidates.isEmpty()) return candidates;
        if (geminiApiKey == null || geminiApiKey.isBlank()) return candidates;
        String model = "gemini-1.5-flash";
        String url = "https://generativelanguage.googleapis.com/v1/models/" + model + ":generateContent?key=" + geminiApiKey;

        StringBuilder prompt = new StringBuilder();
        prompt.append("Given the user query, rank the provided chunks by relevance (most to least).\n");
        prompt.append("Return ONLY a JSON array of indices (0-based) in the new order. No text.\n\n");
        prompt.append("Query: \n" + query + "\n\n");
        for (int i = 0; i < Math.min(30, candidates.size()); i++) { // cap prompt length
            Map<String, Object> meta = (Map<String, Object>) candidates.get(i).get("metadata");
            String fileName = meta != null && meta.get("fileName") != null ? meta.get("fileName").toString() : "doc";
            String chunk = meta != null && meta.get("chunk") != null ? meta.get("chunk").toString() : "";
            if (chunk.length() > 700) chunk = chunk.substring(0, 700);
            prompt.append("[" + i + "] " + fileName + "\n" + chunk + "\n\n");
        }

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt.toString());
        Map<String, Object> content = new HashMap<>();
        content.put("role", "user");
        content.put("parts", Collections.singletonList(part));
        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", Collections.singletonList(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return candidates;
        Object candsObj = resp.getBody().get("candidates");
        if (!(candsObj instanceof List) || ((List) candsObj).isEmpty()) return candidates;
        Object first = ((List) candsObj).get(0);
        if (!(first instanceof Map)) return candidates;
        Object partsObj = ((Map) ((Map) first).get("content")).get("parts");
        if (!(partsObj instanceof List) || ((List) partsObj).isEmpty()) return candidates;
        StringBuilder out = new StringBuilder();
        for (Object p : (List) partsObj) {
            if (p instanceof Map && ((Map) p).get("text") != null) out.append(((Map) p).get("text").toString());
        }
        String jsonOrder = out.toString().trim();
        List<Map<String, Object>> ranked = new ArrayList<>(candidates);
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<Integer> order = mapper.readValue(jsonOrder, List.class);
            List<Map<String, Object>> tmp = new ArrayList<>();
            for (Integer idx : order) {
                if (idx != null && idx >= 0 && idx < ranked.size()) tmp.add(ranked.get(idx));
            }
            ranked = tmp;
        } catch (Exception ignore) {}
        if (topN > 0 && ranked.size() > topN) ranked = ranked.subList(0, topN);
        return ranked;
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

            // Use overlap chunking for better context retention across chunks
            List<String> chunks = chunkWithOverlap(text, 1000, 200);
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
        // Robust text extraction: PDF via PDFBox, plain text for .txt, fallback to empty
        if (doc == null || doc.getFilePath() == null) return "";
        String path = doc.getFilePath();
        String lower = path.toLowerCase();
        try {
            if (lower.endsWith(".pdf")) {
                try (PDDocument pdf = Loader.loadPDF(new File(path))) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    String txt = stripper.getText(pdf);
                    return txt != null ? txt.trim() : "";
                }
            } else {
                // Treat as UTF-8 text file
                return Files.readString(Paths.get(path), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            // Fallback: return empty to avoid crashing indexing pipeline
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

    // New: chunking with overlap to preserve context between adjacent chunks
    private List<String> chunkWithOverlap(String text, int size, int overlap) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isEmpty()) return chunks;
        if (size <= 0) size = 1000;
        if (overlap < 0) overlap = 0;
        if (overlap >= size) overlap = size / 4; // safety

        int start = 0;
        while (start < text.length()) {
            int end = Math.min(text.length(), start + size);
            String piece = text.substring(start, end);
            chunks.add(piece);
            if (end >= text.length()) break;
            start = end - overlap;
            if (start < 0) start = 0;
        }
        return chunks;
    }

    private List<float[]> embedWithGemini(List<String> chunks) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new RuntimeException("Gemini API key not configured");
        }
        String url = "https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=" + geminiApiKey;

        List<float[]> vectors = new ArrayList<>();
        for (String chunk : chunks) {
            // Build payload per v1 embedContent schema:
            // {
            //   "content": { "parts": [ { "text": "..." } ] }
            // }
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", chunk);

            List<Map<String, Object>> parts = new ArrayList<>();
            parts.add(textPart);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", parts);

            Map<String, Object> payload = new HashMap<>();
            payload.put("content", content);

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
