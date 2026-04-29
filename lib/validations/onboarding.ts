import { z } from 'zod'

export const clientOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  firm_name: z.string().optional(),
  project_types: z.array(z.string()).default([]),
})

export const draftmanOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  hourly_rate: z.number().min(1, 'Hourly rate must be greater than 0'),
  experience_years: z.number().min(0),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
})
