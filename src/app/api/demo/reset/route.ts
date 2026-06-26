import { NextResponse } from 'next/server';
import { resetDemoWorkspace } from '@/lib/demo/judgeMode';

export async function POST() {
  try {
    const result = await resetDemoWorkspace();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        durationMs: result.duration
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
        durationMs: result.duration
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error during demo reset'
    }, { status: 500 });
  }
}
