package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import com.sajidbaba1.researchmanagementsystem.entity.TeamMember;
import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.repository.ResearchProjectRepository;
import com.sajidbaba1.researchmanagementsystem.repository.TeamMemberRepository;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private ResearchProjectRepository projectRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private ProjectDocumentRepository documentRepository;

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            List<ResearchProject> projects = projectRepository.findAll();
            List<TeamMember> teamMembers = teamMemberRepository.findAll();
            List<ProjectDocument> documents = documentRepository.findAll();
            
            // Calculate project statistics
            long totalProjects = projects.size();
            long completedProjects = projects.stream()
                    .filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus()))
                    .count();
            long inProgressProjects = projects.stream()
                    .filter(p -> "IN_PROGRESS".equalsIgnoreCase(p.getStatus()))
                    .count();
            
            double totalBudget = 0.0;
            if (!projects.isEmpty()) {
                totalBudget = projects.stream()
                        .mapToDouble(p -> p.getBudget() != null ? p.getBudget() : 0.0)
                        .sum();
            }
            
            stats.put("totalDocuments", documents.size());
            stats.put("totalTeamMembers", teamMembers.size());
            stats.put("totalProjects", totalProjects);
            stats.put("completedProjects", completedProjects);
            stats.put("inProgressProjects", inProgressProjects);
            stats.put("totalBudget", totalBudget);
            stats.put("success", true);
            
        } catch (Exception e) {
            stats.put("success", false);
            stats.put("error", e.getMessage());
            stats.put("totalDocuments", 0);
            stats.put("totalTeamMembers", 0);
            stats.put("totalProjects", 0);
            stats.put("completedProjects", 0);
            stats.put("inProgressProjects", 0);
            stats.put("totalBudget", 0.0);
        }
        
        return stats;
    }

    @GetMapping("/activity")
    public List<Map<String, Object>> getRecentActivity() {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        try {
            // Get recent projects
            List<ResearchProject> projects = projectRepository.findAll();
            for (ResearchProject project : projects) {
                if (project.getCreatedAt() != null) {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("id", "project_" + project.getId());
                    activity.put("action", "Project created");
                    activity.put("item", project.getTitle());
                    activity.put("type", "project");
                    activity.put("timestamp", project.getCreatedAt());
                    activity.put("time", formatTimeAgo(project.getCreatedAt()));
                    activities.add(activity);
                }
            }
            
            // Get recent team members
            List<TeamMember> members = teamMemberRepository.findAll();
            for (TeamMember member : members) {
                if (member.getCreatedAt() != null) {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("id", "member_" + member.getId());
                    activity.put("action", "Team member added");
                    activity.put("item", member.getName());
                    activity.put("type", "member");
                    activity.put("timestamp", member.getCreatedAt());
                    activity.put("time", formatTimeAgo(member.getCreatedAt()));
                    activities.add(activity);
                }
            }
            
            // Get recent documents
            List<ProjectDocument> documents = documentRepository.findAll();
            for (ProjectDocument document : documents) {
                if (document.getCreatedAt() != null) {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("id", "document_" + document.getId());
                    activity.put("action", "Document uploaded");
                    activity.put("item", document.getFileName());
                    activity.put("type", "document");
                    activity.put("timestamp", document.getCreatedAt());
                    activity.put("time", formatTimeAgo(document.getCreatedAt()));
                    activities.add(activity);
                }
            }
            
            // Sort by timestamp and limit to 10 activities
            return activities.stream()
                    .sorted((a1, a2) -> {
                        Date d1 = (Date) a1.get("timestamp");
                        Date d2 = (Date) a2.get("timestamp");
                        if (d1 == null || d2 == null) return 0;
                        return d2.compareTo(d1);
                    })
                    .limit(10)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            // Return empty list on error
            return new ArrayList<>();
        }
    }

    private String formatTimeAgo(Date date) {
        if (date == null) return "Unknown time";
        
        try {
            long diffInMillies = Math.abs(new Date().getTime() - date.getTime());
            long diffInDays = diffInMillies / (24 * 60 * 60 * 1000);
            long diffInHours = diffInMillies / (60 * 60 * 1000);
            long diffInMinutes = diffInMillies / (60 * 1000);
            
            if (diffInDays > 0) {
                return diffInDays + " day" + (diffInDays > 1 ? "s" : "") + " ago";
            } else if (diffInHours > 0) {
                return diffInHours + " hour" + (diffInHours > 1 ? "s" : "") + " ago";
            } else {
                return diffInMinutes + " minute" + (diffInMinutes > 1 ? "s" : "") + " ago";
            }
        } catch (Exception e) {
            return "Some time ago";
        }
    }
}
