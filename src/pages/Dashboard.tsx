
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Users } from 'lucide-react';

const Dashboard = () => {
  const { staff, shifts, currentWeekStart } = useApp();
  const navigate = useNavigate();
  
  // Calculate number of shifts this week
  const endOfWeek = new Date(currentWeekStart);
  endOfWeek.setDate(currentWeekStart.getDate() + 6);
  
  const startStr = currentWeekStart.toISOString().split('T')[0];
  const endStr = endOfWeek.toISOString().split('T')[0];
  
  const thisWeekShifts = shifts.filter(
    shift => shift.date >= startStr && shift.date <= endStr
  );
  
  const activeStaff = staff.filter(s => s.isActive).length;
  
  // Format day as "Monday, 12th April"
  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long'
    });
  };
  
  // Calculate today's shifts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const todayShifts = shifts.filter(shift => shift.date === todayStr);
  
  // Get staff names for today's shifts
  const todayStaffIds = [...new Set(todayShifts.map(shift => shift.staffId))];
  const todayStaffNames = todayStaffIds.map(id => {
    const member = staff.find(s => s.id === id);
    return member ? member.name : 'Unknown';
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => navigate('/schedule')}
            className="bg-pub-dark hover:bg-pub-DEFAULT text-white"
          >
            <Calendar className="mr-2 h-4 w-4" />
            View Schedule
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{activeStaff}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {staff.length} total staff members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week's Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{thisWeekShifts.length}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Week starting {formatDay(currentWeekStart)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{todayShifts.length} shifts</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDay(today)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Staff</CardTitle>
            <CardDescription>
              Staff members working today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayStaffNames.length > 0 ? (
              <ul className="space-y-2">
                {todayStaffNames.map((name, index) => (
                  <li key={index} className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No staff scheduled for today</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="flex items-center justify-start" 
                onClick={() => navigate('/staff/new')}
              >
                <User className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-start"
                onClick={() => navigate('/schedule')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Add Shift
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-start"
                onClick={() => navigate('/hours')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Track Hours
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-start"
                onClick={() => navigate('/payroll')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Run Payroll
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
