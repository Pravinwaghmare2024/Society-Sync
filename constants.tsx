
import { User, UserRole, MaintenanceRecord, Notice, Complaint } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Doe', unit: 'A-101', role: UserRole.RESIDENT, email: 'john@example.com' },
  { id: 'u2', name: 'Admin Jane', unit: 'Office', role: UserRole.ADMIN, email: 'admin@society.com' },
];

export const MOCK_NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Elevator Maintenance',
    content: 'Elevator in Block B will be under maintenance tomorrow from 10 AM to 2 PM.',
    date: '2023-11-20',
    priority: 'HIGH',
    author: 'Management'
  },
  {
    id: 'n2',
    title: 'Water Supply Shutdown',
    content: 'Scheduled cleaning of the overhead tank this Sunday. Water supply will be interrupted.',
    date: '2023-11-21',
    priority: 'MEDIUM',
    author: 'Admin'
  }
];

export const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm1', unit: 'A-101', amount: 2500, dueDate: '2023-11-05', status: 'PAID', month: 'November', paidDate: '2023-11-02' },
  { id: 'm2', unit: 'A-101', amount: 2500, dueDate: '2023-10-05', status: 'PAID', month: 'October', paidDate: '2023-10-04' },
  { id: 'm3', unit: 'A-102', amount: 2500, dueDate: '2023-11-05', status: 'PENDING', month: 'November' },
  { id: 'm4', unit: 'B-205', amount: 2500, dueDate: '2023-10-05', status: 'OVERDUE', month: 'October' },
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
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
