import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Save, DollarSign } from 'lucide-react';

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
  finix_application_id: string | null;
  basis_points: number;
  fixed_fee: number;
  ach_basis_points: number;
  ach_fixed_fee: number;
  ach_basis_points_fee_limit: number | null;
  ach_credit_return_fixed_fee: number;
  ach_debit_return_fixed_fee: number;
  dispute_fixed_fee: number;
  dispute_inquiry_fixed_fee: number;
  sync_status: 'pending' | 'synced' | 'error';
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

const FeesTab: React.FC<FeesTabProps> = ({ merchant }) => {
  const [feeProfile, setFeeProfile] = useState<FeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<FeeProfile>>({});
  const { hasRole } = useUserRole();
  const { toast } = useToast();

  const isSuperAdmin = hasRole('superAdmin');

  useEffect(() => {
    fetchFeeProfile();
  }, [merchant.id]);

  const fetchFeeProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('merchant_fee_profiles')
        .select('*')
        .eq('merchant_id', merchant.id)
        .maybeSingle();

      if (error) throw error;
      
      setFeeProfile(data);
      if (data) {
        setFormData(data);
      } else {
        // Set default values for new fee profile
        setFormData({
          basis_points: 290,
          fixed_fee: 30,
          ach_basis_points: 20,
          ach_fixed_fee: 30,
          ach_basis_points_fee_limit: 500,
          ach_credit_return_fixed_fee: 0,
          ach_debit_return_fixed_fee: 0,
          dispute_fixed_fee: 1500,
          dispute_inquiry_fixed_fee: 1500,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load fee profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super administrators can manage fee profiles",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      if (feeProfile) {
        // Update existing fee profile
        const { data, error } = await supabase.functions.invoke('update-merchant-fee-profile', {
          body: { 
            merchantId: merchant.id,
            profileData: formData 
          }
        });
        if (error) throw error;
        setFeeProfile(data);
      } else {
        // Create new fee profile
        const { data, error } = await supabase.functions.invoke('create-merchant-fee-profile', {
          body: { 
            merchantId: merchant.id,
            profileData: formData 
          }
        });
        if (error) throw error;
        setFeeProfile(data);
      }

      setIsEditing(false);
      toast({
        title: "Success",
        description: `Fee profile ${feeProfile ? 'updated' : 'created'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save fee profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof FeeProfile, value: string) => {
    const numericValue = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numericValue }));
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatBasisPoints = (bps: number) => {
    return `${(bps / 100).toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fee Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fee Profile</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">Access Restricted</p>
            <p>Only super administrators can view and manage fee profiles.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fee Profile</CardTitle>
          {feeProfile && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={feeProfile.sync_status === 'synced' ? 'default' : 
                           feeProfile.sync_status === 'error' ? 'destructive' : 'secondary'}>
                {feeProfile.sync_status}
              </Badge>
              {feeProfile.finix_fee_profile_id && (
                <Badge variant="outline">ID: {feeProfile.finix_fee_profile_id}</Badge>
              )}
            </div>
          )}
        </div>
        {feeProfile ? (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(feeProfile);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Fee Profile
              </Button>
            )}
          </div>
        ) : (
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Creating...' : 'Create Fee Profile'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Card Processing Fees */}
        <div>
          <h3 className="text-lg font-medium mb-4">Card Processing Fees</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basis_points">Basis Points</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="basis_points"
                    type="number"
                    value={formData.basis_points || 0}
                    onChange={(e) => handleInputChange('basis_points', e.target.value)}
                    placeholder="290"
                  />
                  <span className="text-sm text-muted-foreground">bps</span>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {formatBasisPoints(formData.basis_points || 0)} ({formData.basis_points || 0} basis points)
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixed_fee">Fixed Fee</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="fixed_fee"
                    type="number"
                    value={formData.fixed_fee || 0}
                    onChange={(e) => handleInputChange('fixed_fee', e.target.value)}
                    placeholder="30"
                  />
                  <span className="text-sm text-muted-foreground">cents</span>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {formatCurrency(formData.fixed_fee || 0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACH Processing Fees */}
        <div>
          <h3 className="text-lg font-medium mb-4">ACH Processing Fees</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ach_basis_points">ACH Basis Points</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="ach_basis_points"
                    type="number"
                    value={formData.ach_basis_points || 0}
                    onChange={(e) => handleInputChange('ach_basis_points', e.target.value)}
                    placeholder="20"
                  />
                  <span className="text-sm text-muted-foreground">bps</span>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {formatBasisPoints(formData.ach_basis_points || 0)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ach_fixed_fee">ACH Fixed Fee</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="ach_fixed_fee"
                    type="number"
                    value={formData.ach_fixed_fee || 0}
                    onChange={(e) => handleInputChange('ach_fixed_fee', e.target.value)}
                    placeholder="30"
                  />
                  <span className="text-sm text-muted-foreground">cents</span>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {formatCurrency(formData.ach_fixed_fee || 0)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ach_basis_points_fee_limit">ACH Fee Limit</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="ach_basis_points_fee_limit"
                    type="number"
                    value={formData.ach_basis_points_fee_limit || 0}
                    onChange={(e) => handleInputChange('ach_basis_points_fee_limit', e.target.value)}
                    placeholder="500"
                  />
                  <span className="text-sm text-muted-foreground">cents</span>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {formatCurrency(formData.ach_basis_points_fee_limit || 0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Return Fees */}
        <div>
          <h3 className="text-lg font-medium mb-4">Return Fees</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ach_credit_return_fixed_fee">ACH Credit Return Fee</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="ach_credit_return_fixed_fee"
                    type="number"
                    value={formData.ach_credit_return_fixed_fee || 0}
                    onChange={(e) => handleInputChange('ach_credit_return_fixed_fee', e.target.value)}
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground">cents</span>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {formatCurrency(formData.ach_credit_return_fixed_fee || 0)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ach_debit_return_fixed_fee">ACH Debit Return Fee</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="ach_debit_return_fixed_fee"
                    type="number"
                    value={formData.ach_debit_return_fixed_fee || 0}
                    onChange={(e) => handleInputChange('ach_debit_return_fixed_fee', e.target.value)}
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground">cents</span>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {formatCurrency(formData.ach_debit_return_fixed_fee || 0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dispute Fees */}
        <div>
          <h3 className="text-lg font-medium mb-4">Dispute Fees</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dispute_fixed_fee">Dispute Fee</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="dispute_fixed_fee"
                    type="number"
                    value={formData.dispute_fixed_fee || 0}
                    onChange={(e) => handleInputChange('dispute_fixed_fee', e.target.value)}
                    placeholder="1500"
                  />
                  <span className="text-sm text-muted-foreground">cents</span>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {formatCurrency(formData.dispute_fixed_fee || 0)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispute_inquiry_fixed_fee">Dispute Inquiry Fee</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="dispute_inquiry_fixed_fee"
                    type="number"
                    value={formData.dispute_inquiry_fixed_fee || 0}
                    onChange={(e) => handleInputChange('dispute_inquiry_fixed_fee', e.target.value)}
                    placeholder="1500"
                  />
                  <span className="text-sm text-muted-foreground">cents</span>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {formatCurrency(formData.dispute_inquiry_fixed_fee || 0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {feeProfile && feeProfile.last_synced_at && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Last synced: {new Date(feeProfile.last_synced_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeesTab;