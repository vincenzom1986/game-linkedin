import type { Location } from '../data/types'

export interface LocationPanelViewModel {
  title: string
  meta: string
  summary: string
  projects: string[]
  skills: string[]
}

export function formatLocationPanel(location: Location): LocationPanelViewModel {
  return {
    title: location.name,
    meta: [location.role, location.period].filter(Boolean).join(' · '),
    summary: location.summary,
    projects: location.activities,
    skills: location.skills.map(({ name }) => name),
  }
}
