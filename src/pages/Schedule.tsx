
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { Shift as ShiftType } from '@/types';

const Schedule = () => {
  const { 
    staff, 
    shifts, 
    currentWeekStart, 
    setCurrentWeekStart,
    addShift,
    updateShift,
    deleteShift,
    getStaffById 
  } = useApp();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<ShiftType | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  const [formData, setFormData] = useState({
    staffId: '',
    date: '',
    startTime: '',
    endTime: '',
    position: '',
    notes: '',
    isPaid: false,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      staffId: '',
      date: '',
      startTime: '',
      endTime: '',
      position: '',
      notes: '',
      isPaid: false,
    });
  };

  const handleAddClick = (day: Date) => {
    setSelectedDay(day);
    setFormData({
      ...formData,
      date: day.toISOString().split('T')[0],
      staffId: staff.length > 0 ? staff[0].id : '',
      position: staff.length > 0 ? staff[0].position : '',
    });
    setIsAddDialogOpen(true);
  };

  const handleAddShift = () => {
    addShift(formData);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditClick = (shift: ShiftType) => {
    setCurrentShift(shift);
    setFormData({
      staffId: shift.staffId,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      position: shift.position,
      notes: shift.notes || '',
      isPaid: shift.isPaid,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateShift = () => {
    if (currentShift) {
      updateShift({ ...formData, id: currentShift.id });
      setIsEditDialogOpen(false);
      resetForm();
    }
  };

  const handleDeleteClick = (shift: ShiftType) => {
    setCurrentShift(shift);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteShift = () => {
    if (currentShift) {
      deleteShift(currentShift.id);
      setIsDeleteDialogOpen(false);
    }
  };

  // Group shifts by day
  const shiftsByDay = weekDays.map(day => {
    const dayStr = day.toISOString().split('T')[0];
    return {
      date: day,
      shifts: shifts.filter(shift => shift.date === dayStr),
    };
  });

  // Format time from 24hr to 12hr
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    return `${hour % 12 || 12}:${minutes}${hour >= 12 ? 'pm' : 'am'}`;
  };

  // Get staff positions (unique)
  const staffPositions = [...new Set(staff.map(s => s.position))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {shiftsByDay.map(({ date, shifts }) => (
          <Card key={date.toISOString()} className="md:min-h-[16rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <span className={date.getDay() === 0 || date.getDay() === 6 ? 'text-pub-accent' : ''}>
                  {formatDay(date)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAddClick(date)}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {shifts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center my-8">
                  No shifts scheduled
                </p>
              ) : (
                shifts.map(shift => {
                  const staffMember = getStaffById(shift.staffId);
                  return (
                    <div
                      key={shift.id}
                      className="p-2 rounded-md border bg-muted/50 text-sm relative"
                    >
                      <div className="font-medium">{staffMember?.name}</div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {shift.position}
                      </div>
                      <div className="text-xs">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </div>
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEditClick(shift)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteClick(shift)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Shift Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
            <DialogDescription>
              {selectedDay && `Add a shift for ${formatDay(selectedDay, true)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="staffId">Staff Member</Label>
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
              <Label htmlFor="position">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => handleSelectChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {staffPositions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
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
              onClick={handleAddShift} 
              disabled={!formData.staffId || !formData.startTime || !formData.endTime}
              className="bg-pub-dark hover:bg-pub-DEFAULT text-white"
            >
              Add Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>
              Update the shift details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-staffId">Staff Member</Label>
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
              <Label htmlFor="edit-position">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => handleSelectChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {staffPositions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input
                  id="edit-endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
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
            <Button onClick={handleUpdateShift} className="bg-pub-dark hover:bg-pub-DEFAULT text-white">
              Update Shift
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
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteShift}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
