package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectRisk;
import com.sajidbaba1.researchmanagementsystem.service.ProjectRiskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/risks")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectRiskController {
    
    @Autowired
    private ProjectRiskService projectRiskService;
    
    @GetMapping
    public List<ProjectRisk> getAllRisks() {
        return projectRiskService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectRisk> getRiskById(@PathVariable Long id) {
        Optional<ProjectRisk> risk = projectRiskService.findById(id);
        return risk.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/project/{projectId}")
    public List<ProjectRisk> getRisksByProjectId(@PathVariable Long projectId) {
        return projectRiskService.findByProjectId(projectId);
    }
    
    @GetMapping("/project/{projectId}/status/{status}")
    public List<ProjectRisk> getRisksByProjectIdAndStatus(@PathVariable Long projectId, @PathVariable String status) {
        return projectRiskService.findByProjectIdAndStatus(projectId, status);
    }
    
    @GetMapping("/project/{projectId}/category/{category}")
    public List<ProjectRisk> getRisksByProjectIdAndCategory(@PathVariable Long projectId, @PathVariable String category) {
        return projectRiskService.findByProjectIdAndCategory(projectId, category);
    }
    
    @GetMapping("/project/{projectId}/high-risk-count")
    public long getHighRiskCount(@PathVariable Long projectId) {
        return projectRiskService.countHighRiskByProjectId(projectId);
    }
    
    @PostMapping
    public ProjectRisk createRisk(@RequestBody ProjectRisk risk) {
        return projectRiskService.save(risk);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectRisk> updateRisk(@PathVariable Long id, @RequestBody ProjectRisk riskDetails) {
        Optional<ProjectRisk> existingRisk = projectRiskService.findById(id);
        if (existingRisk.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ProjectRisk risk = existingRisk.get();
        risk.setTitle(riskDetails.getTitle());
        risk.setDescription(riskDetails.getDescription());
        risk.setCategory(riskDetails.getCategory());
        risk.setProbability(riskDetails.getProbability());
        risk.setImpact(riskDetails.getImpact());
        risk.setRiskScore(riskDetails.getRiskScore());
        risk.setMitigationPlan(riskDetails.getMitigationPlan());
        risk.setContingencyPlan(riskDetails.getContingencyPlan());
        risk.setOwner(riskDetails.getOwner());
        risk.setStatus(riskDetails.getStatus());
        risk.setNotes(riskDetails.getNotes());
        
        return ResponseEntity.ok(projectRiskService.save(risk));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRisk(@PathVariable Long id) {
        if (!projectRiskService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        projectRiskService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
