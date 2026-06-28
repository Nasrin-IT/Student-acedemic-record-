
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  rollNumber?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  data: string; // Base64
}

export interface SemesterMark {
  code: string;
  subject: string;
  grade: string;
}

export interface Semester {
  number: number;
  marks: SemesterMark[];
  cgpa: string;
}

export interface StudentProfile {
  id: string;
  rollNumber: string;
  registerNo: string;
  fullName: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  community: string;
  phone: string;
  email: string;
  address: string;
  fatherName: string;
  fatherOccupation: string;
  fatherPhone: string;
  motherName: string;
  motherOccupation: string;
  motherPhone: string;
  annualIncomeFather: string;
  annualIncomeMother: string;
  communicationAddress: string;
  
  programme: string;
  branch: string;
  section: string;
  academicYear: string;
  entryType: 'Regular' | 'Lateral';
  admissionType: 'DOTE' | 'Management';
  schoolLastStudied: string;
  facultyCounsellor: string[];

  semesters: Semester[];
  
  photo?: string; // Base64 string
  idProof?: DocumentFile;
  certificates: DocumentFile[];
}
