import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ActivityType, Checkin, Guide, Team, UserProfile } from '../types'
import { SEED_CHECKINS, SEED_GUIDES, SEED_TEAMS } from '../data/seed'

export const DEFAULT_PROFILE: UserProfile = {
  nickname: '探索者小昆',
  avatar: '🦜',
  city: '昆明',
  interests: ['展览', '徒步', '咖啡'],
  budget: 100,
  groupSize: 2,
  radiusKm: 15,
}

export const AVATARS = ['🦜', '🐼', '🦊', '🐧', '🐨', '🐯', '🐰', '🐳']

interface StoreState {
  profile: UserProfile
  teams: Team[]
  checkins: Checkin[]
  guides: Guide[]
  favorites: string[] // activityId[]
  updateProfile: (p: Partial<UserProfile>) => void
  toggleInterest: (t: ActivityType) => void
  createTeam: (t: Omit<Team, 'id' | 'creator' | 'members' | 'createdAt'>) => string
  joinTeam: (id: string) => boolean
  leaveTeam: (id: string) => void
  addCheckin: (c: Omit<Checkin, 'id' | 'author' | 'createdAt'>) => void
  addGuide: (g: Omit<Guide, 'id' | 'author' | 'likes' | 'likedByMe' | 'createdAt'>) => void
  likeGuide: (id: string) => void
  toggleFavorite: (activityId: string) => void
  resetDemo: () => void
}

const genId = () => Math.random().toString(36).slice(2, 9)

// localStorage 写入失败（如照片过大）时静默降级，不影响内存态
const safeStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      console.warn('本地存储空间不足，数据仅保留在当前页面')
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* noop */
    }
  },
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      teams: SEED_TEAMS,
      checkins: SEED_CHECKINS,
      guides: SEED_GUIDES,
      favorites: ['a04'],

      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      toggleInterest: (t) =>
        set((s) => {
          const has = s.profile.interests.includes(t)
          return {
            profile: {
              ...s.profile,
              interests: has
                ? s.profile.interests.filter((i) => i !== t)
                : [...s.profile.interests, t],
            },
          }
        }),

      createTeam: (t) => {
        const id = genId()
        const me = get().profile.nickname
        const team: Team = { ...t, id, creator: me, members: [me], createdAt: Date.now() }
        set((s) => ({ teams: [team, ...s.teams] }))
        return id
      },

      joinTeam: (id) => {
        const me = get().profile.nickname
        const team = get().teams.find((t) => t.id === id)
        if (!team) return false
        if (team.members.includes(me)) return true
        if (team.members.length >= team.maxMembers) return false
        set((s) => ({
          teams: s.teams.map((t) =>
            t.id === id ? { ...t, members: [...t.members, me] } : t,
          ),
        }))
        return true
      },

      leaveTeam: (id) => {
        const me = get().profile.nickname
        set((s) => ({
          teams: s.teams
            .map((t) => (t.id === id ? { ...t, members: t.members.filter((m) => m !== me) } : t))
            .filter((t) => !(t.id === id && t.members.length === 0)),
        }))
      },

      addCheckin: (c) =>
        set((s) => ({
          checkins: [
            { ...c, id: genId(), author: s.profile.nickname, createdAt: Date.now() },
            ...s.checkins,
          ],
        })),

      addGuide: (g) =>
        set((s) => ({
          guides: [
            {
              ...g, id: genId(), author: s.profile.nickname,
              likes: 0, likedByMe: false, createdAt: Date.now(),
            },
            ...s.guides,
          ],
        })),

      likeGuide: (id) =>
        set((s) => ({
          guides: s.guides.map((g) =>
            g.id === id
              ? { ...g, likedByMe: !g.likedByMe, likes: g.likes + (g.likedByMe ? -1 : 1) }
              : g,
          ),
        })),

      toggleFavorite: (activityId) =>
        set((s) => ({
          favorites: s.favorites.includes(activityId)
            ? s.favorites.filter((f) => f !== activityId)
            : [...s.favorites, activityId],
        })),

      resetDemo: () =>
        set({
          profile: DEFAULT_PROFILE,
          teams: SEED_TEAMS,
          checkins: SEED_CHECKINS,
          guides: SEED_GUIDES,
          favorites: ['a04'],
        }),
    }),
    {
      name: 'wcg-store-v1',
      storage: createJSONStorage(() => safeStorage),
      version: 1,
    },
  ),
)
