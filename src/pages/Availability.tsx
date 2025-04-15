
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Availability as AvailabilityType } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Availability = () => {
  const { staff, availabilities, addAvailability, updateAvailability, deleteAvailability } = useApp();
  const { toast } = useToast();
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff.length > 0 ? staff[0].id : '');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAvailability, setCurrentAvailability] = useState<AvailabilityType | null>(null);
  
  const [formData, setFormData] = useState<Omit<AvailabilityType, 'id'>>({
    staffId: selectedStaffId,
    dayOfWeek: 1, // Monday default
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
    recurrenceType: 'weekly',
  });

  const staffAvailability = availabilities.filter(a => a.staffId === selectedStaffId);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: name === 'dayOfWeek' ? parseInt(value, 10) : value,
    });
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isAvailable: checked,
    });
  };
  
  const resetForm = () => {
    setFormData({
      staffId: selectedStaffId,
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
      recurrenceType: 'weekly',
    });
  };
  
  const handleAddClick = () => {
    setFormData({
      ...formData,
      staffId: selectedStaffId,
    });
    setIsAddDialogOpen(true);
  };
  
  const handleAddAvailability = () => {
    addAvailability(formData);
    setIsAddDialogOpen(false);
    resetForm();
  };
  
  const handleEditClick = (availability: AvailabilityType) => {
    setCurrentAvailability(availability);
    setFormData({
      staffId: availability.staffId,
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      isAvailable: availability.isAvailable,
      recurrenceType: availability.recurrenceType,
      date: availability.date,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateAvailability = () => {
    if (currentAvailability) {
      updateAvailability({ ...formData, id: currentAvailability.id });
      setIsEditDialogOpen(false);
      resetForm();
    }
  };
  
  const handleDeleteClick = (availability: AvailabilityType) => {
    setCurrentAvailability(availability);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteAvailability = () => {
    if (currentAvailability) {
      deleteAvailability(currentAvailability.id);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Staff Availability</h1>
        <Button
          onClick={handleAddClick}
          className="bg-pub-dark hover:bg-pub-DEFAULT text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Availability
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Staff Member</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedStaffId}
                onValueChange={(value) => setSelectedStaffId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((staffMember) => (
                    <SelectItem key={staffMember.id} value={staffMember.id}>
                      {staffMember.name} ({staffMember.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {staff.find(s => s.id === selectedStaffId)?.name || 'Staff'} Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="weekly">
                <TabsList className="mb-4">
                  <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="weekly">
                  <div className="grid grid-cols-7 gap-2 text-center font-medium">
                    {dayNames.map((day, index) => (
                      <div key={day} className="text-sm">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {dayNames.map((day, index) => {
                      const dayAvailabilities = staffAvailability.filter(
                        a => a.dayOfWeek === index && a.recurrenceType === 'weekly'
                      );
                      
                      return (
                        <div
                          key={day}
                          className="border rounded-md p-2 min-h-[100px] bg-muted/30"
                        >
                          {dayAvailabilities.length > 0 ? (
                            dayAvailabilities.map(availability => (
                              <div 
                                key={availability.id}
                                className={`text-xs p-1 my-1 rounded-sm flex justify-between items-center ${
                                  availability.isAvailable 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                <span>
                                  {availability.startTime} - {availability.endTime}
                                </span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleEditClick(availability)}
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(availability)}
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground h-full flex items-center justify-center">
                              No availability set
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="list">
                  <div className="space-y-4">
                    {staffAvailability.length > 0 ? (
                      staffAvailability.map(availability => (
                        <div
                          key={availability.id}
                          className={`p-3 border rounded-md flex justify-between items-center ${
                            availability.isAvailable
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div>
                            <div className="font-medium">
                              {dayNames[availability.dayOfWeek]}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {availability.startTime} - {availability.endTime}
                            </div>
                            <div className="text-xs mt-1">
                              {availability.isAvailable ? 'Available' : 'Unavailable'} •{' '}
                              {availability.recurrenceType === 'weekly' ? 'Weekly' : 'One-time'}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(availability)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(availability)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6 text-muted-foreground">
                        No availability records found for this staff member.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Availability Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
            <DialogDescription>
              Set when this staff member is available to work.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recurrenceType">Recurrence Type</Label>
              <Select
                value={formData.recurrenceType}
                onValueChange={(value) => handleSelectChange('recurrenceType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly (Recurring)</SelectItem>
                  <SelectItem value="oneTime">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select
                value={formData.dayOfWeek.toString()}
                onValueChange={(value) => handleSelectChange('dayOfWeek', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={day} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {formData.recurrenceType === 'oneTime' && (
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
            
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
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isAvailable">
                {formData.isAvailable ? 'Available' : 'Unavailable'}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddAvailability}
              className="bg-pub-dark hover:bg-pub-DEFAULT text-white"
            >
              Add Availability
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Availability Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Availability</DialogTitle>
            <DialogDescription>
              Update when this staff member is available to work.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-recurrenceType">Recurrence Type</Label>
              <Select
                value={formData.recurrenceType}
                onValueChange={(value) => handleSelectChange('recurrenceType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly (Recurring)</SelectItem>
                  <SelectItem value="oneTime">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-dayOfWeek">Day of Week</Label>
              <Select
                value={formData.dayOfWeek.toString()}
                onValueChange={(value) => handleSelectChange('dayOfWeek', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={day} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {formData.recurrenceType === 'oneTime' && (
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input 
                  id="edit-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
            
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
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="edit-isAvailable">
                {formData.isAvailable ? 'Available' : 'Unavailable'}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAvailability}
              className="bg-pub-dark hover:bg-pub-DEFAULT text-white"
            >
              Update Availability
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
              Are you sure you want to delete this availability record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAvailability}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Availability;
