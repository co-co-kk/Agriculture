// 该文件定义报告接口，返回当前场景的分析报告数据。
import { HttpResponse, delay, http } from 'msw'
import { queryReport } from '@/mocks/data/querySelectors'
import type { SceneType } from '@/types/domain'

const parseScene = (value: string | null): SceneType => {
  if (value === 'pest' || value === 'nutrient' || value === 'weed') {
    return value
  }
  return 'disease'
}

export const reportHandlers = [
  http.get('/api/reports', async ({ request }) => {
    const url = new URL(request.url)
    const scene = parseScene(url.searchParams.get('scene'))
    const snapshotId = url.searchParams.get('snapshotId')

    await delay(120)

    return HttpResponse.json({
      scene,
      report: queryReport(scene, snapshotId),
    })
  }),
]
