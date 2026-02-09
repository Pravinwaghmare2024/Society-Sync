
export enum UserRole {
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT'
}

export enum StaffRole {
  CLEANING = 'Cleaning',
  PLUMBING = 'Plumbing',
  ELECTRICAL = 'Electrical',
  SECURITY = 'Security',
  GARDENING = 'Gardening'
}

export interface User {
  id: string;
  name: string;
  unit: string;
  role: UserRole;
  email: string;
}

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  allocatedFloors: number[]; // e.g. [1, 2, 3]
  availability: string;
}

export interface MaintenanceRecord {
  id: string;
  unit: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  month: string;
  paidDate?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  author: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  residentId: string;
  residentName: string;
  unit: string;
  createdAt: string;
  aiPriority?: string;
  aiSummary?: string;
}
