
export type Role = 'elder' | 'helper' | 'admin';

export type HelperType = 'Student' | 'Part-Time' | 'Volunteer';

export type ServiceCategory = 'Basic' | 'Technical' | 'Personal';

export type RequestStatus = 'searching' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  password?: string;
  phone: string;
  age: number;
  language: 'English' | 'Tamil';
  avatar: string;
  // Elder fields
  address?: string;
  // Helper fields
  helperType?: HelperType;
  categories?: ServiceCategory[];
  verificationStatus?: VerificationStatus;
  documents?: string[]; // file names
  orgName?: string; // For certificates
}

export interface CareRequest {
  id: string;
  elderId: string;
  helperId: string | null;
  category: ServiceCategory;
  description: string;
  voiceNote?: string;
  photo?: string;
  timestamp: string;
  pickupAddress?: string;
  dropAddress?: string;
  distanceKm: number;
  hours: number;
  status: RequestStatus;
  payment: number;
  isPaid?: boolean; // New field for payment tracking
  rating?: number;
  feedback?: string;
}

export interface Certificate {
  id: string;
  helperId: string;
  issueDate: string;
  status: 'pending' | 'approved';
}
