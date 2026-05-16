import type { ReactNode } from 'react'

type RichChatTextProps = {
  text: string
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    }

    return <span key={`${part}-${index}`}>{part}</span>
  })
}

function flushList(items: string[], nodes: ReactNode[], key: string) {
  if (items.length === 0) return

  nodes.push(
    <ul key={key}>
      {items.map((item, index) => (
        <li key={`${key}-${index}`}>{renderInline(item)}</li>
      ))}
    </ul>,
  )
  items.length = 0
}

export function RichChatText({ text }: RichChatTextProps) {
  const nodes: ReactNode[] = []
  const listItems: string[] = []
  const lines = text.split(/\r?\n/)

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()

    if (!line) {
      flushList(listItems, nodes, `list-${index}`)
      return
    }

    if (line.startsWith('### ')) {
      flushList(listItems, nodes, `list-${index}`)
      nodes.push(<h3 key={`heading-${index}`}>{renderInline(line.slice(4))}</h3>)
      return
    }

    if (line.startsWith('## ')) {
      flushList(listItems, nodes, `list-${index}`)
      nodes.push(<h3 key={`heading-${index}`}>{renderInline(line.slice(3))}</h3>)
      return
    }

    if (line.startsWith('- ')) {
      listItems.push(line.slice(2))
      return
    }

    flushList(listItems, nodes, `list-${index}`)
    nodes.push(<p key={`paragraph-${index}`}>{renderInline(line)}</p>)
  })

  flushList(listItems, nodes, 'list-final')

  return <div className="ai-rich-text">{nodes}</div>
}
