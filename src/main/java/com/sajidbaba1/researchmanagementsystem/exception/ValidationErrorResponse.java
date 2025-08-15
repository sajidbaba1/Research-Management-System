package com.sajidbaba1.researchmanagementsystem.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class ValidationErrorResponse extends ErrorResponse {
    private List<ValidationError> validationErrors;
}
