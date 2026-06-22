import type { Contact } from '../data/types'

export interface ContactPanelViewModel {
  title: string
  linkedinLabel: string
  linkedinUrl: string
  emailLabel: string
  emailUrl: string
}

export function formatContactPanel(contact: Contact): ContactPanelViewModel {
  return {
    title: 'Restiamo in contatto',
    linkedinLabel: 'LinkedIn',
    linkedinUrl: contact.linkedin,
    emailLabel: contact.email,
    emailUrl: 'mailto:' + contact.email,
  }
}
