import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ACTIVITIES, ACTIVITY_TYPES } from '../data/activities'
import { useStore } from '../store/useStore'
import { useWeather } from '../lib/weather'
import { recommend } from '../lib/recommend'
import ActivityCard from '../components/ActivityCard'
import type { ActivityType } from '../types'

type SortKey = 'score' | 'price' | 'distance' | 'hot'

export default function Explore() {
  const [params] = useSearchParams()
  const profile = useStore((s) => s.profile)
  const { sat, sun } = useWeather()

  const [type, setType] = useState<ActivityType | '全部'>('全部')
  const [indoorOnly, setIndoorOnly] = useState(params.get('indoor') === '1')
  const [outdoorOnly, setOutdoorOnly] = useState(false)
  const [freeOnly, setFreeOnly] = useState(params.get('free') === '1')
  const [maxPrice, setMaxPrice] = useState(200)
  const [nearOnly, setNearOnly] = useState(params.get('near') === '1')
  const [sort, setSort] = useState<SortKey>('score')

  const teamCount = (id: string) =>
    useStore.getState().teams.filter((t) => t.activityId === id).reduce((n, t) => n + t.members.length, 0)

  const list = useMemo(() => {
    let pool = ACTIVITIES.filter((a) => {
      if (type !== '全部' && a.type !== type) return false
      if (indoorOnly && !a.indoor) return false
      if (outdoorOnly && a.indoor) return false
      if (freeOnly && a.price !== 0) return false
      if (nearOnly && a.distanceKm > 3) return false
      if (a.price > maxPrice) return false
      return true
    })
    const scored = recommend(profile, pool, sat, sun, teamCount, { hardFilter: false })
    if (sort === 'score') pool = scored.map((s) => s.activity)
    else if (sort === 'price') pool = [...pool].sort((a, b) => a.price - b.price)
    else if (sort === 'distance') pool = [...pool].sort((a, b) => a.distanceKm - b.distanceKm)
    else pool = [...pool].sort((a, b) => b.popularity - a.popularity)
    return pool
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, indoorOnly, outdoorOnly, freeOnly, nearOnly, maxPrice, sort, sat, sun, profile])

  const sortLabels: { key: SortKey; label: string }[] = [
    { key: 'score', label: '智能推荐' },
    { key: 'price', label: '价格最低' },
    { key: 'distance', label: '距离最近' },
    { key: 'hot', label: '热度最高' },
  ]

  return (
    <div className="space-y-4 px-4 pt-4">
      {/* 类型 chips */}
      <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {(['全部', ...ACTIVITY_TYPES] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs transition-colors ${
              type === t ? 'bg-emerald-500 font-medium text-white' : 'border border-stone-200 bg-white text-stone-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 筛选条 */}
      <div className="rounded-2xl bg-white p-3.5 shadow-card">
        <div className="flex gap-2">
          {[
            { label: '室内', v: indoorOnly, set: setIndoorOnly, off: () => setOutdoorOnly(false) },
            { label: '户外', v: outdoorOnly, set: setOutdoorOnly, off: () => setIndoorOnly(false) },
            { label: '免费', v: freeOnly, set: setFreeOnly, off: () => {} },
            { label: '3km 内', v: nearOnly, set: setNearOnly, off: () => {} },
          ].map((f) => (
            <button
              key={f.label}
              onClick={() => {
                f.set(!f.v)
                if (!f.v) f.off()
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs transition-colors ${
                f.v ? 'bg-emerald-500 font-medium text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-stone-400">
            <span>人均预算</span>
            <span className="font-medium text-emerald-600">≤ ¥{maxPrice}{maxPrice >= 200 ? '（不限）' : ''}</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="mt-1 w-full accent-emerald-500"
          />
        </div>
      </div>

      {/* 排序 */}
      <div className="flex gap-2 text-xs">
        {sortLabels.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`rounded-full px-3 py-1 ${
              sort === s.key ? 'bg-stone-800 font-medium text-white' : 'bg-white text-stone-500'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="space-y-3 pb-2">
        {list.map((a) => (
          <ActivityCard key={a.id} activity={a} sat={sat} sun={sun} />
        ))}
        {list.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-stone-400 shadow-card">
            没有符合条件的活动，试试放宽筛选 🐣
          </div>
        )}
      </div>
    </div>
  )
}
