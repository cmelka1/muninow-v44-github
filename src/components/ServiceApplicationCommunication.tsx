import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User } from 'lucide-react';
import { useServiceApplicationComments, useCreateServiceApplicationComment } from '@/hooks/useServiceApplicationComments';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ServiceApplicationCommunicationProps {
  applicationId: string;
}

export const ServiceApplicationCommunication: React.FC<ServiceApplicationCommunicationProps> = ({
  applicationId
}) => {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const { profile } = useAuth();
  const { data: comments, isLoading } = useServiceApplicationComments(applicationId);
  const { mutate: createComment, isPending } = useCreateServiceApplicationComment();

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive"
      });
      return;
    }

    // Temporarily disabled until database types are updated
    toast({
      title: "Feature Coming Soon",
      description: "Comments will be available once the database is updated",
      variant: "default"
    });
  };

  // Return empty array for now
  const filteredComments: any[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication ({filteredComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <div className="text-center py-4 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Comments feature coming soon</p>
          </div>
        </div>

        {/* Add Comment Form - Only for municipal users */}
        {profile?.account_type === 'municipal' && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant={isInternal ? "default" : "outline"}
                size="sm"
                onClick={() => setIsInternal(true)}
              >
                Internal
              </Button>
              <Button
                variant={!isInternal ? "default" : "outline"}
                size="sm"
                onClick={() => setIsInternal(false)}
              >
                External
              </Button>
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isInternal ? "Add internal note..." : "Add comment for applicant..."}
              rows={3}
              disabled
            />
            <Button 
              onClick={handleSubmit} 
              disabled
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};