/**
 * OPTIMUS — Autonomous Form Assistant Engine
 * Phase 10.10 (Final Spec)
 *
 * Detects, generates, and validates form drafts using agent memory,
 * obligations, and user profile data.
 *
 * ABSOLUTE SAFETY RULE:
 * OPTIMUS MAY: fill forms, generate drafts, detect missing fields, ask for approval.
 * OPTIMUS MUST NEVER: click Submit, accept Terms, send applications, trigger external actions.
 * THE FINAL ACTION ALWAYS BELONGS TO THE USER.
 *
 * Supported Forms (auto-detected):
 * - Hackathon Registrations
 * - Internship Applications
 * - Event Registrations
 * - Club Applications
 * - College / Academic Forms
 * - Scholarship Applications
 * - Competition Registrations
 * - Placement Forms
 * - Research Program Applications
 */

import { FormDraft } from '@/types';
import { Obligation } from '@/types/database';

// ─── User Profile ─────────────────────────────────────────────
interface UserProfile {
  name: string;
  email: string;
  college: string;
  year: string;
  branch: string;
  team: string;
  github: string;
  linkedin: string;
  phone: string;
  city: string;
  rollNumber: string;
  cgpa: string;
  skills: string;
}

// ─── Form Type Definitions ────────────────────────────────────
const FORM_TYPE_LABELS: Record<string, string> = {
  hackathon_registration:    'Hackathon Registration',
  internship_application:    'Internship Application',
  event_registration:        'Event / Workshop Registration',
  club_application:          'Club / Society Application',
  scholarship_application:   'Scholarship Application',
  competition_registration:  'Competition Registration',
  placement_form:            'Placement Form',
  research_application:      'Research Program Application',
  conference_submission:     'Conference / Paper Submission',
  academic_form:             'Academic / College Form',
  general_application:       'General Application',
};

// ─── Extract User Profile from agent_memory ───────────────────
function extractUserProfile(memories: any[]): Partial<UserProfile> {
  const profile: Partial<UserProfile> = {};

  for (const mem of memories) {
    const content = mem.content || {};
    const raw = JSON.stringify(content).toLowerCase();

    if (!profile.name && (content.name || content.userName || content.user_name))
      profile.name = content.name || content.userName || content.user_name;

    if (!profile.email && (content.email || content.userEmail))
      profile.email = content.email || content.userEmail;

    if (!profile.college && (content.college || content.institution || raw.includes('lnmiit') || raw.includes('university')))
      profile.college = content.college || content.institution || 'LNMIIT Jaipur';

    if (!profile.year && (content.year || content.academicYear))
      profile.year = String(content.year || content.academicYear);

    if (!profile.branch && (content.branch || content.department || content.major))
      profile.branch = content.branch || content.department || content.major;

    if (!profile.team && (content.team || content.teamName || content.club))
      profile.team = content.team || content.teamName || content.club;

    if (!profile.github && (content.github || content.githubUrl))
      profile.github = content.github || content.githubUrl;

    if (!profile.linkedin && (content.linkedin || content.linkedinUrl))
      profile.linkedin = content.linkedin || content.linkedinUrl;

    if (!profile.phone && (content.phone || content.phoneNumber || content.mobile))
      profile.phone = content.phone || content.phoneNumber || content.mobile;

    if (!profile.city && (content.city || content.location))
      profile.city = content.city || content.location;

    if (!profile.rollNumber && (content.rollNumber || content.roll_number || content.studentId))
      profile.rollNumber = content.rollNumber || content.roll_number || content.studentId;

    if (!profile.cgpa && (content.cgpa || content.gpa || content.percentage))
      profile.cgpa = String(content.cgpa || content.gpa || content.percentage);

    if (!profile.skills && (content.skills || content.techStack))
      profile.skills = Array.isArray(content.skills)
        ? content.skills.join(', ')
        : content.skills || content.techStack;
  }

  return profile;
}

// ─── Previous Application Data Extraction ────────────────────
function extractPreviousApplicationData(previousApplications: any[]): Partial<UserProfile> {
  if (!previousApplications?.length) return {};
  // Reuse fields from the most recent previous application
  const latest = previousApplications[previousApplications.length - 1];
  return latest?.fields ?? {};
}

