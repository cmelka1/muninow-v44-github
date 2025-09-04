import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Edit2, Save, X, Plus, Trash2, GripVertical } from 'lucide-react';
import { useMunicipalPermitQuestions } from '@/hooks/useMunicipalPermitQuestions';
import {
  useCreateMunicipalPermitQuestion,
  useUpdateMunicipalPermitQuestion,
  useDeleteMunicipalPermitQuestion,
} from '@/hooks/useMunicipalPermitQuestionsMutations';
import { useMerchants } from '@/hooks/useMerchants';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { supabase } from '@/integrations/supabase/client';

const QUESTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Multiple Choice' },
  { value: 'date', label: 'Date' },
];

interface EditableQuestionFieldProps {
  value: string | number | boolean;
  onChange: (value: any) => void;
  type: 'text' | 'textarea' | 'boolean' | 'select';
  options?: Array<{ value: string; label: string }>;
  isEditMode: boolean;
}

const EditableQuestionField: React.FC<EditableQuestionFieldProps> = ({
  value,
  onChange,
  type,
  options,
  isEditMode
}) => {
  if (!isEditMode) {
    if (type === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
    }
    return <span className="text-sm">{String(value)}</span>;
  }

  if (type === 'boolean') {
    return (
      <Switch
        checked={value as boolean}
        onCheckedChange={onChange}
      />
    );
  }

  if (type === 'textarea') {
    return (
      <Textarea
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[80px]"
      />
    );
  }

  if (type === 'select' && options) {
    return (
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
};

const NewQuestionRow: React.FC<{
  merchants: any[];
  onAdd: (question: any) => void;
  nextDisplayOrder: number;
}> = ({ merchants, onAdd, nextDisplayOrder }) => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('text');
  const [isRequired, setIsRequired] = useState(false);
  const [merchantId, setMerchantId] = useState('all');
  const [helpText, setHelpText] = useState('');

  const handleAdd = () => {
    if (!questionText.trim()) return;

    onAdd({
      question_text: questionText,
      question_type: questionType,
      is_required: isRequired,
      merchant_id: merchantId === 'all' ? null : merchantId,
      help_text: helpText || null,
      display_order: nextDisplayOrder,
      is_active: true,
    });

    // Reset form
    setQuestionText('');
    setQuestionType('text');
    setIsRequired(false);
    setMerchantId('all');
    setHelpText('');
  };

  return (
    <TableRow className="bg-muted/50">
      <TableCell>
        <Input
          placeholder="Enter question text..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full"
        />
      </TableCell>
      <TableCell>
        <Select value={questionType} onValueChange={setQuestionType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-center">
        <Switch
          checked={isRequired}
          onCheckedChange={setIsRequired}
        />
      </TableCell>
      <TableCell>
        <Select value={merchantId} onValueChange={setMerchantId}>
          <SelectTrigger>
            <SelectValue placeholder="All Merchants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Merchants</SelectItem>
            {merchants.map(merchant => (
              <SelectItem key={merchant.id} value={merchant.id}>
                {merchant.merchant_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge variant="default">Yes</Badge>
      </TableCell>
      <TableCell>
        <Button 
          onClick={handleAdd} 
          size="sm" 
          disabled={!questionText.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export const PermitQuestionsCard: React.FC = () => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [changes, setChanges] = useState<Record<string, any>>({});

  // Get customer ID from user profile
  const [customerId, setCustomerId] = useState<string | undefined>();

  React.useEffect(() => {
    const fetchCustomerId = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.customer_id) {
        setCustomerId(profile.customer_id);
      }
    };

    fetchCustomerId();
  }, [user]);

  const { data: questions = [], isLoading } = useMunicipalPermitQuestions(customerId);
  const { merchants } = useMerchants();
  
  const createMutation = useCreateMunicipalPermitQuestion();
  const updateMutation = useUpdateMunicipalPermitQuestion();
  const deleteMutation = useDeleteMunicipalPermitQuestion();

  const handleFieldChange = (questionId: string, field: string, value: any) => {
    setChanges(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      }
    }));
  };

  const getFieldValue = (question: any, field: string) => {
    return changes[question.id]?.[field] !== undefined 
      ? changes[question.id][field] 
      : question[field];
  };

  const handleSave = async () => {
    try {
      const updatePromises = Object.entries(changes).map(([questionId, questionChanges]) => 
        updateMutation.mutateAsync({ id: questionId, ...questionChanges })
      );

      await Promise.all(updatePromises);
      setChanges({});
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleCancel = () => {
    setChanges({});
    setIsEditMode(false);
  };

  const handleAddQuestion = async (questionData: any) => {
    try {
      await createMutation.mutateAsync(questionData);
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteMutation.mutateAsync(questionId);
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const nextDisplayOrder = Math.max(0, ...questions.map(q => q.display_order)) + 1;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permit Questions</CardTitle>
          <CardDescription>Loading questions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Permit Questions</CardTitle>
            <CardDescription>
              Configure custom questions for permit applications
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={Object.keys(changes).length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditMode(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Questions
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Required</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <EditableQuestionField
                    value={getFieldValue(question, 'question_text')}
                    onChange={(value) => handleFieldChange(question.id, 'question_text', value)}
                    type="textarea"
                    isEditMode={isEditMode}
                  />
                </TableCell>
                <TableCell>
                  <EditableQuestionField
                    value={getFieldValue(question, 'question_type')}
                    onChange={(value) => handleFieldChange(question.id, 'question_type', value)}
                    type="select"
                    options={QUESTION_TYPES}
                    isEditMode={isEditMode}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <EditableQuestionField
                    value={getFieldValue(question, 'is_required')}
                    onChange={(value) => handleFieldChange(question.id, 'is_required', value)}
                    type="boolean"
                    isEditMode={isEditMode}
                  />
                </TableCell>
                <TableCell>
                  {question.merchant_name || 'All Merchants'}
                </TableCell>
                <TableCell>
                  <EditableQuestionField
                    value={getFieldValue(question, 'is_active')}
                    onChange={(value) => handleFieldChange(question.id, 'is_active', value)}
                    type="boolean"
                    isEditMode={isEditMode}
                  />
                </TableCell>
                <TableCell className="text-center">
                  {isEditMode && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Question</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this question? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteQuestion(question.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {isEditMode && (
              <NewQuestionRow
                merchants={merchants}
                onAdd={handleAddQuestion}
                nextDisplayOrder={nextDisplayOrder}
              />
            )}
          </TableBody>
        </Table>
        
        {questions.length === 0 && !isEditMode && (
          <div className="text-center py-8 text-muted-foreground">
            No permit questions configured. Click "Edit Questions" to add some.
          </div>
        )}
      </CardContent>
    </Card>
  );
};