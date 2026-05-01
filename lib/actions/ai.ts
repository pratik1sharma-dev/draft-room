'use server'

import { generateJSON } from '@/lib/ai/gemini'

export interface ProjectSpec {
  title: string
  description: string
  deliverables: string[]
  skills_required: string[]
  budget_min: number
  budget_max: number
  budget_type: 'fixed' | 'hourly'
}

export interface DeliveryCheckResult {
  verified: boolean
  checklist: Array<{ item: string; found: boolean; note?: string }>
  summary: string
  missing: string[]
}

const CITY_AUTHORITY: Record<string, string> = {
  mumbai: 'MCGM', pune: 'PMRDA', ahmedabad: 'AUDA', bengaluru: 'BBMP',
  bangalore: 'BBMP', chennai: 'CMDA', delhi: 'MCD', hyderabad: 'GHMC',
  kolkata: 'KMC', surat: 'SMC', jaipur: 'JDA',
}

export async function generateProjectSpec(input: {
  projectType: string
  city: string
  description: string
}): Promise<{ spec?: ProjectSpec; error?: string }> {
  try {
    const authority = CITY_AUTHORITY[input.city.toLowerCase()] ?? 'local municipal authority'

    const spec = await generateJSON<ProjectSpec>(
      `Project type: ${input.projectType}
City: ${input.city}
Client's description: ${input.description}`,
      `You are an expert architectural project manager in India with deep knowledge of local building regulations, submission formats, and drafting standards.

Generate a detailed project specification for a drafting project. Be specific about deliverables based on the project type and city.

For ${input.city}, the relevant authority is ${authority}.

Return a JSON object with exactly these fields:
{
  "title": "concise project title (6-10 words)",
  "description": "2-3 paragraph professional description mentioning the specific drawing requirements, applicable Indian standards (IS codes, NBC 2016 where relevant), and ${authority} submission format requirements",
  "deliverables": ["array of specific drawing sheets/documents, e.g. 'Site plan (1:200)', 'Ground floor plan (1:100)', 'Section AA (1:100)' — be exhaustive for the project type"],
  "skills_required": ["pick only from: AutoCAD, Revit, SketchUp, 3D Rendering, Structural Drawings, BIM"],
  "budget_min": <realistic INR number for this scope in India>,
  "budget_max": <realistic INR number, typically 1.5-2x budget_min>,
  "budget_type": "fixed"
}

Be specific to the project type. A residential bungalow needs different deliverables than a commercial complex or interior fit-out.`
    )

    return { spec }
  } catch (e) {
    console.error('[generateProjectSpec] error:', e)
    return { error: 'Failed to generate spec. Please try again.' }
  }
}

export async function verifyDelivery(input: {
  agreedDeliverables: string
  submissionNote: string
}): Promise<{ result?: DeliveryCheckResult; error?: string }> {
  try {
    const result = await generateJSON<DeliveryCheckResult>(
      `Agreed deliverables:
${input.agreedDeliverables}

Draftsman's submission note:
${input.submissionNote}`,
      `You are verifying whether a draftsman's submission covers all the agreed deliverables for an architectural drafting project in India.

Analyse the submission note and check each agreed deliverable.

Return a JSON object with exactly these fields:
{
  "verified": <true if all deliverables are clearly accounted for>,
  "checklist": [
    { "item": "<deliverable name>", "found": <true/false>, "note": "<optional short note if partially found or unclear>" }
  ],
  "summary": "<one sentence — e.g. 'All 6 deliverables submitted' or '2 of 6 deliverables missing'>",
  "missing": ["<list of deliverable names that are clearly absent from the submission>"]
}`
    )

    return { result }
  } catch (e) {
    console.error('[verifyDelivery] error:', e)
    return { error: 'AI verification failed. Please review manually.' }
  }
}

export interface PaymentMilestone {
  milestone: string
  amount: number
  trigger: string
}

export async function generatePaymentPlan(input: {
  deliverables: string
  totalAmount: number
  timeline: string
}): Promise<{ plan?: PaymentMilestone[]; error?: string }> {
  try {
    const plan = await generateJSON<PaymentMilestone[]>(
      `Deliverables: ${input.deliverables}
Total Amount: ₹${input.totalAmount}
Timeline: ${input.timeline}`,
      `You are a financial advisor for architectural projects in India.
Break down the total amount into 3-4 logical payment milestones.
Ensure the milestones are tied to the provided deliverables.
Ensure the sum of 'amount' in all milestones exactly equals ${input.totalAmount}.

Return a JSON array of objects with these fields:
[
  { "milestone": "Short description", "amount": <number>, "trigger": "Action that triggers payment" }
]`
    )
    return { plan }
  } catch (e) {
    console.error('[generatePaymentPlan] error:', e)
    return { error: 'Failed to generate payment plan' }
  }
}
