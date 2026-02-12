
import { User, UserRole, MaintenanceRecord, Notice, Complaint, StaffMember, StaffRole } from './types.ts';

const DEFAULT_SOCIETY_ID = 'soc_1';

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    societyId: DEFAULT_SOCIETY_ID,
    name: 'John Doe', 
    username: 'john', 
    password: 'password123', 
    unit: 'A-101', 
    role: UserRole.RESIDENT, 
    email: 'john@example.com',
    residencyType: 'OWNER'
  },
  { 
    id: 'u2', 
    societyId: DEFAULT_SOCIETY_ID,
    name: 'Admin Jane', 
    username: 'admin', 
    password: 'admin123', 
    unit: 'Office', 
    role: UserRole.ADMIN, 
    email: 'admin@society.com',
    residencyType: 'OWNER'
  },
];

export const MOCK_STAFF: StaffMember[] = [
  { id: 's1', societyId: DEFAULT_SOCIETY_ID, name: 'Ramesh Kumar', role: StaffRole.CLEANING, phone: '+91 98765 00001', allocatedFloors: [1, 2, 3], availability: '08:00 AM - 04:00 PM' },
  { id: 's2', societyId: DEFAULT_SOCIETY_ID, name: 'Suresh Singh', role: StaffRole.CLEANING, phone: '+91 98765 00002', allocatedFloors: [4, 5, 6], availability: '08:00 AM - 04:00 PM' },
  { id: 's3', societyId: DEFAULT_SOCIETY_ID, name: 'Sunita Devi', role: StaffRole.CLEANING, phone: '+91 98765 00003', allocatedFloors: [7, 8, 9, 10], availability: '09:00 AM - 05:00 PM' },
  { id: 's4', societyId: DEFAULT_SOCIETY_ID, name: 'Arjun Electric', role: StaffRole.ELECTRICAL, phone: '+91 98765 00004', allocatedFloors: [], availability: '24/7 (On Call)' },
  { id: 's5', societyId: DEFAULT_SOCIETY_ID, name: 'Vijay Plumber', role: StaffRole.PLUMBING, phone: '+91 98765 00005', allocatedFloors: [], availability: '10:00 AM - 06:00 PM' },
];

export const MOCK_NOTICES: Notice[] = [
  {
    id: 'n1',
    societyId: DEFAULT_SOCIETY_ID,
    title: 'Elevator Maintenance',
    content: 'Elevator in Block B will be under maintenance tomorrow from 10 AM to 2 PM.',
    date: '2023-11-20',
    priority: 'HIGH',
    author: 'Management'
  },
  {
    id: 'n2',
    societyId: DEFAULT_SOCIETY_ID,
    title: 'Water Supply Shutdown',
    content: 'Scheduled cleaning of the overhead tank this Sunday. Water supply will be interrupted.',
    date: '2023-11-21',
    priority: 'MEDIUM',
    author: 'Admin'
  }
];

export const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm1', societyId: DEFAULT_SOCIETY_ID, unit: 'A-101', amount: 2500, dueDate: '2023-11-05', status: 'PAID', month: 'November', paidDate: '2023-11-02' },
  { id: 'm2', societyId: DEFAULT_SOCIETY_ID, unit: 'A-101', amount: 2500, dueDate: '2023-10-05', status: 'PAID', month: 'October', paidDate: '2023-10-04' },
  { id: 'm3', societyId: DEFAULT_SOCIETY_ID, unit: 'A-102', amount: 2500, dueDate: '2023-11-05', status: 'PENDING', month: 'November' },
  { id: 'm4', societyId: DEFAULT_SOCIETY_ID, unit: 'B-205', amount: 2500, dueDate: '2023-10-05', status: 'OVERDUE', month: 'October' },
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    societyId: DEFAULT_SOCIETY_ID,
    title: 'Water Leakage',
    description: 'There is a major water leakage in the ceiling of my kitchen.',
    category: 'Plumbing',
    status: 'OPEN',
    residentId: 'u1',
    residentName: 'John Doe',
    unit: 'A-101',
    createdAt: '2023-11-18',
    aiPriority: 'Urgent',
    aiSummary: 'Ceiling leakage in kitchen needs immediate plumbing attention.'
  }
];
