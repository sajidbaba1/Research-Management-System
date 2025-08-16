package com.sajidbaba1.researchmanagementsystem.dto.timeline;

import java.util.List;

public class CPMRequest {
    private List<Long> projectIds; // optional subset; if null -> all

    public List<Long> getProjectIds() { return projectIds; }
    public void setProjectIds(List<Long> projectIds) { this.projectIds = projectIds; }
}
