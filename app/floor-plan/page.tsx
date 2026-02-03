'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocationStore } from '@/lib/store';
import { useTableStore } from '@/lib/stores/table-store';
import { useReservationStore } from '@/lib/stores/reservation-store';
import { ReservationsSidebar } from '@/components/floor-plan/reservations-sidebar';
import { DroppableTable } from '@/components/floor-plan/droppable-table';
import { FloorPlanEditor } from '@/components/floor-plan/floor-plan-editor';
import { toast } from 'sonner';
import {
  LayoutGrid,
  List,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
  Edit2,
  Clock,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { TableStatus, TableShape, Table } from '@/types';

const tableStatusConfig: Record<TableStatus, { color: string; bgColor: string; borderColor: string; label: string }> = {
  available: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
    borderColor: 'border-gray-300',
    label: 'Available'
  },
  reserved: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
    borderColor: 'border-blue-400',
    label: 'Reserved'
  },
  occupied: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 hover:bg-amber-200',
    borderColor: 'border-amber-400',
    label: 'Occupied'
  },
  finishing: {
    color: 'text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200 animate-pulse',
    borderColor: 'border-green-400',
    label: 'Finishing'
  },
  blocked: {
    color: 'text-red-700',
    bgColor: 'bg-red-50 hover:bg-red-100',
    borderColor: 'border-red-400 border-dashed',
    label: 'Blocked'
  },
};

const shapeIcons: Record<TableShape, string> = {
  circle: '⬤',
  square: '⬛',
  rectangle: '▬',
  booth: '🛋️',
};

export default function FloorPlanPage() {
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();
  const { getTablesByLocation, clearTable, getTableUtilization, endDrag, getTable } = useTableStore();
  const { completeReservation, cancelReservation, getReservation } = useReservationStore();

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'floor' | 'list' | 'edit'>('floor');
  const [zoom, setZoom] = useState(1);

  const tables = getTablesByLocation(location.id);
  const utilization = getTableUtilization(location.id);

  // Group tables by section
  const sections = Array.from(new Set(tables.map((t) => t.section)));

  const statusCounts = {
    available: tables.filter((t) => t.status === 'available').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    finishing: tables.filter((t) => t.status === 'finishing').length,
    blocked: tables.filter((t) => t.status === 'blocked').length,
  };

  const handleClearTable = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    if (table.currentReservationId) {
      if (table.status === 'reserved') {
        // Cancel the reservation
        cancelReservation(table.currentReservationId);
        toast.success('Reservation cancelled', {
          description: `Table ${table.number} is now available`,
        });
      } else {
        // Complete the reservation (occupied or finishing)
        completeReservation(table.currentReservationId);
        toast.success('Table cleared', {
          description: `Table ${table.number} is now available`,
        });
      }
    } else {
      toast.success('Table cleared', {
        description: `Table ${table.number} is now available`,
      });
    }

    clearTable(tableId);
    setSelectedTable(null);
  };

  // Handle drag end when dropping outside valid targets
  const handleDragEnd = () => {
    endDrag();
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      onDragEnd={handleDragEnd}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Floor Plan</h1>
          <p className="text-muted-foreground">
            Real-time table status for {location.name} • {utilization}% utilization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'floor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('floor')}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Floor View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            List View
          </Button>
          <Button
            variant={viewMode === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('edit')}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Layout
          </Button>
        </div>
      </div>

      {/* Status Legend & Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Table Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {Object.entries(tableStatusConfig).map(([status, config]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-4 w-4 rounded border-2',
                    config.bgColor,
                    config.borderColor
                  )}
                />
                <span className="text-sm font-medium capitalize">{config.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {statusCounts[status as TableStatus]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Floor Plan View with Sidebar */}
      {viewMode === 'floor' ? (
        <div className="flex gap-6">
          {/* Reservations Sidebar */}
          <ReservationsSidebar />

          {/* Floor Plan */}
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Interactive Floor Plan</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag reservations from the sidebar onto tables to seat guests
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                    disabled={zoom >= 2}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={sections[0]} className="space-y-4">
                <TabsList>
                  {sections.map((section) => (
                    <TabsTrigger key={section} value={section}>
                      {section}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {sections.map((section) => {
                  const sectionTables = tables.filter((t) => t.section === section);

                  return (
                    <TabsContent key={section} value={section}>
                      <div className="relative bg-gray-50 rounded-lg p-8 min-h-[500px] overflow-auto border border-border">
                        <div
                          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                        >
                          {/* Grid background */}
                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage:
                                'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                              backgroundSize: '20px 20px',
                            }}
                          />

                          {/* Droppable Tables */}
                          {sectionTables.map((table) => (
                            <DroppableTable
                              key={table.id}
                              table={table}
                              isSelected={selectedTable === table.id}
                              onClick={() => setSelectedTable(table.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      ) : (
        /* Edit Layout View */
        <FloorPlanEditor locationId={location.id} />
      )}

      {/* Selected Table Details Sidebar */}
      {selectedTable && (
        <Card className="fixed right-6 top-24 w-80 shadow-lg z-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Table {tables.find((t) => t.id === selectedTable)?.number}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTable(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const table = tables.find((t) => t.id === selectedTable);
              if (!table) return null;

              const currentReservation = table.currentReservationId
                ? getReservation(table.currentReservationId)
                : null;

              return (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className={cn('border', tableStatusConfig[table.status].color)}>
                        {tableStatusConfig[table.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">{table.capacity} guests</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{table.shape}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Section</span>
                      <span className="font-medium">{table.section}</span>
                    </div>
                  </div>

                  {currentReservation && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">
                        {table.status === 'reserved' ? 'Reservation' : 'Current Guest'}
                      </p>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <p className="font-semibold">{currentReservation.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          Party of {currentReservation.partySize}
                        </p>
                        {table.status === 'reserved' && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(currentReservation.dateTime), 'h:mm a')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-2">
                    {table.status === 'occupied' && (
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleClearTable(table.id)}
                      >
                        Mark Complete & Clear
                      </Button>
                    )}
                    {table.status === 'finishing' && (
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleClearTable(table.id)}
                      >
                        Clear Table
                      </Button>
                    )}
                    {table.status === 'reserved' && (
                      <Button
                        className="w-full"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleClearTable(table.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel Reservation
                      </Button>
                    )}
                    {table.status === 'available' && (
                      <Button className="w-full" size="sm" disabled>
                        Drag reservation to seat
                      </Button>
                    )}
                    <Button className="w-full" variant="outline" size="sm">
                      View History
                    </Button>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TableCard({ table }: { table: Table }) {
  const config = tableStatusConfig[table.status as TableStatus];

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-10 w-10 rounded-lg border-2 flex items-center justify-center font-bold',
                config.bgColor,
                config.borderColor,
                config.color
              )}
            >
              {table.number}
            </div>
            <div>
              <div className="font-medium">Table {table.number}</div>
              <div className="text-xs text-muted-foreground">{table.section}</div>
            </div>
          </div>
          <Badge className={cn('border', config.color)}>{config.label}</Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Capacity</span>
            <span className="font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              {table.capacity}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium capitalize">
              {shapeIcons[table.shape as TableShape]} {table.shape}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button size="sm" variant="outline" className="w-full">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
