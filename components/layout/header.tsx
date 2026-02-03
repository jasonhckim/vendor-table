'use client';

import { useLocationStore, useSyncStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, Circle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { currentLocationId, setCurrentLocation, getCurrentLocation, getAllLocations } = useLocationStore();
  const { syncStatus } = useSyncStore();
  const currentLocation = getCurrentLocation();
  const locations = getAllLocations();

  const syncStatusConfig = {
    live: { color: 'bg-green-500', text: 'Live', textColor: 'text-green-700' },
    syncing: { color: 'bg-yellow-500 animate-pulse', text: 'Syncing', textColor: 'text-yellow-700' },
    offline: { color: 'bg-gray-500', text: 'Offline', textColor: 'text-gray-700' },
    error: { color: 'bg-red-500', text: 'Error', textColor: 'text-red-700' },
  };

  const status = syncStatusConfig[syncStatus.status];

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      {/* Search Bar */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reservations, guests, tables..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Right side - Location, Sync Status, User */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Location Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 font-medium text-sm md:text-base"
              style={{ borderColor: currentLocation.color }}
            >
              <Circle
                className="h-3 w-3 fill-current"
                style={{ color: currentLocation.color }}
              />
              <span className="hidden sm:inline">{currentLocation.name}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {locations.map((location) => (
              <DropdownMenuItem
                key={location.id}
                onClick={() => setCurrentLocation(location.id)}
                className="gap-2"
              >
                <Circle
                  className={cn(
                    'h-3 w-3 fill-current',
                    location.id === currentLocationId && 'ring-2 ring-offset-2'
                  )}
                  style={{ color: location.color }}
                />
                <div className="flex-1">
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {location.address.split(',')[0]}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Firebase Sync Status */}
        <div className="hidden lg:flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
          <div className={cn('h-2 w-2 rounded-full', status.color)} />
          <span className={cn('text-sm font-medium', status.textColor)}>
            {status.text}
          </span>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