// ─── Auto-detect Form Type ────────────────────────────────────
function detectFormType(obligation: Obligation): string {
  const combined = (obligation.title + ' ' + (obligation.description || '')).toLowerCase();

  if (combined.includes('hackathon') || combined.includes('hack'))
    return 'hackathon_registration';
  if (combined.includes('internship') || combined.includes('intern') || combined.includes('intern application'))
    return 'internship_application';
  if (combined.includes('placement') || combined.includes('campus recruit'))
    return 'placement_form';
  if (combined.includes('research') && (combined.includes('program') || combined.includes('fellowship')))
    return 'research_application';
  if (combined.includes('scholarship') || combined.includes('fellowship') || combined.includes('grant'))
    return 'scholarship_application';
  if (combined.includes('competition') || combined.includes('contest') || combined.includes('olympiad'))
    return 'competition_registration';
  if (combined.includes('conference') || combined.includes('paper') || combined.includes('publication'))
    return 'conference_submission';
  if (combined.includes('club') || combined.includes('society') || combined.includes('organisation') ||
      combined.includes('ambassador') || combined.includes('volunteer'))
    return 'club_application';
  if (combined.includes('event') || combined.includes('workshop') || combined.includes('seminar') ||
      combined.includes('webinar') || combined.includes('bootcamp'))
    return 'event_registration';
  if (combined.includes('college') || combined.includes('admission') || combined.includes('form') ||
      combined.includes('google form'))
    return 'academic_form';

  return 'general_application';
}

// ─── Field Templates ──────────────────────────────────────────
function getFieldTemplate(formType: string): string[] {
  const templates: Record<string, string[]> = {
    hackathon_registration: [
      'Full Name', 'Email Address', 'College / Institution', 'Year of Study',
      'Branch / Department', 'Team Name', 'GitHub Profile', 'LinkedIn Profile',
      'Phone Number', 'City',
    ],
    internship_application: [
      'Full Name', 'Email Address', 'College / Institution', 'Year of Study',
      'Branch / Department', 'GitHub Profile', 'LinkedIn Profile',
      'Resume / CV Link', 'Phone Number', 'Cover Letter Summary',
    ],
    placement_form: [
      'Full Name', 'Email Address', 'College / Institution', 'Roll Number',
      'Branch / Department', 'CGPA / Percentage', 'Phone Number',
      'GitHub Profile', 'LinkedIn Profile', 'City',
    ],
    research_application: [
      'Full Name', 'Email Address', 'College / Institution', 'Year of Study',
      'Branch / Department', 'Research Area of Interest', 'GitHub / Research Link',
      'Statement of Purpose Summary', 'Phone Number', 'CGPA / Percentage',
    ],
    scholarship_application: [
      'Full Name', 'Email Address', 'College / Institution', 'Year of Study',
      'Branch / Department', 'Roll Number', 'CGPA / Percentage',
      'Phone Number', 'Statement of Purpose Summary', 'City',
    ],
    competition_registration: [
      'Full Name', 'Email Address', 'College / Institution', 'Year of Study',
      'Branch / Department', 'Team Name', 'Phone Number', 'City',
    ],
    conference_submission: [
      'Full Name', 'Email Address', 'College / Institution', 'Paper Title',
      'Abstract', 'Co-Authors', 'GitHub / Research Link', 'Phone Number',
    ],
    club_application: [
      'Full Name', 'Email Address', 'College / Institution', 'Year of Study',
      'Branch / Department', 'Phone Number', 'Roll Number',
      'Why do you want to join?', 'Relevant Skills',
    ],
    event_registration: [
      'Full Name', 'Email Address', 'College / Institution', 'Year of Study',
      'Branch / Department', 'Phone Number', 'City', 'Roll Number',
    ],
    academic_form: [
      'Full Name', 'Email Address', 'College / Institution', 'Year of Study',
      'Branch / Department', 'Roll Number', 'Phone Number', 'City',
    ],
    general_application: [
      'Full Name', 'Email Address', 'College / Institution', 'Year of Study',
      'Phone Number', 'City',
    ],
  };

  return templates[formType] ?? templates['general_application'];
}

