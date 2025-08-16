package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByProjectId(Long projectId);
    List<TeamMember> findByEmail(String email);
    List<TeamMember> findByRole(String role);
}
