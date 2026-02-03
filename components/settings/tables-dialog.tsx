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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTableStore } from '@/lib/stores/table-store';
import { useLocationStore } from '@/lib/store';
import { toast } from 'sonner';
import { Settings, Plus, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TableShape, Table } from '@/types';

interface TablesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TablesDialog({ open, onOpenChange }: TablesDialogProps) {
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();
  const { getTablesByLocation, getSectionsByLocation, addTable, updateTable, deleteTable } = useTableStore();

  const tables = getTablesByLocation(location.id);
  const sections = getSectionsByLocation(location.id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');
  const [newTableShape, setNewTableShape] = useState<TableShape>('square');
  const [newTableSection, setNewTableSection] = useState(sections[0]?.name || 'Main Dining');
  const [editingTable, setEditingTable] = useState<string | null>(null);

  const handleAddTable = () => {
    if (!newTableNumber.trim()) return;

    addTable({
      locationId: location.id,
      number: newTableNumber.trim(),
      capacity: parseInt(newTableCapacity),
      shape: newTableShape,
      section: newTableSection,
      status: 'available',
      position: { x: 100 + tables.length * 100, y: 100 },
    });

    setNewTableNumber('');
    setNewTableCapacity('4');
    setShowAddForm(false);
    toast.success('Table added', {
      description: `Table ${newTableNumber} has been created`,
    });
  };

  const handleDeleteTable = (table: Table) => {
    if (table.status === 'occupied') {
      toast.error('Cannot delete occupied table');
      return;
    }
    deleteTable(table.id);
    toast.info('Table deleted');
  };

  const handleUpdateCapacity = (tableId: string, capacity: string) => {
    updateTable(tableId, { capacity: parseInt(capacity) });
  };

  // Group tables by section
  const tablesBySection = sections.map((section) => ({
    section,
    tables: tables.filter((t) => t.section === section.name),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Tables & Floor Plan
          </DialogTitle>
          <DialogDescription>
            Manage tables and sections for {location.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Table Form */}
          {showAddForm ? (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
              <h4 className="font-medium">Add New Table</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="table-number">Table Number</Label>
                  <Input
                    id="table-number"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    placeholder="e.g., 9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table-capacity">Capacity</Label>
                  <Select value={newTableCapacity} onValueChange={setNewTableCapacity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 6, 8, 10, 12].map((cap) => (
                        <SelectItem key={cap} value={String(cap)}>
                          {cap} guests
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table-shape">Shape</Label>
                  <Select value={newTableShape} onValueChange={(v) => setNewTableShape(v as TableShape)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rectangle">Rectangle</SelectItem>
                      <SelectItem value="booth">Booth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table-section">Section</Label>
                  <Select value={newTableSection} onValueChange={setNewTableSection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.name}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddTable} disabled={!newTableNumber.trim()}>
                  Add Table
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Table
            </Button>
          )}

          {/* Tables by Section */}
          {tablesBySection.map(({ section, tables: sectionTables }) => (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: section.color }}
                />
                <h3 className="font-semibold">{section.name}</h3>
                <Badge variant="secondary">{sectionTables.length} tables</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {sectionTables.map((table) => (
                  <div
                    key={table.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      table.status === 'occupied' && 'bg-amber-50 border-amber-200',
                      table.status === 'blocked' && 'bg-red-50 border-red-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg">#{table.number}</div>
                      <div className="text-sm text-muted-foreground">
                        <Users className="inline h-3 w-3 mr-1" />
                        {table.capacity}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {table.shape}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      {editingTable === table.id ? (
                        <Select
                          value={String(table.capacity)}
                          onValueChange={(v) => {
                            handleUpdateCapacity(table.id, v);
                            setEditingTable(null);
                          }}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 4, 6, 8, 10, 12].map((cap) => (
                              <SelectItem key={cap} value={String(cap)}>
                                {cap} guests
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTable(table.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTable(table)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={table.status === 'occupied'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Tables</span>
              <span className="font-medium">{tables.length}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Total Capacity</span>
              <span className="font-medium">
                {tables.reduce((sum, t) => sum + t.capacity, 0)} guests
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
