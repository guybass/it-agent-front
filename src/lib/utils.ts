import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays > 0) return `${diffDays}d left`
  if (diffDays === 0) return 'Today'
  return `${Math.abs(diffDays)}d ago`
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function domainDisplayName(domain: string): string {
  const names: Record<string, string> = {
    okta: 'Okta',
    google_workspace: 'Google',
    slack: 'Slack',
    notion: 'Notion',
    atlassian: 'Atlassian',
    '1password': '1Password',
    github: 'GitHub',
    linear: 'Linear',
    figma: 'Figma',
    hubspot: 'HubSpot',
    vercel: 'Vercel',
    datadog: 'Datadog',
    cloudflare: 'Cloudflare',
    aws: 'AWS',
    mongodb: 'MongoDB',
    sentry: 'Sentry',
  }
  return names[domain] || capitalize(domain)
}
