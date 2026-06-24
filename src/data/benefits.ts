export interface Benefit {
  id: string;
  name: string;
  shortName: string;
  category: string;
  weeklyAmount?: number;
  description: string;
  applyUrl?: string;
  eligibilitySummary: string;
}

export const BENEFITS: Benefit[] = [
  {
    id: 'universal-credit',
    name: 'Universal Credit',
    shortName: 'UC',
    category: 'Income',
    weeklyAmount: 320,
    description: 'Monthly payment to help with living costs',
    eligibilitySummary: 'Low income, UK resident',
    applyUrl: 'https://www.gov.uk/universal-credit',
  },
  {
    id: 'pip',
    name: 'Personal Independence Payment',
    shortName: 'PIP',
    category: 'Disability',
    weeklyAmount: 92,
    description: 'Helps with extra costs of disability or long-term illness',
    eligibilitySummary: 'Difficulty with daily living or mobility',
    applyUrl: 'https://www.gov.uk/pip',
  },
  {
    id: 'attendance-allowance',
    name: 'Attendance Allowance',
    shortName: 'AA',
    category: 'Disability',
    weeklyAmount: 108,
    description: 'For people over State Pension age who need help with personal care',
    eligibilitySummary: 'State Pension age + care needs',
    applyUrl: 'https://www.gov.uk/attendance-allowance',
  },
  {
    id: 'carers-allowance',
    name: "Carer's Allowance",
    shortName: 'CA',
    category: 'Caring',
    weeklyAmount: 67,
    description: 'For people who care for someone with substantial care needs',
    eligibilitySummary: 'Caring 35+ hours/week',
    applyUrl: 'https://www.gov.uk/carers-allowance',
  },
  // More can be added from the 79 benefits list
  {
    id: 'pension-credit',
    name: 'Pension Credit',
    shortName: 'PC',
    category: 'Income',
    weeklyAmount: 200,
    description: 'Extra money for people over State Pension age',
    eligibilitySummary: 'Low income over pension age',
    applyUrl: 'https://www.gov.uk/pension-credit',
  },
];

export const getBenefitById = (id: string): Benefit | undefined => {
  return BENEFITS.find(b => b.id === id);
};

export const getBenefitsByCategory = (category: string): Benefit[] => {
  return BENEFITS.filter(b => b.category === category);
};