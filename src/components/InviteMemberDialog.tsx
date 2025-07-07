import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface InviteMemberDialogProps {
  onInvite: (email: string, role: 'admin' | 'user', organizationType: 'resident' | 'business' | 'municipal') => Promise<boolean>;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({ onInvite }) => {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !profile?.account_type) return;
    
    setIsSubmitting(true);
    
    const success = await onInvite(
      email.trim(), 
      role, 
      profile.account_type as 'resident' | 'business' | 'municipal'
    );
    
    if (success) {
      setEmail('');
      setRole('user');
      setOpen(false);
    }
    
    setIsSubmitting(false);
  };

  const organizationType = profile?.account_type as 'resident' | 'business' | 'municipal';
  const getOrganizationLabel = () => {
    switch (organizationType) {
      case 'resident': return 'household';
      case 'business': return 'team';
      case 'municipal': return 'organization';
      default: return 'organization';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite {getOrganizationLabel()} member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: 'admin' | 'user') => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !email.trim()}>
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};