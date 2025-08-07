import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MunicipalityAutocomplete } from '@/components/ui/municipality-autocomplete';
import { useToast } from '@/hooks/use-toast';

interface PayTaxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectedMunicipality {
  customer_id: string;
  legal_entity_name: string;
  doing_business_as: string;
  business_city: string;
  business_state: string;
}

export const PayTaxDialog: React.FC<PayTaxDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [selectedMunicipality, setSelectedMunicipality] = useState<SelectedMunicipality | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedMunicipality) e.municipality = 'Municipality is required';
    if (!accountNumber.trim()) e.accountNumber = 'Account or tax number is required';
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount greater than 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // Placeholder for future payment flow
      toast({
        title: 'Pay Tax form ready',
        description: 'Payment flow will be connected next. Your details are captured.',
      });
      onOpenChange(false);
      // Reset form
      setSelectedMunicipality(null);
      setAccountNumber('');
      setAmount('');
      setMemo('');
      setErrors({});
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Pay Tax</DialogTitle>
          <DialogDescription>Enter your details to proceed with a tax payment.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Municipality</Label>
            <MunicipalityAutocomplete
              onSelect={(m) => setSelectedMunicipality(m as SelectedMunicipality)}
              placeholder="Search your municipality"
            />
            {errors.municipality && <p className="text-sm text-destructive">{errors.municipality}</p>}
          </div>

          <div className="space-y-2">
            <Label>Account / Tax Number</Label>
            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="e.g., Property ID, Tax ID" />
            {errors.accountNumber && <p className="text-sm text-destructive">{errors.accountNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <Input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label>Memo (optional)</Label>
            <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Add any notes for this payment" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
