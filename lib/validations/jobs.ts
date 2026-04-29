import { z } from 'zod'

export const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  skills_required: z.array(z.string()).min(1, 'Select at least one skill'),
  budget_type: z.enum(['fixed', 'hourly']),
  budget_amount: z.number().min(1, 'Budget must be greater than 0'),
  deadline: z.string().optional(),
})
