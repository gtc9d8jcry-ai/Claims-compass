import { Benefit } from '../../data/benefits';

export const benefitsRegistry: Benefit[] = [
  {
    id: 'universal-credit',
    name: 'Universal Credit',
    shortName: 'UC',
    category: 'Income',
    weeklyAmount: 320,
    description: 'Helps with living costs if you have a low income',
    eligibilitySummary: 'Low income, in GB, aged 18+ (usually)',
    applyUrl: 'https://www.gov.uk/universal-credit',
  },
  {
    id: 'pip',
    name: 'Personal Independence Payment',
    shortName: 'PIP',
    category: 'Disability',
    weeklyAmount: 92,
    description: 'Helps with extra costs caused by disability or illness',
    eligibilitySummary: 'Difficulty with daily living or getting around',
    applyUrl: 'https://www.gov.uk/pip',
  },
  {
    id: 'attendance-allowance',
    name: 'Attendance Allowance',
    shortName: 'AA',
    category: 'Disability',
    weeklyAmount: 108,
    description: 'For people over State Pension age who need help with care',
    eligibilitySummary: 'State Pension age + care needs (day and/or night)',
    applyUrl: 'https://www.gov.uk/attendance-allowance',
  },
  {
    id: 'carers-allowance',
    name: "Carer's Allowance",
    shortName: 'CA',
    category: 'Caring',
    weeklyAmount: 67,
    description: 'Support for carers who look after someone with substantial care needs',
    eligibilitySummary: 'Caring 35+ hours per week',
    applyUrl: 'https://www.gov.uk/carers-allowance',
  },
  {
    id: 'pension-credit',
    name: 'Pension Credit',
    shortName: 'PC',
    category: 'Income',
    weeklyAmount: 200,
    description: 'Extra money to help with living costs if you’re over State Pension age',
    eligibilitySummary: 'Over pension age with low income',
    applyUrl: 'https://www.gov.uk/pension-credit',
  },
  // We can keep expanding this list towards the full 79
];

export const getBenefit = (id: string) => benefitsRegistry.find(b => b.id === id);