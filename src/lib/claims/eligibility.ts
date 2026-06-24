import { Profile } from '../schemas/profile';

export type EligibilityResult = {
  benefit: string;
  id: string;
  weekly: number;
  reason: string;
  status: 'likely' | 'possible' | 'unlikely';
};

export type EligibilityResults = {
  likely: EligibilityResult[];
  possible: EligibilityResult[];
  unlikely: EligibilityResult[];
  totalWeekly: number;
};

export const runEligibility = (profile: Profile): EligibilityResults => {
  const results: EligibilityResults = {
    likely: [],
    possible: [],
    unlikely: [],
    totalWeekly: 0,
  };

  // Example core benefits (expanded from backup)
  const benefits = [
    {
      id: 'universal-credit',
      name: 'Universal Credit',
      weekly: 320,
      check: (p: Profile) => p.income && p.income < 2000 && p.residency === 'UK',
    },
    {
      id: 'pip',
      name: 'Personal Independence Payment',
      weekly: 92,
      check: (p: Profile) => p.hasDisability === true,
    },
    {
      id: 'attendance-allowance',
      name: 'Attendance Allowance',
      weekly: 108,
      check: (p: Profile) => p.age && p.age >= 66 && p.needsCare === true,
    },
    {
      id: 'carers-allowance',
      name: "Carer's Allowance",
      weekly: 67,
      check: (p: Profile) => p.isCaring === true,
    },
    // Add more from the full 79 benefits registry as needed
  ];

  benefits.forEach(b => {
    const isEligible = b.check(profile);
    const result: EligibilityResult = {
      benefit: b.name,
      id: b.id,
      weekly: b.weekly,
      reason: isEligible ? 'Matches your profile' : 'May qualify with more info',
      status: isEligible ? 'likely' : 'possible',
    };

    if (isEligible) {
      results.likely.push(result);
      results.totalWeekly += b.weekly;
    } else {
      results.possible.push(result);
    }
  });

  return results;
};