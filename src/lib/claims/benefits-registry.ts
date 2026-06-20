import { Profile } from '../schemas/profile';

export interface Benefit {
  id: string;
  name: string;
  description: string;
  weeklyAmount?: number;
  checkEligibility: (profile: Profile) => boolean;
}

export const benefitsRegistry: Benefit[] = [
  {
    id: 'attendance_allowance',
    name: 'Attendance Allowance',
    description: 'For people over State Pension age who need help with personal care.',
    checkEligibility: (p) => {
      if (!p.date_of_birth) return false;
      const age = calculateAge(p.date_of_birth);
      return age >= 66 && (p.has_disability === true);
    }
  },
  {
    id: 'universal_credit',
    name: 'Universal Credit',
    description: 'Main benefit for low income / unemployed.',
    checkEligibility: (p) => p.weekly_income !== null && p.weekly_income < 1500,
  },
];

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
