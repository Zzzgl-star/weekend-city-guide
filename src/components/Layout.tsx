import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, Compass, Users, Camera, User } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'

const TABS = [
  { to: '/', label: '首页', icon: Home },
  { to: '/explore', label: '探索', icon: Compass },
  { to: '/teams', label: '组队', icon: Users },
  { to: '/checkin', label: '打卡', icon: Camera },
  { to: '/profile', label: '我的', icon: User },
]

export default function Layout() {
  const location = useLocation()
  const nickname = useStore((s) => s.profile.nickname)
  const [greeting] = useState(() => {
    const h = new Date().getHours()
    if (h < 6) return '夜深了'
    if (h < 12) return '早上好'
    if (h < 18) return '下午好'
    return '晚上好'
  })

  // 隐藏 header 的页面（表单类）
  const hideHeader = ['/checkin/new', '/guide/new'].includes(location.pathname)

  return (
    <div className="page-shell relative">
      {!hideHeader && (
        <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 pb-4 pt-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">{greeting}，{nickname}</p>
              <h1 className="mt-0.5 text-xl font-bold tracking-wide">周末城市探索指南</h1>
            </div>
            <div className="text-3xl">🗺️</div>
          </div>
        </header>
      )}

      <main>
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="grid grid-cols-5">
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={({ }) =>
                  `flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors ${
                    active ? 'text-emerald-600' : 'text-stone-400'
                  }`
                }
              >
                <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
                <span className={active ? 'font-semibold' : ''}>{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
