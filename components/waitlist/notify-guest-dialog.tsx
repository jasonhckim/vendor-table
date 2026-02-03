'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useWaitlistStore } from '@/lib/stores/waitlist-store';
import { useLocationStore } from '@/lib/store';
import { sendSMS, renderTemplate, getWaitlistVariables, formatPhone } from '@/lib/sms';
import { toast } from 'sonner';
import { MessageSquare, Phone, Clock, Users, Send, Loader2 } from 'lucide-react';
import type { WaitlistEntry } from '@/types';

interface NotifyGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: WaitlistEntry | null;
}

export function NotifyGuestDialog({ open, onOpenChange, entry }: NotifyGuestDialogProps) {
  const { getTemplatesByLocation, getDefaultTemplate } = useSettingsStore();
  const { notifyGuest } = useWaitlistStore();
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewMessage, setPreviewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const templates = getTemplatesByLocation(location.id).filter(
    (t) => t.type === 'waitlist-ready'
  );

  // Set default template when dialog opens
  useEffect(() => {
    if (open && entry) {
      const defaultTemplate = getDefaultTemplate(location.id, 'waitlist-ready');
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
      } else if (templates.length > 0) {
        setSelectedTemplateId(templates[0].id);
      }
    }
  }, [open, entry, location.id, getDefaultTemplate, templates]);

  // Update preview when template changes
  useEffect(() => {
    if (entry && selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        const variables = getWaitlistVariables(entry);
        setPreviewMessage(renderTemplate(template.template, variables));
      }
    }
  }, [selectedTemplateId, entry, templates]);

  const handleSend = async () => {
    if (!entry) return;

    setIsSending(true);

    try {
      const result = await sendSMS(entry.guestPhone, previewMessage);

      if (result.success) {
        notifyGuest(entry.id);
        toast.success('SMS sent successfully', {
          description: `Notified ${entry.guestName} that their table is ready`,
        });
        onOpenChange(false);
      } else {
        toast.error('Failed to send SMS', {
          description: 'Please try again or call the guest directly',
        });
      }
    } catch {
      toast.error('Failed to send SMS', {
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Notify Guest - Table Ready
          </DialogTitle>
          <DialogDescription>
            Send an SMS to let the guest know their table is ready
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Guest Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">{entry.guestName}</span>
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {entry.partySize} guests
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {formatPhone(entry.guestPhone)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Waiting {entry.quotedWaitTime} min
              </span>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Message Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                    {template.isDefault && (
                      <span className="ml-2 text-xs text-muted-foreground">(Default)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Preview */}
          <div className="space-y-2">
            <Label>Message Preview</Label>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-green-900">{previewMessage}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {previewMessage.length} characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending} className="gap-2">
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send SMS
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
