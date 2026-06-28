'use server'

import { revalidatePath } from 'next/cache'
import { interventionRepo } from '@/lib/repositories'

import { getActiveUserId } from '@/lib/auth'

export async function escalateToPartnerAction(obligationId: string, partnerEmail: string) {
  const userId = await getActiveUserId()
  if (!userId) throw new Error("Unauthorized")

  await interventionRepo.create({
    user_id: userId,
    obligation_id: obligationId,
    type: 'Partner Escalation',
    severity: 'Critical',
    status: 'active',
    message: `Escalation alert dispatched to accountability partner (${partnerEmail}) regarding this obligation.`
  })

  revalidatePath('/')
  revalidatePath('/obligations')
  
  return { success: true }
}
