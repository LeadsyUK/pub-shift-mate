
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Clock, CheckCircle } from 'lucide-react';
import { TimesheetEntry, Shift } from '@/types';
import { format } from 'date-fns';

const Timesheets = () => {
  const { 
    staff, 
    shifts, 
    timesheets, 
    currentWeekStart, 
    setCurrentWeekStart,
    addTimesheet,
    updateTimesheet,
    deleteTimesheet,
    clockIn,
    clockOut,
    getStaffById,
    isManager
  } = useApp();
  
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    staff.length > 0 ? staff[0].id : ''
  );
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTimesheet, setCurrentTimesheet] = useState<TimesheetEntry | null>(null);
  const [isClockInDialogOpen, setIsClockInDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<TimesheetEntry>>({
    staffId: selectedStaffId,
    shiftId: '',
    clockInTime: '',
    clockOutTime: '',
    manuallyEntered: true,
    notes: '',
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'shiftId') {
      const selectedShift = shifts.find(s => s.id === value);
      if (selectedShift) {
        // Set the staffId based on the selected shift
        setFormData({
          ...formData,
          shiftId: value,
          staffId: selectedShift.staffId
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const resetForm = () => {
    setFormData({
      staffId: selectedStaffId,
      shiftId: '',
      clockInTime: '',
      clockOutTime: '',
      manuallyEntered: true,
      notes: '',
    });
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleAddTimesheet = () => {
    if (formData.staffId && formData.shiftId && formData.clockInTime) {
      addTimesheet(formData as Omit<TimesheetEntry, 'id'>);
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEditClick = (timesheet: TimesheetEntry) => {
    setCurrentTimesheet(timesheet);
    setFormData({
      staffId: timesheet.staffId,
      shiftId: timesheet.shiftId,
      clockInTime: timesheet.clockInTime,
      clockOutTime: timesheet.clockOutTime || '',
      manuallyEntered: timesheet.manuallyEntered,
      notes: timesheet.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTimesheet = () => {
    if (currentTimesheet && formData.staffId && formData.shiftId && formData.clockInTime) {
      updateTimesheet({
        ...formData,
        id: currentTimesheet.id,
        staffId: formData.staffId,
        shiftId: formData.shiftId,
        clockInTime: formData.clockInTime,
        clockOutTime: formData.clockOutTime,
        manuallyEntered: formData.manuallyEntered || true,
        notes: formData.notes,
      } as TimesheetEntry);
      setIsEditDialogOpen(false);
      resetForm();
    }
  };

  const handleDeleteClick = (timesheet: TimesheetEntry) => {
    setCurrentTimesheet(timesheet);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTimesheet = () => {
    if (currentTimesheet) {
      deleteTimesheet(currentTimesheet.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleClockInClick = () => {
    resetForm();
    setIsClockInDialogOpen(true);
  };

  const handleClockInSubmit = () => {
    if (formData.staffId && formData.shiftId) {
      clockIn(formData.staffId, formData.shiftId);
      setIsClockInDialogOpen(false);
      resetForm();
    }
  };

  const handleClockOutClick = (timesheet: TimesheetEntry) => {
    clockOut(timesheet.id);
  };

  // Filter shifts for the week
  const startDate = currentWeekStart.toISOString().split('T')[0];
  const endDate = new Date(currentWeekStart);
  endDate.setDate(currentWeekStart.getDate() + 6);
  const endDateStr = endDate.toISOString().split('T')[0];
  
  const weekShifts = shifts.filter(
    shift => shift.date >= startDate && shift.date <= endDateStr
  );
  
  // Get timesheets for selected staff and current week
  const staffTimesheets = timesheets.filter(t => {
    // Extract the date part from clockInTime
    const date = t.clockInTime.split('T')[0];
    return t.staffId === selectedStaffId && date >= startDate && date <= endDateStr;
  });
  
  // Get active (clocked in but not out) timesheets
  const activeTimesheets = timesheets.filter(t => !t.clockOutTime);
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'dd MMM yyyy HH:mm');
  };
  
  // Calculate duration in hours
  const calculateDuration = (clockIn: string, clockOut: string | undefined) => {
    if (!clockOut) return 'In progress';
    
    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return `${durationHours.toFixed(2)} hrs`;
  };

  // Get shift display for a timesheet
  const getShiftDisplay = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return 'Unknown shift';
    
    const shiftDate = new Date(shift.date).toLocaleDateString('en-GB');
    return `${shiftDate} (${shift.startTime}-${shift.endTime})`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
        <div className="flex space-x-2">
          <Button onClick={handleClockInClick} className="bg-pub-dark hover:bg-pub-DEFAULT text-white">
            <Clock className="mr-2 h-4 w-4" />
            Clock In/Out
          </Button>
          {isManager() && (
            <Button onClick={handleAddClick} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Manual Entry
            </Button>
          )}
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous Week
          </Button>
          
          <h2 className="text-xl font-semibold">
            Week of {formatDay(currentWeekStart, true)}
          </h2>
          
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            Next Week
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <Button variant="link" size="sm" onClick={handleCurrentWeek}>
          Go to Current Week
        </Button>
      </div>

      <Tabs defaultValue="records">
        <TabsList className="mb-4">
          <TabsTrigger value="records">Timesheet Records</TabsTrigger>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Timesheet Records</CardTitle>
                <Select
                  value={selectedStaffId}
                  onValueChange={setSelectedStaffId}
                >
                  <SelectTrigger className="w-[200px] mt-2 sm:mt-0">
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
            </CardHeader>
            <CardContent>
              {staffTimesheets.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No timesheet records found for this period.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shift</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffTimesheets.map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        <TableCell>{getShiftDisplay(timesheet.shiftId)}</TableCell>
                        <TableCell>{formatTimestamp(timesheet.clockInTime)}</TableCell>
                        <TableCell>
                          {timesheet.clockOutTime 
                            ? formatTimestamp(timesheet.clockOutTime)
                            : 'Not clocked out'}
                        </TableCell>
                        <TableCell>
                          {calculateDuration(timesheet.clockInTime, timesheet.clockOutTime)}
                        </TableCell>
                        <TableCell>
                          {timesheet.manuallyEntered ? 'Manual' : 'Auto'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {!timesheet.clockOutTime && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClockOutClick(timesheet)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Clock Out
                              </Button>
                            )}
                            {isManager() && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(timesheet)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(timesheet)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Clock-In Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {activeTimesheets.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No active clock-in sessions.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Clock In Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeTimesheets.map((timesheet) => {
                      const staffMember = getStaffById(timesheet.staffId);
                      return (
                        <TableRow key={timesheet.id}>
                          <TableCell>{staffMember?.name || 'Unknown'}</TableCell>
                          <TableCell>{getShiftDisplay(timesheet.shiftId)}</TableCell>
                          <TableCell>{formatTimestamp(timesheet.clockInTime)}</TableCell>
                          <TableCell>
                            {calculateDuration(
                              timesheet.clockInTime, 
                              new Date().toISOString()
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleClockOutClick(timesheet)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Clock Out
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Timesheet Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Timesheet Entry</DialogTitle>
            <DialogDescription>
              Manually add a timesheet record for a staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="shiftId">Shift</Label>
              <Select
                value={formData.shiftId}
                onValueChange={(value) => handleSelectChange('shiftId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {weekShifts.map((shift) => {
                    const staffMember = getStaffById(shift.staffId);
                    const shiftDate = new Date(shift.date).toLocaleDateString('en-GB');
                    return (
                      <SelectItem key={shift.id} value={shift.id}>
                        {staffMember?.name} - {shiftDate} ({shift.startTime}-{shift.endTime})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clockInTime">Clock In Time</Label>
                <Input
                  id="clockInTime"
                  name="clockInTime"
                  type="datetime-local"
                  value={formData.clockInTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clockOutTime">Clock Out Time (optional)</Label>
                <Input
                  id="clockOutTime"
                  name="clockOutTime"
                  type="datetime-local"
                  value={formData.clockOutTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional information..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTimesheet}
              disabled={!formData.staffId || !formData.shiftId || !formData.clockInTime}
            >
              Add Timesheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Timesheet Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Timesheet Entry</DialogTitle>
            <DialogDescription>
              Update the timesheet record details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-shiftId">Shift</Label>
              <Select
                value={formData.shiftId}
                onValueChange={(value) => handleSelectChange('shiftId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => {
                    const staffMember = getStaffById(shift.staffId);
                    const shiftDate = new Date(shift.date).toLocaleDateString('en-GB');
                    return (
                      <SelectItem key={shift.id} value={shift.id}>
                        {staffMember?.name} - {shiftDate} ({shift.startTime}-{shift.endTime})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-clockInTime">Clock In Time</Label>
                <Input
                  id="edit-clockInTime"
                  name="clockInTime"
                  type="datetime-local"
                  value={formData.clockInTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-clockOutTime">Clock Out Time</Label>
                <Input
                  id="edit-clockOutTime"
                  name="clockOutTime"
                  type="datetime-local"
                  value={formData.clockOutTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes (optional)</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional information..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTimesheet}>
              Update Timesheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this timesheet record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTimesheet}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clock In Dialog */}
      <Dialog open={isClockInDialogOpen} onOpenChange={setIsClockInDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clock In/Out</DialogTitle>
            <DialogDescription>
              Record your work time by clocking in for a shift.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clockin-staffId">Staff Member</Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) => handleSelectChange('staffId', value)}
              >
                <SelectTrigger>
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
            
            <div className="grid gap-2">
              <Label htmlFor="clockin-shiftId">Shift</Label>
              <Select
                value={formData.shiftId}
                onValueChange={(value) => handleSelectChange('shiftId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts
                    .filter(s => s.staffId === formData.staffId)
                    .map((shift) => {
                      const shiftDate = new Date(shift.date).toLocaleDateString('en-GB');
                      return (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shiftDate} ({shift.startTime}-{shift.endTime})
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClockInDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleClockInSubmit}
              disabled={!formData.staffId || !formData.shiftId}
              className="bg-pub-dark hover:bg-pub-DEFAULT text-white"
            >
              <Clock className="mr-2 h-4 w-4" />
              Clock In Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timesheets;
