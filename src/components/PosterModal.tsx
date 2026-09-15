import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { X, Download } from 'lucide-react'
import { useStore } from '../store/useStore'
import { activityById } from '../data/activities'

export default function PosterModal({ onClose }: { onClose: () => void }) {
  const checkins = useStore((s) => s.checkins)
  const profile = useStore((s) => s.profile)
  const posterRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const mine = checkins.slice(0, 6)
  const spots = mine.length

  const download = async () => {
    if (!posterRef.current) return
    setBusy(true)
    try {
      const canvas = await html2canvas(posterRef.current, { scale: 2, backgroundColor: '#0d9488' })
      const link = document.createElement('a')
      link.download = `周末足迹_${profile.nickname}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex w-full max-w-xs flex-col items-center">
        <div
          ref={posterRef}
          className="w-full overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-500 to-lime-500 p-6 text-white shadow-2xl"
        >
          <p className="text-center text-[10px] tracking-[0.3em] opacity-80">WEEKEND CITY GUIDE</p>
          <h2 className="mt-1 text-center text-2xl font-bold">周末足迹</h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-3xl">{profile.avatar}</span>
            <span className="text-lg font-semibold">{profile.nickname}</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/15 p-3 text-center backdrop-blur">
            <div>
              <p className="text-xl font-bold">{spots}</p>
              <p className="text-[10px] opacity-80">打卡地点</p>
            </div>
            <div>
              <p className="text-xl font-bold">{spots * 10 + 25}</p>
              <p className="text-[10px] opacity-80">探索积分</p>
            </div>
            <div>
              <p className="text-xl font-bold">{profile.city}</p>
              <p className="text-[10px] opacity-80">城市</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {mine.length === 0 && <p className="text-center text-xs opacity-80">快去打卡你的第一个周末地点吧</p>}
            {mine.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-xs">{activityById(c.activityId)?.title}</span>
                <span className="text-[10px] text-amber-200">{'★'.repeat(c.rating)}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[10px] opacity-75">🗺️ 周末城市探索指南 · 每个周末都值得一场小冒险</p>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={download}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-emerald-600 disabled:opacity-60"
          >
            <Download size={15} /> {busy ? '生成中…' : '保存海报'}
          </button>
          <button onClick={onClose} className="flex items-center gap-1.5 rounded-full bg-white/20 px-5 py-2.5 text-sm text-white">
            <X size={15} /> 关闭
          </button>
        </div>
      </div>
    </div>
  )
}
