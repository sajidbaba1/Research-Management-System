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

@Service
public class RAGService {

    private final String groqApiKey;
    private final RestTemplate restTemplate;
    private final ProjectDocumentRepository documentRepository;
    private final ResearchProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    
    @Value("${pinecone.api.key:}")
    private String pineconeApiKey;

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
        try {
            StringBuilder responseBuilder = new StringBuilder();
            List<String> sources = new ArrayList<>();

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
