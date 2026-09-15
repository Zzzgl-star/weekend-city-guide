import { useCallback, useEffect, useState } from 'react'
import type { WeatherDay } from '../types'

const LAT = 25.0389 // 昆明
const LNG = 102.7183

function codeToText(code: number): { text: string; emoji: string } {
  if (code === 0) return { text: '晴', emoji: '☀️' }
  if (code === 1 || code === 2) return { text: '多云', emoji: '⛅' }
  if (code === 3) return { text: '阴', emoji: '☁️' }
  if (code === 45 || code === 48) return { text: '雾', emoji: '🌫️' }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { text: '雨', emoji: '🌧️' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { text: '雪', emoji: '❄️' }
  if (code >= 95) return { text: '雷阵雨', emoji: '⛈️' }
  return { text: '多云', emoji: '⛅' }
}

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// 计算最近一个即将到来的周六/周日
export function getWeekendDates(): { sat: Date; sun: Date } {
  const now = new Date()
  const dow = now.getDay() // 0=周日
  const daysUntilSat = (6 - dow + 7) % 7
  const sat = new Date(now)
  sat.setDate(now.getDate() + daysUntilSat)
  const sun = new Date(sat)
  sun.setDate(sat.getDate() + 1)
  return { sat, sun }
}

const WEEK_LABEL = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 降级用的模拟天气（昆明 9 月典型天气）
function mockWeather(): { sat: WeatherDay; sun: WeatherDay } {
  const { sat, sun } = getWeekendDates()
  return {
    sat: {
      date: fmt(sat), label: '周六', code: 2, text: '多云', emoji: '⛅',
      tempMax: 24, tempMin: 16, precipProb: 20, isGoodForOutdoor: true, mock: true,
    },
    sun: {
      date: fmt(sun), label: '周日', code: 61, text: '小雨', emoji: '🌧️',
      tempMax: 21, tempMin: 15, precipProb: 65, isGoodForOutdoor: false, mock: true,
    },
  }
}

interface WeatherState {
  sat: WeatherDay
  sun: WeatherDay
  loading: boolean
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>(() => ({
    ...mockWeather(),
    loading: true,
  }))

  const load = useCallback(async () => {
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&timezone=Asia%2FShanghai&forecast_days=14`
      const res = await fetch(url)
      if (!res.ok) throw new Error('weather api error')
      const data = await res.json()
      const { sat, sun } = getWeekendDates()
      const satStr = fmt(sat)
      const sunStr = fmt(sun)
      const dates: string[] = data.daily.time
      const si = dates.indexOf(satStr)
      const ui = dates.indexOf(sunStr)
      if (si === -1 || ui === -1) throw new Error('weekend not in range')
      const build = (i: number, label: string): WeatherDay => {
        const code = data.daily.weather_code[i]
        const { text, emoji } = codeToText(code)
        const precip = data.daily.precipitation_probability_max[i] ?? 0
        return {
          date: dates[i], label, code, text, emoji,
          tempMax: Math.round(data.daily.temperature_2m_max[i]),
          tempMin: Math.round(data.daily.temperature_2m_min[i]),
          precipProb: precip,
          isGoodForOutdoor: code <= 3 && precip < 40,
          mock: false,
        }
      }
      setState({ sat: build(si, '周六'), sun: build(ui, '周日'), loading: false })
    } catch {
      // 请求失败降级为模拟天气，保证页面可用
      setState({ ...mockWeather(), loading: false })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, retry: load }
}

export function weatherBySlot(sat: WeatherDay, sun: WeatherDay) {
  return {
    sat_am: sat, sat_pm: sat, sat_eve: sat,
    sun_am: sun, sun_pm: sun, sun_eve: sun,
  } as const
}
