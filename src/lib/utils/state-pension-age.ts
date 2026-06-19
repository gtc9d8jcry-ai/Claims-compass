// ============================================
// State Pension Age Calculator
// Handles normal rules + transitional rules (Dec 1960 – Apr 1961)
// ============================================

export interface StatePensionAgeResult {
  hasReached: boolean;
  statePensionAge: number;
  displayAge: string;
  exactStatePensionDate: string | null;
  isTransitional: boolean;
  monthsOver: number;
}

export function calculateStatePensionAge(
  dateOfBirth: string | null | undefined
): StatePensionAgeResult | null {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const birthYear = dob.getFullYear();
  const birthMonth = dob.getMonth() + 1;
  const birthDay = dob.getDate();

  const today = new Date();
  const ageYears = today.getFullYear() - birthYear;

  let spaYears = 66;
  let extraMonths = 0;
  let isTransitional = false;

  // Transitional rules for Dec 1960 – Apr 1961 births
  if (birthYear === 1960 && birthMonth === 12 && birthDay >= 6) {
    extraMonths = Math.min(4, Math.floor((31 - birthDay) / 7.5));
    isTransitional = true;
  } else if (birthYear === 1961 && birthMonth >= 1 && birthMonth <= 4) {
    extraMonths = 4 + Math.floor((birthMonth - 1) * 0.75);
    isTransitional = true;
  }

  const hasReached = ageYears >= spaYears;

  return {
    hasReached,
    statePensionAge: spaYears,
    displayAge: isTransitional 
      ? `${spaYears} years and ${extraMonths} months` 
      : `${spaYears} years`,
    exactStatePensionDate: null,
    isTransitional,
    monthsOver: extraMonths,
  };
}

export function hasReachedStatePensionAge(
  dateOfBirth: string | null | undefined
): boolean {
  const result = calculateStatePensionAge(dateOfBirth);
  return result?.hasReached ?? false;
}
