import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ACTIVITIES } from '../data/activities'
import { useStore } from '../store/useStore'
import { useWeather } from '../lib/weather'
import { buildWeekendPlan, recommend } from '../lib/recommend'
import WeatherCard from '../components/WeatherCard'
import ActivityCard from '../components/ActivityCard'
import { SLOT_LABELS } from '../data/activities'

const QUICK_FILTERS = [
  { label: '☔ 室内', to: '/explore?indoor=1' },
  { label: '🆓 免费', to: '/explore?free=1' },
  { label: '👥 适合2人', to: '/explore?people=2' },
  { label: '📍 3km 内', to: '/explore?near=1' },
]

export default function Home() {
  const profile = useStore((s) => s.profile)
  const teams = useStore((s) => s.teams)
  const checkins = useStore((s) => s.checkins)
  const guides = useStore((s) => s.guides)
  const { sat, sun, loading } = useWeather()

  const teamCount = (id: string) => teams.filter((t) => t.activityId === id).reduce((n, t) => n + t.members.length, 0)

  const scored = useMemo(
    () => recommend(profile, ACTIVITIES, sat, sun, () => 0, { hardFilter: true }),
    [profile, sat, sun],
  )
  const top = useMemo(() => scored.slice(0, 3), [scored])
  const plan = useMemo(() => buildWeekendPlan(scored), [scored])
  const latestCheckins = checkins.slice(0, 2)
  const latestGuides = guides.slice(0, 2)

  return (
    <div className="space-y-5 px-4 pt-4">
      <WeatherCard sat={sat} sun={sun} loading={loading} />

      {/* 周末行程 */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1 text-base font-bold text-stone-800">
            <Sparkles size={16} className="text-amber-500" /> 你的周末行程
          </h2>
          <Link to="/explore" className="flex items-center text-xs text-emerald-600">
            全部活动 <ArrowRight size={12} />
          </Link>
        </div>
        <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {plan.map(({ slot, item }) => (
            <Link
              key={slot}
              to={`/activity/${item.activity.id}`}
              className="w-40 shrink-0 rounded-2xl bg-white p-3.5 shadow-card"
            >
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                {SLOT_LABELS[slot]}
              </span>
              <div className="mt-2 text-2xl">{item.activity.emoji}</div>
              <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug">{item.activity.title}</h3>
              <p className="mt-1 text-[11px] text-stone-400">
                {item.activity.price === 0 ? '免费' : `¥${item.activity.price}`} · {item.activity.venue}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 快捷筛选 */}
      <section>
        <div className="flex gap-2">
          {QUICK_FILTERS.map((f) => (
            <Link
              key={f.label}
              to={f.to}
              className="flex-1 rounded-xl border border-stone-200 bg-white py-2 text-center text-xs text-stone-600"
            >
              {f.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 为你推荐 */}
      <section>
        <h2 className="mb-2 text-base font-bold text-stone-800">✨ 为你推荐</h2>
        <p className="mb-2.5 -mt-1 text-[11px] text-stone-400">
          按兴趣 35% · 天气 25% · 预算 20% · 距离 10% · 热度 10% 综合排序（预算上限 ¥{profile.budget}）
        </p>
        <div className="space-y-3">
          {top.map((s) => (
            <ActivityCard key={s.activity.id} activity={s.activity} sat={sat} sun={sun} score={s.score} reason={s.reason} />
          ))}
        </div>
      </section>

      {/* 社区动态 */}
      <section>
        <h2 className="mb-2 text-base font-bold text-stone-800">🔥 社区动态</h2>
        <div className="space-y-2">
          {latestCheckins.map((c) => (
            <Link key={c.id} to="/checkin" className="block rounded-xl bg-white p-3 shadow-card">
              <p className="text-xs font-medium text-stone-600">
                📸 {c.author} 打卡了「{ACTIVITIES.find((a) => a.id === c.activityId)?.title}」
              </p>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-400">{c.note}</p>
            </Link>
          ))}
          {latestGuides.map((g) => (
            <Link key={g.id} to="/checkin" className="block rounded-xl bg-white p-3 shadow-card">
              <p className="text-xs font-medium text-stone-600">📝 {g.author} 发布了攻略</p>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-400">{g.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
