import { Star, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Activity, WeatherDay } from '../types'
import { COVER_GRADIENTS, SLOT_LABELS } from '../data/activities'
import { slotWeather } from '../lib/recommend'
import { useStore } from '../store/useStore'

interface Props {
  activity: Activity
  sat: WeatherDay
  sun: WeatherDay
  score?: number
  reason?: string
}

export default function ActivityCard({ activity: a, sat, sun, score, reason }: Props) {
  const favorites = useStore((s) => s.favorites)
  const fav = favorites.includes(a.id)
  const w = slotWeather(a.slots[0], sat, sun)
  const fitText = a.indoor
    ? w.isGoodForOutdoor ? '室内 · 全天适宜' : '室内 · 雨天首选'
    : w.isGoodForOutdoor ? '户外 · 天气正好' : '户外 · 需好天'

  return (
    <Link
      to={`/activity/${a.id}`}
      className="block rounded-2xl bg-white shadow-card transition-transform active:scale-[0.99]"
    >
      <div className="flex">
        <div
          className={`flex w-[92px] shrink-0 items-center justify-center rounded-l-2xl bg-gradient-to-br text-4xl ${COVER_GRADIENTS[a.cover]}`}
        >
          {a.emoji}
        </div>
        <div className="min-w-0 flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold text-stone-800">{a.title}</h3>
            <Heart
              size={16}
              className={`mt-0.5 shrink-0 ${fav ? 'fill-red-500 text-red-500' : 'text-stone-300'}`}
            />
          </div>
          <p className="mt-0.5 truncate text-xs text-stone-400">
            {a.venue} · {a.distanceKm}km
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600">
              {a.type}
            </span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] ${a.indoor ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'}`}>
              {a.indoor ? '室内' : '户外'}
            </span>
            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
              {fitText}
            </span>
            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
              {SLOT_LABELS[a.slots[0]]}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-600">
              {a.price === 0 ? '免费' : `¥${a.price}/人`}
            </span>
            {score !== undefined && (
              <span className="flex items-center gap-1 text-xs text-amber-500">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                匹配 {score}
              </span>
            )}
          </div>
          {reason && (
            <p className="mt-1.5 line-clamp-2 rounded-lg bg-stone-50 px-2 py-1 text-[11px] leading-relaxed text-stone-500">
              💡 {reason}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
