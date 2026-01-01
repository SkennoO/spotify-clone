'use client'

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { HiHome } from 'react-icons/hi'
import { BiSearch } from 'react-icons/bi'
import Box from './Box'
import SidebarItem from './SidebarItem'
import Library from './Library'
import { Song } from '@/types'
import usePlayer from '@/hooks/usePlayer'
import { twMerge } from 'tailwind-merge'
import Link from 'next/link'

interface Props {
  children: React.ReactNode
  songs: Song[]
}

const Sidebar: React.FC<Props> = ({ children, songs }) => {
  const player = usePlayer()
  const pathname = usePathname()

  const routes = useMemo(() => [
    {
      icon: HiHome,
      label: 'Home',
      active: pathname !== '/search',
      href: '/'
    },
    {
      icon: BiSearch,
      label: 'Search',
      active: pathname === '/search',
      href: '/search'
    }
  ], [pathname])

  return (
    <div className={twMerge(`flex h-full`, player.activeId && 'h-[calc(100%-80px)]')}>
      
      {/* SIDEBAR */}
      <div className="hidden md:flex flex-col gap-y-2 bg-black h-full w-[300px] p-2">

        {/* MENU BOX */}
        <Box>
          <div className="flex flex-col gap-y-4 px-5 py-4">

            {/* BRAND TEXT */}
<Link
  href="/"
  className="flex items-start text-white hover:opacity-80 transition"
>
  <span className="text-2xl font-bold tracking-tight">
    MUSICFY
  </span>
  <span className="ml-0.5 text-[10px] font-normal opacity-70 leading-none">
    RO
  </span>
</Link>


            {/* ROUTES */}
            {routes.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}

          </div>
        </Box>

        {/* LIBRARY */}
        <Box className="overflow-y-auto h-full">
          <Library songs={songs} />
        </Box>

      </div>

      {/* MAIN */}
      <main className="h-full flex-1 overflow-y-auto py-2">
        {children}
      </main>

    </div>
  )
}

export default Sidebar
