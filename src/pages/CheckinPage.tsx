import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Camera, Map, FileText, Plus, Sparkles } from 'lucide-react'
import { ACTIVITIES, activityById } from '../data/activities'
import { useStore } from '../store/useStore'
import PosterModal from '../components/PosterModal'
import type { Guide } from '../types'

const timeAgo = (ts: number) => {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  return `${Math.floor(h / 24)} 天前`
}

export default function CheckinPage() {
  const [tab, setTab] = useState<'checkin' | 'guide'>('checkin')
  const [showPoster, setShowPoster] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const checkins = useStore((s) => s.checkins)
  const guides = useStore((s) => s.guides)
  const likeGuide = useStore((s) => s.likeGuide)
  const me = useStore((s) => s.profile.nickname)

  // 从活动页跳转来时直接打开打卡表单
  useEffect(() => {
    if (params.get('activityId')) {
      navigate('/checkin/new?activityId=' + params.get('activityId'), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4 px-4 pt-4">
      {/* 分段切换 */}
      <div className="flex rounded-full bg-stone-200/60 p-1 text-sm">
        {([
          { k: 'checkin', label: '足迹打卡', icon: Map },
          { k: 'guide', label: '攻略分享', icon: FileText },
        ] as const).map(({ k, label, icon: Icon }) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-full py-2 transition-colors ${
              tab === k ? 'bg-white font-semibold text-emerald-600 shadow-sm' : 'text-stone-500'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'checkin' ? (
        <>
          <div className="flex gap-2">
            <Link
              to="/checkin/new"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-400 py-2.5 text-sm font-medium text-white"
            >
              <Plus size={15} /> 去打卡
            </Link>
            <button
              onClick={() => setShowPoster(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-800 py-2.5 text-sm font-medium text-white"
            >
              <Sparkles size={15} /> 生成足迹海报
            </button>
          </div>

          <div className="space-y-3">
            {checkins.map((c) => {
              const a = activityById(c.activityId)
              return (
                <div key={c.id} className="overflow-hidden rounded-2xl bg-white shadow-card">
                  {c.photo && (
                    <img src={c.photo} alt="打卡照片" className="h-44 w-full object-cover" />
                  )}
                  <div className="p-3.5">
                    <div className="flex items-center justify-between">
                      <Link to={`/activity/${c.activityId}`} className="text-[15px] font-semibold text-stone-800">
                        {a ? `${a.emoji} ${a.title}` : '已下架活动'}
                      </Link>
                      <span className="text-xs text-amber-500">{'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}</span>
                    </div>
                    {c.note && <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500">{c.note}</p>}
                    <p className="mt-2 text-[11px] text-stone-300">
                      {c.author} · {timeAgo(c.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
            {checkins.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center text-sm text-stone-400 shadow-card">
                还没有打卡记录，去创造第一个周末回忆吧 📸
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => navigate('/guide/new')}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white"
          >
            <Plus size={15} /> 发布攻略
          </button>
          <div className="space-y-3">
            {guides.map((g: Guide) => (
              <div key={g.id} className="rounded-2xl bg-white p-4 shadow-card">
                <h3 className="text-[15px] font-semibold leading-snug text-stone-800">{g.title}</h3>
                <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-[13px] leading-relaxed text-stone-500">
                  {g.content}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {g.tags.map((t) => (
                    <span key={t} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-600">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-stone-100 pt-2.5">
                  <span className="text-[11px] text-stone-300">
                    {g.author} · {timeAgo(g.createdAt)}
                  </span>
                  <button
                    onClick={() => likeGuide(g.id)}
                    className={`flex items-center gap-1 text-xs ${g.likedByMe ? 'text-red-500' : 'text-stone-400'}`}
                  >
                    ♥ {g.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showPoster && <PosterModal onClose={() => setShowPoster(false)} />}

      <p className="pt-1 text-center text-[11px] text-stone-300">共 {checkins.length} 次打卡 · {guides.length} 篇攻略</p>
    </div>
  )
}
