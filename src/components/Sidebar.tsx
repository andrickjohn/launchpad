'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Send, LayoutDashboard, LogOut, Settings, Rocket } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Prospects', href: '/prospects', icon: Users },
  { name: 'Outreach', href: '/outreach', icon: Send },
]

const secondaryNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shadow-2xl">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            LaunchPad
          </h1>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg scale-105'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Secondary Navigation & User Section */}
      <div className="border-t border-slate-800">
        <div className="space-y-1 px-3 py-4">
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all hover:translate-x-1 group"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
