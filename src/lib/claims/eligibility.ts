import { Profile } from '../schemas/profile';
import { BENEFITS, Benefit } from '../data/benefits';

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

  if (!profile) return results;

  const age = profile.age || 0;
  const lowerIncome = (profile.income || 0) < 2500;
  const hasDisability = profile.hasDisability === true;
  const needsCare = profile.needsCare === true;
  const isCaring = profile.isCaring === true;
  const over66 = age >= 66;

  BENEFITS.forEach((benefit: Benefit) => {
    let status: 'likely' | 'possible' | 'unlikely' = 'possible';
    let reason = 'May qualify with more information';

    // Core logic based on profile
    if (benefit.id === 'universal-credit' && lowerIncome) {
      status = 'likely';
      reason = 'Low income matches eligibility';
    } else if (benefit.id === 'pip' && hasDisability) {
      status = 'likely';
      reason = 'Disability / mobility needs';
    } else if (benefit.id === 'attendance-allowance' && over66 && needsCare) {
      status = 'likely';
      reason = 'Over pension age with care needs';
    } else if (benefit.id === 'carers-allowance' && isCaring) {
      status = 'likely';
      reason = 'Providing substantial care';
    } else if (benefit.id === 'pension-credit' && over66 && lowerIncome) {
      status = 'likely';
      reason = 'Low income over pension age';
    }

    const result: EligibilityResult = {
      benefit: benefit.name,
      id: benefit.id,
      weekly: benefit.weeklyAmount || 0,
      reason,
      status,
    };

    if (status === 'likely') {
      results.likely.push(result);
      results.totalWeekly += benefit.weeklyAmount || 0;
    } else {
      results.possible.push(result);
    }
  });

  return results;
};