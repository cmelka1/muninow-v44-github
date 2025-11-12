/**
 * Service Form Validators
 * Pure validation functions for service application forms
 * Returns error messages for invalid fields, null for valid fields
 */

import { FormFieldConfig } from './serviceFormMappers';

/**
 * Validate required fields in form data
 * Returns a map of field IDs to error messages
 */
export const validateRequiredFields = (
  formData: Record<string, any>,
  formFields: FormFieldConfig[]
): Record<string, string> => {
  const errors: Record<string, string> = {};

  formFields.forEach((field) => {
    if (field.required && (!formData[field.id] || formData[field.id] === '')) {
      errors[field.id] = `${field.label} is required`;
    }
  });

  return errors;
};

/**
 * Validate user-defined amount
 * Returns error message if invalid, null if valid
 */
export const validateUserDefinedAmount = (
  amountCents: number | undefined
): string | null => {
  if (!amountCents || amountCents <= 0) {
    return 'Service Fee Amount is required and must be greater than 0';
  }
  return null;
};

/**
 * Validate file upload
 * Returns error message if invalid, null if valid
 */
export const validateFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ];

  if (file.size > maxSize) {
    return 'File size must be less than 10MB';
  }

  if (!allowedTypes.includes(file.type)) {
    return 'File type not supported. Please upload PDF, DOC, DOCX, JPG, PNG, or GIF files.';
  }

  return null;
};

/**
 * Validate email format
 * Returns error message if invalid, null if valid
 */
export const validateEmail = (email: string): string | null => {
  if (!email) return null; // Empty is handled by required validation
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  
  return null;
};

/**
 * Validate phone number format
 * Returns error message if invalid, null if valid
 */
export const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Empty is handled by required validation
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // US phone numbers should have 10 digits (or 11 with country code)
  if (digitsOnly.length < 10 || digitsOnly.length > 11) {
    return 'Invalid phone number format';
  }
  
  return null;
};

/**
 * Validate number field
 * Returns error message if invalid, null if valid
 */
export const validateNumber = (
  value: any,
  min?: number,
  max?: number
): string | null => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return 'Must be a valid number';
  }
  
  if (min !== undefined && num < min) {
    return `Must be at least ${min}`;
  }
  
  if (max !== undefined && num > max) {
    return `Must be at most ${max}`;
  }
  
  return null;
};

/**
 * Validate document upload requirements
 * Returns error message if invalid, null if valid
 */
export const validateDocumentUpload = (
  uploadedDocuments: any[],
  required: boolean
): string | null => {
  if (!required) return null;
  
  const completedDocs = uploadedDocuments.filter(
    (doc) => doc.uploadStatus === 'completed'
  );
  
  if (completedDocs.length === 0) {
    return 'At least one document must be uploaded';
  }
  
  return null;
};

/**
 * Validate time slot selection
 * Returns error message if invalid, null if valid
 */
export const validateTimeSlot = (
  date: Date | undefined,
  time: string | undefined
): string | null => {
  if (!date) return 'Date is required';
  if (!time) return 'Time slot is required';
  return null;
};

/**
 * Comprehensive validation for Step 1 (Application Form)
 * Returns all validation errors for the step
 */
export const validateApplicationForm = (
  formData: Record<string, any>,
  formFields: FormFieldConfig[],
  options: {
    requiresDocumentUpload?: boolean;
    uploadedDocuments?: any[];
    allowUserDefinedAmount?: boolean;
  }
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validate required fields
  const requiredFieldErrors = validateRequiredFields(formData, formFields);
  Object.assign(errors, requiredFieldErrors);

  // Validate user-defined amount if applicable
  if (options.allowUserDefinedAmount) {
    const amountError = validateUserDefinedAmount(formData.amount_cents);
    if (amountError) {
      errors.amount_cents = amountError;
    }
  }

  // Validate document upload if required
  if (options.requiresDocumentUpload && options.uploadedDocuments) {
    const docError = validateDocumentUpload(
      options.uploadedDocuments,
      options.requiresDocumentUpload
    );
    if (docError) {
      errors._documents = docError;
    }
  }

  // Validate specific field types
  formFields.forEach((field) => {
    const value = formData[field.id];
    if (!value) return; // Skip empty fields (handled by required validation)

    const fieldId = field.id.toLowerCase();

    // Email validation
    if (fieldId.includes('email')) {
      const emailError = validateEmail(value);
      if (emailError) errors[field.id] = emailError;
    }

    // Phone validation
    if (fieldId.includes('phone')) {
      const phoneError = validatePhone(value);
      if (phoneError) errors[field.id] = phoneError;
    }

    // Number validation
    if (field.type === 'number') {
      const numberError = validateNumber(value);
      if (numberError) errors[field.id] = numberError;
    }
  });

  return errors;
};
