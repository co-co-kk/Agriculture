// 该文件定义任务接口，返回场景对应的无人机任务列表。
import { HttpResponse, delay, http } from 'msw'
import { queryMissions } from '@/mocks/data/querySelectors'
import type { SceneType } from '@/types/domain'

// 解析场景参数并提供默认值。
const parseScene = (value: string | null): SceneType => {
  return value === 'pest' ? 'pest' : 'disease'
}

// 导出任务接口 handler，供时间轴与任务选择器复用。
export const missionHandlers = [
  http.get('/api/missions', async ({ request }) => {
    const url = new URL(request.url)
    const scene = parseScene(url.searchParams.get('scene'))

    await delay(180)

    return HttpResponse.json({
      scene,
      missions: queryMissions(scene),
    })
  }),
]
