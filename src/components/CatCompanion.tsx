import { catAssets } from '../data/catAssets'
import { getModelLabel, getProviderLabel } from '../services/aiProviders'
import type { CatPersona, ChatMessage } from '../types/app'
import { RichChatText } from './RichChatText'

type CatCompanionProps = {
  persona: CatPersona
  bubble: string
  chatText: string
  chatMessages: ChatMessage[]
  provider: string
  model: string
  responseMode: string
  isSubmitting: boolean
  setChatText: (text: string) => void
  submitChat: () => void
}

export function CatCompanion({ persona, bubble, chatText, chatMessages, provider, model, responseMode, isSubmitting, setChatText, submitChat }: CatCompanionProps) {
  const cat = catAssets[persona]
  const followUp = isSubmitting
    ? '正在理解你的状态，不急着给答案。'
    : persona === 'comfort' ? '安慰优先规则已生效，必要时再接鼓励喵。' : `${getModelLabel(model)} 已接入。`
  const isComposing = chatText.trim().length > 0 || isSubmitting
  const recentMessages = chatMessages.slice(-4)

  return (
    <aside className={`cat-companion ${persona} ${isComposing ? 'is-composing' : ''}`}>
      <div className="cat-status-row">
        <span className="live-status">{isSubmitting ? '正在理解你' : '在线陪伴'}</span>
        <span>{getProviderLabel(provider)} · {responseMode === 'detailed' ? '详细' : '简洁'}</span>
      </div>
      <div className="cat-stage" aria-label={`${cat.name}当前陪伴状态`}>
        <div className="cat-image-wrap">
          <img src={cat.image} alt={cat.name} />
        </div>
        <span className="cat-state-chip">{cat.state}</span>
      </div>
      <p className="eyebrow">{cat.title}</p>
      <h2>{cat.name}</h2>
      <p className="cat-tone">{cat.tone}</p>
      <div className="cat-bubble"><RichChatText text={bubble} /></div>
      <div className="chat-history" aria-label="最近对话">
        {recentMessages.length === 0 && (
          <div className="chat-message cat starter">我在这里。你可以只说一个词，比如“累”“焦虑”或者“想开始”。</div>
        )}
        {recentMessages.map((message) => (
          <div className={message.role === 'user' ? 'chat-message user' : 'chat-message cat'} key={message.id}>
            {message.role === 'cat' ? <RichChatText text={message.text} /> : message.text}
          </div>
        ))}
        {isSubmitting && <div className="chat-message cat thinking">我正在把你的话放慢一点理解...</div>}
      </div>
      <div className="chat-box">
        <input value={chatText} onChange={(event) => setChatText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitChat()} placeholder="和知行喵说说现在的状态" disabled={isSubmitting} />
        <button type="button" onClick={submitChat} disabled={isSubmitting}>{isSubmitting ? '理解中' : '发送'}</button>
      </div>
      <p className="routing-note">{followUp}</p>
    </aside>
  )
}
