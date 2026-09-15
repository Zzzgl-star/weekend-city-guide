// 核心类型定义
export type ActivityType =
  | '展览'
  | '市集'
  | '演出'
  | '徒步'
  | '运动'
  | '桌游'
  | '咖啡'
  | '手作'

export type Slot = 'sat_am' | 'sat_pm' | 'sat_eve' | 'sun_am' | 'sun_pm' | 'sun_eve'

export interface Activity {
  id: string
  title: string
  type: ActivityType
  emoji: string
  venue: string
  address: string
  slots: Slot[]
  price: number // 人均，0 为免费
  indoor: boolean
  distanceKm: number // 距市中心（翠湖）
  popularity: number // 0-100 热度
  tags: string[]
  description: string
  transport: string
  tips: string
  cover: string // 渐变色 tailwind class
  maxTeam: number // 建议组队人数上限
}

export interface UserProfile {
  nickname: string
  avatar: string
  city: string
  interests: ActivityType[]
  budget: number // 人均预算上限
  groupSize: number // 同行人数
  radiusKm: number // 出行半径
}

export interface Team {
  id: string
  activityId: string
  meetSlot: Slot
  meetPoint: string
  note: string
  maxMembers: number
  creator: string
  members: string[]
  contact: string // 发起人联系方式，仅队员可见
  createdAt: number
}

export interface Checkin {
  id: string
  activityId: string
  rating: number // 1-5
  note: string
  photo?: string // dataURL
  author: string
  createdAt: number
}

export interface Guide {
  id: string
  title: string
  content: string
  tags: string[]
  activityId?: string
  author: string
  likes: number
  likedByMe: boolean
  createdAt: number
}

export interface WeatherDay {
  date: string // YYYY-MM-DD
  label: string // 周六 / 周日
  code: number // open-meteo weathercode
  text: string
  emoji: string
  tempMax: number
  tempMin: number
  precipProb: number
  isGoodForOutdoor: boolean
  mock: boolean
}

export interface ScoredActivity {
  activity: Activity
  score: number // 0-100
  interest: number
  weatherFit: number
  budgetFit: number
  distanceFit: number
  hotFit: number
  reason: string
}
