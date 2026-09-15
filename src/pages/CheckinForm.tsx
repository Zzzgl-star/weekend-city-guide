import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Star, Upload, X } from 'lucide-react'
import { ACTIVITIES } from '../data/activities'
import { useStore } from '../store/useStore'

// 照片压缩：最长边 1000px，JPEG 0.7，避免 localStorage 超限
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 1000
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function CheckinForm() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const addCheckin = useStore((s) => s.addCheckin)

  const [activityId, setActivityId] = useState(params.get('activityId') ?? ACTIVITIES[0].id)
  const [rating, setRating] = useState(5)
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (params.get('activityId')) setActivityId(params.get('activityId')!)
  }, [params])

  const pick = async (f: File | undefined) => {
    if (!f) return
    try {
      setPhoto(await compressImage(f))
    } catch {
      alert('图片读取失败，换一张试试')
    }
  }

  const submit = () => {
    setSaving(true)
    try {
      addCheckin({ activityId, rating, note: note.trim(), photo })
      navigate('/checkin')
    } catch {
      alert('保存失败，可能照片过大')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-base font-bold">打卡记录</h1>
      </div>

      {/* 照片 */}
      <div className="rounded-2xl bg-white p-4 shadow-card">
        <label className="text-xs text-stone-500">活动照片（可选）</label>
        {photo ? (
          <div className="relative mt-2">
            <img src={photo} alt="preview" className="h-44 w-full rounded-xl object-cover" />
            <button
              onClick={() => setPhoto(undefined)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-2 flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-stone-200 text-stone-400"
          >
            <Upload size={22} />
            <span className="text-xs">点击上传照片</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>

      {/* 活动 + 评分 + 短评 */}
      <div className="space-y-4 rounded-2xl bg-white p-4 shadow-card">
        <div>
          <label className="text-xs text-stone-500">打卡的活动</label>
          <select
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            className="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none"
          >
            {ACTIVITIES.map((a) => (
              <option key={a.id} value={a.id}>{a.emoji} {a.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-stone-500">评分</label>
          <div className="mt-1.5 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                <Star
                  size={28}
                  className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-stone-500">短评</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="这次体验怎么样？有什么想提醒队友的？"
            className="mt-1.5 w-full resize-none rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none placeholder:text-stone-300 focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      </div>

      <button
        onClick={submit}
        disabled={saving}
        className="w-full rounded-xl bg-amber-400 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? '保存中…' : '保存打卡'}
      </button>
    </div>
  )
}
