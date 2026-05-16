import { zhixingCat } from '../data/catAssets'
import type { GrowthEvidence, UserPreferences, UserProfile } from '../types/app'
import { ModuleIcon } from '../components/ModuleIcon'

type ProfilePageProps = {
  user: UserProfile
  preferences: UserPreferences
  evidenceRecords: GrowthEvidence[]
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  logoutSession: () => void
  resetSession: () => void
}

export function ProfilePage({ user, preferences, evidenceRecords, updatePreferences, logoutSession, resetSession }: ProfilePageProps) {
  const totalFishEarned = evidenceRecords.reduce((sum, record) => sum + record.fishEarned, 0)
  const practiceCount = evidenceRecords.filter((record) => record.category === '实践体验' || record.category === '沟通练习').length

  return (
    <div className="page-stack">
      <section className="profile-summary">
        <img src={zhixingCat} alt="知行喵头像" />
        <div>
          <h2>{user.name}</h2>
          <p>Lv.{user.level} {user.title} · 连续打卡 {user.streakDays} 天</p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2><span className="heading-icon"><ModuleIcon name="history" size={18} /></span>成长档案</h2>
          <span>自动沉淀最近证据</span>
        </div>
        <div className="archive-metrics">
          <span><ModuleIcon name="tasks" size={17} />{evidenceRecords.length} 条成长证据</span>
          <span><ModuleIcon name="practice" size={17} />{practiceCount} 次实践练习</span>
          <span><ModuleIcon name="fish" size={17} />累计 +{totalFishEarned} 小鱼干</span>
        </div>
        <div className="evidence-list">
          {evidenceRecords.slice(0, 6).map((record) => (
            <article key={record.id}>
              <div>
                <span>{record.category}</span>
                <strong>{record.title}</strong>
                <p>{record.note}</p>
              </div>
              <small>{record.createdAt} · +{record.fishEarned}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2><span className="heading-icon"><ModuleIcon name="settings" size={18} /></span>设置</h2>
          <span>体验偏好</span>
        </div>
        <label className="setting-row">
          <span><ModuleIcon name="spark" size={18} />启用猫系动效</span>
          <input type="checkbox" checked={preferences.motionEnabled} onChange={(event) => updatePreferences({ motionEnabled: event.target.checked })} />
        </label>
        <label className="setting-row">
          <span><ModuleIcon name="quiet" size={18} />轻陪伴模式</span>
          <input type="checkbox" checked={preferences.quietMode} onChange={(event) => updatePreferences({ quietMode: event.target.checked })} />
        </label>
        <label className="setting-row">
          <span><ModuleIcon name="settings" size={18} />AI 提供方</span>
          <select value={preferences.provider} onChange={(event) => {
            const provider = event.target.value as UserPreferences['provider']
            updatePreferences({ provider, aiModel: provider === 'qwen' ? 'qwen-plus' : preferences.aiModel })
          }}>
            <option value="mock">Mock AI</option>
            <option value="deepseek">DeepSeek</option>
            <option value="qwen">通义千问</option>
          </select>
        </label>
        <label className="setting-row">
          <span><ModuleIcon name="settings" size={18} />模型</span>
          <select value={preferences.aiModel} disabled={preferences.provider === 'mock'} onChange={(event) => updatePreferences({ aiModel: event.target.value as UserPreferences['aiModel'] })}>
            {preferences.provider === 'qwen' ? (
              <option value="qwen-plus">通义千问 Plus</option>
            ) : (
              <>
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="deepseek-reasoner">DeepSeek Reasoner</option>
              </>
            )}
          </select>
        </label>
        <label className="setting-row">
          <span><ModuleIcon name="spark" size={18} />回复长度</span>
          <select value={preferences.responseMode} onChange={(event) => updatePreferences({ responseMode: event.target.value as UserPreferences['responseMode'] })}>
            <option value="brief">简洁陪伴</option>
            <option value="detailed">详细分析</option>
          </select>
        </label>
        <div className="quota-summary" aria-label="AI 免费额度">
          <span>标准 AI 对话 20 次/天</span>
          <span>详细分析 5 次/天</span>
          <span>深度思考 3 次/天</span>
        </div>
        <div className="setting-row">
          <span><ModuleIcon name="logout" size={18} />账号安全</span>
          <button type="button" className="logout-action" onClick={logoutSession}><ModuleIcon name="logout" size={16} />退出登录</button>
        </div>
        <div className="setting-row">
          <span><ModuleIcon name="reset" size={18} />演示数据</span>
          <button type="button" className="danger-action" onClick={resetSession}><ModuleIcon name="reset" size={16} />重置体验数据</button>
        </div>
      </section>
    </div>
  )
}
