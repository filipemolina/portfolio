export interface ExperienceEntry {
  company: string
  title: string
  period: string
  location: string
  bullets: string[]
}

export const experience: ExperienceEntry[] = [
  {
    company: 'Knak Inc.',
    title: 'Senior Frontend Engineer',
    period: '2025',
    location: 'Remote',
    bullets: [
      'Built the frontend for new AI features in a company-wide SaaS email editor, integrating multiple LLM providers (Claude, ChatGPT, Gemini) into production workflows.',
      'Collaborated with a cross-functional team to align new features with enterprise architecture standards.',
    ],
  },
  {
    company: 'PowerSchool Inc.',
    title: 'Senior React Developer',
    period: '2021 – 2024',
    location: 'Remote',
    bullets: [
      'Provided frontend architecture leadership on a major modernization effort, migrating a monolithic application to a microservices architecture.',
      'Designed and built a GraphQL server as an orchestration and integration layer across disparate microservices.',
      'Contributed to system analysis and solution design for a mobile app improving communication between teachers, students, and parents.',
    ],
  },
  {
    company: 'Skip the Dishes',
    title: 'Senior React Developer',
    period: '2018 – 2021',
    location: 'Winnipeg, MB',
    bullets: [
      'Led solution design and development of a new menu-builder tool, introducing GraphQL as a core technology at the company.',
      'Key contributor to the solution architecture of a business-critical application later adopted internationally.',
    ],
  },
  {
    company: 'Mesquita City Hall',
    title: 'Systems Analyst',
    period: '2015 – 2018',
    location: 'Rio de Janeiro, Brazil',
    bullets: [
      "Established and led the city government's first in-house development team, mentoring junior developers.",
      'Served as technical consultant to business users, leading feasibility studies and requirements analysis for medium- and large-scale applications.',
      'Designed three solutions that modernized citizen–government interaction.',
    ],
  },
  {
    company: '3A WorldWide & Agência Frog',
    title: 'Web Developer',
    period: '2012 – 2015',
    location: 'Rio de Janeiro, Brazil',
    bullets: [
      'Developed web applications for a range of clients and introduced SDLC best practices including version control and code review.',
    ],
  },
]
