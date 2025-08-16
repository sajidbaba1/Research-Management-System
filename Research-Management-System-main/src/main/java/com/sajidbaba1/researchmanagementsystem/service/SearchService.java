package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.dto.*;
import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.entity.TeamMember;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectDocumentRepository;
import com.sajidbaba1.researchmanagementsystem.repository.TeamMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired
    private ProjectDocumentRepository projectDocumentRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    public SearchResponse searchDocuments(SearchRequest request) {
        long startTime = System.currentTimeMillis();
        
        // Simple database search instead of vector search
        String query = request.getQuery().toLowerCase();
        List<ProjectDocument> documents = projectDocumentRepository.findAll();
        
        List<SearchResult> results = processDocumentResults(documents.stream()
            .filter(doc -> doc.getFileName().toLowerCase().contains(query) || 
                          (doc.getDescription() != null && doc.getDescription().toLowerCase().contains(query)))
            .limit(request.getSize())
            .collect(Collectors.toList()));
        
        long searchTime = System.currentTimeMillis() - startTime;
        
        return new SearchResponse(
                results,
                results.size(),
                (int) Math.ceil((double) results.size() / request.getSize()),
                request.getPage(),
                request.getSize(),
                searchTime
        );
    }

    public SearchResponse searchTeamMembers(SearchRequest request) {
        long startTime = System.currentTimeMillis();
        
        String query = request.getQuery().toLowerCase();
        List<TeamMember> teamMembers = teamMemberRepository.findAll();
        
        List<SearchResult> results = processTeamMemberResults(teamMembers.stream()
            .filter(member -> member.getName().toLowerCase().contains(query) ||
                          member.getEmail().toLowerCase().contains(query) ||
                          member.getDepartment().toLowerCase().contains(query))
            .limit(request.getSize())
            .collect(Collectors.toList()));
        
        long searchTime = System.currentTimeMillis() - startTime;
        
        return new SearchResponse(
                results,
                results.size(),
                (int) Math.ceil((double) results.size() / request.getSize()),
                request.getPage(),
                request.getSize(),
                searchTime
        );
    }

    public SearchResponse universalSearch(SearchRequest request) {
        long startTime = System.currentTimeMillis();
        
        String query = request.getQuery().toLowerCase();
        
        // Search both documents and team members
        List<SearchResult> documentResults = searchDocuments(request).getResults();
        List<SearchResult> teamMemberResults = searchTeamMembers(request).getResults();
        
        List<SearchResult> combinedResults = new ArrayList<>();
        combinedResults.addAll(documentResults);
        combinedResults.addAll(teamMemberResults);
        
        // Sort by relevance score
        combinedResults.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        
        long searchTime = System.currentTimeMillis() - startTime;
        
        return new SearchResponse(
                combinedResults,
                combinedResults.size(),
                (int) Math.ceil((double) combinedResults.size() / request.getSize()),
                request.getPage(),
                request.getSize(),
                searchTime
        );
    }

    public List<String> getSearchSuggestions(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        // Get recent searches and popular searches
        List<String> suggestions = new ArrayList<>();
        
        // Add document name suggestions
        List<ProjectDocument> documents = projectDocumentRepository.findAll();
        documents.stream()
                .filter(doc -> doc.getFileName().toLowerCase().contains(query.toLowerCase()))
                .limit(3)
                .forEach(doc -> suggestions.add(doc.getFileName()));
        
        // Add team member name suggestions
        List<TeamMember> teamMembers = teamMemberRepository.findAll();
        teamMembers.stream()
                .filter(member -> member.getName().toLowerCase().contains(query.toLowerCase()))
                .limit(3)
                .forEach(member -> suggestions.add(member.getName()));
        
        return suggestions.stream().distinct().limit(5).collect(Collectors.toList());
    }

    private List<SearchResult> processDocumentResults(List<ProjectDocument> documents) {
        return documents.stream()
            .map(doc -> {
                SearchResult result = new SearchResult();
                result.setId(doc.getId().toString());
                result.setType("document");
                result.setTitle(doc.getFileName());
                result.setDescription(doc.getDescription());
                result.setContentPreview(doc.getFileName() + " - " + doc.getFileType());
                result.setScore(0.8);
                result.setUrl("/documents/" + doc.getId());
                result.setMetadata(doc);
                return result;
            })
            .collect(Collectors.toList());
    }

    private List<SearchResult> processTeamMemberResults(List<TeamMember> members) {
        return members.stream()
            .map(member -> {
                SearchResult result = new SearchResult();
                result.setId(member.getId().toString());
                result.setType("team-member");
                result.setTitle(member.getName());
                result.setDescription(member.getRole() + " - " + member.getDepartment());
                result.setContentPreview(member.getEmail() + " - " + member.getExpertise());
                result.setScore(0.8);
                result.setUrl("/team-members/" + member.getId());
                result.setMetadata(member);
                return result;
            })
            .collect(Collectors.toList());
    }
}
