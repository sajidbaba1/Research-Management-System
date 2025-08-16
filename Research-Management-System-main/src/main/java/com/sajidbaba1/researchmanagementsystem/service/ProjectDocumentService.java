package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectDocumentService {

    @Autowired
    private ProjectDocumentRepository projectDocumentRepository;

    public List<ProjectDocument> getAllDocuments() {
        return projectDocumentRepository.findAll();
    }

    public Optional<ProjectDocument> getDocumentById(Long id) {
        return projectDocumentRepository.findById(id);
    }

    public List<ProjectDocument> getDocumentsByProjectId(Long projectId) {
        return projectDocumentRepository.findByProjectId(projectId);
    }

    public List<ProjectDocument> getDocumentsByFileType(String fileType) {
        return projectDocumentRepository.findByFileType(fileType);
    }

    public ProjectDocument saveDocument(ProjectDocument document) {
        if (document.getId() == null) {
            document.setCreatedAt(new Date());
        }
        return projectDocumentRepository.save(document);
    }

    public void deleteDocument(Long id) {
        projectDocumentRepository.deleteById(id);
    }
}
