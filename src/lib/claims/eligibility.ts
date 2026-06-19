import { Profile } from '../schemas/profile';
import { benefitsRegistry, BenefitResult } from './benefits-registry';
import { hasReachedStatePensionAge } from '../utils/state-pension-age';

export interface EligibilityResults {
  all: BenefitResult[];
  likely: BenefitResult[];
  possible: BenefitResult[];
  unlikely: BenefitResult[];
  totalWeekly: number;
  hasAnyLikely: boolean;
}

export function runEligibility(profile: Profile): EligibilityResults {
  const allResults = benefitsRegistry.map(benefit => benefit.checkEligibility(profile));

  const likely = allResults.filter(r => r.category === 'likely' && r.eligible);
  const possible = allResults.filter(r => r.category === 'possible' && r.eligible);
  const unlikely = allResults.filter(r => r.category === 'unlikely' || !r.eligible);

  const totalWeekly = [...likely, ...possible].reduce((sum, r) => sum + (r.weeklyAmount || 0), 0);

  return {
    all: allResults,
    likely,
    possible,
    unlikely,
    totalWeekly: Math.round(totalWeekly),
    hasAnyLikely: likely.length > 0,
  };
}

// Re-export the pension age helper for convenience in other files
export { hasReachedStatePensionAge };
