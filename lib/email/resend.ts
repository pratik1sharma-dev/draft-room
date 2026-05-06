'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'DraftRoom <notifications@draftroom.in>'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://draft-room-vert.vercel.app'

function isConfigured() {
  const key = process.env.RESEND_API_KEY
  return key && key !== 'your_resend_api_key'
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
  if (!isConfigured()) return
  try {
    await resend.emails.send({
      from: FROM,
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
  } catch {}
}

export async function sendApplicationAcceptedEmail({
  drafterEmail, drafterName, projectTitle, contractId,
}: {
  drafterEmail: string
  drafterName: string
  projectTitle: string
  contractId: string
}) {
  if (!isConfigured()) return
  try {
    await resend.emails.send({
      from: FROM,
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
  } catch {}
}

export async function sendApplicationRejectedEmail({
  drafterEmail, drafterName, projectTitle,
}: {
  drafterEmail: string
  drafterName: string
  projectTitle: string
}) {
  if (!isConfigured()) return
  try {
    await resend.emails.send({
      from: FROM,
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
  } catch {}
}

export async function sendWelcomeEmail({
  email, name, role,
}: {
  email: string
  name: string
  role: 'client' | 'draftsman'
}) {
  if (!isConfigured()) return
  const isClient = role === 'client'
  try {
    await resend.emails.send({
      from: FROM,
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
  } catch {}
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
  if (!isConfigured()) return
  try {
    await resend.emails.send({
      from: FROM,
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
  } catch {}
}
