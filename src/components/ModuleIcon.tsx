import {
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  Circle,
  ClipboardList,
  Compass,
  Drama,
  HeartHandshake,
  Home,
  LogOut,
  Moon,
  RotateCcw,
  Settings,
  SmilePlus,
  Sparkles,
  Sprout,
  Target,
  Trophy,
  UserRound,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import fishSnack from '../assets/cats/fish-snack.png'

export type ModuleIconName =
  | 'home'
  | 'explore'
  | 'manor'
  | 'profile'
  | 'goal'
  | 'habit'
  | 'scenario'
  | 'activity'
  | 'progress'
  | 'trophy'
  | 'next'
  | 'fish'
  | 'tasks'
  | 'mood'
  | 'history'
  | 'settings'
  | 'quiet'
  | 'logout'
  | 'reset'
  | 'arrow'
  | 'spark'
  | 'study'
  | 'social'
  | 'practice'
  | 'check'
  | 'empty'

const iconMap: Record<Exclude<ModuleIconName, 'fish'>, LucideIcon> = {
  home: Home,
  explore: Compass,
  manor: Sprout,
  profile: UserRound,
  goal: Target,
  habit: Sparkles,
  scenario: Drama,
  activity: Bell,
  progress: Trophy,
  trophy: Trophy,
  next: Zap,
  tasks: ClipboardList,
  mood: SmilePlus,
  history: BookOpen,
  settings: Settings,
  quiet: Moon,
  logout: LogOut,
  reset: RotateCcw,
  arrow: ArrowRight,
  spark: Sparkles,
  study: BookOpen,
  social: HeartHandshake,
  practice: ClipboardList,
  check: Check,
  empty: Circle,
}

type ModuleIconProps = {
  name: ModuleIconName
  className?: string
  size?: number
}

export function ModuleIcon({ name, className, size = 22 }: ModuleIconProps) {
  if (name === 'fish') {
    return (
      <img
        aria-hidden="true"
        className={className ? `asset-icon fish-asset-icon ${className}` : 'asset-icon fish-asset-icon'}
        src={fishSnack}
        alt=""
        style={{ width: size, height: size }}
      />
    )
  }

  const Icon = iconMap[name]
  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={2.5} />
}
