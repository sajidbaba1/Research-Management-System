package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectMember;
import com.sajidbaba1.researchmanagementsystem.service.ProjectMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectMemberController {
    
    @Autowired
    private ProjectMemberService projectMemberService;
    
    @GetMapping
    public List<ProjectMember> getAllMembers() {
        return projectMemberService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectMember> getMemberById(@PathVariable Long id) {
        Optional<ProjectMember> member = projectMemberService.findById(id);
        return member.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/project/{projectId}")
    public List<ProjectMember> getMembersByProjectId(@PathVariable Long projectId) {
        return projectMemberService.findByProjectId(projectId);
    }
    
    @GetMapping("/project/{projectId}/role/{role}")
    public List<ProjectMember> getMembersByProjectIdAndRole(@PathVariable Long projectId, @PathVariable String role) {
        return projectMemberService.findByProjectIdAndRole(projectId, role);
    }
    
    @GetMapping("/project/{projectId}/active")
    public List<ProjectMember> getActiveMembersByProjectId(@PathVariable Long projectId) {
        return projectMemberService.findByProjectIdAndIsActiveTrue(projectId);
    }
    
    @PostMapping
    public ProjectMember createMember(@RequestBody ProjectMember member) {
        return projectMemberService.save(member);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectMember> updateMember(@PathVariable Long id, @RequestBody ProjectMember memberDetails) {
        Optional<ProjectMember> existingMember = projectMemberService.findById(id);
        if (existingMember.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ProjectMember member = existingMember.get();
        member.setFirstName(memberDetails.getFirstName());
        member.setLastName(memberDetails.getLastName());
        member.setEmail(memberDetails.getEmail());
        member.setRole(memberDetails.getRole());
        member.setAffiliation(memberDetails.getAffiliation());
        member.setExpertise(memberDetails.getExpertise());
        member.setResponsibilities(memberDetails.getResponsibilities());
        member.setPhone(memberDetails.getPhone());
        member.setIsActive(memberDetails.getIsActive());
        
        return ResponseEntity.ok(projectMemberService.save(member));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        if (!projectMemberService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        projectMemberService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
