package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import com.sajidbaba1.researchmanagementsystem.entity.TeamMember;
import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.repository.ResearchProjectRepository;
import com.sajidbaba1.researchmanagementsystem.repository.TeamMemberRepository;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    @Autowired
    private ResearchProjectRepository projectRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private ProjectDocumentRepository documentRepository;

    public String processQuery(String query) {
        query = query.toLowerCase().trim();
        
        // Search projects
        if (query.contains("project") || query.contains("projects")) {
            return searchProjects(query);
        }
        
        // Search team members
        if (query.contains("team") || query.contains("member") || query.contains("person")) {
            return searchTeamMembers(query);
        }
        
        // Search documents
        if (query.contains("document") || query.contains("file") || query.contains("paper")) {
            return searchDocuments(query);
        }
        
        // General search
        return performGeneralSearch(query);
    }
    
    private String searchProjects(String query) {
        List<ResearchProject> projects = projectRepository.findAll();
        
        if (query.contains("status")) {
            Map<String, Long> statusCounts = projects.stream()
                    .collect(Collectors.groupingBy(ResearchProject::getStatus, Collectors.counting()));
            
            return String.format("Project Status: %s", statusCounts.entrySet().stream()
                    .map(e -> e.getKey() + ": " + e.getValue())
                    .collect(Collectors.joining(", ")));
        }
        
        if (query.contains("count")) {
            return String.format("Total Projects: %d", projects.size());
        }
        
        // Return project details
        return projects.stream()
                .limit(5)
                .map(p -> String.format("Project: %s | Status: %s | Budget: $%.2f", 
                        p.getTitle(), p.getStatus(), p.getBudget()))
                .collect(Collectors.joining("\n"));
    }
    
    private String searchTeamMembers(String query) {
        List<TeamMember> members = teamMemberRepository.findAll();
        
        if (query.contains("count")) {
            return String.format("Total Team Members: %d", members.size());
        }
        
        // Return member details
        return members.stream()
                .limit(5)
                .map(m -> String.format("Member: %s | Role: %s | Department: %s", 
                        m.getName(), m.getRole(), m.getDepartment()))
                .collect(Collectors.joining("\n"));
    }
    
    private String searchDocuments(String query) {
        List<ProjectDocument> documents = documentRepository.findAll();
        
        if (query.contains("count")) {
            return String.format("Total Documents: %d", documents.size());
        }
        
        // Return document details
        return documents.stream()
                .limit(5)
                .map(d -> String.format("Document: %s | Type: %s | Uploaded by: %s", 
                        d.getFileName(), d.getFileType(), d.getUploadedBy()))
                .collect(Collectors.joining("\n"));
    }
    
    private String performGeneralSearch(String query) {
        StringBuilder response = new StringBuilder();
        
        // Search all entities
        List<ResearchProject> projects = projectRepository.findAll();
        List<TeamMember> members = teamMemberRepository.findAll();
        List<ProjectDocument> documents = documentRepository.findAll();
        
        response.append("📊 **Research Management System Overview**\n\n");
        
        response.append(String.format("🗂️ **Projects**: %d total\n", projects.size()));
        response.append(String.format("👥 **Team Members**: %d total\n", members.size()));
        response.append(String.format("📄 **Documents**: %d total\n\n", documents.size()));
        
        // Add recent activity
        response.append("**Recent Activity**:\n");
        
        // Recent projects
        if (!projects.isEmpty()) {
            response.append("**Latest Projects:**\n");
            projects.stream()
                    .limit(3)
                    .forEach(p -> response.append(String.format("• %s (%s)\n", p.getTitle(), p.getStatus())));
        }
        
        // Recent team members
        if (!members.isEmpty()) {
            response.append("\n**Team Members:**\n");
            members.stream()
                    .limit(3)
                    .forEach(m -> response.append(String.format("• %s - %s\n", m.getName(), m.getRole())));
        }
        
        // Recent documents
        if (!documents.isEmpty()) {
            response.append("\n**Recent Documents:**\n");
            documents.stream()
                    .limit(3)
                    .forEach(d -> response.append(String.format("• %s (%s)\n", d.getFileName(), d.getFileType())));
        }
        
        return response.toString();
    }
    
    public Map<String, Object> getProjectStats() {
        Map<String, Object> stats = new HashMap<>();
        List<ResearchProject> projects = projectRepository.findAll();
        List<TeamMember> teamMembers = teamMemberRepository.findAll();
        List<ProjectDocument> documents = documentRepository.findAll();
        
        long totalProjects = projects.size();
        long completedProjects = projects.stream()
                .filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus()))
                .count();
        long inProgressProjects = projects.stream()
                .filter(p -> "IN_PROGRESS".equalsIgnoreCase(p.getStatus()))
                .count();
        long totalTeamMembers = teamMembers.size();
        long totalDocuments = documents.size();
        
        stats.put("totalProjects", totalProjects);
        stats.put("completedProjects", completedProjects);
        stats.put("inProgressProjects", inProgressProjects);
        stats.put("totalTeamMembers", totalTeamMembers);
        stats.put("totalDocuments", totalDocuments);
        stats.put("projects", projects);
        stats.put("teamMembers", teamMembers);
        stats.put("documents", documents);
        
        return stats;
    }
}
