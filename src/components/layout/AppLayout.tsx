
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  Menu, 
  X, 
  CreditCard,
  Home,
  CalendarCheck,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarProvider, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { useApp } from '@/contexts/AppContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center h-16 px-4 border-b md:hidden">
            <SidebarTrigger>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
            <h1 className="ml-4 text-lg font-medium">PubShiftMate</h1>
          </div>
          <div className="pub-container py-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const AppSidebar = () => {
  const location = useLocation();
  const { isManager } = useApp();
  
  // Define navigation items based on role
  const navItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/',
    },
    {
      title: 'Schedule',
      icon: Calendar,
      href: '/schedule',
    },
    {
      title: 'Staff',
      icon: Users,
      href: '/staff',
      managerOnly: true
    },
    {
      title: 'Availability',
      icon: CalendarCheck,
      href: '/availability',
    },
    {
      title: 'Timesheets',
      icon: ClipboardList,
      href: '/timesheets',
    },
    {
      title: 'Hours',
      icon: Clock,
      href: '/hours',
    },
    {
      title: 'Payroll',
      icon: CreditCard,
      href: '/payroll',
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.managerOnly || isManager()
  );

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center justify-between px-4 border-b">
        <Link to="/" className="flex items-center space-x-2">
          <div className="rounded-md bg-pub-accent text-white p-1">
            <Clock className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">PubShiftMate</span>
        </Link>
        <SidebarTrigger className="md:hidden">
          <Button variant="ghost" size="icon">
            <X className="h-5 w-5" />
          </Button>
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent>
        <nav className="space-y-1 px-2 py-4">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.title}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-3">
        <div className="text-xs text-muted-foreground">
          <p>PubShiftMate</p>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
