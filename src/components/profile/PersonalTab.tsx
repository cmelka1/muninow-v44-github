import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GooglePlacesAutocomplete } from '@/components/ui/google-places-autocomplete';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Save, X, User, Mail, Phone, MapPin, Building, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

// Address 2 Types (same as signup form)
const ADDRESS_2_TYPES = [
  'Apartment',
  'Suite',
  'Floor',
  'Building',
  'Room',
  'Unit',
  'Department',
  'Lot',
  'Basement',
  'Penthouse'
];

export const PersonalTab = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    streetAddress: profile?.street_address || '',
    address2Type: '',
    address2Value: '',
    city: profile?.city || '',
    state: profile?.state || '',
    zipCode: profile?.zip_code || '',
    businessName: profile?.business_legal_name || ''
  });

  useEffect(() => {
    if (profile && user) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: user.email || '',
        phone: profile.phone || '',
        streetAddress: profile.street_address || '',
        address2Type: '',
        address2Value: '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        businessName: profile.business_legal_name || ''
      });
    }
  }, [profile, user]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleAddressSelect = (addressComponents: AddressComponents) => {
    setFormData({
      ...formData,
      streetAddress: addressComponents.streetAddress,
      city: addressComponents.city,
      state: addressComponents.state,
      zipCode: addressComponents.zipCode
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          street_address: formData.streetAddress,
          apt_number: formData.address2Type && formData.address2Value 
            ? `${formData.address2Type} ${formData.address2Value.toUpperCase()}`
            : null,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          business_legal_name: formData.businessName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      streetAddress: profile?.street_address || '',
      address2Type: '',
      address2Value: '',
      city: profile?.city || '',
      state: profile?.state || '',
      zipCode: profile?.zip_code || '',
      businessName: profile?.business_legal_name || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {getInitials(formData.firstName, formData.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-slate-600">{formData.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {profile?.account_type === 'business' ? 'Business Account' : 'Resident Account'}
                </Badge>
              </div>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} size="sm" disabled={isLoading}>
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" disabled={isLoading}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-slate-700 font-medium">
                First Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-slate-700 font-medium">
                Last Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled={true}
                  className="pl-10 bg-slate-50"
                />
              </div>
              <p className="text-xs text-slate-500">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="streetAddress" className="text-slate-700 font-medium">
              Street Address
            </Label>
            {isEditing ? (
              <GooglePlacesAutocomplete
                value={formData.streetAddress}
                onChange={(value) => setFormData({...formData, streetAddress: value})}
                onAddressSelect={handleAddressSelect}
                placeholder="Start typing your address..."
                className="w-full h-11"
              />
            ) : (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  disabled={true}
                  className="pl-10"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Address 2 (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address2Type" className="text-slate-600 text-sm">Type</Label>
                {isEditing ? (
                  <Select 
                    value={formData.address2Type} 
                    onValueChange={(value) => setFormData({...formData, address2Type: value})}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDRESS_2_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.address2Type}
                      disabled={true}
                      className="pl-10"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address2Value" className="text-slate-600 text-sm">Value</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="address2Value"
                    value={formData.address2Value}
                    onChange={(e) => setFormData({...formData, address2Value: e.target.value.toUpperCase()})}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="e.g., 4B, 12A"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-slate-700 font-medium">
                City
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-slate-700 font-medium">
                State
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-slate-700 font-medium">
                ZIP Code
              </Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information (if applicable) */}
      {profile?.account_type === 'business' && (
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-slate-700 font-medium">
                Business Legal Name
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Information */}
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700 font-medium">Account Type</Label>
              <div className="mt-1">
                <Badge variant="secondary">
                  {profile?.account_type === 'business' ? 'Business' : 'Resident'}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-slate-700 font-medium">Account Created</Label>
              <div className="mt-1 text-sm text-slate-600">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
          <div>
            <Label className="text-slate-700 font-medium">User ID</Label>
            <div className="mt-1 text-sm text-slate-600 font-mono">
              {user?.id}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};