export interface Benefit {
  id: string;
  name: string;
  summary: string;
  applyUrl: string;
}

export const BENEFITS: Benefit[] = [
  {
    id: "universal-credit",
    name: "Universal Credit",
    summary: "Monthly payment to help with living costs for people on low income or out of work.",
    applyUrl: "https://www.gov.uk/universal-credit",
  },
  {
    id: "pip",
    name: "Personal Independence Payment (PIP)",
    summary: "Helps with extra costs if you have a long-term physical or mental health condition or disability.",
    applyUrl: "https://www.gov.uk/pip",
  },
  {
    id: "attendance-allowance",
    name: "Attendance Allowance",
    summary: "For people over State Pension age who need help with personal care or supervision due to illness or disability.",
    applyUrl: "https://www.gov.uk/attendance-allowance",
  },
  {
    id: "carers-allowance",
    name: "Carer's Allowance",
    summary: "Weekly payment for people who care for someone with a disability for at least 35 hours a week.",
    applyUrl: "https://www.gov.uk/carers-allowance",
  },
  {
    id: "pension-credit",
    name: "Pension Credit",
    summary: "Extra money for people over State Pension age on low income.",
    applyUrl: "https://www.gov.uk/pension-credit",
  },
  {
    id: "housing-benefit",
    name: "Housing Benefit",
    summary: "Helps pay rent if you’re on a low income.",
    applyUrl: "https://www.gov.uk/housing-benefit",
  },
  {
    id: "council-tax-reduction",
    name: "Council Tax Reduction",
    summary: "Helps pay Council Tax if you’re on a low income.",
    applyUrl: "https://www.gov.uk/apply-council-tax-reduction",
  },
  {
    id: "child-benefit",
    name: "Child Benefit",
    summary: "Weekly payment for people bringing up children.",
    applyUrl: "https://www.gov.uk/child-benefit",
  },
  {
    id: "child-tax-credit",
    name: "Child Tax Credit",
    summary: "Extra money for people bringing up children on a low income.",
    applyUrl: "https://www.gov.uk/child-tax-credit",
  },
  {
    id: "working-tax-credit",
    name: "Working Tax Credit",
    summary: "Extra money for people who work but are on a low income.",
    applyUrl: "https://www.gov.uk/working-tax-credit",
  },
  // Add more benefits below as needed...
];

export function getBenefit(id: string): Benefit | undefined {
  return BENEFITS.find((b) => b.id === id);
}