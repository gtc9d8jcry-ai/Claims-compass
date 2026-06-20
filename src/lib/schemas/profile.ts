import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  full_name: z.string().min(1, "Full name is required"),
  date_of_birth: z.string().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable(),
  address_line1: z.string().nullable(),
  address_line2: z.string().nullable(),
  city: z.string().nullable(),
  postcode: z.string().nullable(),
  region: z.enum(['England', 'Scotland', 'Wales', 'Northern Ireland']).nullable(),
  phone_number: z.string().nullable(),
  email: z.string().email().nullable(),
  weekly_income: z.number().nullable(),
  income_frequency: z.enum(['weekly', 'monthly', 'annual']).default('weekly'),
  employment_status: z.string().nullable(),
  has_disability: z.boolean().default(false),
  has_carer: z.boolean().default(false),
  number_of_children: z.number().int().default(0),
  housing_status: z.string().nullable(),
  immigration_status: z.string().nullable(),
  onboarding_completed: z.boolean().default(false),
  last_updated: z.string().nullable(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// Helper for income normalization
export function toWeekly(amount: number | null | undefined, frequency: string = 'weekly'): number {
  if (!amount || amount <= 0) return 0;
  switch (frequency) {
    case 'monthly': return Math.round((amount * 12) / 52);
    case 'annual': return Math.round(amount / 52);
    case 'weekly':
    default: return Math.round(amount);
  }
}
