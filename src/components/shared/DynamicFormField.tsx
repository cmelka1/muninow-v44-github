import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { RestPlacesAutocomplete } from '@/components/ui/rest-places-autocomplete';
import { AlertCircle } from 'lucide-react';

export interface FormFieldConfig {
  id: string;
  label: string;
  type: string;
  options?: string[];
  required: boolean;
  placeholder?: string;
}

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (fieldId: string, value: any) => void;
  error?: string;
  onErrorClear?: (fieldId: string) => void;
}

// Address field detection helper
const ADDRESS_FIELD_IDS = [
  'address', 'full_address', 'street_address', 'street',
  'property_address', 'business_address', 'location'
];

const isAddressField = (fieldId: string): boolean => {
  return ADDRESS_FIELD_IDS.some(id => 
    fieldId.toLowerCase().includes(id.toLowerCase())
  );
};

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  onErrorClear,
}) => {
  const { id, label, type, options, placeholder } = field;

  const handleChange = (newValue: any) => {
    onChange(id, newValue);
    if (onErrorClear) {
      onErrorClear(id);
    }
  };

  const handleAddressAutocompleteSelect = (
    addressComponents: {
      streetAddress: string;
      city: string;
      state: string;
      zipCode: string;
    }
  ) => {
    // Create full address string (matching Permits and Business Licenses behavior)
    const fullAddress = `${addressComponents.streetAddress}, ${addressComponents.city}, ${addressComponents.state} ${addressComponents.zipCode}`;
    handleChange(fullAddress);
  };

  // Use Google Places Autocomplete for address fields
  if (isAddressField(id)) {
    return (
      <div className="space-y-2">
        <RestPlacesAutocomplete
          placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
          onAddressSelect={handleAddressAutocompleteSelect}
          value={value || ''}
          onChange={handleChange}
          className={error ? 'ring-2 ring-destructive border-destructive' : ''}
        />
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    );
  }

  switch (type) {
    case 'textarea':
      return (
        <div className="space-y-2">
          <RichTextEditor
            content={value || ''}
            onChange={handleChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
            className="w-full"
          />
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>
      );
    
    case 'select':
      return (
        <div className="space-y-2">
          <Select value={value || ''} onValueChange={handleChange}>
            <SelectTrigger className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>
      );
    
    case 'number':
      return (
        <div className="space-y-2">
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            placeholder={placeholder}
            className={error ? 'border-destructive' : ''}
          />
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>
      );
    
    default:
      return (
        <div className="space-y-2">
          <Input
            type={type}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            data-error={error ? "true" : "false"}
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>
      );
  }
};
