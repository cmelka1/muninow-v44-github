import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, FileText, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TaxDocument {
  id?: string;
  file: File;
  documentType: string;
  description: string;
  uploaded?: boolean;
  storagePath?: string;
}

interface TaxDocumentUploadProps {
  documents: TaxDocument[];
  onDocumentsChange: (documents: TaxDocument[]) => void;
  disabled?: boolean;
  taxSubmissionId?: string;
}

const DOCUMENT_TYPES = [
  { value: 'tax_form', label: 'Tax Form' },
  { value: 'receipts', label: 'Receipts' },
  { value: 'supporting_document', label: 'Supporting Document' },
  { value: 'backup_calculation', label: 'Backup Calculation' },
  { value: 'other', label: 'Other' }
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif'
];

export const TaxDocumentUpload: React.FC<TaxDocumentUploadProps> = ({
  documents,
  onDocumentsChange,
  disabled = false,
  taxSubmissionId
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload PDF, DOC, DOCX, XLS, XLSX, or image files.';
    }
    
    return null;
  };

  const generateStoragePath = (userId: string, fileName: string): string => {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${userId}/${timestamp}_${sanitizedFileName}`;
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    const storagePath = generateStoragePath(user.id, file.name);
    
    const { error } = await supabase.storage
      .from('tax-documents')
      .upload(storagePath, file);
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    return storagePath;
  };

  const saveDocumentRecord = async (
    file: File,
    storagePath: string,
    documentType: string,
    description: string
  ): Promise<void> => {
    if (!user || !taxSubmissionId) return;
    
    const { error } = await supabase
      .from('tax_submission_documents')
      .insert({
        tax_submission_id: taxSubmissionId,
        document_type: documentType,
        file_name: storagePath.split('/')[1], // Remove user folder prefix
        original_file_name: file.name,
        content_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        description: description || null,
        uploaded_by: user.id
      });
    
    if (error) {
      throw new Error(`Failed to save document record: ${error.message}`);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (disabled || uploading) return;
    
    setUploading(true);
    const newDocuments: TaxDocument[] = [];
    
    try {
      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          toast({
            title: 'File validation failed',
            description: `${file.name}: ${error}`,
            variant: 'destructive'
          });
          continue;
        }
        
        // For now, add files to the list without uploading to storage
        // Upload will happen when the tax submission is created
        newDocuments.push({
          file,
          documentType: 'supporting_document',
          description: '',
          uploaded: false
        });
      }
      
      onDocumentsChange([...documents, ...newDocuments]);
      
      if (newDocuments.length > 0) {
        toast({
          title: 'Files added',
          description: `${newDocuments.length} file(s) added successfully.`
        });
      }
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
    
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  };

  const removeDocument = (index: number) => {
    if (disabled) return;
    
    const updatedDocuments = documents.filter((_, i) => i !== index);
    onDocumentsChange(updatedDocuments);
  };

  const updateDocument = (index: number, updates: Partial<TaxDocument>) => {
    if (disabled) return;
    
    const updatedDocuments = documents.map((doc, i) => 
      i === index ? { ...doc, ...updates } : doc
    );
    onDocumentsChange(updatedDocuments);
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Supporting Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, DOC, DOCX, XLS, XLSX, or images (max 50MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />
        </div>

        {/* Document List */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Uploaded Documents</Label>
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex-shrink-0 mt-1">
                  {getFileIcon(doc.file.type)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{doc.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file.size)}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      disabled={disabled}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`doc-type-${index}`} className="text-xs">
                        Document Type
                      </Label>
                      <Select
                        value={doc.documentType}
                        onValueChange={(value) => updateDocument(index, { documentType: value })}
                        disabled={disabled}
                      >
                        <SelectTrigger id={`doc-type-${index}`} className="h-8 text-xs">
                          <SelectValue />
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
                      <Label htmlFor={`doc-desc-${index}`} className="text-xs">
                        Description (Optional)
                      </Label>
                      <Input
                        id={`doc-desc-${index}`}
                        placeholder="Brief description"
                        value={doc.description}
                        onChange={(e) => updateDocument(index, { description: e.target.value })}
                        disabled={disabled}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};