// ─── Map Profile to Fields ────────────────────────────────────
function mapProfileToFields(
  fieldTemplate: string[],
  profile: Partial<UserProfile>,
  previous: Partial<UserProfile>
): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const field of fieldTemplate) {
    const key = field.toLowerCase();
    // Memory-first, then previous application fallback
    const get = (profileVal: string | undefined, prevKey?: string) =>
      profileVal || (prevKey && (previous as any)[prevKey]) || '';

    if (key.includes('full name') || key === 'name')
      fields[field] = get(profile.name, 'Full Name');
    else if (key.includes('email'))
      fields[field] = get(profile.email, 'Email Address');
    else if (key.includes('college') || key.includes('institution'))
      fields[field] = get(profile.college, 'College / Institution');
    else if (key.includes('year'))
      fields[field] = get(profile.year, 'Year of Study');
    else if (key.includes('branch') || key.includes('department'))
      fields[field] = get(profile.branch, 'Branch / Department');
    else if (key.includes('team'))
      fields[field] = get(profile.team, 'Team Name');
    else if (key.includes('github'))
      fields[field] = get(profile.github, 'GitHub Profile');
    else if (key.includes('linkedin'))
      fields[field] = get(profile.linkedin, 'LinkedIn Profile');
    else if (key.includes('phone') || key.includes('mobile'))
      fields[field] = get(profile.phone, 'Phone Number');
    else if (key.includes('city') || key.includes('location'))
      fields[field] = get(profile.city, 'City');
    else if (key.includes('roll'))
      fields[field] = get(profile.rollNumber, 'Roll Number');
    else if (key.includes('cgpa') || key.includes('gpa') || key.includes('percentage'))
      fields[field] = get(profile.cgpa, 'CGPA / Percentage');
    else if (key.includes('skill'))
      fields[field] = get(profile.skills, 'Relevant Skills');
    else
      fields[field] = '';  // Cannot auto-fill — flagged as missing
  }

  return fields;
}

// ─── Recommendations Generator ────────────────────────────────
function buildRecommendations(
  missingFields: string[],
  formType: string,
  confidence: number
): string[] {
  const recs: string[] = [];

  if (missingFields.length > 0)
    recs.push(...missingFields.map(f => `Add missing field: ${f}`));

  if (formType === 'hackathon_registration')
    recs.push('Verify teammate GitHub profiles are correct', 'Review hackathon problem statement before submitting');

  if (formType === 'internship_application')
    recs.push('Tailor cover letter summary to the role', 'Ensure resume link is publicly accessible');

  if (formType === 'scholarship_application')
    recs.push('Proofread Statement of Purpose for grammar', 'Confirm CGPA matches official transcript');

  if (formType === 'research_application')
    recs.push('Reference specific research papers in your SOP', 'Mention relevant projects or publications');

  if (confidence < 80)
    recs.push('Low confidence — review all fields manually before submission');

  if (recs.length === 0)
    recs.push('All fields complete — review data accuracy before submitting');

  return recs;
}

// ─── Status Derivation ────────────────────────────────────────
function deriveStatus(missingFields: string[], confidence: number): FormDraft['status'] {
  if (missingFields.length === 0 && confidence >= 90) return 'READY';
  if (missingFields.length > 0) return 'MISSING_INFORMATION';
  return 'REQUIRES_APPROVAL';
}

// ─── Duplicate Check ──────────────────────────────────────────
function isDuplicateSubmission(
  obligation: Obligation,
  previousApplications: any[]
): boolean {
  return previousApplications.some(prev =>
    prev.obligationId === obligation.id ||
    prev.formType === detectFormType(obligation)
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────
export function generateFormDraft(
  obligation: Obligation,
  memories: any[],
  previousApplications: any[] = []
): FormDraft {
  const formType = detectFormType(obligation);
  const fieldTemplate = getFieldTemplate(formType);
  const userProfile = extractUserProfile(memories);
  const previousData = extractPreviousApplicationData(previousApplications);

  const fields = mapProfileToFields(fieldTemplate, userProfile, previousData);

  const missingFields = Object.entries(fields)
    .filter(([, v]) => !v || v.trim() === '')
    .map(([k]) => k);

  const completedFields = fieldTemplate.length - missingFields.length;
  const confidence = Math.round((completedFields / fieldTemplate.length) * 100);
  const recommendations = buildRecommendations(missingFields, formType, confidence);
  const status = deriveStatus(missingFields, confidence);

  // Duplicate detection warning
  const isDuplicate = isDuplicateSubmission(obligation, previousApplications);
  if (isDuplicate) {
    recommendations.unshift('⚠ Possible duplicate detected — a similar form was already submitted.');
  }

  return {
    id: `form_${obligation.id}_${Date.now()}`,
    formType,
    title: FORM_TYPE_LABELS[formType] ?? 'Application Form',
    completedFields,
    totalFields: fieldTemplate.length,
    confidence,
    missingFields,
    fields,
    recommendations,
    status,
  };
}
