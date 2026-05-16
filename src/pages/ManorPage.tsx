import { useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { ModuleIcon } from '../components/ModuleIcon'
import type { ManorBuilding, ManorState, ShopItem } from '../types/app'

type ManorPageProps = {
  completionRate: number
  manor: ManorState
  selectedMood: string
  fishCount: number
  shopItems: ShopItem[]
  purchasedItemIds: ShopItem['id'][]
  onUpdateBuilding: (buildingId: ManorBuilding['id'], payload: { positionX: number; positionY: number }) => void
  onPurchaseItem: (itemId: ShopItem['id']) => void
}

type Position = {
  positionX: number
  positionY: number
}

const entityClassNames: Record<string, string> = {
  'study-tower': 'entity-study-tower',
  'mood-pond': 'entity-mood-pond',
  'knowledge-garden': 'entity-knowledge-garden',
  'decor:sunflower': 'entity-sunflower',
  'decor:cozy-lamp': 'entity-lamp',
  'decor:calm-stone': 'entity-stone',
  'decor:study-banner': 'entity-banner',
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function ManorPage({ completionRate, manor, selectedMood, fishCount, shopItems, purchasedItemIds, onUpdateBuilding, onPurchaseItem }: ManorPageProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [draftPositions, setDraftPositions] = useState<Record<string, Position>>({})
  const visibleBuildings = useMemo(
    () => manor.buildings.filter((building) => building.variant === 'core' || !building.itemId || purchasedItemIds.includes(building.itemId)),
    [manor.buildings, purchasedItemIds],
  )

  function getPosition(building: ManorBuilding) {
    return draftPositions[building.id] ?? {
      positionX: building.positionX,
      positionY: building.positionY,
    }
  }

  function readPointerPosition(event: ReactPointerEvent) {
    const rect = sceneRef.current?.getBoundingClientRect()
    if (!rect) return null

    return {
      positionX: clamp(((event.clientX - rect.left) / rect.width) * 100, 4, 96),
      positionY: clamp(((event.clientY - rect.top) / rect.height) * 100, 6, 94),
    }
  }

  function updateDraftPosition(buildingId: string, event: ReactPointerEvent) {
    const position = readPointerPosition(event)
    if (!position) return null

    setDraftPositions((current) => ({
      ...current,
      [buildingId]: position,
    }))

    return position
  }

  return (
    <div className="page-stack">
      <section ref={sceneRef} className={`manor-scene theme-${manor.theme}`} aria-label="成长庄园预览">
        <div className="manor-mood-layer" aria-hidden="true"></div>
        <div className="sun"></div>
        <div className="path"></div>
        {visibleBuildings.map((building) => {
          const position = getPosition(building)
          const className = entityClassNames[building.type] ?? 'entity-decoration'
          const label = building.type === 'mood-pond' ? `${building.label} · ${selectedMood}` : building.label

          return (
            <button
              key={building.id}
              type="button"
              className={`manor-entity ${building.variant === 'core' ? 'manor-core' : 'manor-decoration'} ${className} ${draggingId === building.id ? 'is-dragging' : ''}`}
              style={{ left: `${position.positionX}%`, top: `${position.positionY}%` }}
              title={label}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId)
                setDraggingId(building.id)
                updateDraftPosition(building.id, event)
              }}
              onPointerMove={(event) => {
                if (draggingId === building.id) {
                  updateDraftPosition(building.id, event)
                }
              }}
              onPointerUp={(event) => {
                if (draggingId !== building.id) return
                const position = updateDraftPosition(building.id, event)
                setDraggingId(null)
                if (position) {
                  onUpdateBuilding(building.id, position)
                }
              }}
              onPointerCancel={() => setDraggingId(null)}
            >
              <span>{label}</span>
              <small>Lv.{building.level}</small>
            </button>
          )
        })}
      </section>
      <section className="section-block">
        <div className="section-heading">
          <h2><span className="heading-icon"><ModuleIcon name="manor" size={18} /></span>庄园成长映射</h2>
          <span>当前活力 {manor.vitality || completionRate}%</span>
        </div>
        <div className={`manor-response-card theme-${manor.theme}`}>
          <strong>{manor.moodTone}正在影响庄园氛围</strong>
          <span>{manor.theme === 'calm' ? '池塘会更慢一点，先把焦虑放轻。' : manor.theme === 'comfort' ? '暖光会靠近路边，陪你缓一会儿。' : manor.theme === 'bright' ? '阳光更亮，适合把开心变成行动。' : manor.theme === 'focus' ? '庄园会收束注意力，先照顾边界。' : '庄园保持温暖，适合稳稳推进。'}</span>
        </div>
        <div className="manor-metrics">
          <span><ModuleIcon name="study" size={18} />自我管理：学习塔点亮</span>
          <span><ModuleIcon name="mood" size={18} />情绪健康：池塘颜色随打卡变化</span>
          <span><ModuleIcon name="social" size={18} />社会情感：花园后续接同盟互动</span>
        </div>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <h2><span className="heading-icon"><ModuleIcon name="fish" size={18} /></span>小鱼干商店</h2>
          <span>当前余额 {fishCount} 条</span>
        </div>
        <div className="shop-grid">
          {shopItems.map((item) => {
            const purchased = purchasedItemIds.includes(item.id)
            const affordable = fishCount >= item.cost

            return (
              <article key={item.id} className={purchased ? 'shop-card purchased' : 'shop-card'}>
                <span className={`module-badge ${item.tone}`}><ModuleIcon name={item.category === '情绪道具' ? 'mood' : item.category === '喵咪小物' ? 'spark' : 'manor'} /></span>
                <div>
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <small>{item.effect}</small>
                </div>
                <button type="button" disabled={purchased} onClick={() => onPurchaseItem(item.id)}>
                  <ModuleIcon name={purchased ? 'check' : 'fish'} size={16} />
                  <span>{purchased ? '已拥有' : affordable ? `${item.cost} 兑换` : `差 ${item.cost - fishCount}`}</span>
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
