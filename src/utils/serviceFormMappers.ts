/**
 * Service Form Mappers
 * Pure utility functions for transforming form data and database schemas
 * No UI dependencies - can be used across components and tested independently
 */

export interface FormFieldConfig {
  id: string;
  label: string;
  type: string;
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export interface ApplicantData {
  applicant_name?: string;
  applicant_email?: string;
  applicant_phone?: string;
  business_legal_name?: string;
  street_address?: string;
  apt_number?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

/**
 * Address field detection
 * Identifies if a field ID represents an address field
 */
const ADDRESS_FIELD_IDS = [
  'address',
  'full_address',
  'street_address',
  'street',
  'property_address',
  'business_address',
  'location',
];

export const isAddressField = (fieldId: string): boolean => {
  return ADDRESS_FIELD_IDS.some((id) =>
    fieldId.toLowerCase().includes(id.toLowerCase())
  );
};

/**
 * Extract applicant data from form data
 * Maps various field name variations to standardized applicant fields
 */
export const extractApplicantData = (
  formData: Record<string, any>
): ApplicantData => {
  return {
    applicant_name:
      formData.name ||
      formData.full_name ||
      `${formData.first_name || ''} ${formData.last_name || ''}`.trim() ||
      undefined,
    applicant_email: formData.email || undefined,
    applicant_phone: formData.phone || formData.phone_number || undefined,
    business_legal_name:
      formData.business_name ||
      formData.business_legal_name ||
      formData.company_name ||
      undefined,
    street_address:
      formData.address ||
      formData.street_address ||
      formData.street ||
      undefined,
    apt_number:
      formData.apt || formData.apt_number || formData.apartment || undefined,
    city: formData.city || undefined,
    state: formData.state || undefined,
    zip_code:
      formData.zip || formData.zip_code || formData.postal_code || undefined,
  };
};

/**
 * Map profile data to form fields for auto-population
 * Intelligently matches profile fields to form field IDs
 */
export const mapProfileToFormData = (
  profile: any,
  formFields: FormFieldConfig[]
): Record<string, any> => {
  const formData: Record<string, any> = {};

  formFields.forEach((field) => {
    const fieldId = field.id.toLowerCase();

    // Handle name fields
    if (fieldId === 'name' || fieldId === 'full_name' || fieldId === 'fullname') {
      if (profile.first_name || profile.last_name) {
        formData[field.id] = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }
    } else if (fieldId === 'first_name' || fieldId === 'firstname') {
      formData[field.id] = profile.first_name || '';
    } else if (fieldId === 'last_name' || fieldId === 'lastname') {
      formData[field.id] = profile.last_name || '';
    }
    // Handle address fields
    else if (
      fieldId === 'address' ||
      fieldId === 'full_address' ||
      fieldId === 'street_address'
    ) {
      if (profile.street_address) {
        const addressParts = [
          profile.street_address,
          profile.apt_number ? `Apt ${profile.apt_number}` : '',
          profile.city,
          profile.state,
          profile.zip_code,
        ].filter(Boolean);
        formData[field.id] = addressParts.join(', ');
      }
    } else if (fieldId === 'street' || fieldId === 'street_address') {
      formData[field.id] = profile.street_address || '';
    } else if (fieldId === 'apt' || fieldId === 'apt_number' || fieldId === 'apartment') {
      formData[field.id] = profile.apt_number || '';
    } else if (fieldId === 'city') {
      formData[field.id] = profile.city || '';
    } else if (fieldId === 'state') {
      formData[field.id] = profile.state || '';
    } else if (
      fieldId === 'zip' ||
      fieldId === 'zip_code' ||
      fieldId === 'postal_code'
    ) {
      formData[field.id] = profile.zip_code || '';
    }
    // Handle contact fields
    else if (fieldId === 'email') {
      formData[field.id] = profile.email || '';
    } else if (fieldId === 'phone' || fieldId === 'phone_number') {
      formData[field.id] = profile.phone || '';
    }
    // Handle business fields
    else if (
      fieldId === 'business_name' ||
      fieldId === 'business_legal_name' ||
      fieldId === 'company_name'
    ) {
      formData[field.id] = profile.business_legal_name || '';
    }
  });

  return formData;
};

/**
 * Initialize form data with default values based on field types
 */
export const initializeFormData = (formFields: FormFieldConfig[]): Record<string, any> => {
  const formData: Record<string, any> = {};
  
  formFields.forEach((field) => {
    formData[field.id] = field.type === 'number' ? 0 : '';
  });
  
  return formData;
};

/**
 * Prepare submission payload for database insertion
 * Combines form data with applicant data and metadata
 */
export const prepareSubmissionPayload = (
  formData: Record<string, any>,
  options: {
    tileId: string;
    userId: string;
    customerId: string;
    merchantId?: string;
    baseAmountCents: number;
    status?: string;
    paymentStatus?: string;
    submittedAt?: string;
  }
) => {
  const applicantData = extractApplicantData(formData);

  return {
    tile_id: options.tileId,
    user_id: options.userId,
    customer_id: options.customerId,
    merchant_id: options.merchantId,
    status: options.status || 'submitted',
    payment_status: options.paymentStatus || 'unpaid',
    submitted_at: options.submittedAt,
    base_amount_cents: options.baseAmountCents,
    ...applicantData,
    additional_information:
      formData.additional_information || formData.notes || formData.comments || undefined,
    service_specific_data: formData,
  };
};
