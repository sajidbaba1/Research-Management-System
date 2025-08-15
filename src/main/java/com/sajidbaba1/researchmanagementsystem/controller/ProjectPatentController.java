package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectPatent;
import com.sajidbaba1.researchmanagementsystem.service.ProjectPatentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/patents")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectPatentController {
    
    @Autowired
    private ProjectPatentService projectPatentService;
    
    @GetMapping
    public List<ProjectPatent> getAllPatents() {
        return projectPatentService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectPatent> getPatentById(@PathVariable Long id) {
        Optional<ProjectPatent> patent = projectPatentService.findById(id);
        return patent.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/project/{projectId}")
    public List<ProjectPatent> getPatentsByProjectId(@PathVariable Long projectId) {
        return projectPatentService.findByProjectId(projectId);
    }
    
    @GetMapping("/project/{projectId}/status/{status}")
    public List<ProjectPatent> getPatentsByProjectIdAndStatus(@PathVariable Long projectId, @PathVariable String status) {
        return projectPatentService.findByProjectIdAndStatus(projectId, status);
    }
    
    @GetMapping("/project/{projectId}/type/{type}")
    public List<ProjectPatent> getPatentsByProjectIdAndType(@PathVariable Long projectId, @PathVariable String type) {
        return projectPatentService.findByProjectIdAndType(projectId, type);
    }
    
    @GetMapping("/inventor/{inventor}")
    public List<ProjectPatent> getPatentsByInventor(@PathVariable String inventor) {
        return projectPatentService.findByInventorsContaining(inventor);
    }
    
    @PostMapping
    public ProjectPatent createPatent(@RequestBody ProjectPatent patent) {
        return projectPatentService.save(patent);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectPatent> updatePatent(@PathVariable Long id, @RequestBody ProjectPatent patentDetails) {
        Optional<ProjectPatent> existingPatent = projectPatentService.findById(id);
        if (existingPatent.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ProjectPatent patent = existingPatent.get();
        patent.setTitle(patentDetails.getTitle());
        patent.setAbstractText(patentDetails.getAbstractText());
        patent.setPatentNumber(patentDetails.getPatentNumber());
        patent.setType(patentDetails.getType());
        patent.setStatus(patentDetails.getStatus());
        patent.setInventors(patentDetails.getInventors());
        patent.setAssignee(patentDetails.getAssignee());
        patent.setPatentOffice(patentDetails.getPatentOffice());
        patent.setFilingDate(patentDetails.getFilingDate());
        patent.setPublicationDate(patentDetails.getPublicationDate());
        patent.setGrantDate(patentDetails.getGrantDate());
        patent.setPriorityDate(patentDetails.getPriorityDate());
        patent.setIpcClass(patentDetails.getIpcClass());
        patent.setCpcClass(patentDetails.getCpcClass());
        patent.setClaims(patentDetails.getClaims());
        patent.setDrawings(patentDetails.getDrawings());
        patent.setUrl(patentDetails.getUrl());
        patent.setCommercializationStatus(patentDetails.getCommercializationStatus());
        patent.setLicensingStatus(patentDetails.getLicensingStatus());
        patent.setRevenueGenerated(patentDetails.getRevenueGenerated());
        
        return ResponseEntity.ok(projectPatentService.save(patent));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatent(@PathVariable Long id) {
        if (!projectPatentService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        projectPatentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
