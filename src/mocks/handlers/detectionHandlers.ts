// 该文件定义帧识别接口，返回当前任务帧的检测详情。
import { HttpResponse, delay, http } from 'msw'
import { queryDetectionsByFrame } from '@/mocks/data/querySelectors'
import type { SceneType, SeverityLevel } from '@/types/domain'

// 解析场景参数并提供默认值。
const parseScene = (value: string | null): SceneType => {
  return value === 'pest' ? 'pest' : 'disease'
}

// 导出识别接口 handler，支持按场景和筛选条件查询。
export const detectionHandlers = [
  http.get('/api/detections', async ({ request }) => {
    const url = new URL(request.url)
    const scene = parseScene(url.searchParams.get('scene'))
    const missionId = url.searchParams.get('missionId') ?? ''
    const frameIndex = Number(url.searchParams.get('frameIndex') ?? '0')
    const severity = (url.searchParams.get('severity') ?? undefined) as SeverityLevel | undefined
    const agentType = url.searchParams.get('agentType') ?? undefined
    const pestType = url.searchParams.get('pestType') ?? undefined

    if (!missionId) {
      return HttpResponse.json(
        {
          scene,
          frame: null,
          diseaseDetections: [],
          pestDetections: [],
        },
        { status: 400 },
      )
    }

    await delay(160)

    const result = queryDetectionsByFrame({
      scene,
      missionId,
      frameIndex,
      severity,
      agentType,
      pestType,
    })

    return HttpResponse.json({
      scene,
      ...result,
    })
  }),
]
