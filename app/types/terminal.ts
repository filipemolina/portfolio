export type ScreenKind =
  | 'home'
  | 'about'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'contact'
  | 'help'
  | 'list'
  | 'error'
  | 'info'
  | 'ascii'
  | 'neofetch'

export interface Screen {
  command?: string
  kind: ScreenKind
  text?: string
}
