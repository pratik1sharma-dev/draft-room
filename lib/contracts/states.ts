export const ContractStatus = {
  OFFER_SENT: 'offer_sent',
  CLIENT_TURN: 'client_turn',
  DRAFTSMAN_TURN: 'draftsman_turn',
  TERMS_AGREED: 'terms_agreed',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  REVISION_REQUESTED: 'revision_requested',
  COMPLETED: 'completed',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const

export type ContractStatus = typeof ContractStatus[keyof typeof ContractStatus]

export const ACTIVE_STATUSES: ContractStatus[] = [
  ContractStatus.OFFER_SENT,
  ContractStatus.CLIENT_TURN,
  ContractStatus.DRAFTSMAN_TURN,
  ContractStatus.TERMS_AGREED,
  ContractStatus.IN_PROGRESS,
  ContractStatus.IN_REVIEW,
  ContractStatus.REVISION_REQUESTED,
]

export const WORK_STATUSES: ContractStatus[] = [
  ContractStatus.IN_PROGRESS,
  ContractStatus.IN_REVIEW,
  ContractStatus.REVISION_REQUESTED,
]

export const DISCUSSION_STATUSES: ContractStatus[] = [
  ContractStatus.OFFER_SENT,
  ContractStatus.CLIENT_TURN,
  ContractStatus.DRAFTSMAN_TURN,
  ...WORK_STATUSES,
]

export const CANCELLABLE_STATUSES: ContractStatus[] = [
  ContractStatus.OFFER_SENT,
  ContractStatus.CLIENT_TURN,
  ContractStatus.DRAFTSMAN_TURN,
  ContractStatus.TERMS_AGREED,
]

export const STATUS_LABELS: Record<ContractStatus, string> = {
  offer_sent: 'Offer Sent',
  client_turn: 'Awaiting Client',
  draftsman_turn: 'Awaiting Draftsman',
  terms_agreed: 'Terms Agreed',
  in_progress: 'In Progress',
  in_review: 'In Review',
  revision_requested: 'Revision Requested',
  completed: 'Completed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
}

export const STATUS_VARIANTS: Record<ContractStatus, 'available' | 'verified' | 'founding' | 'skill'> = {
  offer_sent: 'founding',
  client_turn: 'founding',
  draftsman_turn: 'founding',
  terms_agreed: 'available',
  in_progress: 'available',
  in_review: 'founding',
  revision_requested: 'founding',
  completed: 'verified',
  declined: 'skill',
  cancelled: 'skill',
  disputed: 'skill',
}
