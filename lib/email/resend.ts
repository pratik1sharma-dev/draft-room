'use server'

import { Resend } from 'resend'
import { logger } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'DraftRoom <notifications@thedraftroom.in>'
const REPLY_TO = 'taaranhq@gmail.com'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.thedraftroom.in'

function isConfigured() {
  const key = process.env.RESEND_API_KEY
  return key && key !== 'your_resend_api_key'
}

export async function sendCompleteProfileEmail({ email }: { email: string }) {
  if (!isConfigured()) { logger.warn('email skipped — RESEND_API_KEY not set', { fn: 'sendCompleteProfileEmail', to: email }); return }
  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: email,
      subject: 'One last step — complete your DraftRoom profile',
      html: `
        <p>Welcome to DraftRoom!</p>
        <p>You're almost ready. Complete your profile so clients or drafters can find you and start working together.</p>
        <p><a href="${BASE_URL}/onboarding">Complete your profile →</a></p>
        <hr />
        <p style="font-size:12px;color:#888">DraftRoom — India's drafting marketplace</p>
      `,
    })
    logger.info('email sent', { fn: 'sendCompleteProfileEmail', to: email })
  } catch (e) {
    logger.error('email failed', { fn: 'sendCompleteProfileEmail', to: email, error: String(e) })
  }
}

export async function sendApplicationReceivedEmail({
  clientEmail, clientName, drafterName, projectTitle, projectId,
}: {
  clientEmail: string
  clientName: string
  drafterName: string
  projectTitle: string
  projectId: string
}) {
  if (!isConfigured()) { logger.warn('email skipped — RESEND_API_KEY not set', { fn: 'sendApplicationReceivedEmail', to: clientEmail }); return }
  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: clientEmail,
      subject: `New application for "${projectTitle}"`,
      html: `
        <p>Hi ${clientName},</p>
        <p><strong>${drafterName}</strong> has applied to your project <strong>${projectTitle}</strong>.</p>
        <p><a href="${BASE_URL}/projects/${projectId}">Review the application →</a></p>
        <hr />
        <p style="font-size:12px;color:#888">DraftRoom — India's drafting marketplace</p>
      `,
    })
    logger.info('email sent', { fn: 'sendApplicationReceivedEmail', to: clientEmail, projectId })
  } catch (e) {
    logger.error('email failed', { fn: 'sendApplicationReceivedEmail', to: clientEmail, projectId, error: String(e) })
  }
}

export async function sendApplicationAcceptedEmail({
  drafterEmail, drafterName, projectTitle, contractId,
}: {
  drafterEmail: string
  drafterName: string
  projectTitle: string
  contractId: string
}) {
  if (!isConfigured()) { logger.warn('email skipped — RESEND_API_KEY not set', { fn: 'sendApplicationAcceptedEmail', to: drafterEmail }); return }
  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: drafterEmail,
      subject: `Your application was accepted — ${projectTitle}`,
      html: `
        <p>Hi ${drafterName},</p>
        <p>Your application for <strong>${projectTitle}</strong> was accepted. The client has started a contract with you.</p>
        <p><a href="${BASE_URL}/contracts/${contractId}">View the contract →</a></p>
        <hr />
        <p style="font-size:12px;color:#888">DraftRoom — India's drafting marketplace</p>
      `,
    })
    logger.info('email sent', { fn: 'sendApplicationAcceptedEmail', to: drafterEmail, contractId })
  } catch (e) {
    logger.error('email failed', { fn: 'sendApplicationAcceptedEmail', to: drafterEmail, contractId, error: String(e) })
  }
}

export async function sendApplicationRejectedEmail({
  drafterEmail, drafterName, projectTitle,
}: {
  drafterEmail: string
  drafterName: string
  projectTitle: string
}) {
  if (!isConfigured()) { logger.warn('email skipped — RESEND_API_KEY not set', { fn: 'sendApplicationRejectedEmail', to: drafterEmail }); return }
  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: drafterEmail,
      subject: `Update on your application — ${projectTitle}`,
      html: `
        <p>Hi ${drafterName},</p>
        <p>The client has selected another drafter for <strong>${projectTitle}</strong>. Keep applying — more projects are posted every day.</p>
        <p><a href="${BASE_URL}/projects">Browse open projects →</a></p>
        <hr />
        <p style="font-size:12px;color:#888">DraftRoom — India's drafting marketplace</p>
      `,
    })
    logger.info('email sent', { fn: 'sendApplicationRejectedEmail', to: drafterEmail })
  } catch (e) {
    logger.error('email failed', { fn: 'sendApplicationRejectedEmail', to: drafterEmail, error: String(e) })
  }
}

export async function sendWelcomeEmail({
  email, name, role,
}: {
  email: string
  name: string
  role: 'client' | 'draftsman'
}) {
  if (!isConfigured()) { logger.warn('email skipped — RESEND_API_KEY not set', { fn: 'sendWelcomeEmail', to: email }); return }
  const isClient = role === 'client'
  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: email,
      subject: `Welcome to DraftRoom, ${name} 👋`,
      html: `
        <p>Hi ${name},</p>
        <p>Welcome to <strong>DraftRoom</strong> — India's marketplace for CAD drafting work.</p>
        ${isClient ? `
        <p>You're all set to post your first drafting project. Write a brief, review drafter portfolios, and agree on deliverables before work begins.</p>
        <p><a href="${BASE_URL}/post-project">Post your first project →</a></p>
        ` : `
        <p>Your profile is live. Architects and project owners can now find you and send you projects directly.</p>
        <p><a href="${BASE_URL}/projects">Browse open projects →</a></p>
        `}
        <p>If you have any questions, just reply to this email — we read every message.</p>
        <hr />
        <p style="font-size:12px;color:#888">DraftRoom — India's drafting marketplace</p>
      `,
    })
    logger.info('email sent', { fn: 'sendWelcomeEmail', to: email, role })
  } catch (e) {
    logger.error('email failed', { fn: 'sendWelcomeEmail', to: email, role, error: String(e) })
  }
}

export async function sendDirectOfferEmail({
  drafterEmail, drafterName, clientName, projectTitle, contractId,
}: {
  drafterEmail: string
  drafterName: string
  clientName: string
  projectTitle: string
  contractId: string
}) {
  if (!isConfigured()) { logger.warn('email skipped — RESEND_API_KEY not set', { fn: 'sendDirectOfferEmail', to: drafterEmail }); return }
  try {
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: drafterEmail,
      subject: `You have a new offer from ${clientName}`,
      html: `
        <p>Hi ${drafterName},</p>
        <p><strong>${clientName}</strong> has sent you a direct offer for the project <strong>${projectTitle}</strong>.</p>
        <p><a href="${BASE_URL}/contracts/${contractId}">View the offer →</a></p>
        <hr />
        <p style="font-size:12px;color:#888">DraftRoom — India's drafting marketplace</p>
      `,
    })
    logger.info('email sent', { fn: 'sendDirectOfferEmail', to: drafterEmail, contractId })
  } catch (e) {
    logger.error('email failed', { fn: 'sendDirectOfferEmail', to: drafterEmail, contractId, error: String(e) })
  }
}
