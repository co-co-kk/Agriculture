// 该文件定义告警接口，返回右侧告警流数据。
import { HttpResponse, delay, http } from 'msw'
import { queryAlerts } from '@/mocks/data/querySelectors'
import type { SceneType } from '@/types/domain'

// 解析场景参数并提供默认值。
const parseScene = (value: string | null): SceneType => {
  return value === 'pest' ? 'pest' : 'disease'
}

// 导出告警接口 handler，支持场景切换联动。
export const alertHandlers = [
  http.get('/api/alerts', async ({ request }) => {
    const url = new URL(request.url)
    const scene = parseScene(url.searchParams.get('scene'))

    await delay(140)

    return HttpResponse.json({
      scene,
      alerts: queryAlerts(scene),
    })
  }),
]
