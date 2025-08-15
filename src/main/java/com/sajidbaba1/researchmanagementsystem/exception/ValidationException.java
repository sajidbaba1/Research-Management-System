package com.sajidbaba1.researchmanagementsystem.exception;

import java.util.List;

public class ValidationException extends RuntimeException {
    private final List<ValidationError> validationErrors;

    public ValidationException(String message, List<ValidationError> validationErrors) {
        super(message);
        this.validationErrors = validationErrors;
    }

    public List<ValidationError> getValidationErrors() {
        return validationErrors;
    }
}
