'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTableStore } from '@/lib/stores/table-store';
import { DraggableTable } from './draggable-table';
import { EditorToolbar } from './editor-toolbar';
import { TableProperties } from './table-properties';
import { LayoutManager } from './layout-manager';
import { toast } from 'sonner';
import { Edit2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LocationId, Table, TableShape } from '@/types';

interface FloorPlanEditorProps {
  locationId: LocationId;
}

const GRID_SIZE = 20;

export function FloorPlanEditor({ locationId }: FloorPlanEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);
  const [layoutManagerOpen, setLayoutManagerOpen] = useState(false);
  const [layoutManagerMode, setLayoutManagerMode] = useState<'save' | 'load'>('save');

  const {
    getTablesByLocation,
    addTable,
    updateTable,
    deleteTable,
    updateTablePosition,
  } = useTableStore();

  const tables = getTablesByLocation(locationId);
  const sections = Array.from(new Set(tables.map((t) => t.section)));
  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const handleToggleEditMode = () => {
    if (isEditMode && hasChanges) {
      // Prompt to save before exiting
      toast.info('You have unsaved changes', {
        description: 'Save your layout or changes will be lost',
        action: {
          label: 'Save',
          onClick: () => openLayoutManager('save'),
        },
      });
    }
    setIsEditMode(!isEditMode);
    setSelectedTableId(null);
  };

  const handlePositionChange = useCallback(
    (tableId: string, position: { x: number; y: number }) => {
      updateTablePosition(tableId, position);
      setHasChanges(true);
    },
    [updateTablePosition]
  );

  const handleAddTable = () => {
    const newTable = addTable({
      locationId,
      number: `T${tables.length + 1}`,
      capacity: 4,
      shape: 'square' as TableShape,
      status: 'available',
      section: sections[0] || 'Main Floor',
      position: { x: 100, y: 100 },
    });

    setSelectedTableId(newTable.id);
    setHasChanges(true);
    toast.success('Table added', {
      description: `Table ${newTable.number} has been created`,
    });
  };

  const handleDeleteTable = () => {
    if (!selectedTableId || !selectedTable) return;

    deleteTable(selectedTableId);
    setSelectedTableId(null);
    setHasChanges(true);
    toast.success('Table deleted', {
      description: `Table ${selectedTable.number} has been removed`,
    });
  };

  const handleUpdateTable = (updates: Partial<Table>) => {
    if (!selectedTableId) return;
    updateTable(selectedTableId, updates);
    setHasChanges(true);
    toast.success('Table updated');
  };

  const openLayoutManager = (mode: 'save' | 'load') => {
    setLayoutManagerMode(mode);
    setLayoutManagerOpen(true);
  };

  const handleLayoutManagerClose = () => {
    setLayoutManagerOpen(false);
    if (layoutManagerMode === 'save') {
      setHasChanges(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Floor Plan</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isEditMode
                  ? 'Drag tables to reposition them'
                  : 'Click tables to view details'}
              </p>
            </div>
            <Button
              variant={isEditMode ? 'default' : 'outline'}
              onClick={handleToggleEditMode}
              className="gap-2"
            >
              {isEditMode ? (
                <>
                  <Eye className="h-4 w-4" />
                  Exit Edit Mode
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  Edit Layout
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Editor Toolbar */}
          <EditorToolbar
            isEditMode={isEditMode}
            snapToGrid={snapToGrid}
            zoom={zoom}
            hasChanges={hasChanges}
            selectedTableId={selectedTableId}
            onToggleSnap={() => setSnapToGrid(!snapToGrid)}
            onZoomIn={() => setZoom(Math.min(2, zoom + 0.1))}
            onZoomOut={() => setZoom(Math.max(0.5, zoom - 0.1))}
            onResetZoom={() => setZoom(1)}
            onAddTable={handleAddTable}
            onDeleteTable={handleDeleteTable}
            onSaveLayout={() => openLayoutManager('save')}
            onLoadLayout={() => openLayoutManager('load')}
          />

          {/* Floor Plan Canvas */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Tabs defaultValue={sections[0]} className="space-y-4">
                <TabsList>
                  {sections.map((section) => (
                    <TabsTrigger key={section} value={section}>
                      {section}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {tables.filter((t) => t.section === section).length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {sections.map((section) => {
                  const sectionTables = tables.filter((t) => t.section === section);

                  return (
                    <TabsContent key={section} value={section}>
                      <div
                        className={cn(
                          'relative bg-gray-50 rounded-lg min-h-[500px] overflow-hidden border border-border',
                          isEditMode && 'bg-gray-100'
                        )}
                        onClick={() => isEditMode && setSelectedTableId(null)}
                      >
                        {/* Grid overlay in edit mode */}
                        {isEditMode && snapToGrid && (
                          <div
                            className="absolute inset-0 pointer-events-none opacity-30"
                            style={{
                              backgroundImage: `
                                linear-gradient(to right, #d1d5db 1px, transparent 1px),
                                linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
                              `,
                              backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
                            }}
                          />
                        )}

                        <div
                          className="relative"
                          style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left',
                            width: `${100 / zoom}%`,
                            height: `${500 / zoom}px`,
                          }}
                        >
                          {sectionTables.map((table) => (
                            <DraggableTable
                              key={table.id}
                              table={table}
                              isSelected={selectedTableId === table.id}
                              isEditMode={isEditMode}
                              snapToGrid={snapToGrid}
                              gridSize={GRID_SIZE}
                              onClick={() => setSelectedTableId(table.id)}
                              onPositionChange={(pos) =>
                                handlePositionChange(table.id, pos)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>

            {/* Properties Panel */}
            {isEditMode && selectedTable && (
              <TableProperties
                table={selectedTable}
                onUpdate={handleUpdateTable}
                onDelete={handleDeleteTable}
                onClose={() => setSelectedTableId(null)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Layout Manager Dialog */}
      <LayoutManager
        isOpen={layoutManagerOpen}
        onClose={handleLayoutManagerClose}
        locationId={locationId}
        mode={layoutManagerMode}
      />
    </>
  );
}
