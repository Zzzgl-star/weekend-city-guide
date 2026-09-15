import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ACTIVITIES } from '../data/activities'
import { useStore } from '../store/useStore'

export default function GuideNew() {
  const navigate = useNavigate()
  const addGuide = useStore((s) => s.addGuide)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [activityId, setActivityId] = useState('')

  const submit = () => {
    if (!title.trim() || !content.trim()) {
      alert('标题和内容都要填哦')
      return
    }
    addGuide({
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean).slice(0, 4),
      activityId: activityId || undefined,
    })
    navigate('/checkin')
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-base font-bold">发布攻略</h1>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-4 shadow-card">
        <div>
          <label className="text-xs text-stone-500">标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={30}
            placeholder="如：昆明雨天周末完美动线"
            className="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none placeholder:text-stone-300 focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        <div>
          <label className="text-xs text-stone-500">正文（支持换行）</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="把你的周末路线、花费、避坑经验分享给大家…"
            className="mt-1.5 w-full resize-none rounded-xl bg-stone-100 px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-stone-300 focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        <div>
          <label className="text-xs text-stone-500">标签（用空格或逗号分隔，最多 4 个）</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="如：雨天方案 室内 人均120"
            className="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none placeholder:text-stone-300"
          />
        </div>
        <div>
          <label className="text-xs text-stone-500">关联活动（可选）</label>
          <select
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            className="mt-1.5 w-full rounded-xl bg-stone-100 px-3 py-2.5 text-sm outline-none"
          >
            <option value="">不关联</option>
            {ACTIVITIES.map((a) => (
              <option key={a.id} value={a.id}>{a.emoji} {a.title}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={submit} className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white">
        发布攻略
      </button>
    </div>
  )
}
