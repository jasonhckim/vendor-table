'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Trash2 } from 'lucide-react';
import type { Table, TableShape } from '@/types';

interface TablePropertiesProps {
  table: Table;
  onUpdate: (updates: Partial<Table>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const SHAPE_OPTIONS: { value: TableShape; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'booth', label: 'Booth' },
];

export function TableProperties({
  table,
  onUpdate,
  onDelete,
  onClose,
}: TablePropertiesProps) {
  const [number, setNumber] = useState(table.number);
  const [capacity, setCapacity] = useState(table.capacity.toString());
  const [shape, setShape] = useState<TableShape>(table.shape);
  const [section, setSection] = useState(table.section);

  // Update local state when table changes
  useEffect(() => {
    setNumber(table.number);
    setCapacity(table.capacity.toString());
    setShape(table.shape);
    setSection(table.section);
  }, [table]);

  const handleSave = () => {
    onUpdate({
      number,
      capacity: parseInt(capacity) || 2,
      shape,
      section,
    });
  };

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Table Properties</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Table Number */}
        <div className="space-y-2">
          <Label htmlFor="table-number">Table Number</Label>
          <Input
            id="table-number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g., T1, 101"
          />
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            max={20}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        {/* Shape */}
        <div className="space-y-2">
          <Label>Shape</Label>
          <Select value={shape} onValueChange={(v) => setShape(v as TableShape)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHAPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section */}
        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <Input
            id="section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g., Main Floor, Patio"
          />
        </div>

        {/* Position Display */}
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            Position: ({Math.round(table.position.x)}, {Math.round(table.position.y)})
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={onDelete}
            title="Delete Table"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
