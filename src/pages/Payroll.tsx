
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  CreditCard, 
  CheckCircle2 
} from 'lucide-react';
import { StaffHours } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const Payroll = () => {
  const { staff, shifts, currentWeekStart, setCurrentWeekStart, updateShift } = useApp();
  const { toast } = useToast();
  
  // Generate week range for display
  const weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(currentWeekStart.getDate() + 6);
  
  const startStr = currentWeekStart.toISOString().split('T')[0];
  const endStr = weekEndDate.toISOString().split('T')[0];
  
  // Format day as "Monday 12th April"
  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long'
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

  // Calculate staff hours and pay for the current week
  const calculateStaffHours = (): StaffHours[] => {
    const staffHours: StaffHours[] = [];
    
    staff.forEach(staffMember => {
      const staffShifts = shifts.filter(
        shift => shift.staffId === staffMember.id && 
                shift.date >= startStr && 
                shift.date <= endStr
      );
      
      if (staffShifts.length === 0) return;
      
      let totalHours = 0;
      
      staffShifts.forEach(shift => {
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
      
      staffHours.push({
        staffId: staffMember.id,
        staffName: staffMember.name,
        totalHours,
        totalPay,
        shifts: staffShifts
      });
    });
    
    return staffHours.sort((a, b) => a.staffName.localeCompare(b.staffName));
  };

  const staffHours = calculateStaffHours();
  
  // Calculate totals
  const totalHours = staffHours.reduce((sum, staff) => sum + staff.totalHours, 0);
  const totalPay = staffHours.reduce((sum, staff) => sum + staff.totalPay, 0);

  // Mark as paid
  const markAsPaid = (staffId: string) => {
    const staffShifts = shifts.filter(
      shift => shift.staffId === staffId && 
              shift.date >= startStr && 
              shift.date <= endStr && 
              !shift.isPaid
    );
    
    staffShifts.forEach(shift => {
      updateShift({ ...shift, isPaid: true });
    });
    
    toast({
      title: "Marked as paid",
      description: "All shifts for this staff member have been marked as paid.",
    });
  };

  // Mark all as paid
  const markAllAsPaid = () => {
    const weekShifts = shifts.filter(
      shift => shift.date >= startStr && 
              shift.date <= endStr && 
              !shift.isPaid
    );
    
    weekShifts.forEach(shift => {
      updateShift({ ...shift, isPaid: true });
    });
    
    toast({
      title: "All shifts marked as paid",
      description: "All shifts for this week have been marked as paid.",
    });
  };

  // Export payroll as CSV
  const exportPayroll = () => {
    // Create CSV content
    const csvContent = [
      ["Staff Name", "Position", "Hours", "Hourly Rate", "Total Pay"],
      ...staffHours.map(staff => {
        const staffMember = staff.shifts[0] ? staff.shifts[0].position : "";
        const hourlyRate = staff.totalPay / staff.totalHours;
        return [
          staff.staffName,
          staffMember,
          staff.totalHours.toFixed(2),
          `£${hourlyRate.toFixed(2)}`,
          `£${staff.totalPay.toFixed(2)}`
        ];
      }),
      [], // Empty row
      ["Total", "", totalHours.toFixed(2), "", `£${totalPay.toFixed(2)}`]
    ]
      .map(row => row.join(","))
      .join("\n");
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `payroll-${startStr}-to-${endStr}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Payroll exported",
      description: "The payroll data has been exported as a CSV file.",
    });
  };

  // Calculate if all shifts are paid
  const areAllShiftsPaid = (staffHours: StaffHours): boolean => {
    return staffHours.shifts.every(shift => shift.isPaid);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
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
          Week of {formatDay(currentWeekStart)} to {formatDay(weekEndDate)}
        </h2>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Payroll Summary</CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={exportPayroll}
              disabled={staffHours.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={markAllAsPaid}
              disabled={staffHours.length === 0}
              className="bg-pub-dark hover:bg-pub-DEFAULT text-white"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Mark All Paid
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {staffHours.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffHours.map((staffHour) => {
                    const staffMember = staff.find(s => s.id === staffHour.staffId);
                    const position = staffHour.shifts[0]?.position || '';
                    const allPaid = areAllShiftsPaid(staffHour);
                    
                    return (
                      <TableRow key={staffHour.staffId}>
                        <TableCell className="font-medium">{staffHour.staffName}</TableCell>
                        <TableCell>{position}</TableCell>
                        <TableCell className="text-right">{staffHour.totalHours.toFixed(1)}</TableCell>
                        <TableCell className="text-right">£{staffMember?.hourlyRate.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">£{staffHour.totalPay.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              allPaid
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {allPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsPaid(staffHour.staffId)}
                            disabled={allPaid}
                            className="whitespace-nowrap"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Paid
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="flex justify-end mt-6">
                <div className="bg-muted rounded-lg p-4 w-full sm:w-auto">
                  <div className="flex justify-between sm:space-x-8 mb-2">
                    <span className="text-sm text-muted-foreground">Total Hours:</span>
                    <span className="font-bold">{totalHours.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between sm:space-x-8">
                    <span className="text-sm text-muted-foreground">Total Payroll:</span>
                    <span className="font-bold text-lg">£{totalPay.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              No shifts scheduled for this week.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;
