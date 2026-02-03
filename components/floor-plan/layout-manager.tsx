'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useLayoutStore } from '@/lib/stores/layout-store';
import { useTableStore } from '@/lib/stores/table-store';
import { format } from 'date-fns';
import {
  Save,
  Trash2,
  Star,
  Check,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { LocationId, FloorLayout } from '@/types';

interface LayoutManagerProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: LocationId;
  mode: 'save' | 'load';
}

export function LayoutManager({
  isOpen,
  onClose,
  locationId,
  mode,
}: LayoutManagerProps) {
  const [layoutName, setLayoutName] = useState('');
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);

  const {
    saveLayout,
    deleteLayout,
    setDefaultLayout,
    getLayoutsByLocation,
    getLayout,
  } = useLayoutStore();

  const {
    getTablesByLocation,
    bulkUpdatePositions,
  } = useTableStore();

  const layouts = getLayoutsByLocation(locationId);
  const tables = getTablesByLocation(locationId);

  const handleSave = () => {
    if (!layoutName.trim()) {
      toast.error('Please enter a layout name');
      return;
    }

    const tablePositions = tables.map((table) => ({
      tableId: table.id,
      position: table.position,
    }));

    saveLayout(layoutName.trim(), locationId, tablePositions);
    toast.success('Layout saved', {
      description: `"${layoutName}" has been saved`,
    });
    setLayoutName('');
    onClose();
  };

  const handleLoad = () => {
    if (!selectedLayoutId) {
      toast.error('Please select a layout');
      return;
    }

    const layout = getLayout(selectedLayoutId);
    if (!layout) return;

    // Apply positions from layout to tables
    bulkUpdatePositions(layout.tables);

    toast.success('Layout loaded', {
      description: `"${layout.name}" has been applied`,
    });
    onClose();
  };

  const handleDelete = (layoutId: string) => {
    const layout = getLayout(layoutId);
    deleteLayout(layoutId);
    toast.success('Layout deleted', {
      description: `"${layout?.name}" has been removed`,
    });

    if (selectedLayoutId === layoutId) {
      setSelectedLayoutId(null);
    }
  };

  const handleSetDefault = (layoutId: string) => {
    setDefaultLayout(layoutId);
    const layout = getLayout(layoutId);
    toast.success('Default layout set', {
      description: `"${layout?.name}" is now the default`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'save' ? 'Save Layout' : 'Load Layout'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save'
              ? 'Save the current table arrangement as a layout'
              : 'Load a previously saved table arrangement'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'save' && (
            <div className="space-y-2">
              <Label htmlFor="layout-name">Layout Name</Label>
              <Input
                id="layout-name"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="e.g., Weekend Setup, Private Event"
              />
            </div>
          )}

          {/* Existing Layouts */}
          {layouts.length > 0 && (
            <div className="space-y-2">
              <Label>
                {mode === 'save' ? 'Existing Layouts' : 'Available Layouts'}
              </Label>
              <div className="max-h-60 overflow-y-auto space-y-2 rounded-lg border p-2">
                {layouts.map((layout) => (
                  <LayoutItem
                    key={layout.id}
                    layout={layout}
                    isSelected={selectedLayoutId === layout.id}
                    onSelect={() => setSelectedLayoutId(layout.id)}
                    onDelete={() => handleDelete(layout.id)}
                    onSetDefault={() => handleSetDefault(layout.id)}
                    showSelect={mode === 'load'}
                  />
                ))}
              </div>
            </div>
          )}

          {layouts.length === 0 && mode === 'load' && (
            <div className="py-8 text-center text-muted-foreground">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No saved layouts</p>
              <p className="text-sm">Save your first layout to get started</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            {mode === 'save' ? (
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                Save Layout
              </Button>
            ) : (
              <Button
                onClick={handleLoad}
                disabled={!selectedLayoutId}
                className="flex-1 gap-2"
              >
                <Check className="h-4 w-4" />
                Load Layout
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LayoutItem({
  layout,
  isSelected,
  onSelect,
  onDelete,
  onSetDefault,
  showSelect,
}: {
  layout: FloorLayout;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  showSelect: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg border transition-colors',
        showSelect && 'cursor-pointer hover:bg-muted/50',
        isSelected && 'border-primary bg-primary/5'
      )}
      onClick={showSelect ? onSelect : undefined}
    >
      {showSelect && (
        <div
          className={cn(
            'h-4 w-4 rounded-full border-2 flex items-center justify-center',
            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{layout.name}</span>
          {layout.isDefault && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Star className="h-3 w-3" />
              Default
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {layout.tables.length} tables - {format(layout.updatedAt, 'MMM d, yyyy')}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {!layout.isDefault && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSetDefault();
            }}
            title="Set as default"
            className="h-8 w-8"
          >
            <Star className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete layout"
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
