
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Staff, Shift, Availability, User, TimesheetEntry } from '@/types';
import { toast } from "@/hooks/use-toast";

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Initialize with some sample data
const initialStaff: Staff[] = [
  {
    id: generateId(),
    name: 'John Smith',
    email: 'john@example.com',
    phone: '07700 900123',
    position: 'Bartender',
    hourlyRate: 10.5,
    isActive: true,
    notes: 'Experienced bartender',
    availability: [
      {
        id: generateId(),
        staffId: '1', // Will be replaced in useEffect
        dayOfWeek: 1, // Monday
        startTime: '12:00',
        endTime: '23:00',
        isAvailable: true,
        recurrenceType: 'weekly',
      },
      {
        id: generateId(),
        staffId: '1', // Will be replaced in useEffect
        dayOfWeek: 2, // Tuesday
        startTime: '12:00',
        endTime: '23:00',
        isAvailable: true,
        recurrenceType: 'weekly',
      },
      {
        id: generateId(),
        staffId: '1', // Will be replaced in useEffect
        dayOfWeek: 5, // Friday
        startTime: '17:00',
        endTime: '23:00',
        isAvailable: true,
        recurrenceType: 'weekly',
      },
    ]
  },
  {
    id: generateId(),
    name: 'Sarah Jones',
    email: 'sarah@example.com',
    phone: '07700 900456',
    position: 'Server',
    hourlyRate: 9.75,
    isActive: true,
    notes: 'Student, available weekends only',
    availability: [
      {
        id: generateId(),
        staffId: '2', // Will be replaced in useEffect
        dayOfWeek: 5, // Friday
        startTime: '18:00',
        endTime: '23:59',
        isAvailable: true,
        recurrenceType: 'weekly',
      },
      {
        id: generateId(),
        staffId: '2', // Will be replaced in useEffect
        dayOfWeek: 6, // Saturday
        startTime: '12:00',
        endTime: '23:59',
        isAvailable: true,
        recurrenceType: 'weekly',
      },
      {
        id: generateId(),
        staffId: '2', // Will be replaced in useEffect
        dayOfWeek: 0, // Sunday
        startTime: '12:00',
        endTime: '20:00',
        isAvailable: true,
        recurrenceType: 'weekly',
      },
    ]
  },
];

// Initial users with roles
const initialUsers: User[] = [
  {
    id: generateId(),
    staffId: '', // Will be filled in useEffect
    email: 'john@example.com',
    role: 'staff',
  },
  {
    id: generateId(),
    staffId: '', // Will be filled in useEffect
    email: 'sarah@example.com',
    role: 'staff',
  },
  {
    id: generateId(),
    staffId: 'manager',
    email: 'manager@pubshiftmate.com',
    role: 'manager',
  }
];

// Get the current date and create a weeklong range of days
const today = new Date();
const currentDay = today.getDay();
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Start on Monday

const initialShifts: Shift[] = [
  {
    id: generateId(),
    staffId: initialStaff[0].id,
    date: new Date(startOfWeek).toISOString().split('T')[0],
    startTime: '12:00',
    endTime: '20:00',
    position: 'Bartender',
    isPaid: false,
    handoverNotes: 'Stock check completed. Low on gin, order needed.',
  },
  {
    id: generateId(),
    staffId: initialStaff[1].id,
    date: new Date(startOfWeek).toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '23:00',
    position: 'Server',
    isPaid: false,
  },
];

// Initial timesheet entries
const initialTimesheets: TimesheetEntry[] = [
  {
    id: generateId(),
    staffId: initialStaff[0].id,
    shiftId: initialShifts[0].id,
    clockInTime: `${initialShifts[0].date}T${initialShifts[0].startTime}:00`,
    clockOutTime: `${initialShifts[0].date}T${initialShifts[0].endTime}:00`,
    manuallyEntered: true,
    notes: 'Regular shift',
  }
];

