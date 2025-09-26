import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AddTaxSubmissionDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taxSubmissionId: string;
  onSuccess: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'tax_form', label: 'Tax Form' },
  { value: 'receipts', label: 'Receipts' },
  { value: 'supporting_document', label: 'Supporting Document' },
  { value: 'backup_calculation', label: 'Backup Calculation' },
  { value: 'other', label: 'Other' }
];

export const AddTaxSubmissionDocumentDialog: React.FC<AddTaxSubmissionDocumentDialogProps> = ({
  open,
  onOpenChange,
  taxSubmissionId,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [description, setDescription] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType || !user?.id) {
      toast({
        title: "Missing information",
        description: "Please select a file and document type",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create file path: tax-documents/userId/taxSubmissionId/timestamp-filename
      const timestamp = Date.now();
      const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${taxSubmissionId}/${timestamp}-${sanitizedFileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('tax-documents')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Insert document record
      const { error: insertError } = await supabase
        .from('tax_submission_documents')
        .insert({
          tax_submission_id: taxSubmissionId,
          uploaded_by: user.id,
          file_name: selectedFile.name,
          original_file_name: selectedFile.name,
          document_type: documentType,
          description: description || null,
          storage_path: filePath,
          file_size: selectedFile.size,
          content_type: selectedFile.type,
          status: 'confirmed'
        });

      if (insertError) {
        // If database insert fails, clean up the uploaded file
        await supabase.storage
          .from('tax-documents')
          .remove([filePath]);
        throw insertError;
      }

      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded to the tax submission"
      });

      // Reset form
      setSelectedFile(null);
      setDocumentType("");
      setDescription("");
      onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Supporting Document</DialogTitle>
          <DialogDescription>
            Upload a new document to this tax submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="document-type">Document Type *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the document"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="file-upload">Select File *</Label>
            {!selectedFile ? (
              <div className="mt-2">
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 hover:bg-muted/25 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Click to upload a file</p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 50MB)
                    </p>
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('file-upload')?.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                  className="sr-only"
                />
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeSelectedFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || !selectedFile || !documentType}>
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};