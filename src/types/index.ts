
// Staff member type
export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  hourlyRate: number;
  isActive: boolean;
  notes?: string;
  availability?: Availability[];
}

// Staff availability type
export interface Availability {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  recurrenceType: 'weekly' | 'oneTime';
  date?: string; // ISO date string for one-time availability
}

// Shift type
export interface Shift {
  id: string;
  staffId: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  position: string;
  notes?: string;
  isPaid: boolean;
  handoverNotes?: string;
}

// Computed hours and pay
export interface StaffHours {
  staffId: string;
  staffName: string;
  totalHours: number;
  totalPay: number;
  shifts: Shift[];
}

// Week interface for navigation
export interface Week {
  startDate: Date;
  endDate: Date;
  weekNumber: number;
  isCurrentWeek: boolean;
}

// Permission levels
export type UserRole = 'manager' | 'staff';

// User interface for permissions
export interface User {
  id: string;
  staffId: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
}

// Timesheet entry
export interface TimesheetEntry {
  id: string;
  staffId: string;
  shiftId: string;
  clockInTime: string; // ISO date-time string
  clockOutTime?: string; // ISO date-time string
  manuallyEntered: boolean;
  notes?: string;
}
