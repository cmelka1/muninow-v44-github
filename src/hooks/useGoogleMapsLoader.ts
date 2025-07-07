import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleMapsLoaderState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

export const useGoogleMapsLoader = () => {
  const [state, setState] = useState<GoogleMapsLoaderState>({
    isLoaded: false,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setState({ isLoaded: true, isLoading: false, error: null });
      return;
    }

    // Check if already loading
    if (state.isLoading) {
      return;
    }

    const loadGoogleMaps = async () => {
      setState({ isLoaded: false, isLoading: true, error: null });

      try {
        // Get the secure Google Maps API URL from our proxy
        const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
          body: { service: 'js' }
        });

        if (error) {
          throw new Error('Failed to get Google Maps API URL');
        }

        if (!data?.url) {
          throw new Error('Invalid response from Google Maps proxy');
        }

        // Create and append the script tag
        const script = document.createElement('script');
        script.src = data.url;
        script.async = true;
        script.defer = true;

        // Set up callback for when script loads
        return new Promise<void>((resolve, reject) => {
          script.onload = () => {
            // Wait for Google Maps to be available
            const checkGoogleMaps = () => {
              if (window.google && window.google.maps && window.google.maps.places) {
                setState({ isLoaded: true, isLoading: false, error: null });
                resolve();
              } else {
                setTimeout(checkGoogleMaps, 100);
              }
            };
            checkGoogleMaps();
          };

          script.onerror = () => {
            setState({ 
              isLoaded: false, 
              isLoading: false, 
              error: 'Failed to load Google Maps API' 
            });
            reject(new Error('Failed to load Google Maps API'));
          };

          document.head.appendChild(script);
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setState({ 
          isLoaded: false, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    };

    loadGoogleMaps();
  }, []);

  const loadPlacesLibrary = async () => {
    if (!window.google?.maps) {
      throw new Error('Google Maps not loaded');
    }

    try {
      const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");
      return { PlaceAutocompleteElement };
    } catch (error) {
      console.error('Error loading Places library:', error);
      throw error;
    }
  };

  return {
    ...state,
    loadPlacesLibrary
  };
};