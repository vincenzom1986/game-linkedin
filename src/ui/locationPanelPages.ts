import type { Location } from '../data/types'

export interface LocationPanelPage {
  eyebrow: string
  title: string
  body: string
}

export function locationPanelPages(location: Location): LocationPanelPage[] {
  const tools = location.tools?.length ? '\n\nSTRUMENTI\n' + location.tools.join('  •  ') : ''
  return [
    {
      eyebrow: location.name.toUpperCase() + ' · ' + location.period,
      title: location.role,
      body: location.summary,
    },
    {
      eyebrow: location.name.toUpperCase(),
      title: 'Cosa facevo',
      body: location.activities.map((activity) => '• ' + activity).join('\n'),
    },
    {
      eyebrow: 'LA MIA ESPERIENZA',
      title: 'Cosa ho imparato',
      body: location.experience,
    },
    {
      eyebrow: location.district.label.toUpperCase(),
      title: 'Competenze',
      body: location.skills.map(({ name }) => name).join('  •  ') + tools,
    },
  ]
}
