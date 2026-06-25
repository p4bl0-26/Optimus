// ============================================================
// OPTIMUS — Navigation Constants
// Route definitions and sidebar nav items
// ============================================================

import type { NavItem } from '@/types'

export const ROUTES = {
  dashboard: '/',
  obligations: '/obligations',
  actions: '/actions',
  briefings: '/briefings',
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
  '/settings': {
    title: 'Settings',
    description: 'Manage your OPTIMUS preferences and integrations',
  },
}
