package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectBudget;
import com.sajidbaba1.researchmanagementsystem.service.ProjectBudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectBudgetController {
    
    @Autowired
    private ProjectBudgetService projectBudgetService;
    
    @GetMapping
    public List<ProjectBudget> getAllBudgets() {
        return projectBudgetService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectBudget> getBudgetById(@PathVariable Long id) {
        Optional<ProjectBudget> budget = projectBudgetService.findById(id);
        return budget.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/project/{projectId}")
    public List<ProjectBudget> getBudgetsByProjectId(@PathVariable Long projectId) {
        return projectBudgetService.findByProjectId(projectId);
    }
    
    @GetMapping("/project/{projectId}/category/{category}")
    public List<ProjectBudget> getBudgetsByProjectIdAndCategory(@PathVariable Long projectId, @PathVariable String category) {
        return projectBudgetService.findByProjectIdAndCategory(projectId, category);
    }
    
    @GetMapping("/project/{projectId}/status/{status}")
    public List<ProjectBudget> getBudgetsByProjectIdAndStatus(@PathVariable Long projectId, @PathVariable String status) {
        return projectBudgetService.findByProjectIdAndStatus(projectId, status);
    }
    
    @GetMapping("/project/{projectId}/summary")
    public ResponseEntity<BudgetSummary> getBudgetSummary(@PathVariable Long projectId) {
        Double budgeted = projectBudgetService.sumBudgetedAmountByProjectId(projectId);
        Double actual = projectBudgetService.sumActualAmountByProjectId(projectId);
        Double utilization = projectBudgetService.calculateBudgetUtilization(projectId);
        
        BudgetSummary summary = new BudgetSummary();
        summary.setTotalBudgeted(budgeted != null ? budgeted : 0.0);
        summary.setTotalActual(actual != null ? actual : 0.0);
        summary.setUtilizationPercentage(utilization);
        
        return ResponseEntity.ok(summary);
    }
    
    @PostMapping
    public ProjectBudget createBudget(@RequestBody ProjectBudget budget) {
        return projectBudgetService.save(budget);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectBudget> updateBudget(@PathVariable Long id, @RequestBody ProjectBudget budgetDetails) {
        Optional<ProjectBudget> existingBudget = projectBudgetService.findById(id);
        if (existingBudget.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ProjectBudget budget = existingBudget.get();
        budget.setCategory(budgetDetails.getCategory());
        budget.setItemDescription(budgetDetails.getItemDescription());
        budget.setBudgetedAmount(budgetDetails.getBudgetedAmount());
        budget.setActualAmount(budgetDetails.getActualAmount());
        budget.setVendorName(budgetDetails.getVendorName());
        budget.setPurchaseOrderNumber(budgetDetails.getPurchaseOrderNumber());
        budget.setInvoiceNumber(budgetDetails.getInvoiceNumber());
        budget.setStatus(budgetDetails.getStatus());
        budget.setNotes(budgetDetails.getNotes());
        
        return ResponseEntity.ok(projectBudgetService.save(budget));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        if (!projectBudgetService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        projectBudgetService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    public static class BudgetSummary {
        private Double totalBudgeted;
        private Double totalActual;
        private Double utilizationPercentage;
        
        // Getters and setters
        public Double getTotalBudgeted() { return totalBudgeted; }
        public void setTotalBudgeted(Double totalBudgeted) { this.totalBudgeted = totalBudgeted; }
        public Double getTotalActual() { return totalActual; }
        public void setTotalActual(Double totalActual) { this.totalActual = totalActual; }
        public Double getUtilizationPercentage() { return utilizationPercentage; }
        public void setUtilizationPercentage(Double utilizationPercentage) { this.utilizationPercentage = utilizationPercentage; }
    }
}
