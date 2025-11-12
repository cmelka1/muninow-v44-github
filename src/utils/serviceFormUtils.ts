/**
 * Service Form Utilities
 * Centralized exports for all service form utilities
 */

// Re-export all mappers
export {
  isAddressField,
  extractApplicantData,
  mapProfileToFormData,
  initializeFormData,
  prepareSubmissionPayload,
  type FormFieldConfig,
  type ApplicantData,
} from './serviceFormMappers';

// Re-export all validators
export {
  validateRequiredFields,
  validateUserDefinedAmount,
  validateFile,
  validateEmail,
  validatePhone,
  validateNumber,
  validateDocumentUpload,
  validateTimeSlot,
  validateApplicationForm,
} from './serviceFormValidators';
