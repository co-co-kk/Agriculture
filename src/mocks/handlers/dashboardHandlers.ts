// 该文件定义看板数据接口，模拟真实后端查询行为。
import { HttpResponse, delay, http } from 'msw'
import { queryDashboard } from '@/mocks/data/querySelectors'
import type { SceneType, SeverityLevel } from '@/types/domain'

// 场景兜底函数，避免非法参数导致接口异常。
const parseScene = (value: string | null): SceneType => {
  return value === 'pest' ? 'pest' : 'disease'
}

// 导出看板接口 handler，支持病害与虫害筛选。
export const dashboardHandlers = [
  http.get('/api/dashboard', async ({ request }) => {
    const url = new URL(request.url)
    const scene = parseScene(url.searchParams.get('scene'))
    const severity = (url.searchParams.get('severity') ?? undefined) as SeverityLevel | undefined
    const agentType = url.searchParams.get('agentType') ?? undefined
    const pestType = url.searchParams.get('pestType') ?? undefined

    await delay(220)

    return HttpResponse.json(
      queryDashboard({
        scene,
        severity,
        agentType,
        pestType,
      }),
    )
  }),
]
