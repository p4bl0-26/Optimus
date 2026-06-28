// ============================================================
// OPTIMUS — Greeting Utility
// Time-based greeting and icon system
// Browser local timezone, 24h format
// ============================================================

export type GreetingPeriod = 'morning' | 'afternoon' | 'evening' | 'night'

export function getGreetingPeriod(date: Date = new Date()): GreetingPeriod {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

export function getDynamicGreeting(date: Date = new Date()): string {
  const period = getGreetingPeriod(date)
  const map: Record<GreetingPeriod, string> = {
    morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening',
    night: 'Good Night',
  }
  return map[period]
}

/** Returns the Lucide icon name for the current time of day */
export function getGreetingIconName(date: Date = new Date()): string {
  const period = getGreetingPeriod(date)
  const iconMap: Record<GreetingPeriod, string> = {
    morning: 'Sunrise',
    afternoon: 'Sun',
    evening: 'Sunset',
    night: 'Moon',
  }
  return iconMap[period]
}

/** Format time as HH:MM with timezone abbreviation (browser local) */
export function formatLocalTime(date: Date = new Date()): string {
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  // Extract timezone abbreviation
  const tzParts = date.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')
  const tz = tzParts[tzParts.length - 1] || ''
  return `${time} ${tz}`
}

/** Format date as: Sunday • 28 June 2026 */
export function formatLocalDate(date: Date = new Date()): string {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' })
  const day = date.getDate()
  const month = date.toLocaleDateString('en-GB', { month: 'long' })
  const year = date.getFullYear()
  return `${weekday} • ${day} ${month} ${year}`
}
