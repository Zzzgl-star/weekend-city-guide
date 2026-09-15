import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, MapPin, TrainFront, Lightbulb, Heart, Camera, Users, Plus, Clock,
} from 'lucide-react'
import { activityById, COVER_GRADIENTS, SLOT_LABELS } from '../data/activities'
import { useStore } from '../store/useStore'
import { useWeather } from '../lib/weather'
import { slotWeather } from '../lib/recommend'
import type { Slot } from '../types'

export default function ActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const a = activityById(id ?? '')
  const { sat, sun } = useWeather()
  const profile = useStore((s) => s.profile)
  const teams = useStore((s) => s.teams)
  const favorites = useStore((s) => s.favorites)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const joinTeam = useStore((s) => s.joinTeam)
  const leaveTeam = useStore((s) => s.leaveTeam)
  const createTeam = useStore((s) => s.createTeam)

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    meetSlot: (a?.slots[0] ?? 'sat_am') as Slot,
    meetPoint: '',
    note: '',
    maxMembers: 4,
  })

  if (!a) return <div className="p-10 text-center text-stone-400">活动不存在</div>

  const fav = favorites.includes(a.id)
  const activityTeams = teams.filter((t) => t.activityId === a.id)
  const me = profile.nickname

  // 天气适宜度
  const dayWeathers = useMemo(() => {
    const days = a.slots.map((s) => slotWeather(s, sat, sun))
    return days[0]
  }, [a, sat, sun])
  const fitScore = a.indoor
    ? dayWeathers.isGoodForOutdoor ? 75 : 95
    : dayWeathers.isGoodForOutdoor ? 95 : 40
  const fitLabel =
    fitScore >= 90 ? '天气非常合适' : fitScore >= 70 ? '天气较合适' : '建议改期或换室内活动'
  const fitColor = fitScore >= 90 ? 'text-emerald-600' : fitScore >= 70 ? 'text-amber-500' : 'text-red-500'

  const submitTeam = () => {
    createTeam({
      activityId: a.id,
      meetSlot: form.meetSlot,
      meetPoint: form.meetPoint || a.venue + '门口',
      note: form.note,
      maxMembers: Math.min(Math.max(form.maxMembers, 2), 10),
      contact: 'wx: ' + me.slice(0, 4) + '_' + Math.random().toString(36).slice(2, 6),
    })
    setShowCreate(false)
    setForm({ meetSlot: a.slots[0], meetPoint: '', note: '', maxMembers: 4 })
  }

  return (
    <div className="pb-6">
      {/* 封面 */}
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br text-6xl ${COVER_GRADIENTS[a.cover]}`}>
        {a.emoji}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => toggleFavorite(a.id)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 backdrop-blur ${
            fav ? 'text-red-400' : 'text-white'
          }`}
        >
          <Heart size={18} className={fav ? 'fill-red-400' : ''} />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <span className="rounded-full bg-black/30 px-2 py-0.5 text-[11px] text-white backdrop-blur">{a.type}</span>
          <span className="rounded-full bg-black/30 px-2 py-0.5 text-[11px] text-white backdrop-blur">
            {a.indoor ? '室内' : '户外'}
          </span>
          <span className="rounded-full bg-black/30 px-2 py-0.5 text-[11px] text-white backdrop-blur">
            热度 {a.popularity}
          </span>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <div>
          <h1 className="text-lg font-bold text-stone-800">{a.title}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {a.price === 0 ? '免费' : `¥${a.price}/人`} · {a.venue}
          </p>
        </div>

        {/* 天气适宜度 */}
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">🌤️ 天气适宜度</h2>
            <span className={`text-sm font-bold ${fitColor}`}>{fitScore} 分</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {dayWeathers.emoji} {dayWeathers.label} {dayWeathers.text} {dayWeathers.tempMin}~{dayWeathers.tempMax}°C
            ，降水概率 {dayWeathers.precipProb}% — {fitLabel}
          </p>
        </div>

        {/* 详情信息 */}
        <div className="space-y-2.5 rounded-2xl bg-white p-4 text-sm shadow-card">
          <p className="flex gap-2 text-stone-600">
            <Clock size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>{a.slots.map((s) => SLOT_LABELS[s]).join(' / ')}</span>
          </p>
          <p className="flex gap-2 text-stone-600">
            <MapPin size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>{a.address}</span>
          </p>
          <p className="flex gap-2 text-stone-600">
            <TrainFront size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>{a.transport}</span>
          </p>
          <p className="flex gap-2 text-stone-600">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>
              <b className="font-medium">贴士：</b>{a.tips}
            </span>
          </p>
          <p className="border-t border-stone-100 pt-2.5 text-[13px] leading-relaxed text-stone-500">{a.description}</p>
        </div>

        {/* 操作按钮 */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate('/checkin/new?activityId=' + a.id)}
            className="flex items-center justify-center gap-1 rounded-xl bg-amber-400 py-2.5 text-sm font-medium text-white"
          >
            <Camera size={15} /> 打卡
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white"
          >
            <Plus size={15} /> 发起组队
          </button>
          <button
            onClick={() => toggleFavorite(a.id)}
            className={`flex items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-medium ${
              fav ? 'bg-red-50 text-red-500' : 'bg-stone-100 text-stone-500'
            }`}
          >
            <Heart size={15} className={fav ? 'fill-red-400 text-red-400' : ''} /> {fav ? '已收藏' : '收藏'}
          </button>
        </div>

        {/* 组队列表 */}
        <section>
          <h2 className="mb-2 flex items-center gap-1 text-sm font-bold">
            <Users size={15} className="text-emerald-500" /> 本活动队伍（{activityTeams.length}）
          </h2>
          {activityTeams.length === 0 && (
            <p className="rounded-xl bg-white p-4 text-center text-xs text-stone-400 shadow-card">
              还没有队伍，点击上方「发起组队」成为队长吧
            </p>
          )}
          <div className="space-y-2.5">
            {activityTeams.map((t) => {
              const joined = t.members.includes(me)
              const full = t.members.length >= t.maxMembers
              return (
                <div key={t.id} className="rounded-2xl bg-white p-3.5 shadow-card">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-stone-700">
                      队长 {t.creator} · {SLOT_LABELS[t.meetSlot]} 集合
                    </p>
                    <span className="text-[11px] text-emerald-600">{t.members.length}/{t.maxMembers}</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-400">📍 {t.meetPoint}</p>
                  {t.note && <p className="mt-1 text-xs text-stone-500">💬 {t.note}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {t.members.map((m) => (
                        <span key={m} className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-[9px]">
                          {m.slice(0, 1)}
                        </span>
                      ))}
                    </div>
                    {joined ? (
                      <button onClick={() => leaveTeam(t.id)} className="text-xs text-stone-400 underline">
                        退出队伍
                      </button>
                    ) : full ? (
                      <span className="text-xs text-stone-300">已满员</span>
                    ) : (
                      <button onClick={() => joinTeam(t.id)} className="rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-white">
                        加入
                      </button>
                    )}
                  </div>
                  {joined ? (
                    <p className="mt-2 text-[11px] text-stone-400">📞 {t.creator}：{t.contact}</p>
                  ) : (
                    <p className="mt-2 text-[11px] text-stone-300">🔒 加入后可见联系方式</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* 发起组队弹层 */}
      {showCreate && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40" onClick={() => setShowCreate(false)}>
          <div className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold">发起组队 · {a.title}</h3>
            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs text-stone-500">集合时段</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {a.slots.map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm({ ...form, meetSlot: s })}
                      className={`rounded-full px-3 py-1.5 text-xs ${
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
                  placeholder={a.venue + ' 门口'}
                  className="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none placeholder:text-stone-300 focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500">队伍说明</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  placeholder="比如：新手友好，中午一起拼饭"
                  className="mt-1.5 w-full resize-none rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none placeholder:text-stone-300 focus:ring-2 focus:ring-emerald-300"
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
              <button onClick={submitTeam} className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white">
                创建队伍（默认邀请 {profile.groupSize} 人同行）
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部留白给 fixed nav */}
      <div className="h-2" />
      <Link to="/explore" className="sr-only">返回探索</Link>
    </div>
  )
}
