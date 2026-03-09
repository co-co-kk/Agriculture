// 该文件组合全局 Provider 与轻量路由，统一管理页面入口。
import { useEffect, useState } from 'react'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { navigateTo, normalizePath, type AppPath } from '@/app/router'
import { DashboardPage } from '@/pages/DashboardPage'
import { DataCenterPage } from '@/pages/DataCenterPage'

export const App = (): JSX.Element => {
  const [path, setPath] = useState<AppPath>(() => normalizePath(window.location.pathname))

  useEffect(() => {
    const onPopState = () => {
      setPath(normalizePath(window.location.pathname))
    }
    window.addEventListener('popstate', onPopState)
    if (window.location.pathname === '/' || window.location.pathname === '') {
      navigateTo('/dashboard')
    } else if (window.location.pathname !== '/dashboard' && window.location.pathname !== '/data-center') {
      navigateTo('/dashboard')
    }
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  return (
    <QueryProvider>
      {path === '/data-center' ? (
        <DataCenterPage onOpenDashboard={() => navigateTo('/dashboard')} />
      ) : (
        <DashboardPage onOpenDataCenter={() => navigateTo('/data-center')} />
      )}
    </QueryProvider>
  )
}
