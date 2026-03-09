// 该文件定义看板数据接口，支持按场景和快照版本查询。
import { HttpResponse, delay, http } from 'msw'
import { queryDashboard } from '@/mocks/data/querySelectors'
import type { SceneType, SeverityLevel } from '@/types/domain'

// 场景兜底函数，避免非法参数导致接口异常。
const parseScene = (value: string | null): SceneType => {
  if (value === 'pest' || value === 'nutrient' || value === 'weed') {
    return value
  }
  return 'disease'
}

export const dashboardHandlers = [
  http.get('/api/dashboard', async ({ request }) => {
    const url = new URL(request.url)
    const scene = parseScene(url.searchParams.get('scene'))
    const snapshotId = url.searchParams.get('snapshotId')
    const severity = (url.searchParams.get('severity') ?? undefined) as SeverityLevel | undefined
    const agentType = url.searchParams.get('agentType') ?? undefined
    const pestType = url.searchParams.get('pestType') ?? undefined
    const deficiencyType = url.searchParams.get('deficiencyType') ?? undefined
    const weedType = url.searchParams.get('weedType') ?? undefined

    await delay(220)

    return HttpResponse.json(
      queryDashboard({
        scene,
        snapshotId,
        severity,
        agentType,
        pestType,
        deficiencyType,
        weedType,
      }),
    )
  }),
]
