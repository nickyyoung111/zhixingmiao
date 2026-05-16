import type { Page } from '../types/app'
import { ModuleIcon } from './ModuleIcon'

const titles: Record<Page, string> = {
  home: '首页主控面板',
  explore: '探索工具广场',
  manor: '我的成长庄园',
  profile: '个人中心与设置',
}

type TopBarProps = {
  page: Page
  quietMode: boolean
  toggleQuietMode: () => void
}

export function TopBar({ page, quietMode, toggleQuietMode }: TopBarProps) {
  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">今日状态中枢</p>
        <h1>{titles[page]}</h1>
      </div>
      <div className="top-actions">
        <span>{quietMode ? '轻陪伴' : '标准陪伴'}</span>
        <button type="button" onClick={toggleQuietMode} aria-label={quietMode ? '关闭轻陪伴' : '开启轻陪伴'} title={quietMode ? '关闭轻陪伴' : '开启轻陪伴'}>
          <ModuleIcon name="quiet" size={18} />
        </button>
      </div>
    </header>
  )
}
