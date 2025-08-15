package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_budgets")
@EntityListeners(AuditingEntityListener.class)
public class ProjectBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Item name is required")
    @Size(max = 100, message = "Item name must not exceed 100 characters")
    @Column(nullable = false)
    private String itemName;

    @Column(columnDefinition = "TEXT")
    private String itemDescription;

    @NotNull(message = "Budgeted amount is required")
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal budgetedAmount;

    @Column(precision = 15, scale = 2)
    private BigDecimal actualAmount;

    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Size(max = 100, message = "Vendor name must not exceed 100 characters")
    private String vendorName;

    @Size(max = 50, message = "Purchase order number must not exceed 50 characters")
    private String purchaseOrderNumber;

    @Size(max = 50, message = "Invoice number must not exceed 50 characters")
    private String invoiceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BudgetStatus status = BudgetStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ResearchProject project;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getItemDescription() {
        return itemDescription;
    }

    public void setItemDescription(String itemDescription) {
        this.itemDescription = itemDescription;
    }

    public BigDecimal getBudgetedAmount() {
        return budgetedAmount;
    }

    public void setBudgetedAmount(BigDecimal budgetedAmount) {
        this.budgetedAmount = budgetedAmount;
    }

    public BigDecimal getActualAmount() {
        return actualAmount;
    }

    public void setActualAmount(BigDecimal actualAmount) {
        this.actualAmount = actualAmount;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public String getPurchaseOrderNumber() {
        return purchaseOrderNumber;
    }

    public void setPurchaseOrderNumber(String purchaseOrderNumber) {
        this.purchaseOrderNumber = purchaseOrderNumber;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public BudgetStatus getStatus() {
        return status;
    }

    public void setStatus(BudgetStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public ResearchProject getProject() {
        return project;
    }

    public void setProject(ResearchProject project) {
        this.project = project;
    }

    public enum BudgetStatus {
        PENDING, APPROVED, PAID, CANCELLED
    }
}
