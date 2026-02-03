'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useLocationStore } from '@/lib/store';
import { toast } from 'sonner';
import { Bell, MessageSquare, Edit2, Trash2, Star, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SMSTemplate, SMSTemplateType } from '@/types';

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const templateTypeLabels: Record<SMSTemplateType, string> = {
  'waitlist-ready': 'Table Ready',
  'reservation-confirm': 'Confirmation',
  'reservation-reminder': 'Reminder',
  'custom': 'Custom',
};

const templateTypeColors: Record<SMSTemplateType, string> = {
  'waitlist-ready': 'bg-green-100 text-green-700',
  'reservation-confirm': 'bg-blue-100 text-blue-700',
  'reservation-reminder': 'bg-amber-100 text-amber-700',
  'custom': 'bg-gray-100 text-gray-700',
};

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();
  const { getTemplatesByLocation, updateTemplate, deleteTemplate, setDefaultTemplate, addTemplate } = useSettingsStore();

  const templates = getTemplatesByLocation(location.id);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTemplate, setEditTemplate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [newType] = useState<SMSTemplateType>('custom');

  const handleEdit = (template: SMSTemplate) => {
    setEditingId(template.id);
    setEditName(template.name);
    setEditTemplate(template.template);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim() || !editTemplate.trim()) return;

    updateTemplate(editingId, {
      name: editName.trim(),
      template: editTemplate.trim(),
    });

    setEditingId(null);
    toast.success('Template updated');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditTemplate('');
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    toast.info('Template deleted');
  };

  const handleSetDefault = (id: string) => {
    setDefaultTemplate(id);
    toast.success('Default template updated');
  };

  const handleAddTemplate = () => {
    if (!newName.trim() || !newTemplate.trim()) return;

    addTemplate({
      locationId: location.id,
      name: newName.trim(),
      template: newTemplate.trim(),
      type: newType,
      isDefault: false,
    });

    setNewName('');
    setNewTemplate('');
    setShowAddForm(false);
    toast.success('Template added');
  };

  // Group templates by type
  const templatesByType = Object.entries(templateTypeLabels).map(([type, label]) => ({
    type: type as SMSTemplateType,
    label,
    templates: templates.filter((t) => t.type === type),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            SMS Notifications
          </DialogTitle>
          <DialogDescription>
            Manage SMS templates for {location.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Variables Help */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Available variables:</p>
            <div className="flex flex-wrap gap-2">
              <code className="bg-background px-2 py-0.5 rounded">{'{{guestName}}'}</code>
              <code className="bg-background px-2 py-0.5 rounded">{'{{partySize}}'}</code>
              <code className="bg-background px-2 py-0.5 rounded">{'{{time}}'}</code>
              <code className="bg-background px-2 py-0.5 rounded">{'{{date}}'}</code>
              <code className="bg-background px-2 py-0.5 rounded">{'{{waitTime}}'}</code>
            </div>
          </div>

          {/* Add Template Form */}
          {showAddForm ? (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
              <h4 className="font-medium">Add New Template</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., VIP Table Ready"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message Template</Label>
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border bg-background resize-none"
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    placeholder="Hi {{guestName}}! Your table is ready..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {newTemplate.length} characters
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddTemplate}
                  disabled={!newName.trim() || !newTemplate.trim()}
                >
                  Add Template
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          )}

          {/* Templates by Type */}
          {templatesByType.map(({ type, label, templates: typeTemplates }) => (
            typeTemplates.length > 0 && (
              <div key={type} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={templateTypeColors[type]}>{label}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {typeTemplates.length} template{typeTemplates.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {typeTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={cn(
                        'border rounded-lg p-4',
                        template.isDefault && 'border-primary bg-primary/5'
                      )}
                    >
                      {editingId === template.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Template name"
                          />
                          <textarea
                            className="w-full min-h-[80px] px-3 py-2 rounded-md border bg-background resize-none"
                            value={editTemplate}
                            onChange={(e) => setEditTemplate(e.target.value)}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{template.name}</span>
                              {template.isDefault && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <Star className="h-3 w-3 fill-primary text-primary" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {!template.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetDefault(template.id)}
                                  className="text-xs"
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(template)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(template.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="bg-muted/50 rounded p-3 text-sm">
                            <MessageSquare className="inline h-3 w-3 mr-2 text-muted-foreground" />
                            {template.template}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {template.template.length} characters
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
