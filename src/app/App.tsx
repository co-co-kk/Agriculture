// 该文件用于组合全局 Provider 和页面入口。
import { QueryProvider } from '@/app/providers/QueryProvider'
import { DashboardPage } from '@/pages/DashboardPage'

// 导出应用主组件，统一包裹数据请求上下文。
export const App = (): JSX.Element => {
  return (
    <QueryProvider>
      <DashboardPage />
    </QueryProvider>
  )
}
