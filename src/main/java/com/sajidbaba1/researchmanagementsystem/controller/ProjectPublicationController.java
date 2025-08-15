package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectPublication;
import com.sajidbaba1.researchmanagementsystem.service.ProjectPublicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/publications")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectPublicationController {
    
    @Autowired
    private ProjectPublicationService projectPublicationService;
    
    @GetMapping
    public List<ProjectPublication> getAllPublications() {
        return projectPublicationService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectPublication> getPublicationById(@PathVariable Long id) {
        Optional<ProjectPublication> publication = projectPublicationService.findById(id);
        return publication.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/project/{projectId}")
    public List<ProjectPublication> getPublicationsByProjectId(@PathVariable Long projectId) {
        return projectPublicationService.findByProjectId(projectId);
    }
    
    @GetMapping("/project/{projectId}/status/{status}")
    public List<ProjectPublication> getPublicationsByProjectIdAndStatus(@PathVariable Long projectId, @PathVariable String status) {
        return projectPublicationService.findByProjectIdAndStatus(projectId, status);
    }
    
    @GetMapping("/project/{projectId}/type/{type}")
    public List<ProjectPublication> getPublicationsByProjectIdAndType(@PathVariable Long projectId, @PathVariable String type) {
        return projectPublicationService.findByProjectIdAndType(projectId, type);
    }
    
    @GetMapping("/author/{author}")
    public List<ProjectPublication> getPublicationsByAuthor(@PathVariable String author) {
        return projectPublicationService.findByAuthorsContaining(author);
    }
    
    @PostMapping
    public ProjectPublication createPublication(@RequestBody ProjectPublication publication) {
        return projectPublicationService.save(publication);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectPublication> updatePublication(@PathVariable Long id, @RequestBody ProjectPublication publicationDetails) {
        Optional<ProjectPublication> existingPublication = projectPublicationService.findById(id);
        if (existingPublication.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ProjectPublication publication = existingPublication.get();
        publication.setTitle(publicationDetails.getTitle());
        publication.setAbstractText(publicationDetails.getAbstractText());
        publication.setType(publicationDetails.getType());
        publication.setJournalName(publicationDetails.getJournalName());
        publication.setConferenceName(publicationDetails.getConferenceName());
        publication.setAuthors(publicationDetails.getAuthors());
        publication.setCorrespondingAuthor(publicationDetails.getCorrespondingAuthor());
        publication.setDoi(publicationDetails.getDoi());
        publication.setIssn(publicationDetails.getIssn());
        publication.setIsbn(publicationDetails.getIsbn());
        publication.setVolume(publicationDetails.getVolume());
        publication.setIssue(publicationDetails.getIssue());
        publication.setPages(publicationDetails.getPages());
        publication.setYear(publicationDetails.getYear());
        publication.setPublisher(publicationDetails.getPublisher());
        publication.setUrl(publicationDetails.getUrl());
        publication.setKeywords(publicationDetails.getKeywords());
        publication.setStatus(publicationDetails.getStatus());
        publication.setSubmissionDate(publicationDetails.getSubmissionDate());
        publication.setAcceptanceDate(publicationDetails.getAcceptanceDate());
        publication.setPublicationDate(publicationDetails.getPublicationDate());
        publication.setImpactFactor(publicationDetails.getImpactFactor());
        publication.setCitations(publicationDetails.getCitations());
        publication.setOpenAccess(publicationDetails.getOpenAccess());
        publication.setLicense(publicationDetails.getLicense());
        
        return ResponseEntity.ok(projectPublicationService.save(publication));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePublication(@PathVariable Long id) {
        if (!projectPublicationService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        projectPublicationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
