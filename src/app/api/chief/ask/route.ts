import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { commandCenterRepo } from '@/lib/repositories/CommandCenterRepository';
import { getActivePatterns } from '@/lib/intelligence/memoryEngine';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

// ─── System Prompt ────────────────────────────────────────────
function buildSystemPrompt(context: string): string {
  return `You are OPTIMUS Chief of Staff — an AI executive intelligence system, NOT a generic chatbot.

Your role: Synthesize operational intelligence and deliver actionable, prioritized directives to the operator (Himank).

CORE RULES:
- Always prioritize actionability over explanation.
- Lead with the highest-risk item first.
- Identify conflicts and scheduling overloads immediately.
- Explain WHY something matters (risk score, deadline proximity, historical pattern).
- Suggest what can safely be postponed.
- NEVER invent obligations, risks, or events not present in the data below.
- NEVER respond with generic advice. Everything must reference the actual data.

RESPONSE FORMAT (always follow this structure):
1. **Immediate Priority** — What needs action right now and why.
2. **Risks & Warnings** — Active risk profiles, critical interventions, overloaded days.
3. **Recommended Actions** — Specific, ordered steps the operator should take today.
4. **Strategic Advice** — What can be postponed, deferred, or delegated. Long-horizon view.

CURRENT OPERATIONAL CONTEXT:
${context}`;
}

// ─── Context Builder ──────────────────────────────────────────
async function buildContext(dashboardState: Awaited<ReturnType<typeof commandCenterRepo.getDashboardState>>): Promise<string> {
  const {
    obligations,
    riskProfiles,
    interventions,
    events,
    executiveSummary,
    morningBriefing,
    strategicRecommendations,
    highestRiskTarget,
    overloadedDays,
    recommendedFocus,
  } = dashboardState as any;

  const memoryPatterns = await getActivePatterns();

  const lines: string[] = [];

  // Executive Summary
  lines.push('=== EXECUTIVE SUMMARY ===');
  lines.push(executiveSummary || 'No summary available.');

  // Obligations
  lines.push('\n=== ACTIVE OBLIGATIONS ===');
  if (obligations?.length) {
    obligations
      .filter((o: any) => o.status === 'pending')
      .forEach((o: any) => {
        const risk = riskProfiles?.find((r: any) => r.obligation_id === o.id);
        lines.push(
          `• [${o.priority?.toUpperCase() || 'NORMAL'}] "${o.title}" — Status: ${o.status}` +
          (o.due_date ? ` | Due: ${o.due_date}` : '') +
          (risk ? ` | Risk Score: ${Math.round(risk.risk_score)} (${risk.risk_band})` : '')
        );
        if (risk?.reasoning) lines.push(`  Reasoning: ${risk.reasoning}`);
      });
  } else {
    lines.push('No active obligations.');
  }

  // Highest Risk
  lines.push('\n=== HIGHEST RISK TARGET ===');
  lines.push(highestRiskTarget || 'None identified.');
  if (recommendedFocus) {
    lines.push(`Recommended Focus: ${recommendedFocus.title} — ${recommendedFocus.reason}`);
  }

  // Interventions
  lines.push('\n=== ACTIVE INTERVENTIONS ===');
  const activeInterventions = interventions?.filter((i: any) => i.status === 'pending') || [];
  if (activeInterventions.length) {
    activeInterventions.forEach((i: any) => {
      lines.push(`• [${i.severity}] ${i.type}: ${i.message}`);
    });
  } else {
    lines.push('No active interventions.');
  }

  // Overloaded Days
  if (overloadedDays?.length) {
    lines.push('\n=== OVERLOADED DAYS ===');
    lines.push(overloadedDays.join(', '));
  }

  // Strategic Recommendations
  lines.push('\n=== STRATEGIC RECOMMENDATIONS (Pre-computed) ===');
  if (strategicRecommendations?.length) {
    strategicRecommendations.forEach((r: any) => {
      lines.push(`${r.priority}. ${r.recommendation}`);
      lines.push(`   Reason: ${r.reason} (Confidence: ${Math.round((r.confidence || 0) * 100)}%)`);
    });
  } else {
    lines.push('No strategic recommendations.');
  }

  // Agent Memory Patterns
  if (memoryPatterns?.length) {
    lines.push('\n=== HISTORICAL MEMORY PATTERNS ===');
    memoryPatterns.slice(0, 3).forEach((p: any) => {
      lines.push(`• Pattern: "${p.pattern}" (seen ${p.occurrences}x) — ${p.recommendation}`);
    });
  }

  // Agent Activity (discoveries)
  const discoveries = events?.filter((e: any) =>
    e.agent_name && (e.agent_name.includes('Gmail') || e.agent_name.includes('Calendar') || e.agent_name.includes('Classroom'))
  ) || [];
  if (discoveries.length) {
    lines.push('\n=== RECENT AGENT DISCOVERIES ===');
    discoveries.slice(0, 5).forEach((e: any) => {
      lines.push(`• [${e.agent_name}] ${e.action}${e.metadata?.summary ? ': ' + e.metadata.summary : ''}`);
    });
  }

  // Morning Briefing
  if (morningBriefing) {
    lines.push('\n=== MORNING BRIEFING ===');
    lines.push(morningBriefing);
  }

  return lines.join('\n');
}

// ─── Route Handler ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }

    // Fetch current operational state from the Chief of Staff engine
    const dashboardState = await commandCenterRepo.getDashboardState(DEMO_USER_ID);
    const context = await buildContext(dashboardState);
    const systemPrompt = buildSystemPrompt(context);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    // Build chat history from session
    const chatHistory = (history || []).map((msg: { role: string; text: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (err: any) {
    console.error('[ASK CHIEF API]', err);
    return NextResponse.json(
      { error: err?.message || 'Chief is temporarily unavailable.' },
      { status: 500 }
    );
  }
}
