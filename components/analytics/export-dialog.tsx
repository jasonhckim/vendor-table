'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Download, FileJson, FileSpreadsheet, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExportFormat } from '@/lib/analytics-comparison';

interface ExportDialogProps {
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
}

const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  description: string;
  icon: typeof FileJson;
}[] = [
  {
    value: 'csv',
    label: 'CSV',
    description: 'Spreadsheet-compatible format for Excel, Google Sheets',
    icon: FileSpreadsheet,
  },
  {
    value: 'json',
    label: 'JSON',
    description: 'Structured data format for developers and APIs',
    icon: FileJson,
  },
];

export function ExportDialog({ onExport, isExporting = false }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');

  const handleExport = () => {
    onExport(selectedFormat);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Analytics Data</DialogTitle>
          <DialogDescription>
            Choose a format to export your analytics data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid gap-2">
              {FORMAT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFormat === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFormat(option.value)}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-md p-2',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 gap-2"
            >
              {isExporting ? (
                'Exporting...'
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
