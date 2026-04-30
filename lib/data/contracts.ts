import { createClient } from '@/lib/supabase/server'

export async function getContract(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      jobs!inner(id, title, description, budget_type, budget_amount),
      client:users!contracts_client_id_fkey(id, name, city),
      draftsman:users!contracts_draftsman_id_fkey(id, name, city)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export async function getContractMessages(contractId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('messages')
    .select('*, sender:sender_id(id, name, role)')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true })

  return data ?? []
}
