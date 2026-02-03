'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Save,
  FolderOpen,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  isEditMode: boolean;
  snapToGrid: boolean;
  zoom: number;
  hasChanges: boolean;
  selectedTableId: string | null;
  onToggleSnap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onAddTable: () => void;
  onDeleteTable: () => void;
  onSaveLayout: () => void;
  onLoadLayout: () => void;
}

export function EditorToolbar({
  isEditMode,
  snapToGrid,
  zoom,
  hasChanges,
  selectedTableId,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onAddTable,
  onDeleteTable,
  onSaveLayout,
  onLoadLayout,
}: EditorToolbarProps) {
  if (!isEditMode) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
      {/* Table Actions */}
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTable}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteTable}
          disabled={!selectedTableId}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Grid Snap */}
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <Button
          variant={snapToGrid ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleSnap}
          className="gap-2"
        >
          <Grid3X3 className="h-4 w-4" />
          Snap
          <Badge
            variant="secondary"
            className={cn(
              'text-xs px-1',
              snapToGrid ? 'bg-white/20' : ''
            )}
          >
            {snapToGrid ? 'ON' : 'OFF'}
          </Badge>
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 pr-2 border-r border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onResetZoom}
          className="w-16"
        >
          {Math.round(zoom * 100)}%
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={zoom >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Layout Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveLayout}
          className={cn('gap-2', hasChanges && 'border-amber-400 bg-amber-50')}
        >
          <Save className="h-4 w-4" />
          Save Layout
          {hasChanges && (
            <Badge variant="secondary" className="text-xs bg-amber-200">
              Unsaved
            </Badge>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadLayout}
          className="gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          Load
        </Button>
      </div>
    </div>
  );
}
