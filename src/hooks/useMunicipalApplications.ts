import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ApplicationsBreakdown {
  total: number;
  buildingPermits: number;
  businessLicenses: number;
  serviceApplications: number;
}

export const useMunicipalApplications = (customerId: string | undefined) => {
  return useQuery({
    queryKey: ["municipal-applications", customerId],
    queryFn: async (): Promise<ApplicationsBreakdown> => {
      if (!customerId) {
        throw new Error("Customer ID is required");
      }

      // Get building permits (exclude draft)
      const { count: permitsCount, error: permitsError } = await supabase
        .from("permit_applications")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", customerId)
        .in("application_status", ["submitted", "under_review", "information_requested", "resubmitted", "approved"]);

      if (permitsError) throw permitsError;

      // Get business licenses (exclude draft)
      const { count: licensesCount, error: licensesError } = await supabase
        .from("business_license_applications")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", customerId)
        .in("application_status", ["submitted", "under_review", "information_requested", "resubmitted", "approved"]);

      if (licensesError) throw licensesError;

      // Get service applications (exclude draft)
      const { count: servicesCount, error: servicesError } = await supabase
        .from("municipal_service_applications")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", customerId)
        .in("status", ["submitted", "under_review", "information_requested", "resubmitted", "approved"]);

      if (servicesError) throw servicesError;

      return {
        total: (permitsCount || 0) + (licensesCount || 0) + (servicesCount || 0),
        buildingPermits: permitsCount || 0,
        businessLicenses: licensesCount || 0,
        serviceApplications: servicesCount || 0,
      };
    },
    enabled: !!customerId,
  });
};
