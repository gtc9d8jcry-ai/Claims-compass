import { Profile } from '../schemas/profile';
import { benefitsRegistry, Benefit } from './benefits-registry';

export interface BenefitResult {
  benefit: Benefit;
  eligible: boolean;
  reason?: string;
}

export interface EligibilityResults {
  likely: BenefitResult[];
  possible: BenefitResult[];
  unlikely: BenefitResult[];
  totalWeeklyPotential: number;
}

export function runEligibility(profile: Profile): EligibilityResults {
  const results: BenefitResult[] = benefitsRegistry.map(benefit => ({
    benefit,
    eligible: benefit.checkEligibility(profile),
  }));

  const likely = results.filter(r => r.eligible);
  const unlikely = results.filter(r => !r.eligible);

  const totalWeeklyPotential = likely.reduce((sum, r) => {
    return sum + (r.benefit.weeklyAmount || 0);
  }, 0);

  return {
    likely,
    possible: [], 
    unlikely,
    totalWeeklyPotential,
  };
}
