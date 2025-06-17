
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  MessageSquare, 
  Users, 
  Send, 
  X,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsProps {
  selectedUsers: string[];
  onClose: () => void;
  onAction: (action: string, data: any) => void;
}

const AdminBulkActions = ({ selectedUsers, onClose, onAction }: BulkActionsProps) => {
  const [actionType, setActionType] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');

  const handleSubmit = async () => {
    if (!actionType) {
      toast.error('Please select an action type');
      return;
    }

    let actionData = {};

    switch (actionType) {
      case 'email':
        if (!emailSubject || !emailMessage) {
          toast.error('Please fill in email subject and message');
          return;
        }
        actionData = { subject: emailSubject, message: emailMessage };
        break;
      case 'notification':
        if (!notificationTitle || !notificationMessage) {
          toast.error('Please fill in notification title and message');
          return;
        }
        actionData = { title: notificationTitle, message: notificationMessage };
        break;
      case 'points':
        if (!pointsAmount || !pointsReason) {
          toast.error('Please fill in points amount and reason');
          return;
        }
        actionData = { amount: parseInt(pointsAmount), reason: pointsReason };
        break;
    }

    await onAction(actionType, actionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Bulk Actions</span>
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary">
                {selectedUsers.length} users selected
              </Badge>
            </div>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label>Action Type</Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Send Email</SelectItem>
                <SelectItem value="notification">Send Notification</SelectItem>
                <SelectItem value="points">Award Points</SelectItem>
                <SelectItem value="export">Export Users</SelectItem>
                <SelectItem value="suspend">Suspend Accounts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {actionType === 'email' && (
            <div className="space-y-4">
              <div>
                <Label>Email Subject</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <Label>Email Message</Label>
                <Textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter email message"
                  rows={6}
                />
              </div>
            </div>
          )}

          {actionType === 'notification' && (
            <div className="space-y-4">
              <div>
                <Label>Notification Title</Label>
                <Input
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <Label>Notification Message</Label>
                <Textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter notification message"
                  rows={4}
                />
              </div>
            </div>
          )}

          {actionType === 'points' && (
            <div className="space-y-4">
              <div>
                <Label>Points Amount</Label>
                <Input
                  type="number"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  placeholder="Enter points amount"
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Input
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  placeholder="Reason for awarding points"
                />
              </div>
            </div>
          )}

          {actionType === 'export' && (
            <div className="text-center py-8">
              <Download className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                Selected users will be exported to CSV format
              </p>
            </div>
          )}

          {actionType === 'suspend' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-700 mb-2">
                <X className="h-5 w-5" />
                <span className="font-medium">Warning</span>
              </div>
              <p className="text-red-600 text-sm">
                This action will suspend all selected user accounts. They will not be able to access the platform until reactivated.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!actionType}>
              <Send className="h-4 w-4 mr-2" />
              Execute Action
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBulkActions;
