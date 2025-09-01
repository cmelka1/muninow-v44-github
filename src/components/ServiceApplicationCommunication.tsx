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

    createComment({
      application_id: applicationId,
      comment_text: newComment,
      is_internal: isInternal
    }, {
      onSuccess: () => {
        setNewComment('');
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to add comment",
          variant: "destructive"
        });
      }
    });
  };

  // Filter comments based on user role
  const filteredComments = comments?.filter(comment => {
    if (profile?.account_type === 'municipal') {
      return true; // Municipal users see all comments
    }
    return !comment.is_internal; // Regular users only see external comments
  }) || [];

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
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Loading comments...</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No comments yet</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      {comment.reviewer?.first_name} {comment.reviewer?.last_name}
                    </span>
                    {comment.is_internal && (
                      <Badge variant="secondary" className="text-xs">
                        Internal
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{comment.comment_text}</p>
              </div>
            ))
          )}
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
            />
            <Button 
              onClick={handleSubmit} 
              disabled={isPending || !newComment.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isPending ? "Adding..." : "Add Comment"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};