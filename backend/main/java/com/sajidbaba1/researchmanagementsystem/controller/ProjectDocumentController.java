package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.service.ProjectDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
public class ProjectDocumentController {

    @Autowired
    private ProjectDocumentService projectDocumentService;

    @GetMapping
    public List<ProjectDocument> getAllDocuments() {
        return projectDocumentService.getAllDocuments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDocument> getDocumentById(@PathVariable Long id) {
        Optional<ProjectDocument> document = projectDocumentService.getDocumentById(id);
        return document.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public List<ProjectDocument> getDocumentsByProjectId(@PathVariable Long projectId) {
        return projectDocumentService.getDocumentsByProjectId(projectId);
    }

    @PostMapping
    public ProjectDocument createDocument(@RequestBody ProjectDocument document) {
        return projectDocumentService.saveDocument(document);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDocument> updateDocument(@PathVariable Long id, @RequestBody ProjectDocument document) {
        Optional<ProjectDocument> existing = projectDocumentService.getDocumentById(id);
        if (existing.isPresent()) {
            document.setId(id);
            return ResponseEntity.ok(projectDocumentService.saveDocument(document));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        projectDocumentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
