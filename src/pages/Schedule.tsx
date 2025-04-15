import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Calendar, Clock, AlertCircle, Bell, CheckCircle2 } from 'lucide-react';
import { Shift as ShiftType, Staff as StaffType, Availability as AvailabilityType } from '@/types';
import { toast } from "@/hooks/use-toast";

const Schedule = () => {
  const { 
    staff, 
    shifts, 
    availabilities,
    currentWeekStart, 
    setCurrentWeekStart,
    addShift,
    updateShift,
    deleteShift,
    getStaffById,
    sendShiftReminder,
    isManager
  } = useApp();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<ShiftType | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [draggedShift, setDraggedShift] = useState<ShiftType | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    staffId: '',
    date: '',
    startTime: '',
    endTime: '',
    position: '',
    notes: '',
    handoverNotes: '',
    isPaid: false,
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    return day;
  });

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
      handoverNotes: '',
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
      handoverNotes: shift.handoverNotes || '',
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

  const handleSendReminder = (shift: ShiftType) => {
    sendShiftReminder(shift.id);
  };

  const handleDragStart = (shift: ShiftType) => {
    if (!isManager()) return;
    setDraggedShift(shift);
  };

  const handleDragOver = (date: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDay(date);
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
  };

  const handleDrop = (date: string) => {
    if (draggedShift && date !== draggedShift.date) {
      updateShift({
        ...draggedShift,
        date
      });
      
      toast({
        title: "Shift Moved",
        description: `Shift has been moved to ${new Date(date).toLocaleDateString('en-GB')}`
      });
    }
    
    setDraggedShift(null);
    setDragOverDay(null);
  };

  const isStaffAvailable = (staffId: string, date: string, startTime: string, endTime: string): boolean => {
    const dayOfWeek = new Date(date).getDay();
    const staffAvailabilities = availabilities.filter(a => 
      a.staffId === staffId && 
      (a.recurrenceType === 'weekly' && a.dayOfWeek === dayOfWeek) ||
      (a.recurrenceType === 'oneTime' && a.date === date)
    );
    
    if (staffAvailabilities.length === 0) return true;
    
    for (const availability of staffAvailabilities) {
      if (!availability.isAvailable) return false;
      
      if (startTime >= availability.startTime && endTime <= availability.endTime) {
        return true;
      }
    }
    
    return false;
  };

  const shiftsByDay = weekDays.map(day => {
    const dayStr = day.toISOString().split('T')[0];
    return {
      date: day,
      dateStr: dayStr,
      shifts: shifts.filter(shift => shift.date === dayStr),
    };
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    return `${hour % 12 || 12}:${minutes}${hour >= 12 ? 'pm' : 'am'}`;
  };

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

      <Tabs defaultValue="grid">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {shiftsByDay.map(({ date, dateStr, shifts }) => (
              <Card 
                key={dateStr} 
                className={`md:min-h-[24rem] ${dragOverDay === dateStr ? 'border-primary border-2' : ''}`}
                onDragOver={(e) => handleDragOver(dateStr, e)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(dateStr)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span className={date.getDay() === 0 || date.getDay() === 6 ? 'text-pub-accent' : ''}>
                      {formatDay(date)}
                    </span>
                    {isManager() && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddClick(date)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
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
                      const isAvailable = staffMember ? isStaffAvailable(
                        staffMember.id, 
                        shift.date, 
                        shift.startTime, 
                        shift.endTime
                      ) : true;
                      
                      return (
                        <div
                          key={shift.id}
                          className={`p-2 rounded-md border text-sm relative cursor-move ${
                            !isAvailable ? 'bg-red-50 border-red-200' : 'bg-muted/50'
                          }`}
                          draggable={isManager()}
                          onDragStart={() => handleDragStart(shift)}
                        >
                          <div className="font-medium">{staffMember?.name}</div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center">
                            <Badge variant="outline" className="mr-1 py-0 px-1">
                              {shift.position}
                            </Badge>
                            {shift.isPaid && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-1 py-0 px-1">
                                Paid
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                          </div>
                          
                          {shift.handoverNotes && (
                            <div className="mt-1 text-xs italic text-muted-foreground border-t pt-1">
                              "{shift.handoverNotes}"
                            </div>
                          )}
                          
                          {!isAvailable && (
                            <div className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                              <AlertCircle className="h-3 w-3" />
                              <span>Availability conflict</span>
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2 flex space-x-1">
                            {isManager() && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleEditClick(shift)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleDeleteClick(shift)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleSendReminder(shift)}
                                  >
                                    <Bell className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Send shift reminder</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {shifts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No shifts scheduled for this week.
                </p>
              ) : (
                <div className="space-y-4">
                  {shiftsByDay.map(({ date, shifts }) => (
                    <div key={date.toISOString()}>
                      {shifts.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">
                            {formatDay(date, true)}
                          </h3>
                          <div className="space-y-2 pl-4 border-l-2 border-muted">
                            {shifts.map(shift => {
                              const staffMember = getStaffById(shift.staffId);
                              return (
                                <div 
                                  key={shift.id}
                                  className="p-3 border rounded-md flex justify-between items-center"
                                >
                                  <div>
                                    <div className="font-medium">{staffMember?.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {shift.position} • {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                    </div>
                                    {shift.handoverNotes && (
                                      <div className="mt-1 text-sm italic text-muted-foreground">
                                        "{shift.handoverNotes}"
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex space-x-2">
                                    {isManager() && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEditClick(shift)}
                                        >
                                          <Edit className="h-4 w-4 mr-1" />
                                          Edit
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDeleteClick(shift)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Delete
                                        </Button>
                                      </>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSendReminder(shift)}
                                    >
                                      <Bell className="h-4 w-4 mr-1" />
                                      Remind
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
            
            <div className="grid gap-2">
              <Label htmlFor="handoverNotes">Handover Notes (optional)</Label>
              <Textarea
                id="handoverNotes"
                name="handoverNotes"
                value={formData.handoverNotes}
                onChange={handleInputChange}
                placeholder="Notes for shift handover..."
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
            
            <div className="grid gap-2">
              <Label htmlFor="edit-handoverNotes">Handover Notes (optional)</Label>
              <Textarea
                id="edit-handoverNotes"
                name="handoverNotes"
                value={formData.handoverNotes}
                onChange={handleInputChange}
                placeholder="Notes for shift handover..."
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
