import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  const { updateApplicationStatus, isUpdating } = useServiceApplicationWorkflow();

  const validTransitions = getValidStatusTransitions(currentStatus);

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    const success = await updateApplicationStatus(
      applicationId,
      selectedStatus as ServiceApplicationStatus
    );

    if (success) {
      onStatusChange?.();
      onClose();
      setSelectedStatus('');
    }
  };

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

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedStatus || isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};