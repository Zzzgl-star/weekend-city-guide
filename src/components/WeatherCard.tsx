import type { WeatherDay } from '../types'

function DayCard({ d }: { d: WeatherDay }) {
  const bg = d.isGoodForOutdoor ? 'bg-white/15' : 'bg-white/10'
  return (
    <div className={`flex-1 rounded-xl ${bg} p-3 text-white`}>
      <p className="text-xs opacity-80">{d.label}</p>
      <div className="mt-1 text-3xl">{d.emoji}</div>
      <p className="mt-1 text-sm font-semibold">{d.text}</p>
      <p className="text-[11px] opacity-80">
        {d.tempMin}° / {d.tempMax}°C
      </p>
      <p className="text-[11px] opacity-80">降水 {d.precipProb}%</p>
    </div>
  )
}

export default function WeatherCard({ sat, sun, loading }: { sat: WeatherDay; sun: WeatherDay; loading: boolean }) {
  const advice = sat.isGoodForOutdoor && sun.isGoodForOutdoor
    ? '两天都适合户外，安排一场徒步吧！'
    : !sat.isGoodForOutdoor && !sun.isGoodForOutdoor
      ? '周末有雨，室内展览和桌游更合适哦'
      : '一晴一雨，户外+室内各安排一天'
  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-500 p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">本周末天气 · {sat.date === sun.date ? '' : '昆明'}</h2>
        <span className="text-[10px] text-white/70">
          {loading ? '同步中…' : sat.mock || sun.mock ? '模拟数据（API 不可用）' : 'Open-Meteo 实时预报'}
        </span>
      </div>
      <div className="flex gap-2">
        <DayCard d={sat} />
        <DayCard d={sun} />
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-white/90">🌤️ {advice}</p>
    </div>
  )
}
