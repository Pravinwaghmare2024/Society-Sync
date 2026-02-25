
export const UserRole = {
  ADMIN: 'ADMIN',
  RESIDENT: 'RESIDENT'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const StaffRole = {
  CLEANING: 'Cleaning',
  PLUMBING: 'Plumbing',
  ELECTRICAL: 'Electrical',
  SECURITY: 'Security',
  GARDENING: 'Gardening'
} as const;
export type StaffRole = typeof StaffRole[keyof typeof StaffRole];

export type DatabaseMode = 'LOCAL_STORAGE' | 'PRODUCTION_REST_API' | 'FIREBASE_REALTIME' | 'POSTGRESQL' | 'MYSQL' | 'MONGODB';

export type ServerStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE';

export interface ServerInstance {
  id: string;
  name: string;
  endpoint: string;
  status: ServerStatus;
  region: string;
  isDefault?: boolean;
}

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

export type DocumentType = 'AADHAR' | 'POLICE_VERIFICATION' | 'RENT_AGREEMENT' | 'OTHER' | string;
export type DocumentStatus = 'MISSING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';

export interface UserDocument {
  type: DocumentType;
  status: DocumentStatus;
  fileName?: string;
  uploadDate?: string;
  verifiedBy?: string;
  customLabel?: string;
}

export interface User {
  id: string;
  societyId: string;
  name: string;
  username: string;
  password?: string;
  unit: string;
  role: UserRole;
  email: string;
  residencyType?: 'OWNER' | 'TENANT';
  documents?: UserDocument[];
}

export interface StaffMember {
  id: string;
  societyId: string;
  name: string;
  phone: string;
  role: StaffRole;
  allocatedFloors: number[];
  availability: string;
}

export interface MaintenanceRecord {
  id: string;
  societyId: string;
  unit: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'AWAITING_APPROVAL';
  month: string;
  paidDate?: string;
  transactionId?: string;
  proofFileName?: string;
}

export interface Notice {
  id: string;
  societyId: string;
  title: string;
  content: string;
  date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  author: string;
}

export interface Complaint {
  id: string;
  societyId: string;
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
  id: string;
  code: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  registrationNo: string;
  gstNumber: string;
  baseMaintenance: number;
  lateFeePercent: number;
  billingDay: number;
  complaintCategories: string[];
  requiredDocumentTypes: string[];
  logoUrl?: string;
}

export type VoucherType = 'PAYMENT' | 'RECEIPT' | 'JOURNAL';
export type AccountType = 'BANK' | 'CASH' | 'PETTY_CASH';

export interface Voucher {
  id: string;
  societyId: string;
  date: string;
  type: VoucherType;
  account: AccountType;
  amount: number;
  description: string;
  category: string;
  reference?: string;
}

export interface SalaryPayment {
  id: string;
  societyId: string;
  staffId: string;
  staffName: string;
  amount: number;
  month: string;
  date: string;
  status: 'PAID' | 'PENDING';
  paymentMethod: AccountType;
}

export interface AccountBalance {
  societyId: string;
  bank: number;
  cash: number;
  pettyCash: number;
}
