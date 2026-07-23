export interface SkillGroup {
  category: string
  items: string[]
}

export const skills: SkillGroup[] = [
  {
    category: 'Languages',
    items: ['JavaScript', 'TypeScript', 'Go', 'PHP', 'C#', 'Python', 'HTML', 'CSS'],
  },
  {
    category: 'Frontend',
    items: ['React', 'Next.js', 'Vue.js', 'styled-components', 'Tailwind CSS', 'shadcn/ui', 'Ant Design', 'Vite'],
  },
  {
    category: 'Backend & APIs',
    items: ['Node.js', 'Laravel', 'GraphQL', 'REST', 'Service-Oriented & Microservice Architecture'],
  },
  {
    category: 'Databases',
    items: ['PostgreSQL', 'MySQL', 'SQL Server'],
  },
  {
    category: 'Architecture & Practice',
    items: [
      'Solution Architecture',
      'Application Modernization',
      'System Analysis & Design',
      'SDLC',
      'Requirements Analysis',
      'Code Review',
      'Team Leadership & Mentoring',
    ],
  },
]
