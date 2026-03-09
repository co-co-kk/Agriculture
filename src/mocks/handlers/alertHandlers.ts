// 该文件定义告警接口，返回右侧告警流数据。
import { HttpResponse, delay, http } from 'msw'
import { queryAlerts } from '@/mocks/data/querySelectors'
import type { SceneType } from '@/types/domain'

const parseScene = (value: string | null): SceneType => {
  if (value === 'pest' || value === 'nutrient' || value === 'weed') {
    return value
  }
  return 'disease'
}

export const alertHandlers = [
  http.get('/api/alerts', async ({ request }) => {
    const url = new URL(request.url)
    const scene = parseScene(url.searchParams.get('scene'))
    const snapshotId = url.searchParams.get('snapshotId')

    await delay(140)

    return HttpResponse.json({
      scene,
      alerts: queryAlerts(scene, snapshotId),
    })
  }),
]
