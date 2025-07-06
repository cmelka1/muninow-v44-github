import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FinixSellerFormData } from '@/utils/finixFormUtils';

export const useFinixSeller = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitSellerIdentity = async (data: FinixSellerFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting Finix Seller Identity:', JSON.stringify(data, null, 2));
      
      const { data: response, error } = await supabase.functions.invoke('create-finix-seller', {
        body: data
      });

      console.log('Edge function response:', { response, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create Finix seller identity');
      }

      if (response?.error) {
        // Handle detailed error messages from the edge function
        console.error('Finix API error response:', response);
        let errorMsg = response.error;
        
        if (response.field_errors && Object.keys(response.field_errors).length > 0) {
          errorMsg = `Validation errors: ${Object.entries(response.field_errors).map(([field, msg]) => `${field}: ${msg}`).join(', ')}`;
        } else if (response.finix_response?.details) {
          // Extract more detailed error info from Finix response
          const details = Array.isArray(response.finix_response.details) 
            ? response.finix_response.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
            : JSON.stringify(response.finix_response.details);
          errorMsg = `Finix validation errors: ${details}`;
        }
        
        throw new Error(errorMsg);
      }

      console.log('Finix Seller Identity Created:', JSON.stringify(response, null, 2));
      
      toast({
        title: "Seller Identity Created Successfully",
        description: `Finix Identity ID: ${response.finix_response.id}`,
      });

      return response;
    } catch (error) {
      console.error('Seller identity creation error:', error);
      toast({
        title: "Error creating seller identity",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitSellerIdentity,
    isSubmitting
  };
};