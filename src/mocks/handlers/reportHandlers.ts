// 该文件定义报告接口，返回当前场景的分析报告数据。
import { HttpResponse, delay, http } from 'msw'
import { queryReport } from '@/mocks/data/querySelectors'
import type { SceneType } from '@/types/domain'

// 解析场景参数并提供默认值。
const parseScene = (value: string | null): SceneType => {
  return value === 'pest' ? 'pest' : 'disease'
}

// 导出报告接口 handler，供报告抽屉和导出动作复用。
export const reportHandlers = [
  http.get('/api/reports', async ({ request }) => {
    const url = new URL(request.url)
    const scene = parseScene(url.searchParams.get('scene'))

    await delay(120)

    return HttpResponse.json({
      scene,
      report: queryReport(scene),
    })
  }),
]
