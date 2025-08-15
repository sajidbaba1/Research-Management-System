package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectPatent;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectPatentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectPatentService {
    
    @Autowired
    private ProjectPatentRepository projectPatentRepository;
    
    public List<ProjectPatent> findAll() {
        return projectPatentRepository.findAll();
    }
    
    public Optional<ProjectPatent> findById(Long id) {
        return projectPatentRepository.findById(id);
    }
    
    public ProjectPatent save(ProjectPatent patent) {
        return projectPatentRepository.save(patent);
    }
    
    public void deleteById(Long id) {
        projectPatentRepository.deleteById(id);
    }
    
    public List<ProjectPatent> findByProjectId(Long projectId) {
        return projectPatentRepository.findByProjectId(projectId);
    }
    
    public List<ProjectPatent> findByProjectIdAndStatus(Long projectId, String status) {
        return projectPatentRepository.findByProjectIdAndStatus(projectId, status);
    }
    
    public List<ProjectPatent> findByProjectIdAndType(Long projectId, String type) {
        return projectPatentRepository.findByProjectIdAndType(projectId, type);
    }
    
    public List<ProjectPatent> findByInventorsContaining(String inventor) {
        return projectPatentRepository.findByInventorsContaining(inventor);
    }
    
    public List<ProjectPatent> findByProjectIdAndStatusIn(Long projectId, List<String> statuses) {
        return projectPatentRepository.findByProjectIdAndStatusIn(projectId, statuses);
    }
}
