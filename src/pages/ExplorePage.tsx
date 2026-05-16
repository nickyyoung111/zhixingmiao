import { useState } from 'react'
import type { FormEvent } from 'react'
import { activityChallenges, exploreTools, habitTemplates, scenarioPractices } from '../data/mockData'
import type { ActiveHabit, ActivityChallenge, Goal, ScenarioPractice } from '../types/app'
import { ModuleIcon, type ModuleIconName } from '../components/ModuleIcon'

const toolIcons: Record<string, ModuleIconName> = {
  goal: 'goal',
  habit: 'habit',
  scenario: 'scenario',
  activity: 'activity',
}

const habitIcons: Record<string, ModuleIconName> = {
  'study-review': 'study',
  'body-wakeup': 'spark',
  'kind-message': 'social',
  'practice-log': 'practice',
}

type ExplorePageProps = {
  goals: Goal[]
  habits: ActiveHabit[]
  joinedActivityIds: ActivityChallenge['id'][]
  onToolSelect: (toolId: string) => void
  onCreateGoal: (goalText: string) => void
  onActivateHabit: (templateId: string) => void
  onStartScenario: (practiceId: ScenarioPractice['id']) => void
  onJoinActivity: (activityId: ActivityChallenge['id']) => void
}

export function ExplorePage({ goals, habits, joinedActivityIds, onToolSelect, onCreateGoal, onActivateHabit, onStartScenario, onJoinActivity }: ExplorePageProps) {
  const [goalText, setGoalText] = useState('')
  const [activeTool, setActiveTool] = useState('goal')

  function submitGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!goalText.trim()) return
    onCreateGoal(goalText)
    setGoalText('')
  }

  function selectTool(toolId: string) {
    setActiveTool(toolId)
    onToolSelect(toolId)
  }

  return (
    <div className="page-stack">
      <div className="tool-switcher" aria-label="探索模块">
        {exploreTools.map((tool) => (
          <button type="button" className={activeTool === tool.id ? 'active' : ''} key={tool.id} onClick={() => selectTool(tool.id)}>
            <span className="module-badge sky"><ModuleIcon name={toolIcons[tool.id] ?? 'explore'} size={20} /></span>
            <span>{tool.title}</span>
            <small>{tool.status}</small>
          </button>
        ))}
      </div>

      {activeTool === 'goal' && (
        <section className="focus-panel">
          <div>
            <span className="module-badge mango"><ModuleIcon name="goal" /></span>
            <p className="eyebrow">目标工坊</p>
            <h2>把一个大目标拆成今天能开始的小行动</h2>
            <p>输入一个目标，知行喵会拆成 3 个低压力任务。</p>
          </div>
          <form className="goal-form" onSubmit={submitGoal}>
            <input value={goalText} onChange={(event) => setGoalText(event.target.value)} placeholder="例如：这个月养成每天学习复盘的习惯" />
            <button type="submit">生成任务</button>
          </form>
        </section>
      )}

      {activeTool === 'habit' && (
        <section className="section-block">
          <div className="section-heading">
            <h2><span className="heading-icon"><ModuleIcon name="habit" size={18} /></span>习惯图书馆</h2>
            <span>选择一个就够了</span>
          </div>
          <div className="habit-template-grid compact-grid">
            {habitTemplates.map((template) => (
              <article key={template.id}>
                <div>
                  <span className="module-badge mint"><ModuleIcon name={habitIcons[template.id] ?? 'habit'} /></span>
                  <span>{template.area} · {template.energy}</span>
                  <h3>{template.title}</h3>
                  <p>最小行动：{template.tinyAction}</p>
                </div>
                <button type="button" onClick={() => onActivateHabit(template.id)}>
                  <ModuleIcon name="spark" size={17} />
                  <span>开始 3 天</span>
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTool === 'scenario' && (
        <section className="section-block">
          <div className="section-heading">
            <h2><span className="heading-icon"><ModuleIcon name="scenario" size={18} /></span>情景训练舱</h2>
            <span>低压力练一句就好</span>
          </div>
          <div className="scenario-grid compact-grid">
            {scenarioPractices.map((practice) => (
              <article key={practice.id}>
                <span className="module-badge sky"><ModuleIcon name="scenario" /></span>
                <div>
                  <h3>{practice.title}</h3>
                  <p>{practice.situation}</p>
                  <small>开场句：{practice.firstLine}</small>
                </div>
                <button type="button" onClick={() => onStartScenario(practice.id)}>
                  <ModuleIcon name="spark" size={17} />
                  <span>开始练习</span>
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTool === 'activity' && (
        <section className="section-block">
          <div className="section-heading">
            <h2><span className="heading-icon"><ModuleIcon name="activity" size={18} /></span>活动广场</h2>
            <span>选择一个轻实践</span>
          </div>
          <div className="activity-grid compact-grid">
            {activityChallenges.map((activity) => {
              const joined = joinedActivityIds.includes(activity.id)

              return (
                <article key={activity.id} className={joined ? 'joined' : ''}>
                  <span className={`module-badge ${activity.tone}`}><ModuleIcon name="activity" /></span>
                  <div>
                    <span>{activity.area} · {activity.duration}</span>
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                    <small>最小一步：{activity.tinyStep}</small>
                  </div>
                  <button type="button" disabled={joined} onClick={() => onJoinActivity(activity.id)}>
                    <ModuleIcon name={joined ? 'check' : 'spark'} size={17} />
                    <span>{joined ? '已加入' : `加入 +${activity.rewardFish}`}</span>
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {activeTool === 'habit' && (
        <section className="section-block slim-block">
        <div className="section-heading">
          <h2><span className="heading-icon"><ModuleIcon name="spark" size={18} /></span>已开启习惯</h2>
          <span>连续天数会在完成任务后增长</span>
        </div>
        <div className="active-habit-list">
          {habits.map((habit) => (
            <article key={habit.id}>
              <strong>{habit.title}</strong>
              <span>连续 {habit.streak} 天</span>
            </article>
          ))}
        </div>
      </section>
      )}

      {activeTool === 'goal' && (
        <section className="section-block slim-block">
        <div className="section-heading">
          <h2><span className="heading-icon"><ModuleIcon name="goal" size={18} /></span>最近目标</h2>
          <span>后续同步到 goals / milestones</span>
        </div>
        <div className="goal-list">
          {goals.map((goal) => (
            <article key={goal.id}>
              <div>
                <strong>{goal.title}</strong>
                <p>{goal.reason}</p>
              </div>
              <span>{goal.horizon} · {goal.progress}%</span>
            </article>
          ))}
        </div>
      </section>
      )}
    </div>
  )
}
