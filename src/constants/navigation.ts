// ============================================================
// OPTIMUS — Navigation Constants
// Route definitions and sidebar nav items
// ============================================================

import type { NavItem } from '@/types'

export const ROUTES = {
  dashboard: '/',
  obligations: '/obligations',
  schedule: '/schedule',
  actions: '/actions',
  briefings: '/briefings',
  reports: '/reports',
  socials: '/socials',
  status: '/status',
  settings: '/settings',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Command Center',
    href: '/',
    icon: 'LayoutDashboard',
  },
  {
    id: 'obligations',
    label: 'Obligations',
    href: '/obligations',
    icon: 'Target',
  },
  {
    id: 'actions',
    label: 'Action Center',
    href: '/actions',
    icon: 'Zap',
    badge: 3,
  },
  {
    id: 'briefings',
    label: 'Briefings',
    href: '/briefings',
    icon: 'FileText',
  },
  {
    id: 'reports',
    label: 'Executive Reports',
    href: '/reports',
    icon: 'BarChart3',
  },
  {
    id: 'schedule',
    label: 'Execution Schedule',
    href: '/schedule',
    icon: 'Calendar',
  },
  {
    id: 'socials',
    label: 'Socials',
    href: '/socials',
    icon: 'Share2',
  },
  {
    id: 'status',
    label: 'System Status',
    href: '/status',
    icon: 'Activity',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
  },
] as const

// Page metadata (for TopBar titles and meta)
export const PAGE_META: Record<AppRoute, { title: string; description: string }> = {
  '/': {
    title: 'Command Center',
    description: 'AI-powered obligation monitoring and risk intelligence',
  },
  '/obligations': {
    title: 'Obligations',
    description: 'All tracked commitments and deadlines',
  },
  '/actions': {
    title: 'Action Center',
    description: 'Prepared actions awaiting your approval',
  },
  '/briefings': {
    title: 'Briefings',
    description: 'Morning, evening, and critical intelligence briefings',
  },
  '/reports': {
    title: 'Executive Reports',
    description: 'Weekly intelligence and operational performance',
  },
  '/schedule': {
    title: 'AUTONOMOUS SCHEDULE',
    description: 'AI-generated weekly execution plan',
  },
  '/socials': {
    title: 'Socials',
    description: 'Manage your connected platforms and communication channels',
  },
  '/status': {
    title: 'System Status',
    description: 'Live event stream and health monitoring for all OPTIMUS systems',
  },
  '/settings': {
    title: 'Settings',
    description: 'Manage your OPTIMUS preferences and integrations',
  },
}
