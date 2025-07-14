import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Users, UserCheck } from "lucide-react";

interface BillNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: any;
  onNotificationSent: () => void;
}

export function BillNotificationDialog({
  open,
  onOpenChange,
  bill,
  onNotificationSent,
}: BillNotificationDialogProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<string>("email");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const handleSendNotification = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-bill-notification', {
        body: {
          billId: bill.bill_id,
          deliveryMethod,
          messageSubject: deliveryMethod !== 'in_person_visit' ? messageSubject : undefined,
          messageBody: deliveryMethod !== 'in_person_visit' ? messageBody : undefined,
          visitNotes: deliveryMethod === 'in_person_visit' ? visitNotes : undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        onNotificationSent();
        onOpenChange(false);
        
        // Reset form
        setMessageSubject("");
        setMessageBody("");
        setVisitNotes("");
        setDeliveryMethod("email");
      } else {
        throw new Error(data?.message || "Failed to send notification");
      }
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Bill Notification</DialogTitle>
          <DialogDescription>
            Choose how to notify the customer about this bill.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Details Preview */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Bill Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Bill #:</span>{" "}
                {bill.external_bill_number}
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>{" "}
                {formatCurrency(bill.amount_due_cents)}
              </div>
              <div>
                <span className="text-muted-foreground">Due Date:</span>{" "}
                {formatDate(bill.due_date)}
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <span className="capitalize">{bill.bill_status || "unpaid"}</span>
              </div>
            </div>
          </div>

          {/* Delivery Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Delivery Method</Label>
            <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Both Email & SMS
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in_person_visit" id="in_person_visit" />
                <Label htmlFor="in_person_visit" className="flex items-center gap-2 cursor-pointer">
                  <UserCheck className="h-4 w-4" />
                  In-Person Visit
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Message Content or Visit Notes */}
          {deliveryMethod === 'in_person_visit' ? (
            <div className="space-y-2">
              <Label htmlFor="visitNotes">Visit Notes</Label>
              <Textarea
                id="visitNotes"
                placeholder="Enter notes about the in-person visit..."
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Input
                  id="subject"
                  placeholder={`Bill Notification - ${bill.external_bill_number}`}
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Enter a custom message or leave blank for default bill notification..."
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendNotification} disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : deliveryMethod === 'in_person_visit'
              ? "Log Visit"
              : "Send Notification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}