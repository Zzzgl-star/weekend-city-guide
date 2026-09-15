import { Link } from 'react-router-dom'
import { MapPin, Users } from 'lucide-react'
import type { Team, WeatherDay } from '../types'
import { activityById, SLOT_LABELS } from '../data/activities'
import { useStore } from '../store/useStore'

export default function TeamCard({ team, sat, sun }: { team: Team; sat: WeatherDay; sun: WeatherDay }) {
  const a = activityById(team.activityId)
  const me = useStore((s) => s.profile.nickname)
  if (!a) return null
  const joined = team.members.includes(me)
  const full = team.members.length >= team.maxMembers

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/activity/${a.id}`} className="truncate text-[15px] font-semibold text-stone-800">
            {a.emoji} {a.title}
          </Link>
          <p className="mt-1 flex items-center gap-1 text-xs text-stone-400">
            <MapPin size={12} /> {SLOT_LABELS[team.meetSlot]} · {team.meetPoint}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-600">
          {team.members.length}/{team.maxMembers} 人
        </span>
      </div>
      {team.note && <p className="mt-2 rounded-lg bg-stone-50 px-2.5 py-1.5 text-xs text-stone-500">{team.note}</p>}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {team.members.map((m) => (
            <span
              key={m}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-[10px]"
              title={m}
            >
              {m.slice(0, 1)}
            </span>
          ))}
        </div>
        {joined ? (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <Users size={13} /> 我在队中
          </span>
        ) : full ? (
          <span className="text-xs text-stone-400">已满员</span>
        ) : (
          <Link
            to={`/activity/${a.id}`}
            className="rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-white"
          >
            查看并加入
          </Link>
        )}
      </div>
      {/* 联系方式隐私保护：仅加入后可见 */}
      {joined ? (
        <p className="mt-2 text-[11px] text-stone-400">📞 发起人 {team.creator}：{team.contact}</p>
      ) : (
        <p className="mt-2 text-[11px] text-stone-300">🔒 加入队伍后可见发起人联系方式</p>
      )}
    </div>
  )
}
