import React from 'react';
import { RestPlacesAutocomplete } from '@/components/ui/rest-places-autocomplete';

interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface GooglePlacesAutocompleteV2Props {
  placeholder?: string;
  onAddressSelect: (addressComponents: AddressComponents) => void;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const GooglePlacesAutocompleteV2: React.FC<GooglePlacesAutocompleteV2Props> = (props) => {
  // Use the new REST-based autocomplete component
  return <RestPlacesAutocomplete {...props} />;
};