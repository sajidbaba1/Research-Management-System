package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import com.sajidbaba1.researchmanagementsystem.service.ProjectDocumentService;
import com.sajidbaba1.researchmanagementsystem.service.ResearchProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
public class ProjectDocumentController {

    @Autowired
    private ProjectDocumentService projectDocumentService;

    @Autowired
    private ResearchProjectService researchProjectService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

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

    @GetMapping("/type/{fileType}")
    public List<ProjectDocument> getDocumentsByFileType(@PathVariable String fileType) {
        return projectDocumentService.getDocumentsByFileType(fileType);
    }

    @PostMapping
    public ProjectDocument createDocument(@RequestBody ProjectDocument document) {
        return projectDocumentService.saveDocument(document);
    }

    @PostMapping("/upload")
    public ResponseEntity<ProjectDocument> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") Long projectId,
            @RequestParam("description") String description,
            @RequestParam("uploadedBy") String uploadedBy) {
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = System.currentTimeMillis() + extension;
            
            // Save file to disk
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Create document record
            ProjectDocument document = new ProjectDocument();
            document.setFileName(originalFilename);
            document.setFileType(file.getContentType());
            document.setFilePath(filePath.toString());
            document.setDescription(description);
            document.setUploadedBy(uploadedBy);
            document.setProjectId(projectId);
            document.setFileSize(file.getSize());

            ProjectDocument savedDocument = projectDocumentService.saveDocument(document);
            return ResponseEntity.ok(savedDocument);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDocument> updateDocument(@PathVariable Long id, @RequestBody ProjectDocument document) {
        Optional<ProjectDocument> existingDocument = projectDocumentService.getDocumentById(id);
        if (existingDocument.isPresent()) {
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

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Optional<ProjectDocument> documentOptional = projectDocumentService.getDocumentById(id);
        if (documentOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ProjectDocument document = documentOptional.get();
        try {
            Path filePath = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
