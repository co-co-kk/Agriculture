// 该文件用于封装 React Query 的全局配置与 Provider。
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

// 创建查询客户端，统一控制缓存和重试策略。
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// 导出全局查询 Provider，供应用内组件读取异步数据。
export const QueryProvider = ({ children }: PropsWithChildren): JSX.Element => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
