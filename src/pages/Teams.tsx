import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ACTIVITIES, SLOT_LABELS } from '../data/activities'
import { useStore } from '../store/useStore'
import { useWeather } from '../lib/weather'
import TeamCard from '../components/TeamCard'
import type { Slot } from '../types'

export default function Teams() {
  const teams = useStore((s) => s.teams)
  const me = useStore((s) => s.profile.nickname)
  const createTeam = useStore((s) => s.createTeam)
  const { sat, sun } = useWeather()

  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [form, setForm] = useState({
    activityId: ACTIVITIES[0].id,
    meetSlot: 'sat_am' as Slot,
    meetPoint: '',
    note: '',
    maxMembers: 4,
  })

  const filtered = useMemo(() => {
    if (tab === 'mine') return teams.filter((t) => t.members.includes(me))
    return teams
  }, [teams, tab, me])

  const submit = () => {
    createTeam({
      activityId: form.activityId,
      meetSlot: form.meetSlot,
      meetPoint: form.meetPoint || '集合点待定',
      note: form.note,
      maxMembers: Math.min(Math.max(form.maxMembers, 2), 10),
      contact: 'wx: ' + me.slice(0, 4) + '_' + Math.random().toString(36).slice(2, 6),
    })
    setShowCreate(false)
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-sm">
          {(['all', 'mine'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 ${
                tab === t ? 'bg-emerald-500 font-medium text-white' : 'border border-stone-200 bg-white text-stone-500'
              }`}
            >
              {t === 'all' ? '全部队伍' : '我的队伍'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 rounded-full bg-emerald-500 px-3.5 py-2 text-xs font-medium text-white"
        >
          <Plus size={14} /> 发起组队
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <TeamCard key={t.id} team={t} sat={sat} sun={sun} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-stone-400 shadow-card">
            暂无队伍，去发现一个活动发起组队吧 🤝
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40" onClick={() => setShowCreate(false)}>
          <div className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold">发起组队</h3>
            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs text-stone-500">选择活动</label>
                <select
                  value={form.activityId}
                  onChange={(e) => setForm({ ...form, activityId: e.target.value })}
                  className="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none"
                >
                  {ACTIVITIES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.emoji} {a.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-500">集合时段</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(Object.keys(SLOT_LABELS) as Slot[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm({ ...form, meetSlot: s })}
                      className={`rounded-full px-2.5 py-1 text-[11px] ${
                        form.meetSlot === s ? 'bg-emerald-500 font-medium text-white' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {SLOT_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-stone-500">集合地点</label>
                <input
                  value={form.meetPoint}
                  onChange={(e) => setForm({ ...form, meetPoint: e.target.value })}
                  placeholder="如：翠湖公园南门"
                  className="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none placeholder:text-stone-300"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500">队伍说明</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  className="mt-1.5 w-full resize-none rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-stone-500">
                  <label>人数上限</label>
                  <span className="font-medium text-emerald-600">{form.maxMembers} 人</span>
                </div>
                <input
                  type="range" min={2} max={10}
                  value={form.maxMembers}
                  onChange={(e) => setForm({ ...form, maxMembers: Number(e.target.value) })}
                  className="mt-1 w-full accent-emerald-500"
                />
              </div>
              <button onClick={submit} className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white">
                创建队伍
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="pt-1 text-center text-[11px] text-stone-300">
        <Link to="/explore">去探索页挑活动 →</Link>
      </p>
    </div>
  )
}
