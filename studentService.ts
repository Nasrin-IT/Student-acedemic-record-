
import { StudentProfile, Semester } from './types';
import { ALLOWED_ROLL_NUMBERS } from './constants';

const STORAGE_KEY = 'spcet_student_profiles';

export const DEFAULT_SEMESTER_MARKS: Record<number, { code: string; subject: string; grade: string }[]> = {
  1: [
    { code: "BS3171", subject: "Engineering Mathematics I", grade: "O" },
    { code: "CY3151", subject: "Engineering Chemistry", grade: "O" },
    { code: "GE3151", subject: "Problem Solving & Python Programming", grade: "O" },
    { code: "GE3152", subject: "Heritage of Tamils", grade: "O" },
    { code: "GE3171", subject: "Problem Solving & Python Programming Laboratory", grade: "O" },
    { code: "GE3172", subject: "English Laboratory", grade: "O" },
    { code: "HS3152", subject: "Professional English I", grade: "O" },
    { code: "MA3151", subject: "Matrices and Calculus", grade: "O" },
    { code: "PH3151", subject: "Engineering Physics", grade: "O" }
  ],
  2: [
    { code: "BE3251", subject: "Basic Electrical & Electronics Engineering", grade: "O" },
    { code: "CS3251", subject: "Programming in C", grade: "O" },
    { code: "CS3271", subject: "Programming in C Laboratory", grade: "O" },
    { code: "GE3251", subject: "Engineering Graphics", grade: "O" },
    { code: "GE3252", subject: "Tamils and Technology", grade: "O" },
    { code: "GE3271", subject: "Engineering Practices Laboratory", grade: "O" },
    { code: "GE3272", subject: "Communication Laboratory", grade: "O" },
    { code: "HS3252", subject: "Professional English II", grade: "O" },
    { code: "MA3251", subject: "Statistics and Numerical Methods", grade: "O" },
    { code: "PH3256", subject: "Physics for Information Science", grade: "O" }
  ],
  3: [
    { code: "CD3281", subject: "Data Structures", grade: "O" },
    { code: "CD3291", subject: "Data Structures Laboratory", grade: "O" },
    { code: "CS3351", subject: "Digital Principles and Computer Organization", grade: "O" },
    { code: "CS3352", subject: "Foundations of Data Science", grade: "O" },
    { code: "CS3361", subject: "Object Oriented Programming", grade: "O" },
    { code: "CS3381", subject: "Object Oriented Programming Laboratory", grade: "O" },
    { code: "CS3391", subject: "Database Management Systems", grade: "O" },
    { code: "GE3361", subject: "Professional Development", grade: "O" },
    { code: "MA3354", subject: "Discrete Mathematics", grade: "O" }
  ],
  4: [
    { code: "CS3452", subject: "Theory of Computation", grade: "O" },
    { code: "CS3491", subject: "Artificial Intelligence and Machine Learning", grade: "O" },
    { code: "CS3492", subject: "Artificial Intelligence and Machine Learning Laboratory", grade: "O" },
    { code: "IT3401", subject: "Web Essentials", grade: "O" },
    { code: "CS3451", subject: "Introduction to Operating Systems", grade: "O" },
    { code: "GE3451", subject: "Environmental Sciences and Sustainability", grade: "O" },
    { code: "CS3461", subject: "Operating Systems Laboratory", grade: "O" },
    { code: "CS3481", subject: "Database Management Systems Laboratory", grade: "O" }
  ],
  5: [
    { code: "CS3591", subject: "Computer Networks", grade: "O" },
    { code: "IT3501", subject: "Full Stack Development", grade: "O" },
    { code: "CS3551", subject: "Distributed Computing", grade: "O" },
    { code: "CS3691", subject: "Embedded Systems and IoT", grade: "O" },
    { code: "CCS335", subject: "Professional Elective I", grade: "O" },
    { code: "CCS354", subject: "Professional Elective II", grade: "O" },
    { code: "MX3083", subject: "Mandatory Elective", grade: "O" },
    { code: "IT3511", subject: "Full Stack Development Laboratory", grade: "O" }
  ]
};

export const getStudents = async (): Promise<StudentProfile[]> => {
  const response = await fetch('/api/students');
  if (!response.ok) throw new Error('Failed to fetch students');
  return response.json();
};

export const getStudentByRoll = async (roll: string): Promise<StudentProfile | undefined> => {
  const response = await fetch(`/api/students/${roll}`);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error('Failed to fetch student profile');
  return response.json();
};

export const saveStudent = async (profile: StudentProfile): Promise<void> => {
  const response = await fetch('/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profile)
  });
  if (!response.ok) throw new Error('Failed to save student profile');
};

export const deleteStudent = async (id: string): Promise<void> => {
  const response = await fetch(`/api/students/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete student');
};

export const createEmptyProfile = (rollNumber: string, name: string): StudentProfile => {
  const semesters: Semester[] = Array.from({ length: 8 }, (_, i) => {
    const semNum = i + 1;
    const defaultMarks = DEFAULT_SEMESTER_MARKS[semNum];
    if (defaultMarks) {
      return {
        number: semNum,
        cgpa: '10.00',
        marks: defaultMarks.map(m => ({ ...m }))
      };
    } else {
      return {
        number: semNum,
        cgpa: '0.00',
        marks: Array(8).fill(null).map(() => ({ code: '', subject: '', grade: '' }))
      };
    }
  });

  return {
    id: crypto.randomUUID(),
    rollNumber,
    registerNo: rollNumber,
    fullName: name,
    gender: 'Male / Female',
    dob: '',
    bloodGroup: '',
    community: 'OC / BCM / BC / MBC / SCA / SC / ST',
    phone: '',
    email: '',
    address: '',
    fatherName: '',
    fatherOccupation: '',
    fatherPhone: '',
    motherName: '',
    motherOccupation: '',
    motherPhone: '',
    annualIncomeFather: '',
    annualIncomeMother: '',
    communicationAddress: '',
    programme: 'B.Tech',
    branch: 'Information Technology',
    section: 'A Section',
    academicYear: '2023 - 2027',
    entryType: 'Regular',
    admissionType: 'DOTE',
    schoolLastStudied: '',
    facultyCounsellor: ['', '', ''],
    semesters,
    certificates: []
  };
};
