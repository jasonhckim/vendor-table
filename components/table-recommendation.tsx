'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  Users,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Table, Reservation, TableRecommendation } from '@/types';

interface TableRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation;
  onAssignTable: (tableId: string) => void;
}

// Mock recommendation algorithm
function generateRecommendations(
  reservation: Reservation, 
  availableTables: Table[]
): TableRecommendation[] {
  return availableTables.map(table => {
    let score = 0;
    const reasons: string[] = [];
    const warnings: string[] = [];

    // Party size match (30% weight)
    if (table.capacity === reservation.partySize) {
      score += 30;
      reasons.push('Perfect fit for party size');
    } else if (table.capacity === reservation.partySize + 1) {
      score += 25;
      reasons.push(`Fits ${reservation.partySize} guests comfortably`);
    } else if (table.capacity > reservation.partySize) {
      score += 15;
      reasons.push(`Can accommodate ${reservation.partySize} guests`);
      warnings.push(`Table is sized for ${table.capacity} guests`);
    } else {
      score += 5;
      warnings.push('Table may be too small');
    }

    // Seating preference (25% weight)
    if (reservation.seatingPreference !== 'any') {
      const sectionMatch = table.section.toLowerCase().includes(reservation.seatingPreference.toLowerCase());
      if (sectionMatch) {
        score += 25;
        reasons.push(`Matches ${reservation.seatingPreference} preference`);
      } else {
        score += 5;
        warnings.push(`Guest prefers ${reservation.seatingPreference} seating`);
      }
    } else {
      score += 15;
      reasons.push('Guest has no seating preference');
    }

    // Table availability (20% weight)
    if (table.status === 'available') {
      score += 20;
      reasons.push('Available immediately');
    } else if (table.status === 'finishing') {
      score += 15;
      reasons.push('Will be available soon');
    }

    // Special accommodations (15% weight)
    if (reservation.highChairs && table.section.includes('Main')) {
      score += 15;
      reasons.push('Located near high chair storage');
    } else if (reservation.highChairs) {
      score += 5;
    }

    // Table type bonus (10% weight)
    if (table.shape === 'booth' && reservation.partySize <= 4) {
      score += 10;
      reasons.push('Cozy booth seating');
    } else if (table.shape === 'rectangle' && reservation.partySize >= 6) {
      score += 10;
      reasons.push('Large table for group');
    }

    // VIP or special occasion bonus
    if (reservation.specialRequests?.toLowerCase().includes('birthday') ||
        reservation.specialRequests?.toLowerCase().includes('anniversary')) {
      if (table.shape === 'booth' || table.section.includes('Patio')) {
        score += 5;
        reasons.push('Special table for celebration');
      }
    }

    return {
      table,
      matchScore: Math.min(100, score),
      reasons,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// Mock available tables
const mockAvailableTables: Table[] = [
  { 
    id: '12', 
    locationId: 'tustin', 
    number: '12', 
    capacity: 4, 
    shape: 'booth', 
    status: 'available', 
    section: 'Main Dining',
    position: { x: 0, y: 0 }
  },
  { 
    id: '8', 
    locationId: 'tustin', 
    number: '8', 
    capacity: 4, 
    shape: 'square', 
    status: 'available', 
    section: 'Patio',
    position: { x: 0, y: 0 }
  },
  { 
    id: '5', 
    locationId: 'tustin', 
    number: '5+6', 
    capacity: 6, 
    shape: 'rectangle', 
    status: 'available', 
    section: 'Main Dining',
    position: { x: 0, y: 0 }
  },
];

export function TableRecommendationDialog({ 
  open, 
  onOpenChange, 
  reservation, 
  onAssignTable 
}: TableRecommendationDialogProps) {
  const recommendations = generateRecommendations(reservation, mockAvailableTables);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Table Recommendations
          </DialogTitle>
          <DialogDescription>
            AI-powered suggestions for {reservation.guestName}&apos;s party of {reservation.partySize}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {recommendations.map((rec, index) => {
            const isBest = index === 0;
            const matchLevel = rec.matchScore >= 80 ? 'excellent' : rec.matchScore >= 60 ? 'good' : 'fair';
            
            return (
              <Card 
                key={rec.table.id} 
                className={cn(
                  'transition-all hover:shadow-md',
                  isBest && 'border-primary border-2 shadow-lg'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                        {rec.table.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            Table {rec.table.number}
                          </CardTitle>
                          {isBest && (
                            <Badge className="gap-1 bg-primary">
                              <Sparkles className="h-3 w-3" />
                              Best Match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="capitalize">
                            {rec.table.shape}
                          </Badge>
                          <span>•</span>
                          <span>{rec.table.section}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div 
                          className={cn(
                            'text-3xl font-bold',
                            matchLevel === 'excellent' && 'text-green-600',
                            matchLevel === 'good' && 'text-blue-600',
                            matchLevel === 'fair' && 'text-amber-600'
                          )}
                        >
                          {rec.matchScore}
                          <span className="text-lg">%</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 capitalize">
                        {matchLevel} match
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Reasons */}
                  {rec.reasons.length > 0 && (
                    <div className="space-y-2">
                      {rec.reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warnings */}
                  {rec.warnings && rec.warnings.length > 0 && (
                    <div className="space-y-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      {rec.warnings.map((warning, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-amber-900">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Table Details */}
                  <div className="flex flex-wrap gap-4 pt-2 border-t text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Seats {rec.table.capacity}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{rec.table.section}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Available Now</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full"
                    variant={isBest ? 'default' : 'outline'}
                    onClick={() => {
                      onAssignTable(rec.table.id);
                      onOpenChange(false);
                    }}
                  >
                    {isBest ? 'Assign to Best Match' : `Assign to Table ${rec.table.number}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Recommendations are based on party size, seating preferences, table availability, 
              and historical data. The algorithm learns from your table assignments over time.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
