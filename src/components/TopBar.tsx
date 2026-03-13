import { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { mockReminders } from "@/lib/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const pendingCount = mockReminders.filter(r => !r.is_done).length;

  return (
    <header className="h-14 flex items-center justify-between gap-3 border-b px-4 shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts, deals…"
            className="h-8 w-64 pl-8 text-sm bg-secondary border-none focus-visible:ring-1"
          />
        </div>
        <button
          className="sm:hidden flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {pendingCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-semibold font-display">Notifications</p>
            </div>
            <div className="max-h-64 overflow-auto">
              {mockReminders.filter(r => !r.is_done).slice(0, 5).map(r => (
                <Link
                  key={r.id}
                  to="/reminders"
                  className="flex items-start gap-2 border-b px-4 py-3 text-sm transition-colors hover:bg-muted last:border-0"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{r.text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {r.contact_name} · {formatDistanceToNow(new Date(r.due_at), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="border-t px-4 py-2">
              <Link to="/reminders" className="text-xs font-medium text-primary hover:underline">
                View all reminders
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* User profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground">
                F
              </div>
              <span className="hidden md:inline text-sm font-medium">Founder</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">Founder</p>
              <p className="text-xs text-muted-foreground">founder@nosheeet.com</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/integrations">Integrations</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile search expanded */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-14 z-50 border-b bg-background p-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts, deals…"
              className="pl-8 text-sm"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
