import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ServiceApplicationStatus, 
  getStatusDisplayName, 
  getStatusDescription, 
  getValidStatusTransitions, 
  useServiceApplicationWorkflow 
} from '@/hooks/useServiceApplicationWorkflow';

interface ServiceApplicationStatusChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  currentStatus: ServiceApplicationStatus;
  onStatusChange?: () => void;
}

export const ServiceApplicationStatusChangeDialog: React.FC<ServiceApplicationStatusChangeDialogProps> = ({
  isOpen,
  onClose,
  applicationId,
  currentStatus,
  onStatusChange
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ServiceApplicationStatus | ''>('');
  const [reason, setReason] = useState('');
  const { updateApplicationStatus, isUpdating } = useServiceApplicationWorkflow();

  const validTransitions = getValidStatusTransitions(currentStatus);

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    const success = await updateApplicationStatus(
      applicationId,
      selectedStatus as ServiceApplicationStatus,
      reason.trim() || undefined
    );

    if (success) {
      onStatusChange?.();
      onClose();
      setSelectedStatus('');
      setReason('');
    }
  };

  const requiresReason = selectedStatus === 'denied' || selectedStatus === 'information_requested';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
            <div className="mt-1">
              <Badge variant="outline">{getStatusDisplayName(currentStatus)}</Badge>
            </div>
          </div>

          <div>
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ServiceApplicationStatus | '')}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {validTransitions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusDisplayName(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStatus && (
              <p className="text-xs text-muted-foreground mt-1">
                {getStatusDescription(selectedStatus as ServiceApplicationStatus)}
              </p>
            )}
          </div>

          {selectedStatus && (
            <div>
              <Label htmlFor="reason">
                {requiresReason ? 'Reason (Required)' : 'Notes (Optional)'}
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  selectedStatus === 'denied' 
                    ? 'Please explain why the application was denied...'
                    : selectedStatus === 'information_requested'
                    ? 'Please specify what additional information is needed...'
                    : 'Add any notes about this status change...'
                }
                className="mt-1"
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedStatus || (requiresReason && !reason.trim()) || isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};