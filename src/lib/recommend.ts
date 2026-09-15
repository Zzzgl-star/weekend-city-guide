import type { Activity, ScoredActivity, UserProfile, WeatherDay, Slot } from '../types'

const WEIGHTS = { interest: 35, weather: 25, budget: 20, distance: 10, hot: 10 }

export const slotWeather = (slot: Slot, sat: WeatherDay, sun: WeatherDay): WeatherDay =>
  slot.startsWith('sat') ? sat : sun

export function recommend(
  profile: UserProfile,
  activities: Activity[],
  sat: WeatherDay,
  sun: WeatherDay,
  teamCount: (activityId: string) => number,
  opts: { hardFilter?: boolean } = {},
): ScoredActivity[] {
  const hard = opts.hardFilter ?? true
  const pool = hard
    ? activities.filter((a) => {
        if (a.price > profile.budget) return false // 预算硬过滤
        if (a.distanceKm > profile.radiusKm * 1.5) return false // 距离过远
        return true
      })
    : activities

  const scored: ScoredActivity[] = pool.map((a) => {
    // 兴趣匹配 35%
    const interest = profile.interests.includes(a.type) ? 1 : 0.3

    // 天气适宜 25%：取各时段中天气适配度最高者
    let weatherFit: number
    if (a.indoor) {
      const raining = [sat, sun].some((d) => !d.isGoodForOutdoor)
      weatherFit = raining ? 1 : 0.6 // 室内活动雨天更凸显价值
    } else {
      const fits = [sat, sun].map((d) => (d.isGoodForOutdoor ? 1 : 0.15))
      weatherFit = Math.max(...fits)
    }

    // 预算匹配 20%：花费越少略优
    const budgetFit = 1 - (a.price / Math.max(profile.budget, 1)) * 0.5

    // 距离 10%
    const distanceFit = 1 - Math.min(a.distanceKm / Math.max(profile.radiusKm, 1), 1)

    // 热度 10%
    const hotFit = a.popularity / 100

    const score = Math.round(
      WEIGHTS.interest * interest +
        WEIGHTS.weather * weatherFit +
        WEIGHTS.budget * budgetFit +
        WEIGHTS.distance * distanceFit +
        WEIGHTS.hot * hotFit,
    )

    // 推荐理由
    const bestSlot = a.slots.find((s) => {
      const w = slotWeather(s, sat, sun)
      return a.indoor ? !w.isGoodForOutdoor : w.isGoodForOutdoor
    }) ?? a.slots[0]
    const w = slotWeather(bestSlot, sat, sun)
    const parts: string[] = []
    parts.push(
      a.indoor
        ? `${w.label}${w.text !== '多云' ? w.text : ''}${!w.isGoodForOutdoor ? '适合室内' : ''}`.trim()
        : `${w.label}${w.text}，户外正好`,
    )
    if (profile.interests.includes(a.type)) parts.push(`匹配你的「${a.type}」偏好`)
    parts.push(a.price === 0 ? '免费' : `人均 ${a.price} 元`)
    parts.push(`距市中心 ${a.distanceKm}km`)
    const tc = teamCount(a.id)
    if (tc > 0) parts.push(`已有 ${tc} 人组队`)
    else if (a.maxTeam >= profile.groupSize) parts.push(`可组 ${a.maxTeam} 人小队`)

    return { activity: a, score, interest, weatherFit, budgetFit, distanceFit, hotFit, reason: parts.join(' · ') }
  })

  return scored.sort((x, y) => y.score - x.score)
}

// 按时段生成周末行程：每个时段选一个分数最高且未被占用的活动
export function buildWeekendPlan(
  scored: ScoredActivity[],
): { slot: Slot; item: ScoredActivity }[] {
  const order: Slot[] = ['sat_am', 'sat_pm', 'sat_eve', 'sun_am', 'sun_pm', 'sun_eve']
  const plan: { slot: Slot; item: ScoredActivity }[] = []
  const used = new Set<string>()
  for (const slot of order) {
    const item = scored.find(
      (s) => s.activity.slots.includes(slot) && !used.has(s.activity.id),
    )
    if (item) {
      used.add(item.activity.id)
      plan.push({ slot, item })
    }
  }
  return plan
}
