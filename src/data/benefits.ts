export interface Benefit {
  id: string;
  name: string;
  shortName: string;
  category: string;
  weeklyAmount?: number;
  description: string;
  eligibilitySummary: string;
  applyUrl?: string;
}

export const BENEFITS: Benefit[] = [
  {
    id: 'universal-credit',
    name: 'Universal Credit',
    shortName: 'UC',
    category: 'Income',
    weeklyAmount: 320,
    description: 'Monthly payment to help with living costs for people on low income',
    eligibilitySummary: 'Low income, UK resident, aged 18+',
    applyUrl: 'https://www.gov.uk/universal-credit',
  },
  {
    id: 'pip',
    name: 'Personal Independence Payment',
    shortName: 'PIP',
    category: 'Disability',
    weeklyAmount: 92,
    description: 'Helps with extra costs of long-term illness or disability',
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
    eligibilitySummary: 'State Pension age + care needs (day and/or night)',
    applyUrl: 'https://www.gov.uk/attendance-allowance',
  },
  {
    id: 'carers-allowance',
    name: "Carer's Allowance",
    shortName: 'CA',
    category: 'Caring',
    weeklyAmount: 67,
    description: 'Weekly payment for people who care for someone with substantial care needs',
    eligibilitySummary: 'Caring for 35+ hours per week',
    applyUrl: 'https://www.gov.uk/carers-allowance',
  },
  {
    id: 'pension-credit',
    name: 'Pension Credit',
    shortName: 'PC',
    category: 'Income',
    weeklyAmount: 200,
    description: 'Extra money for people over State Pension age on low income',
    eligibilitySummary: 'Over State Pension age with low income/savings',
    applyUrl: 'https://www.gov.uk/pension-credit',
  },
  {
    id: 'housing-benefit',
    name: 'Housing Benefit',
    shortName: 'HB',
    category: 'Housing',
    weeklyAmount: 150,
    description: 'Helps pay rent if you have a low income',
    eligibilitySummary: 'Low income, paying rent',
    applyUrl: 'https://www.gov.uk/housing-benefit',
  },
  {
    id: 'council-tax-reduction',
    name: 'Council Tax Reduction',
    shortName: 'CTR',
    category: 'Housing',
    description: 'Reduces your council tax bill if you have a low income',
    eligibilitySummary: 'Low income, liable for council tax',
    applyUrl: 'https://www.gov.uk/apply-council-tax-reduction',
  },
  {
    id: 'child-benefit',
    name: 'Child Benefit',
    shortName: 'CB',
    category: 'Children',
    weeklyAmount: 25,
    description: 'Weekly payment for people bringing up children',
    eligibilitySummary: 'Responsible for a child under 16 (or 20 in education)',
    applyUrl: 'https://www.gov.uk/child-benefit',
  },
  {
    id: 'child-tax-credit',
    name: 'Child Tax Credit',
    shortName: 'CTC',
    category: 'Children',
    description: 'Extra money to help with the costs of raising children',
    eligibilitySummary: 'Low income with children',
    applyUrl: 'https://www.gov.uk/child-tax-credit',
  },
  {
    id: 'working-tax-credit',
    name: 'Working Tax Credit',
    shortName: 'WTC',
    category: 'Income',
    description: 'Extra money for people who work but are on a low income',
    eligibilitySummary: 'Working but low income',
    applyUrl: 'https://www.gov.uk/working-tax-credit',
  },
  // We can continue expanding this toward the full ~79 benefits
];

export const getBenefitById = (id: string): Benefit | undefined => {
  return BENEFITS.find(b => b.id === id);
};

export const getBenefitsByCategory = (category: string): Benefit[] => {
  return BENEFITS.filter(b => b.category === category);
};