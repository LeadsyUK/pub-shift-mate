
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Staff, Shift } from '@/types';

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
    notes: 'Experienced bartender'
  },
  {
    id: generateId(),
    name: 'Sarah Jones',
    email: 'sarah@example.com',
    phone: '07700 900456',
    position: 'Server',
    hourlyRate: 9.75,
    isActive: true,
    notes: 'Student, available weekends only'
  },
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

interface AppContextType {
  staff: Staff[];
  shifts: Shift[];
  currentWeekStart: Date;
  setCurrentWeekStart: React.Dispatch<React.SetStateAction<Date>>;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (staff: Staff) => void;
  deleteStaff: (id: string) => void;
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (shift: Shift) => void;
  deleteShift: (id: string) => void;
  getStaffById: (id: string) => Staff | undefined;
  getShiftsForWeek: (startDate: Date) => Shift[];
  getShiftsForStaff: (staffId: string) => Shift[];
  calculateHours: (staffId: string, startDate: Date, endDate: Date) => number;
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
  
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Start on the Monday of the current week
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
  }, [shifts]);

  // Staff CRUD operations
  const addStaff = (newStaff: Omit<Staff, 'id'>) => {
    const staffWithId = { ...newStaff, id: generateId() };
    setStaff([...staff, staffWithId]);
  };

  const updateStaff = (updatedStaff: Staff) => {
    setStaff(staff.map(s => s.id === updatedStaff.id ? updatedStaff : s));
  };

  const deleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
    // Also delete all shifts associated with this staff member
    setShifts(shifts.filter(s => s.staffId !== id));
  };

  // Shift CRUD operations
  const addShift = (newShift: Omit<Shift, 'id'>) => {
    const shiftWithId = { ...newShift, id: generateId() };
    setShifts([...shifts, shiftWithId]);
  };

  const updateShift = (updatedShift: Shift) => {
    setShifts(shifts.map(s => s.id === updatedShift.id ? updatedShift : s));
  };

  const deleteShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
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

  const value = {
    staff,
    shifts,
    currentWeekStart,
    setCurrentWeekStart,
    addStaff,
    updateStaff,
    deleteStaff,
    addShift,
    updateShift,
    deleteShift,
    getStaffById,
    getShiftsForWeek,
    getShiftsForStaff,
    calculateHours,
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
