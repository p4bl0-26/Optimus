"use server";

import { resetDemoWorkspace } from '@/lib/demo/judgeMode';
import { revalidatePath } from 'next/cache';

export async function resetDemoAction() {
  const result = await resetDemoWorkspace();
  if (result.success) {
    revalidatePath('/');
    revalidatePath('/obligations');
    revalidatePath('/briefings');
    revalidatePath('/intelligence');
  }
  return result;
}
