package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.TeamMember;
import com.sajidbaba1.researchmanagementsystem.repository.TeamMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeamMemberService {

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    public List<TeamMember> getAllTeamMembers() {
        return teamMemberRepository.findAll();
    }

    public Optional<TeamMember> getTeamMemberById(Long id) {
        return teamMemberRepository.findById(id);
    }

    public List<TeamMember> getTeamMembersByProjectId(Long projectId) {
        return teamMemberRepository.findByProjectId(projectId);
    }

    public TeamMember saveTeamMember(TeamMember teamMember) {
        return teamMemberRepository.save(teamMember);
    }

    public void deleteTeamMember(Long id) {
        teamMemberRepository.deleteById(id);
    }

    public List<TeamMember> getTeamMembersByRole(String role) {
        return teamMemberRepository.findByRole(role);
    }
}
