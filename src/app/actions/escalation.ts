'use server'

import { revalidatePath } from 'next/cache'
import { interventionRepo } from '@/lib/repositories'

const DEMO_USER_ID = 'demo-user-1'

export async function escalateToPartnerAction(obligationId: string, partnerEmail: string) {
  await interventionRepo.create({
    user_id: DEMO_USER_ID,
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
