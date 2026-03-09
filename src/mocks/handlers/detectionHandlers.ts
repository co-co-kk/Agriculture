// 该文件定义帧识别接口，返回当前任务帧的检测详情。
import { HttpResponse, delay, http } from 'msw'
import { queryDetectionsByFrame } from '@/mocks/data/querySelectors'
import type { SceneType, SeverityLevel } from '@/types/domain'

const parseScene = (value: string | null): SceneType => {
  if (value === 'pest' || value === 'nutrient' || value === 'weed') {
    return value
  }
  return 'disease'
}

export const detectionHandlers = [
  http.get('/api/detections', async ({ request }) => {
    const url = new URL(request.url)
    const scene = parseScene(url.searchParams.get('scene'))
    const snapshotId = url.searchParams.get('snapshotId')
    const missionId = url.searchParams.get('missionId') ?? ''
    const frameIndex = Number(url.searchParams.get('frameIndex') ?? '0')
    const severity = (url.searchParams.get('severity') ?? undefined) as SeverityLevel | undefined
    const agentType = url.searchParams.get('agentType') ?? undefined
    const pestType = url.searchParams.get('pestType') ?? undefined
    const deficiencyType = url.searchParams.get('deficiencyType') ?? undefined
    const weedType = url.searchParams.get('weedType') ?? undefined

    if (!missionId) {
      return HttpResponse.json(
        {
          scene,
          frame: null,
          diseaseDetections: [],
          pestDetections: [],
          nutrientDetections: [],
          weedDetections: [],
        },
        { status: 400 },
      )
    }

    await delay(160)

    const result = queryDetectionsByFrame({
      scene,
      snapshotId,
      missionId,
      frameIndex,
      severity,
      agentType,
      pestType,
      deficiencyType,
      weedType,
    })

    return HttpResponse.json({
      scene,
      ...result,
    })
  }),
]
