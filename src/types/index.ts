
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
