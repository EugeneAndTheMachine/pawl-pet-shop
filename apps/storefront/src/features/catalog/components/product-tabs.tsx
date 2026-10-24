import type { HttpTypes } from '@medusajs/types'
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../../../lib/cx'
import { metadataNumber, metadataString } from '../product-utils'

type Tab = { key: string; label: string; content: ReactNode }

export function ProductTabs({ product }: { product: HttpTypes.StoreProduct }) {
  const baseId = useId()
  const ingredients = metadataString(product, 'ingredients')
  const feedingGuide = metadataString(product, 'feeding_guide')
  const kcal = metadataNumber(product, 'kcal_per_kg')

  const tabs: Tab[] = [
    {
      key: 'description',
      label: 'Mô tả',
      content: <p className="whitespace-pre-line leading-relaxed">{product.description || 'Sản phẩm chưa có mô tả.'}</p>,
    },
  ]
  if (ingredients) {
    tabs.push({ key: 'ingredients', label: 'Thành phần', content: <p className="leading-relaxed">{ingredients}</p> })
  }
  if (feedingGuide || kcal) {
    tabs.push({
      key: 'feeding',
      label: 'Hướng dẫn cho ăn',
      content: (
        <div className="space-y-3 leading-relaxed">
          {feedingGuide && <p>{feedingGuide}</p>}
          {kcal && (
            <p className="text-sm text-ink-soft">
              Năng lượng: <strong className="text-ink">{kcal.toLocaleString('vi-VN')} kcal/kg</strong>
            </p>
          )}
          <p className="text-xs text-ink-soft">Lượng ăn chỉ mang tính tham khảo, không thay thế tư vấn của bác sĩ thú y.</p>
        </div>
      ),
    })
  }

  const [active, setActive] = useState(tabs[0].key)
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.key === active))

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const next = (activeIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    setActive(tabs[next].key)
    document.getElementById(`${baseId}-tab-${tabs[next].key}`)?.focus()
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
      <div role="tablist" aria-label="Thông tin sản phẩm" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line" onKeyDown={onKeyDown}>
        {tabs.map((tab) => {
          const selected = tab.key === tabs[activeIndex].key
          return (
            <button
              key={tab.key}
              id={`${baseId}-tab-${tab.key}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.key)}
              className={cx(
                '-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
                selected ? 'border-brand text-brand-strong' : 'border-transparent text-ink-soft hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.key}
          id={`${baseId}-panel-${tab.key}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab.key}`}
          hidden={tab.key !== tabs[activeIndex].key}
          className="pt-5"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
