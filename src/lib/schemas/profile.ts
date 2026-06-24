import { z } from 'zod';

export const ProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  postcode: z.string().min(1, "Postcode is required"),
  nationality: z.string().default("British"),
  residency: z.enum(["UK", "EEA", "Other"]).default("UK"),
  income: z.number().optional(),
  savings: z.number().optional(),
  hasDisability: z.boolean().default(false),
  needsCare: z.boolean().default(false),
  isCaring: z.boolean().default(false),
  hasPartner: z.boolean().default(false),
  hasChildren: z.boolean().default(false),
  // Add more fields from full backup as needed
});

export type Profile = z.infer<typeof ProfileSchema>;

// Helper to calculate weekly income
export const toWeekly = (annual?: number): number => {
  return annual ? Math.round(annual / 52) : 0;
};