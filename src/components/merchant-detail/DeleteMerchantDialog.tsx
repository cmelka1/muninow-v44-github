import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteMerchantDialogProps {
  merchantName: string;
  merchantId: string;
  onDelete: (merchantId: string) => Promise<void>;
  isDeleting: boolean;
}

const DeleteMerchantDialog: React.FC<DeleteMerchantDialogProps> = ({
  merchantName,
  merchantId,
  onDelete,
  isDeleting,
}) => {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await onDelete(merchantId);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isDeleting}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Merchant
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Merchant</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete <strong>{merchantName}</strong>?
            </p>
            <p className="text-destructive">
              This action cannot be undone. This will permanently delete the merchant and remove all associated data.
            </p>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-semibold mb-2">The following will be checked:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Payment transactions</li>
                <li>Permit applications</li>
                <li>Service applications</li>
                <li>Business license applications</li>
                <li>Fee and payout profiles</li>
              </ul>
              <p className="mt-2 text-xs">
                If any related records exist, deletion will be blocked.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Merchant'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMerchantDialog;
