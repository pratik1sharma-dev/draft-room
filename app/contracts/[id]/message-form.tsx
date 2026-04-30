'use client'

import { useActionState } from 'react'
import { sendMessage } from '@/lib/actions/contracts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function MessageForm({ contractId }: { contractId: string }) {
  const [state, formAction, isPending] = useActionState(sendMessage, null)

  return (
    <form action={formAction} className="flex gap-2 items-end">
      <input type="hidden" name="contract_id" value={contractId} />
      <Textarea
        name="content"
        placeholder="Type your message..."
        className="min-h-[60px] flex-1 resize-none"
        required
      />
      <Button type="submit" disabled={isPending} className="shrink-0">
        {isPending ? 'Sending...' : 'Send'}
      </Button>
      {state?.error && <p className="text-red-400 text-xs mt-1">{state.error}</p>}
    </form>
  )
}
