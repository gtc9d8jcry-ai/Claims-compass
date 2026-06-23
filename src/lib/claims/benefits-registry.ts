import { Profile } from '../schemas/profile';

export interface Benefit {
  id: string;
  name: string;
  description: string;
  weeklyAmount?: number;
  category: 'disability' | 'income' | 'carer' | 'pension' | 'housing' | 'other';
  checkEligibility: (profile: Profile) => boolean;
}

export const benefitsRegistry: Benefit[] = [
  {
    id: 'attendance_allowance',
    name: 'Attendance Allowance',
    description: 'For people over State Pension age who need help with personal care.',
    category: 'disability',
    checkEligibility: (p) => {
      if (!p.date_of_birth) return false;
      const age = calculateAge(p.date_of_birth);
      return age >= 66 && p.has_disability === true;
    }
  },
  {
    id: 'pip',
    name: 'Personal Independence Payment',
    description: 'For people under State Pension age with long-term health conditions.',
    category: 'disability',
    checkEligibility: (p) => {
      if (!p.date_of_birth) return false;
      const age = calculateAge(p.date_of_birth);
      return age < 66 && p.has_disability === true;
    }
  },
  {
    id: 'universal_credit',
    name: 'Universal Credit',
    description: 'Main benefit for low income or unemployed.',
    category: 'income',
    checkEligibility: (p) => p.weekly_income !== null && p.weekly_income < 1500,
  },
  {
    id: 'carers_allowance',
    name: 'Carer’s Allowance',
    description: 'For people caring for someone on disability benefits.',
    category: 'carer',
    checkEligibility: (p) => p.is_carer === true && p.caring_hours && p.caring_hours >= 35,
  },
  // Add more as needed from the full backup...
];

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}