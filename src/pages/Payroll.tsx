
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, FileDown, Calendar, DollarSign, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { Staff, Shift } from '@/types';

const Payroll = () => {
  const { staff, shifts, getStaffById, calculateHours, exportToCSV, isManager } = useApp();
  
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] = useState<'week' | 'month' | 'custom'>('week');
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  });
  const [customStart, setCustomStart] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [customEnd, setCustomEnd] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  
  // Filter shifts by date range
  const shiftsInRange = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return shiftDate >= dateRange.start && shiftDate <= dateRange.end;
  });
  
  // Group shifts by staff
  const staffHours = staff.map(staffMember => {
    const staffShifts = shiftsInRange.filter(shift => shift.staffId === staffMember.id);
    const totalHours = calculateHours(
      staffMember.id,
      dateRange.start,
      dateRange.end
    );
    const totalPay = totalHours * staffMember.hourlyRate;
    
    return {
      staff: staffMember,
      shifts: staffShifts,
      totalHours,
      totalPay
    };
  }).filter(item => 
    // Only include staff with shifts in range or all staff if none selected
    (selectedStaff.length === 0 || selectedStaff.includes(item.staff.id)) && 
    item.shifts.length > 0
  );
  
  // Handle date range selection
  const handleRangeChange = (range: 'week' | 'month' | 'custom') => {
    setSelectedRange(range);
    
    if (range === 'week') {
      setDateRange({
        start: startOfWeek(new Date()),
        end: endOfWeek(new Date())
      });
    } else if (range === 'month') {
      setDateRange({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
      });
    } else {
      // For custom, use the custom input values
      setDateRange({
        start: new Date(customStart),
        end: new Date(customEnd)
      });
    }
  };
  
  // Move to previous period
  const handlePrevious = () => {
    if (selectedRange === 'week') {
      const start = new Date(dateRange.start);
      start.setDate(start.getDate() - 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      setDateRange({ start, end });
    } else if (selectedRange === 'month') {
      const start = subMonths(dateRange.start, 1);
      const end = endOfMonth(start);
      setDateRange({ start, end });
    }
  };
  
  // Move to next period
  const handleNext = () => {
    if (selectedRange === 'week') {
      const start = new Date(dateRange.start);
      start.setDate(start.getDate() + 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      setDateRange({ start, end });
    } else if (selectedRange === 'month') {
      const start = addMonths(dateRange.start, 1);
      const end = endOfMonth(start);
      setDateRange({ start, end });
    }
  };
  
  // Update custom date range
  const handleCustomDateChange = () => {
    setDateRange({
      start: new Date(customStart),
      end: new Date(customEnd)
    });
  };
  
  // Toggle staff selection
  const handleStaffToggle = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };
  
  // Select all staff
  const handleSelectAllStaff = () => {
    if (selectedStaff.length === staff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(staff.map(s => s.id));
    }
  };
  
  // Export payroll data
  const handleExport = () => {
    exportToCSV(dateRange.start, dateRange.end);
  };
  
  // Format a date
  const formatDate = (date: Date) => {
    return format(date, 'dd MMM yyyy');
  };
  
  // Calculate total overall pay
  const totalPayroll = staffHours.reduce((sum, { totalPay }) => sum + totalPay, 0);

  // Check if user is staff or manager
  const isUserManager = isManager();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
        
        {isUserManager && (
          <Button 
            onClick={handleExport}
            className="bg-pub-dark hover:bg-pub-DEFAULT text-white"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>
              Select the period for payroll calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button 
                variant={selectedRange === 'week' ? 'default' : 'outline'}
                className={selectedRange === 'week' ? 'bg-pub-DEFAULT' : ''}
                onClick={() => handleRangeChange('week')}
              >
                Week
              </Button>
              <Button 
                variant={selectedRange === 'month' ? 'default' : 'outline'}
                className={selectedRange === 'month' ? 'bg-pub-DEFAULT' : ''}
                onClick={() => handleRangeChange('month')}
              >
                Month
              </Button>
              <Button 
                variant={selectedRange === 'custom' ? 'default' : 'outline'}
                className={selectedRange === 'custom' ? 'bg-pub-DEFAULT' : ''}
                onClick={() => handleRangeChange('custom')}
              >
                Custom
              </Button>
            </div>
            
            {selectedRange === 'custom' ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="customStart">Start Date</Label>
                  <Input
                    id="customStart"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customEnd">End Date</Label>
                  <Input
                    id="customEnd"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
                <Button onClick={handleCustomDateChange} className="w-full">
                  Apply Custom Range
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-center">
                  <div className="font-medium">
                    {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRange === 'week' ? 'Week' : 'Month'} period
                  </div>
                </div>
                
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {isUserManager && (
              <div className="pt-6 border-t mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="selectAll" 
                    checked={selectedStaff.length === staff.length}
                    onCheckedChange={() => handleSelectAllStaff()} 
                  />
                  <label 
                    htmlFor="selectAll" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {selectedStaff.length === staff.length ? 'Deselect All' : 'Select All Staff'}
                  </label>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {staff.map(staffMember => (
                    <div key={staffMember.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`staff-${staffMember.id}`} 
                        checked={selectedStaff.includes(staffMember.id)}
                        onCheckedChange={() => handleStaffToggle(staffMember.id)} 
                      />
                      <label
                        htmlFor={`staff-${staffMember.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {staffMember.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
            <CardDescription>
              {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Staff
                      </p>
                      <p className="text-2xl font-bold">
                        {staffHours.length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Hours
                      </p>
                      <p className="text-2xl font-bold">
                        {staffHours.reduce((sum, { totalHours }) => sum + totalHours, 0).toFixed(1)}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Payroll
                      </p>
                      <p className="text-2xl font-bold">
                        £{totalPayroll.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {staffHours.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No payroll data available for the selected period.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total Pay</TableHead>
                    {isUserManager && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffHours.map(({ staff, totalHours, totalPay }) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.position}</TableCell>
                      <TableCell>{totalHours.toFixed(1)}</TableCell>
                      <TableCell>£{staff.hourlyRate.toFixed(2)}</TableCell>
                      <TableCell className="font-bold">£{totalPay.toFixed(2)}</TableCell>
                      {isUserManager && (
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => console.log('View details')}>
                            Details
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Missing Users component
const Users = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
};

export default Payroll;
