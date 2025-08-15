package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectPublication;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectPublicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectPublicationService {
    
    @Autowired
    private ProjectPublicationRepository projectPublicationRepository;
    
    public List<ProjectPublication> findAll() {
        return projectPublicationRepository.findAll();
    }
    
    public Optional<ProjectPublication> findById(Long id) {
        return projectPublicationRepository.findById(id);
    }
    
    public ProjectPublication save(ProjectPublication publication) {
        return projectPublicationRepository.save(publication);
    }
    
    public void deleteById(Long id) {
        projectPublicationRepository.deleteById(id);
    }
    
    public List<ProjectPublication> findByProjectId(Long projectId) {
        return projectPublicationRepository.findByProjectId(projectId);
    }
    
    public List<ProjectPublication> findByProjectIdAndStatus(Long projectId, String status) {
        return projectPublicationRepository.findByProjectIdAndStatus(projectId, status);
    }
    
    public List<ProjectPublication> findByProjectIdAndType(Long projectId, String type) {
        return projectPublicationRepository.findByProjectIdAndType(projectId, type);
    }
    
    public List<ProjectPublication> findByAuthorsContaining(String author) {
        return projectPublicationRepository.findByAuthorsContaining(author);
    }
    
    public List<ProjectPublication> findByProjectIdAndStatusIn(Long projectId, List<String> statuses) {
        return projectPublicationRepository.findByProjectIdAndStatusIn(projectId, statuses);
    }
}
