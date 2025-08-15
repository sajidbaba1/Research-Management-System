package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectMember;
import com.sajidbaba1.researchmanagementsystem.repository.ProjectMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectMemberService {
    
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    
    public List<ProjectMember> findAll() {
        return projectMemberRepository.findAll();
    }
    
    public Optional<ProjectMember> findById(Long id) {
        return projectMemberRepository.findById(id);
    }
    
    public ProjectMember save(ProjectMember member) {
        return projectMemberRepository.save(member);
    }
    
    public void deleteById(Long id) {
        projectMemberRepository.deleteById(id);
    }
    
    public List<ProjectMember> findByProjectId(Long projectId) {
        return projectMemberRepository.findByProjectId(projectId);
    }
    
    public List<ProjectMember> findByProjectIdAndRole(Long projectId, String role) {
        return projectMemberRepository.findByProjectIdAndRole(projectId, role);
    }
    
    public List<ProjectMember> findByProjectIdAndIsActiveTrue(Long projectId) {
        return projectMemberRepository.findByProjectIdAndIsActiveTrue(projectId);
    }
    
    public ProjectMember findByProjectIdAndEmail(Long projectId, String email) {
        return projectMemberRepository.findByProjectIdAndEmail(projectId, email);
    }
    
    public List<ProjectMember> findByEmail(String email) {
        return projectMemberRepository.findByEmail(email);
    }
}
