'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocationStore } from '@/lib/store';
import { HoursDialog } from '@/components/settings/hours-dialog';
import { TablesDialog } from '@/components/settings/tables-dialog';
import { NotificationsDialog } from '@/components/settings/notifications-dialog';
import { LocationsDialog } from '@/components/settings/locations-dialog';
import {
  Settings as SettingsIcon,
  Clock,
  Users,
  Bell,
  Link2,
  Shield,
  MapPin,
} from 'lucide-react';

export default function SettingsPage() {
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();

  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [tablesDialogOpen, setTablesDialogOpen] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [locationsDialogOpen, setLocationsDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure settings for {location.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="transition-all hover:shadow-md border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Locations
            </CardTitle>
            <CardDescription>
              Add, edit, or remove restaurant locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocationsDialogOpen(true)}
            >
              Manage Locations
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Hours & Availability
            </CardTitle>
            <CardDescription>
              Set operating hours, reservation slots, and blocked dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHoursDialogOpen(true)}
            >
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Tables & Floor Plan
            </CardTitle>
            <CardDescription>
              Manage tables, sections, and floor plan layout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTablesDialogOpen(true)}
            >
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              SMS templates, email settings, and alert preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotificationsDialogOpen(true)}
            >
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team & Permissions
            </CardTitle>
            <CardDescription>
              Manage staff accounts and role assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Firebase Integration
            </CardTitle>
            <CardDescription>
              Configure iOS app sync and real-time data connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-600 font-medium">Connected</span>
            </div>
            <Button variant="outline" size="sm" disabled>
              Manage
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Access controls, data privacy, and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <HoursDialog open={hoursDialogOpen} onOpenChange={setHoursDialogOpen} />
      <TablesDialog open={tablesDialogOpen} onOpenChange={setTablesDialogOpen} />
      <NotificationsDialog open={notificationsDialogOpen} onOpenChange={setNotificationsDialogOpen} />
      <LocationsDialog open={locationsDialogOpen} onOpenChange={setLocationsDialogOpen} />
    </div>
  );
}