interface AppContextType {
  staff: Staff[];
  shifts: Shift[];
  availabilities: Availability[];
  users: User[];
  timesheets: TimesheetEntry[];
  currentWeekStart: Date;
  currentUser: User | null;
  setCurrentWeekStart: React.Dispatch<React.SetStateAction<Date>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (staff: Staff) => void;
  deleteStaff: (id: string) => void;
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (shift: Shift) => void;
  deleteShift: (id: string) => void;
  addAvailability: (availability: Omit<Availability, 'id'>) => void;
  updateAvailability: (availability: Availability) => void;
  deleteAvailability: (id: string) => void;
  addTimesheet: (timesheet: Omit<TimesheetEntry, 'id'>) => void;
  updateTimesheet: (timesheet: TimesheetEntry) => void;
  deleteTimesheet: (id: string) => void;
  clockIn: (staffId: string, shiftId: string) => void;
  clockOut: (timesheetId: string) => void;
  getStaffById: (id: string) => Staff | undefined;
  getShiftsForWeek: (startDate: Date) => Shift[];
  getShiftsForStaff: (staffId: string) => Shift[];
  getAvailabilityForStaff: (staffId: string) => Availability[];
  getTimesheetsForShift: (shiftId: string) => TimesheetEntry[];
  calculateHours: (staffId: string, startDate: Date, endDate: Date) => number;
  isManager: () => boolean;
  exportToCSV: (startDate: Date, endDate: Date) => void;
  sendShiftReminder: (shiftId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staff, setStaff] = useState<Staff[]>(() => {
    const savedStaff = localStorage.getItem('staff');
    return savedStaff ? JSON.parse(savedStaff) : initialStaff;
  });
  
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const savedShifts = localStorage.getItem('shifts');
    return savedShifts ? JSON.parse(savedShifts) : initialShifts;
  });

  const [availabilities, setAvailabilities] = useState<Availability[]>(() => {
    // Extract availabilities from staff
    const extractedAvailabilities: Availability[] = [];
    staff.forEach(s => {
      if (s.availability) {
        extractedAvailabilities.push(...s.availability.map(a => ({...a, staffId: s.id})));
      }
    });
    
    const savedAvailabilities = localStorage.getItem('availabilities');
    return savedAvailabilities ? JSON.parse(savedAvailabilities) : extractedAvailabilities;
  });

  const [users, setUsers] = useState<User[]>(() => {
    // Match users with staff
    const matchedUsers = initialUsers.map(user => {
      if (user.role === 'manager') return user;
      
      const matchedStaff = staff.find(s => s.email === user.email);
      if (matchedStaff) {
        return {...user, staffId: matchedStaff.id};
      }
      return user;
    });
    
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : matchedUsers;
  });

  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(() => {
    const savedTimesheets = localStorage.getItem('timesheets');
    return savedTimesheets ? JSON.parse(savedTimesheets) : initialTimesheets;
  });
  
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Start on the Monday of the current week
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Default to the manager for demo purposes
    return users.find(u => u.role === 'manager') || null;
  });

  // Fix staff and availability references
  useEffect(() => {
    // Update staff availability references
    const updatedStaff = staff.map(s => {
      if (s.availability) {
        return {
          ...s,
          availability: s.availability.map(a => ({...a, staffId: s.id}))
        };
      }
      return s;
    });
    
    // Extract all availabilities
    const allAvailabilities: Availability[] = [];
    updatedStaff.forEach(s => {
      if (s.availability) {
        allAvailabilities.push(...s.availability);
        delete s.availability; // Remove from staff object
      }
    });
    
    setStaff(updatedStaff);
    setAvailabilities(allAvailabilities);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('availabilities', JSON.stringify(availabilities));
  }, [availabilities]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('timesheets', JSON.stringify(timesheets));
  }, [timesheets]);

  // Staff CRUD operations
  const addStaff = (newStaff: Omit<Staff, 'id'>) => {
    const staffWithId = { ...newStaff, id: generateId() };
    setStaff([...staff, staffWithId]);
    
    // Also create a user account for this staff
    const newUser: User = {
      id: generateId(),
      staffId: staffWithId.id,
      email: staffWithId.email,
      role: 'staff'
    };
    setUsers([...users, newUser]);
    
    toast({
      title: "Staff Member Added",
      description: `${newStaff.name} has been added to the system.`
    });
  };

  const updateStaff = (updatedStaff: Staff) => {
    setStaff(staff.map(s => s.id === updatedStaff.id ? updatedStaff : s));
    
    // Update email in user accounts if changed
    const staffUser = users.find(u => u.staffId === updatedStaff.id);
    if (staffUser && staffUser.email !== updatedStaff.email) {
      setUsers(users.map(u => 
        u.staffId === updatedStaff.id ? {...u, email: updatedStaff.email} : u
      ));
    }
    
    toast({
      title: "Staff Member Updated",
      description: `${updatedStaff.name}'s information has been updated.`
    });
  };

  const deleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
    // Also delete all shifts, availabilities, and timesheets for this staff member
    setShifts(shifts.filter(s => s.staffId !== id));
    setAvailabilities(availabilities.filter(a => a.staffId !== id));
    setTimesheets(timesheets.filter(t => t.staffId !== id));
    // And delete the user account
    setUsers(users.filter(u => u.staffId !== id));
    
    toast({
      title: "Staff Member Deleted",
      description: "The staff member has been removed from the system."
    });
  };

  // Shift CRUD operations
  const addShift = (newShift: Omit<Shift, 'id'>) => {
    const shiftWithId = { ...newShift, id: generateId() };
    setShifts([...shifts, shiftWithId]);
    
    toast({
      title: "Shift Added",
      description: "A new shift has been scheduled."
    });
  };

  const updateShift = (updatedShift: Shift) => {
    setShifts(shifts.map(s => s.id === updatedShift.id ? updatedShift : s));
    
    toast({
      title: "Shift Updated",
      description: "The shift details have been updated."
    });
  };

  const deleteShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
    // Also delete any timesheet entries for this shift
    setTimesheets(timesheets.filter(t => t.shiftId !== id));
    
    toast({
      title: "Shift Deleted",
      description: "The shift has been removed from the schedule."
    });
  };

  // Availability CRUD operations
  const addAvailability = (newAvailability: Omit<Availability, 'id'>) => {
    const availabilityWithId = { ...newAvailability, id: generateId() };
    setAvailabilities([...availabilities, availabilityWithId]);
    
    toast({
      title: "Availability Added",
      description: "Staff availability has been updated."
    });
  };

  const updateAvailability = (updatedAvailability: Availability) => {
    setAvailabilities(availabilities.map(a => 
      a.id === updatedAvailability.id ? updatedAvailability : a
    ));
    
    toast({
      title: "Availability Updated",
      description: "Staff availability has been updated."
    });
  };

  const deleteAvailability = (id: string) => {
    setAvailabilities(availabilities.filter(a => a.id !== id));
    
    toast({
      title: "Availability Removed",
      description: "Staff availability has been updated."
    });
  };

  // Timesheet CRUD operations
  const addTimesheet = (newTimesheet: Omit<TimesheetEntry, 'id'>) => {
    const timesheetWithId = { ...newTimesheet, id: generateId() };
    setTimesheets([...timesheets, timesheetWithId]);
    
    toast({
      title: "Timesheet Entry Added",
      description: "A new timesheet entry has been recorded."
    });
  };

  const updateTimesheet = (updatedTimesheet: TimesheetEntry) => {
    setTimesheets(timesheets.map(t => 
      t.id === updatedTimesheet.id ? updatedTimesheet : t
    ));
    
    toast({
      title: "Timesheet Updated",
      description: "The timesheet entry has been updated."
    });
  };

  const deleteTimesheet = (id: string) => {
    setTimesheets(timesheets.filter(t => t.id !== id));
    
    toast({
      title: "Timesheet Entry Deleted",
      description: "The timesheet entry has been removed."
    });
  };

  // Clock-in/out functionality
  const clockIn = (staffId: string, shiftId: string) => {
    const now = new Date();
    const clockInTime = now.toISOString();
    
    const newTimesheet: Omit<TimesheetEntry, 'id'> = {
      staffId,
      shiftId,
      clockInTime,
      manuallyEntered: false,
    };
    
    addTimesheet(newTimesheet);
    
    toast({
      title: "Clocked In",
      description: `Clock-in time recorded: ${now.toLocaleTimeString()}`
    });
  };

  const clockOut = (timesheetId: string) => {
    const now = new Date();
    const clockOutTime = now.toISOString();
    
    const timesheetEntry = timesheets.find(t => t.id === timesheetId);
    if (timesheetEntry) {
      updateTimesheet({
        ...timesheetEntry,
        clockOutTime
      });
      
      toast({
        title: "Clocked Out",
        description: `Clock-out time recorded: ${now.toLocaleTimeString()}`
      });
    }
  };

  // Utility functions
  const getStaffById = (id: string) => {
    return staff.find(s => s.id === id);
  };

  const getShiftsForWeek = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    return shifts.filter(shift => {
      return shift.date >= startStr && shift.date <= endStr;
    });
  };

  const getShiftsForStaff = (staffId: string) => {
    return shifts.filter(shift => shift.staffId === staffId);
  };

  const getAvailabilityForStaff = (staffId: string) => {
    return availabilities.filter(a => a.staffId === staffId);
  };

  const getTimesheetsForShift = (shiftId: string) => {
    return timesheets.filter(t => t.shiftId === shiftId);
  };

  const calculateHours = (staffId: string, startDate: Date, endDate: Date) => {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const staffShifts = shifts.filter(
      shift => shift.staffId === staffId && shift.date >= startStr && shift.date <= endStr
    );
    
    let totalHours = 0;
    
    staffShifts.forEach(shift => {
      const start = new Date(`${shift.date}T${shift.startTime}`);
      const end = new Date(`${shift.date}T${shift.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      totalHours += diffHours;
    });
    
    return totalHours;
  };

  // Role-based permissions
  const isManager = () => {
    return currentUser?.role === 'manager';
  };

  // Export to CSV
  const exportToCSV = (startDate: Date, endDate: Date) => {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    // Get all shifts in the date range
    const shiftsInRange = shifts.filter(
      shift => shift.date >= startStr && shift.date <= endStr
    );
    
    if (shiftsInRange.length === 0) {
      toast({
        title: "Export Failed",
        description: "No shifts found in the selected date range.",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare CSV content
    let csvContent = "Staff Name,Position,Date,Start Time,End Time,Hours,Pay Rate,Total Pay,Paid Status,Notes\n";
    
    shiftsInRange.forEach(shift => {
      const staffMember = getStaffById(shift.staffId);
      if (!staffMember) return;
      
      const start = new Date(`${shift.date}T${shift.startTime}`);
      const end = new Date(`${shift.date}T${shift.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      const pay = hours * staffMember.hourlyRate;
      
      const formattedDate = new Date(shift.date).toLocaleDateString('en-GB');
      
      csvContent += `"${staffMember.name}","${shift.position}","${formattedDate}","${shift.startTime}","${shift.endTime}",${hours.toFixed(2)},£${staffMember.hourlyRate.toFixed(2)},£${pay.toFixed(2)},"${shift.isPaid ? 'Paid' : 'Unpaid'}","${shift.notes || ''}"\n`;
    });
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_${startStr}_to_${endStr}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Payroll data has been exported to CSV."
    });
  };

  // Send shift reminder (simulated)
  const sendShiftReminder = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;
    
    const staffMember = getStaffById(shift.staffId);
    if (!staffMember) return;
    
    // In a real app, this would send an email or push notification
    // For demo purposes, we'll just show a toast
    toast({
      title: "Reminder Sent",
      description: `A shift reminder has been sent to ${staffMember.name} for their shift on ${new Date(shift.date).toLocaleDateString('en-GB')} at ${shift.startTime}.`
    });
  };

  const value = {
    staff,
    shifts,
    availabilities,
    users,
    timesheets,
    currentWeekStart,
    currentUser,
    setCurrentWeekStart,
    setCurrentUser,
    addStaff,
    updateStaff,
    deleteStaff,
    addShift,
    updateShift,
    deleteShift,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    addTimesheet,
    updateTimesheet,
    deleteTimesheet,
    clockIn,
    clockOut,
    getStaffById,
    getShiftsForWeek,
    getShiftsForStaff,
    getAvailabilityForStaff,
    getTimesheetsForShift,
    calculateHours,
    isManager,
    exportToCSV,
    sendShiftReminder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
