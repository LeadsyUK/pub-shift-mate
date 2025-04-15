
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Shift } from '@/types';

const Hours = () => {
  const { 
    staff, 
    shifts, 
    currentWeekStart, 
    setCurrentWeekStart,
    getStaffById 
  } = useApp();
  
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(
    staff.length > 0 ? staff[0].id : null
  );

  // Generate array of days for the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    return day;
  });

  // Format day as "Mon 12" or "Monday 12th April" if fullDate is true
  const formatDay = (date: Date, fullDate = false) => {
    if (fullDate) {
      return date.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long'
      });
    }
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric'
    });
  };

  const handlePreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  const handleCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  // Get shifts for the selected staff member and current week
  const staffShifts: Shift[] = selectedStaffId
    ? shifts.filter((shift) => {
        const shiftDate = new Date(shift.date);
        const weekEndDate = new Date(currentWeekStart);
        weekEndDate.setDate(currentWeekStart.getDate() + 6);
        
        return (
          shift.staffId === selectedStaffId &&
          shiftDate >= currentWeekStart &&
          shiftDate <= weekEndDate
        );
      })
    : [];

  // Calculate total hours and pay for the week
  const calculateTotals = () => {
    if (!selectedStaffId) return { hours: 0, pay: 0 };
    
    const staffMember = getStaffById(selectedStaffId);
    if (!staffMember) return { hours: 0, pay: 0 };
    
    let totalHours = 0;
    
    staffShifts.forEach((shift) => {
      const start = new Date(`${shift.date}T${shift.startTime}`);
      const end = new Date(`${shift.date}T${shift.endTime}`);
      
      // Handle shifts that end after midnight
      let diffMs = end.getTime() - start.getTime();
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000; // Add 24 hours if end time is earlier than start time
      }
      
      const diffHours = diffMs / (1000 * 60 * 60);
      totalHours += diffHours;
    });
    
    const totalPay = totalHours * staffMember.hourlyRate;
    
    return {
      hours: totalHours,
      pay: totalPay
    };
  };

  const { hours, pay } = calculateTotals();

  // Format time from 24hr to 12hr
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    return `${hour % 12 || 12}:${minutes}${hour >= 12 ? 'pm' : 'am'}`;
  };

  // Calculate hours for a specific shift
  const calculateShiftHours = (shift: Shift) => {
    const start = new Date(`${shift.date}T${shift.startTime}`);
    const end = new Date(`${shift.date}T${shift.endTime}`);
    
    // Handle shifts that end after midnight
    let diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000; // Add 24 hours if end time is earlier than start time
    }
    
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours;
  };

  // Group shifts by day
  const getShiftsForDay = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    return staffShifts.filter(shift => shift.date === dayStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Hours Tracker</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">
          Week of {formatDay(currentWeekStart, true)}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto">
                <Select
                  value={selectedStaffId || ''}
                  onValueChange={(value) => setSelectedStaffId(value)}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((staffMember) => (
                      <SelectItem key={staffMember.id} value={staffMember.id}>
                        {staffMember.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1" />
              
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm text-muted-foreground">Total Hours</span>
                  <span className="text-2xl font-bold">{hours.toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-muted-foreground">Total Pay</span>
                  <span className="text-2xl font-bold">£{pay.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedStaffId ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffShifts.length > 0 ? (
                      staffShifts.map((shift) => (
                        <TableRow key={shift.id}>
                          <TableCell>{formatDay(new Date(shift.date))}</TableCell>
                          <TableCell>{shift.position}</TableCell>
                          <TableCell>{formatTime(shift.startTime)}</TableCell>
                          <TableCell>{formatTime(shift.endTime)}</TableCell>
                          <TableCell className="text-right">
                            {calculateShiftHours(shift).toFixed(1)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No shifts scheduled for this week.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mt-6">
                  {weekDays.map((day) => {
                    const dayShifts = getShiftsForDay(day);
                    const hasShift = dayShifts.length > 0;
                    let dayHours = 0;
                    
                    dayShifts.forEach(shift => {
                      dayHours += calculateShiftHours(shift);
                    });
                    
                    return (
                      <div 
                        key={day.toISOString()} 
                        className={`text-center p-2 rounded-md border ${
                          hasShift 
                            ? 'bg-pub-light/20 border-pub-light' 
                            : 'bg-muted/30'
                        }`}
                      >
                        <div className="text-sm font-medium">{formatDay(day)}</div>
                        <div className="flex justify-center items-center mt-1">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className={`text-sm ${hasShift ? 'font-bold' : 'text-muted-foreground'}`}>
                            {dayHours.toFixed(1)}h
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Please select a staff member to view their hours.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Hours;
