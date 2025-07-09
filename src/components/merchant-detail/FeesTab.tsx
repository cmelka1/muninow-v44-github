import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, AlertCircle, CheckCircle2, Edit2, Save, X, DollarSign, CreditCard, Banknote, Shield } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as z from 'zod';

interface Merchant {
  id: string;
  merchant_name: string;
}

interface FeesTabProps {
  merchant: Merchant;
}

interface FeeProfile {
  id: string;
  merchant_id: string;
  finix_fee_profile_id: string | null;
  ach_basis_points: number | null;
  ach_fixed_fee: number | null;
  basis_points: number | null;
  fixed_fee: number | null;
  dispute_fixed_fee: number | null;
  dispute_inquiry_fixed_fee: number | null;
  sync_status: string;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

// Form validation schema
const feeProfileSchema = z.object({
  ach_basis_points: z.number().min(0).max(10000),
  ach_fixed_fee: z.number().min(0),
  basis_points: z.number().min(0).max(10000),
  fixed_fee: z.number().min(0),
  dispute_fixed_fee: z.number().min(0),
  dispute_inquiry_fixed_fee: z.number().min(0),
});

type FeeProfileFormValues = z.infer<typeof feeProfileSchema>;

const FeesTab: React.FC<FeesTabProps> = ({ merchant }) => {
  const { hasRole } = useUserRole();
  const { toast } = useToast();
  const [feeProfile, setFeeProfile] = useState<FeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isSuperAdmin = hasRole('superAdmin');

  const form = useForm<FeeProfileFormValues>({
    resolver: zodResolver(feeProfileSchema),
    defaultValues: {
      ach_basis_points: 0,
      ach_fixed_fee: 0,
      basis_points: 0,
      fixed_fee: 0,
      dispute_fixed_fee: 0,
      dispute_inquiry_fixed_fee: 0,
    }
  });

  useEffect(() => {
    fetchFeeProfile();
  }, [merchant.id]);

  // Update form when feeProfile changes
  useEffect(() => {
    if (feeProfile) {
      form.reset({
        ach_basis_points: feeProfile.ach_basis_points || 0,
        ach_fixed_fee: (feeProfile.ach_fixed_fee || 0) / 100, // Convert cents to dollars
        basis_points: feeProfile.basis_points || 0,
        fixed_fee: (feeProfile.fixed_fee || 0) / 100, // Convert cents to dollars
        dispute_fixed_fee: (feeProfile.dispute_fixed_fee || 0) / 100, // Convert cents to dollars
        dispute_inquiry_fixed_fee: (feeProfile.dispute_inquiry_fixed_fee || 0) / 100, // Convert cents to dollars
      });
    }
  }, [feeProfile, form]);

  const fetchFeeProfile = async () => {
    if (!isSuperAdmin) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('merchant_fee_profiles')
        .select('*')
        .eq('merchant_id', merchant.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching fee profile:', error);
        toast({
          title: "Error",
          description: "Failed to fetch fee profile",
          variant: "destructive",
        });
      } else {
        setFeeProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFeeProfile = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-merchant-fee-profile', {
        body: {
          merchantId: merchant.id,
          ach_basis_points: 0,
          ach_fixed_fee: 0,
          basis_points: 0,
          fixed_fee: 0,
          dispute_fixed_fee: 0,
          dispute_inquiry_fixed_fee: 0,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee profile created successfully",
      });
      
      fetchFeeProfile();
    } catch (error) {
      console.error('Error creating fee profile:', error);
      toast({
        title: "Error",
        description: "Failed to create fee profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: FeeProfileFormValues) => {
    if (!feeProfile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.functions.invoke('update-merchant-fee-profile', {
        body: {
          merchantId: merchant.id,
          ach_basis_points: data.ach_basis_points,
          ach_fixed_fee: Math.round(data.ach_fixed_fee * 100), // Convert dollars to cents
          basis_points: data.basis_points,
          fixed_fee: Math.round(data.fixed_fee * 100), // Convert dollars to cents
          dispute_fixed_fee: Math.round(data.dispute_fixed_fee * 100), // Convert dollars to cents
          dispute_inquiry_fixed_fee: Math.round(data.dispute_inquiry_fixed_fee * 100), // Convert dollars to cents
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee profile updated successfully",
      });
      
      setIsEditing(false);
      fetchFeeProfile();
    } catch (error) {
      console.error('Error updating fee profile:', error);
      toast({
        title: "Error",
        description: "Failed to update fee profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fees</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading fee profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fees</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access restricted. Only SuperAdmin users can manage fee profiles.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!feeProfile) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fee Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No Fee Profile</p>
            <p className="text-muted-foreground mb-6">
              Create a fee profile to configure payment processing fees for {merchant.merchant_name}.
            </p>
            <Button onClick={handleCreateFeeProfile} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Create Fee Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Fee Profile Status */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Fee Profile Status
                </CardTitle>
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)} variant="outline">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Fees
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm" disabled={isSaving}>
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button type="button" onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  Status: {feeProfile.sync_status === 'synced' ? 'Synced with Finix' : feeProfile.sync_status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-medium">Finix Profile ID</Label>
                  <p className="text-sm font-mono bg-slate-50 p-2 rounded">
                    {feeProfile.finix_fee_profile_id || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-700 font-medium">Last Synced</Label>
                  <p className="text-sm bg-slate-50 p-2 rounded">
                    {feeProfile.last_synced_at 
                      ? new Date(feeProfile.last_synced_at).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Processing Fees */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Card Processing Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="basis_points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Basis Points</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          disabled={!isEditing}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">100 basis points = 1%</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fixed_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Fixed Fee ($)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          disabled={!isEditing}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">Per transaction fee in dollars</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ACH Processing Fees */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                ACH Processing Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ach_basis_points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">ACH Basis Points</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          disabled={!isEditing}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">100 basis points = 1%</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ach_fixed_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">ACH Fixed Fee ($)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          disabled={!isEditing}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">Per ACH transaction fee in dollars</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dispute Fees */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Dispute Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dispute_fixed_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Dispute Fee ($)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          disabled={!isEditing}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">Fee charged per dispute case</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dispute_inquiry_fixed_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Inquiry Fee ($)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          disabled={!isEditing}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <p className="text-xs text-slate-500">Fee charged per dispute inquiry</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

        </form>
      </Form>
    </div>
  );
};

export default FeesTab;