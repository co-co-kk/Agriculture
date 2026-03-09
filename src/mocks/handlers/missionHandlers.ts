// 该文件定义任务接口，返回场景对应的无人机任务列表。
import { HttpResponse, delay, http } from 'msw'
import { queryMissions } from '@/mocks/data/querySelectors'
import type { SceneType } from '@/types/domain'

const parseScene = (value: string | null): SceneType => {
  if (value === 'pest' || value === 'nutrient' || value === 'weed') {
    return value
  }
  return 'disease'
}

export const missionHandlers = [
  http.get('/api/missions', async ({ request }) => {
    const url = new URL(request.url)
    const scene = parseScene(url.searchParams.get('scene'))
    const snapshotId = url.searchParams.get('snapshotId')

    await delay(180)

    return HttpResponse.json({
      scene,
      missions: queryMissions(scene, snapshotId),
    })
  }),
]
