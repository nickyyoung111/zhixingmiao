import type { Page } from '../types/app'
import { ModuleIcon } from './ModuleIcon'

type NavButtonProps = {
  page: Page
  active: Page
  setPage: (page: Page) => void
  label: string
}

export function NavButton({ page, active, setPage, label }: NavButtonProps) {
  return (
    <button type="button" className={active === page ? 'nav-button active' : 'nav-button'} onClick={() => setPage(page)} aria-label={label} title={label}>
      <ModuleIcon name={page} />
      <span className="sr-only">{label}</span>
    </button>
  )
}
