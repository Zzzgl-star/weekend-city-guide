import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { ACTIVITY_TYPES } from '../data/activities'
import { AVATARS, useStore } from '../store/useStore'
import type { ActivityType } from '../types'

const BADGES = [
  { emoji: '🧭', name: '探索家', desc: '完成 1 次打卡', check: (s: { n: number }) => s.n >= 1 },
  { emoji: '🤝', name: '组队达人', desc: '加入过 1 支队伍', check: (s: { t: number }) => s.t >= 1 },
  { emoji: '✍️', name: '攻略作者', desc: '发布 1 篇攻略', check: (s: { g: number }) => s.g >= 1 },
  { emoji: '⭐', name: '收藏家', desc: '收藏 3 个活动', check: (s: { f: number }) => s.f >= 3 },
]

export default function Profile() {
  const profile = useStore((s) => s.profile)
  const updateProfile = useStore((s) => s.updateProfile)
  const toggleInterest = useStore((s) => s.toggleInterest)
  const teams = useStore((s) => s.teams)
  const checkins = useStore((s) => s.checkins)
  const guides = useStore((s) => s.guides)
  const favorites = useStore((s) => s.favorites)
  const resetDemo = useStore((s) => s.resetDemo)
  const [confirmReset, setConfirmReset] = useState(false)

  const me = profile.nickname
  const myTeams = teams.filter((t) => t.members.includes(me)).length
  const myGuides = guides.filter((g) => g.author === me).length
  const points = checkins.length * 10 + myGuides * 20 + myTeams * 5 + favorites.length * 2
  const stats = { n: checkins.length, t: myTeams, g: myGuides, f: favorites.length }

  return (
    <div className="space-y-4 px-4 pt-4">
      {/* 头像与积分 */}
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-card">
        <span className="text-4xl">{profile.avatar}</span>
        <div className="flex-1">
          <p className="text-lg font-bold">{profile.nickname}</p>
          <p className="text-xs opacity-80">{profile.city} · 预算 ¥{profile.budget} · 半径 {profile.radiusKm}km</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">{points}</p>
          <p className="text-[10px] opacity-80">探索积分</p>
        </div>
      </div>

      {/* 数据一览 */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: '我的队伍', n: myTeams, to: '/teams' },
          { label: '打卡', n: checkins.length, to: '/checkin' },
          { label: '攻略', n: myGuides, to: '/checkin' },
          { label: '收藏', n: favorites.length, to: '/explore' },
        ].map((c) => (
          <Link key={c.label} to={c.to} className="rounded-xl bg-white py-2.5 shadow-card">
            <p className="text-lg font-bold text-emerald-600">{c.n}</p>
            <p className="text-[10px] text-stone-400">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* 徽章墙 */}
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-bold">🏅 徽章墙</h2>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {BADGES.map((b) => {
            const got = b.check(stats)
            return (
              <div key={b.name} className={`rounded-xl p-2 text-center ${got ? 'bg-amber-50' : 'bg-stone-50 opacity-45'}`}>
                <div className="text-2xl">{b.emoji}</div>
                <p className="mt-0.5 text-[10px] font-medium text-stone-600">{b.name}</p>
                <p className="text-[9px] leading-tight text-stone-400">{got ? '已获得' : b.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 偏好设置 */}
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-bold">⚙️ 我的偏好</h2>

        <div className="mt-3">
          <label className="text-xs text-stone-500">头像与昵称</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => updateProfile({ avatar: a })}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xl ${
                  profile.avatar === a ? 'bg-emerald-100 ring-2 ring-emerald-400' : 'bg-stone-100'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <input
            value={profile.nickname}
            onChange={(e) => updateProfile({ nickname: e.target.value })}
            maxLength={10}
            className="mt-2 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        <div className="mt-3.5">
          <label className="text-xs text-stone-500">兴趣（影响推荐权重 35%）</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ACTIVITY_TYPES.map((t: ActivityType) => (
              <button
                key={t}
                onClick={() => toggleInterest(t)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  profile.interests.includes(t)
                    ? 'bg-emerald-500 font-medium text-white'
                    : 'border border-stone-200 text-stone-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-stone-500">
            <label>人均预算上限</label>
            <span className="font-medium text-emerald-600">¥{profile.budget}</span>
          </div>
          <input
            type="range" min={0} max={300} step={10}
            value={profile.budget}
            onChange={(e) => updateProfile({ budget: Number(e.target.value) })}
            className="mt-1 w-full accent-emerald-500"
          />
        </div>

        <div className="mt-3">
          <label className="text-xs text-stone-500">同行人数</label>
          <div className="mt-1.5 flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => updateProfile({ groupSize: n })}
                className={`h-8 flex-1 rounded-lg text-xs ${
                  profile.groupSize === n ? 'bg-emerald-500 font-medium text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-stone-500">
            <label>出行半径（距市中心）</label>
            <span className="font-medium text-emerald-600">{profile.radiusKm} km</span>
          </div>
          <input
            type="range" min={3} max={30} step={1}
            value={profile.radiusKm}
            onChange={(e) => updateProfile({ radiusKm: Number(e.target.value) })}
            className="mt-1 w-full accent-emerald-500"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs text-stone-500">所在城市</label>
          <input
            value={profile.city}
            onChange={(e) => updateProfile({ city: e.target.value })}
            maxLength={8}
            className="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      </section>

      {/* 数据说明与重置 */}
      <div className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-[11px] leading-relaxed text-stone-400">
          数据说明：偏好、组队、打卡、攻略保存在你浏览器的本地存储（localStorage）中，
          仅本机可见；换设备或清除浏览器数据后会回到演示初始状态。
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="mt-2.5 flex items-center gap-1 text-xs text-stone-400 underline"
          >
            <RotateCcw size={12} /> 重置演示数据
          </button>
        ) : (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-xs text-stone-500">确认重置？</span>
            <button
              onClick={() => { resetDemo(); setConfirmReset(false) }}
              className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-medium text-white"
            >
              确认
            </button>
            <button onClick={() => setConfirmReset(false)} className="text-xs text-stone-400 underline">
              取消
            </button>
          </div>
        )}
      </div>

      <p className="pb-2 text-center text-[10px] text-stone-300">周末城市探索指南 v1.0 · 昆明演示数据 · AI Coding 实作品</p>
    </div>
  )
}
