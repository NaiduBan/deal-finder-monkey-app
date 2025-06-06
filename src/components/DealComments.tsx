
import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Reply, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  createComment, 
  getCommentsForOffer, 
  getRepliesForComment,
  likeComment, 
  unlikeComment,
  DealComment 
} from '@/services/commentService';

interface DealCommentsProps {
  offerId: string;
}

const DealComments: React.FC<DealCommentsProps> = ({ offerId }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, [offerId]);

  const loadComments = async () => {
    try {
      const data = await getCommentsForOffer(offerId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to comment",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await createComment({
        user_id: session.user.id,
        offer_id: offerId,
        comment_text: newComment.trim()
      });

      setNewComment('');
      loadComments();
      toast({
        title: "Comment added",
        description: "Your comment has been posted!"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to reply",
        variant: "destructive"
      });
      return;
    }

    if (!replyText.trim()) return;

    setLoading(true);
    try {
      await createComment({
        user_id: session.user.id,
        offer_id: offerId,
        comment_text: replyText.trim(),
        parent_comment_id: parentId
      });

      setReplyText('');
      setReplyingTo(null);
      loadComments();
      toast({
        title: "Reply added",
        description: "Your reply has been posted!"
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!session?.user) {
      toast({
        title: "Login required",
        description: "Please login to like comments",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        await unlikeComment(commentId);
      } else {
        await likeComment(commentId);
      }
      loadComments();
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({comments.length})
          </h3>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts about this deal..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-20"
            />
            <Button
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
              size="sm"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-l-2 border-gray-100 pl-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback>
                      {comment.profiles?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">
                          {comment.profiles?.name || 'Anonymous User'}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Report Comment</DropdownMenuItem>
                          {session?.user?.id === comment.user_id && (
                            <DropdownMenuItem>Delete Comment</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-sm text-gray-700 mt-1">
                      {comment.comment_text}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleLikeComment(comment.id, false)} // TODO: track if user already liked
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
                      >
                        <Heart className="w-3 h-3" />
                        {comment.likes_count || 0}
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        <Reply className="w-3 h-3" />
                        Reply
                      </button>
                    </div>
                    
                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="min-h-16 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddReply(comment.id)}
                            disabled={loading || !replyText.trim()}
                            size="sm"
                            variant="outline"
                          >
                            {loading ? 'Posting...' : 'Reply'}
                          </Button>
                          <Button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealComments;
