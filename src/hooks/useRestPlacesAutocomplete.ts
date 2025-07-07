import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlaceSuggestion {
  placeId: string;
  text: string;
}

interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AutocompleteOptions {
  includedRegionCodes?: string[];
  languageCode?: string;
  regionCode?: string;
  includedPrimaryTypes?: string[];
  locationBias?: {
    circle?: {
      center: { latitude: number; longitude: number };
      radius: number;
    };
  };
}

export const useRestPlacesAutocomplete = (options: AutocompleteOptions = {}) => {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken] = useState(() => crypto.randomUUID());
  const debounceRef = useRef<NodeJS.Timeout>();

  // Street abbreviation expansion
  const expandStreetAbbreviations = (street: string): string => {
    const streetTypes: Record<string, string> = {
      'Ave': 'Avenue',
      'St': 'Street', 
      'Rd': 'Road',
      'Dr': 'Drive',
      'Ct': 'Court',
      'Blvd': 'Boulevard',
      'Ln': 'Lane',
      'Pl': 'Place',
      'Cir': 'Circle',
      'Ter': 'Terrace',
      'Way': 'Way',
      'Pkwy': 'Parkway',
      'Sq': 'Square',
      'Loop': 'Loop',
      'Hwy': 'Highway'
    };
    
    Object.entries(streetTypes).forEach(([abbrev, full]) => {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
      street = street.replace(regex, full);
    });
    
    return street;
  };

  const parseAddressComponents = (addressComponents: any[]): AddressComponents => {
    const result: Partial<AddressComponents> = {};
    let streetNumber = '';
    let route = '';

    addressComponents.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.longText;
      } else if (types.includes('route')) {
        route = component.longText;
      } else if (types.includes('locality')) {
        result.city = component.longText;
      } else if (types.includes('administrative_area_level_1')) {
        result.state = component.shortText; // State abbreviation (IL, CA, etc.)
      } else if (types.includes('postal_code')) {
        // Extract only 5-digit ZIP code (remove ZIP+4)
        result.zipCode = component.longText.split('-')[0];
      }
    });

    // Combine and expand street components
    const expandedRoute = route ? expandStreetAbbreviations(route) : '';
    result.streetAddress = `${streetNumber} ${expandedRoute}`.trim();
    
    return {
      streetAddress: result.streetAddress || '',
      city: result.city || '',
      state: result.state || '',
      zipCode: result.zipCode || ''
    };
  };

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        input: input.trim(),
        sessionToken,
        includedPrimaryTypes: options.includedPrimaryTypes || ['address'],
        includedRegionCodes: options.includedRegionCodes || ['US'],
        ...options
      };

      const { data, error: supabaseError } = await supabase.functions.invoke('google-maps-proxy', {
        body: { service: 'autocomplete', ...requestBody }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const suggestions = data?.suggestions?.map((suggestion: any) => ({
        placeId: suggestion.placePrediction.placeId,
        text: suggestion.placePrediction.text.text
      })) || [];

      setSuggestions(suggestions);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [options, sessionToken]);

  const debouncedFetchSuggestions = useCallback((input: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(input);
    }, 300);
  }, [fetchSuggestions]);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<AddressComponents | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase.functions.invoke('google-maps-proxy', {
        body: { 
          service: 'place-details', 
          placeId,
          sessionToken 
        }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.addressComponents) {
        return parseAddressComponents(data.addressComponents);
      }

      return null;
    } catch (err) {
      console.error('Place details error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch place details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions: debouncedFetchSuggestions,
    getPlaceDetails,
    clearSuggestions
  };
};