export interface ProjectEntry {
  name: string
  tagline: string
  description: string
  tags: string[]
  github: string
  license: string
  status: string
}

export const projects: ProjectEntry[] = [
  {
    name: 'Stack Stitcher',
    tagline: 'Open-Source TUI · Go',
    description:
      'A keyboard-driven terminal UI for managing self-hosted Docker Compose stacks. Parses standard Compose files via the official compose-go spec library, with fuzzy service search and clipboard support — no more memorizing docker compose flags.',
    tags: ['Go', 'Bubble Tea', 'Lip Gloss', 'Docker Compose'],
    github: 'https://github.com/filipemolina/stack-stitcher',
    license: 'MIT',
    status: 'Actively developed',
  },
]
