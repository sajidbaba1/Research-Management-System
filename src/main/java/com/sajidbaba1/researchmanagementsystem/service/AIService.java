package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.dto.AIQueryRequest;
import com.sajidbaba1.researchmanagementsystem.dto.AIQueryResponse;
import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.entity.ProjectPublication;
import com.sajidbaba1.researchmanagementsystem.entity.ProjectPatent;
import com.sajidbaba1.researchmanagementsystem.repository.ResearchProjectRepository;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectDocumentRepository;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectPublicationRepository;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectPatentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIService {

    @Autowired
    private ResearchProjectRepository researchProjectRepository;
    
    @Autowired
    private ProjectDocumentRepository projectDocumentRepository;
    
    @Autowired
    private ProjectPublicationRepository projectPublicationRepository;
    
    @Autowired
    private ProjectPatentRepository projectPatentRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${openai.api.key}")
    private String openAiApiKey;
    
    @Value("${pinecone.api.key}")
    private String pineconeApiKey;
    
    @Value("${pinecone.environment}")
    private String pineconeEnvironment;
    
    @Value("${pinecone.index.name}")
    private String pineconeIndexName;
    
    private final ChatbotService chatbotService;

    @Autowired
    public AIService(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    // RAG - Retrieval Augmented Generation
    public Map<String, Object> searchSimilarProjects(String query, int limit) {
        List<ResearchProject> allProjects = researchProjectRepository.findAll();
        
        // Simple similarity search based on keywords and content
        List<ResearchProject> similarProjects = allProjects.stream()
            .filter(project -> 
                project.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                project.getDescription().toLowerCase().contains(query.toLowerCase()) ||
                project.getKeywords().toLowerCase().contains(query.toLowerCase()) ||
                project.getResearchArea().toLowerCase().contains(query.toLowerCase())
            )
            .limit(limit)
            .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("projects", similarProjects);
        result.put("count", similarProjects.size());
        result.put("query", query);
        
        return result;
    }
    
    // Generate project recommendations based on research area and keywords
    public List<Map<String, Object>> generateProjectRecommendations(Long projectId) {
        Optional<ResearchProject> projectOpt = researchProjectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return Collections.emptyList();
        }
        
        ResearchProject project = projectOpt.get();
        List<ResearchProject> allProjects = researchProjectRepository.findAll();
        
        return allProjects.stream()
            .filter(p -> !p.getId().equals(projectId))
            .filter(p -> p.getResearchArea().equals(project.getResearchArea()))
            .map(p -> {
                Map<String, Object> recommendation = new HashMap<>();
                recommendation.put("project", p);
                recommendation.put("similarityScore", calculateSimilarity(project, p));
                recommendation.put("commonKeywords", getCommonKeywords(project, p));
                return recommendation;
            })
            .sorted((a, b) -> Double.compare((Double) b.get("similarityScore"), (Double) a.get("similarityScore")))
            .limit(5)
            .collect(Collectors.toList());
    }
    
    // AI-powered document analysis
    public Map<String, Object> analyzeDocument(Long documentId) {
        Optional<ProjectDocument> documentOpt = projectDocumentRepository.findById(documentId);
        if (documentOpt.isEmpty()) {
            return Collections.singletonMap("error", "Document not found");
        }
        
        ProjectDocument document = documentOpt.get();
        
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("documentId", document.getId());
        analysis.put("title", document.getTitle());
        analysis.put("category", document.getCategory());
        analysis.put("summary", generateSummary(document.getDescription()));
        analysis.put("keywords", extractKeywords(document.getDescription()));
        analysis.put("sentiment", analyzeSentiment(document.getDescription()));
        analysis.put("readability", calculateReadability(document.getDescription()));
        
        return analysis;
    }
    
    // Generate research insights using AI
    public Map<String, Object> generateResearchInsights(Long projectId) {
        Optional<ResearchProject> projectOpt = researchProjectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return Collections.singletonMap("error", "Project not found");
        }
        
        ResearchProject project = projectOpt.get();
        List<ProjectDocument> documents = projectDocumentRepository.findByProjectId(projectId);
        List<ProjectPublication> publications = projectPublicationRepository.findByProjectId(projectId);
        List<ProjectPatent> patents = projectPatentRepository.findByProjectId(projectId);
        
        Map<String, Object> insights = new HashMap<>();
        insights.put("project", project);
        insights.put("documentCount", documents.size());
        insights.put("publicationCount", publications.size());
        insights.put("patentCount", patents.size());
        insights.put("keyThemes", extractKeyThemes(documents, publications));
        insights.put("researchGaps", identifyResearchGaps(project, documents, publications));
        insights.put("futureDirections", suggestFutureDirections(project, documents, publications));
        insights.put("collaborationOpportunities", identifyCollaborationOpportunities(project, publications));
        
        return insights;
    }
    
    // Chatbot functionality for research questions
    public Map<String, Object> chatWithResearchAssistant(String question, Long projectId) {
        Map<String, Object> response = new HashMap<>();
        
        // Simple rule-based responses for now
        String lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.contains("budget")) {
            response.put("answer", getBudgetAnalysis(projectId));
        } else if (lowerQuestion.contains("timeline")) {
            response.put("answer", getTimelineAnalysis(projectId));
        } else if (lowerQuestion.contains("milestone")) {
            response.put("answer", getMilestoneAnalysis(projectId));
        } else if (lowerQuestion.contains("risk")) {
            response.put("answer", getRiskAnalysis(projectId));
        } else {
            response.put("answer", getGeneralProjectInfo(projectId));
        }
        
        response.put("question", question);
        response.put("timestamp", new Date());
        
        return response;
    }
    
    // Generate project summary using AI
    public Map<String, Object> generateProjectSummary(Long projectId) {
        Optional<ResearchProject> projectOpt = researchProjectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return Collections.singletonMap("error", "Project not found");
        }
        
        ResearchProject project = projectOpt.get();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("projectTitle", project.getTitle());
        summary.put("executiveSummary", generateExecutiveSummary(project));
        summary.put("keyAchievements", getKeyAchievements(projectId));
        summary.put("currentStatus", getCurrentStatus(project));
        summary.put("nextSteps", getNextSteps(projectId));
        summary.put("potentialImpact", assessPotentialImpact(project));
        
        return summary;
    }
    
    public AIQueryResponse queryAI(AIQueryRequest request) {
        String response = chatbotService.getResponse(request.getQuery());
        return new AIQueryResponse(response, "high", List.of(), 100L, "query", null);
    }

    public AIQueryResponse chat(AIQueryRequest request) {
        String response = chatbotService.getResponse(request.getQuery());
        return new AIQueryResponse(response, "high", List.of(), 100L, "chat", null);
    }

    public List<String> getSuggestions(Long projectId) {
        return chatbotService.getProjectSuggestions(projectId);
    }

    public AIQueryResponse analyzeProject(AIQueryRequest request) {
        String response = chatbotService.analyzeProject(request.getProjectId());
        return new AIQueryResponse(response, "high", List.of(), 100L, "analyze", null);
    }

    public List<String> getRecommendations(Long projectId) {
        return chatbotService.getProjectRecommendations(projectId);
    }
    
    // Private helper methods
    private double calculateSimilarity(ResearchProject project1, ResearchProject project2) {
        // Simple similarity calculation based on keywords and research area
        Set<String> keywords1 = new HashSet<>(Arrays.asList(project1.getKeywords().toLowerCase().split("\\s+")));
        Set<String> keywords2 = new HashSet<>(Arrays.asList(project2.getKeywords().toLowerCase().split("\\s+")));
        
        Set<String> intersection = new HashSet<>(keywords1);
        intersection.retainAll(keywords2);
        
        Set<String> union = new HashSet<>(keywords1);
        union.addAll(keywords2);
        
        return union.size() > 0 ? (double) intersection.size() / union.size() : 0.0;
    }
    
    private List<String> getCommonKeywords(ResearchProject project1, ResearchProject project2) {
        Set<String> keywords1 = new HashSet<>(Arrays.asList(project1.getKeywords().toLowerCase().split("\\s+")));
        Set<String> keywords2 = new HashSet<>(Arrays.asList(project2.getKeywords().toLowerCase().split("\\s+")));
        
        Set<String> intersection = new HashSet<>(keywords1);
        intersection.retainAll(keywords2);
        
        return new ArrayList<>(intersection);
    }
    
    private String generateSummary(String text) {
        if (text == null || text.length() <= 200) {
            return text;
        }
        return text.substring(0, 200) + "...";
    }
    
    private List<String> extractKeywords(String text) {
        if (text == null) return Collections.emptyList();
        
        // Simple keyword extraction
        String[] words = text.toLowerCase().split("\\s+");
        Map<String, Integer> wordCount = new HashMap<>();
        
        for (String word : words) {
            if (word.length() > 3) {
                wordCount.put(word, wordCount.getOrDefault(word, 0) + 1);
            }
        }
        
        return wordCount.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(10)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }
    
    private String analyzeSentiment(String text) {
        if (text == null) return "neutral";
        
        // Simple sentiment analysis
        String lowerText = text.toLowerCase();
        int positiveWords = 0;
        int negativeWords = 0;
        
        String[] positive = {"good", "great", "excellent", "successful", "innovative"};
        String[] negative = {"bad", "poor", "failed", "problem", "issue"};
        
        for (String word : positive) {
            if (lowerText.contains(word)) positiveWords++;
        }
        
        for (String word : negative) {
            if (lowerText.contains(word)) negativeWords++;
        }
        
        if (positiveWords > negativeWords) return "positive";
        if (negativeWords > positiveWords) return "negative";
        return "neutral";
    }
    
    private double calculateReadability(String text) {
        if (text == null) return 0.0;
        
        // Simple readability score
        String[] sentences = text.split("[.!?]+");
        String[] words = text.split("\\s+");
        
        if (sentences.length == 0 || words.length == 0) return 0.0;
        
        double avgWordsPerSentence = (double) words.length / sentences.length;
        double avgSyllablesPerWord = 1.5; // Simplified
        
        // Flesch Reading Ease formula (simplified)
        return 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
    }
    
    private List<String> extractKeyThemes(List<ProjectDocument> documents, List<ProjectPublication> publications) {
        // Extract common themes from documents and publications
        Set<String> themes = new HashSet<>();
        
        documents.forEach(doc -> {
            themes.addAll(extractKeywords(doc.getDescription()));
        });
        
        publications.forEach(pub -> {
            themes.addAll(extractKeywords(pub.getAbstractText()));
        });
        
        return new ArrayList<>(themes);
    }
    
    private List<String> identifyResearchGaps(ResearchProject project, List<ProjectDocument> documents, List<ProjectPublication> publications) {
        // Identify potential research gaps based on current work
        List<String> gaps = new ArrayList<>();
        
        // This would be more sophisticated with real AI
        gaps.add("Potential collaboration opportunities with related projects");
        gaps.add("Areas for further investigation based on current findings");
        gaps.add("Technology transfer opportunities");
        
        return gaps;
    }
    
    private List<String> suggestFutureDirections(ResearchProject project, List<ProjectDocument> documents, List<ProjectPublication> publications) {
        // Suggest future research directions
        List<String> directions = new ArrayList<>();
        
        directions.add("Expand research to related areas");
        directions.add("Investigate practical applications");
        directions.add("Consider interdisciplinary approaches");
        
        return directions;
    }
    
    private List<String> identifyCollaborationOpportunities(ResearchProject project, List<ProjectPublication> publications) {
        // Identify potential collaboration opportunities
        List<String> opportunities = new ArrayList<>();
        
        opportunities.add("Universities with similar research focus");
        opportunities.add("Industry partners interested in applications");
        opportunities.add("International research networks");
        
        return opportunities;
    }
    
    private String getBudgetAnalysis(Long projectId) {
        // Placeholder for budget analysis
        return "Budget analysis will be implemented with actual financial data";
    }
    
    private String getTimelineAnalysis(Long projectId) {
        // Placeholder for timeline analysis
        return "Timeline analysis will be implemented with project schedule data";
    }
    
    private String getMilestoneAnalysis(Long projectId) {
        // Placeholder for milestone analysis
        return "Milestone analysis will be implemented with project tracking data";
    }
    
    private String getRiskAnalysis(Long projectId) {
        // Placeholder for risk analysis
        return "Risk analysis will be implemented with project risk data";
    }
    
    private String getGeneralProjectInfo(Long projectId) {
        // Placeholder for general project information
        return "General project information will be provided based on available data";
    }
    
    private String generateExecutiveSummary(ResearchProject project) {
        return String.format("Project '%s' focuses on %s research area with a budget of $%d. Led by %s at %s.",
            project.getTitle(),
            project.getResearchArea(),
            project.getBudget(),
            project.getPrincipalInvestigator(),
            project.getInstitution()
        );
    }
    
    private List<String> getKeyAchievements(Long projectId) {
        return Arrays.asList("Project milestones achieved", "Research publications submitted", "Patent applications filed");
    }
    
    private String getCurrentStatus(ResearchProject project) {
        return "Current status: " + project.getStatus();
    }
    
    private List<String> getNextSteps(Long projectId) {
        return Arrays.asList("Complete pending milestones", "Submit final reports", "Prepare for next phase");
    }
    
    private String assessPotentialImpact(ResearchProject project) {
        return "Potential impact includes advancement in " + project.getResearchArea() + " and practical applications";
    }
}
