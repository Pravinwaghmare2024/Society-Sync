
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

export type DatabaseMode = 'LOCAL_STORAGE' | 'PRODUCTION_REST_API' | 'FIREBASE_REALTIME' | 'POSTGRESQL' | 'MYSQL' | 'MONGODB';

export interface WebServerConfig {
  basePath: string;
  staticCacheMaxAge: number;
  enableGzip: boolean;
  enableCsp: boolean;
  hstsMaxAge: number;
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  secure: boolean;
  senderName: string;
}

export interface SystemConfig {
  dbMode: DatabaseMode;
  apiEndpoint: string;
  authToken: string;
  // Database specific connection details
  dbHost?: string;
  dbPort?: number;
  dbName?: string;
  dbUser?: string;
  dbPassword?: string;
  dbSsl?: boolean;
  
  isMaintenanceMode: boolean;
  version: string;
  webServer: WebServerConfig;
  smtp: SmtpConfig;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  unit: string;
  role: UserRole;
  email: string;
  residencyType?: 'OWNER' | 'TENANT';
}

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  allocatedFloors: number[];
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

export interface SocietySettings {
  name: string;
  address: string;
  registrationNo: string;
  gstNumber: string;
  baseMaintenance: number;
  lateFeePercent: number;
  billingDay: number;
}
