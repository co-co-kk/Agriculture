// 该文件定义数据中心接口，覆盖采集、解析、快照与对比流程。
import { HttpResponse, delay, http } from 'msw'
import {
  analyzeJob,
  createJob,
  queryCompare,
  queryIngestionJobs,
  querySnapshots,
  querySources,
  updateCurrentSnapshot,
} from '@/mocks/data/querySelectors'
import type { SceneType } from '@/types/domain'

const parseScene = (value: string | null): SceneType => {
  if (value === 'pest' || value === 'nutrient' || value === 'weed') {
    return value
  }
  return 'disease'
}

export const dataCenterHandlers = [
  http.get('/api/sources', async () => {
    await delay(120)
    return HttpResponse.json({ sources: querySources() })
  }),

  http.get('/api/ingestion/jobs', async () => {
    await delay(120)
    return HttpResponse.json({ jobs: queryIngestionJobs() })
  }),

  http.post('/api/ingestion/jobs', async ({ request }) => {
    const payload = (await request.json()) as { sourceId?: string }
    if (!payload.sourceId) {
      return HttpResponse.json({ message: 'sourceId is required' }, { status: 400 })
    }
    await delay(260)
    try {
      return HttpResponse.json({ job: createJob(payload.sourceId) })
    } catch (error) {
      return HttpResponse.json(
        { message: error instanceof Error ? error.message : 'create job failed' },
        { status: 500 },
      )
    }
  }),

  http.post('/api/analysis/jobs/:jobId/start', async ({ params }) => {
    const jobId = String(params.jobId ?? '')
    if (!jobId) {
      return HttpResponse.json({ message: 'jobId is required' }, { status: 400 })
    }
    await delay(420)
    try {
      const result = analyzeJob(jobId)
      return HttpResponse.json(result)
    } catch (error) {
      return HttpResponse.json(
        { message: error instanceof Error ? error.message : 'analyze job failed' },
        { status: 500 },
      )
    }
  }),

  http.get('/api/snapshots', async () => {
    await delay(120)
    return HttpResponse.json(querySnapshots())
  }),

  http.post('/api/snapshots/:snapshotId/set-current', async ({ params }) => {
    const snapshotId = String(params.snapshotId ?? '')
    if (!snapshotId) {
      return HttpResponse.json({ message: 'snapshotId is required' }, { status: 400 })
    }
    await delay(160)
    try {
      return HttpResponse.json({
        currentSnapshotId: updateCurrentSnapshot(snapshotId),
      })
    } catch (error) {
      return HttpResponse.json(
        { message: error instanceof Error ? error.message : 'set current failed' },
        { status: 500 },
      )
    }
  }),

  http.get('/api/snapshots/compare', async ({ request }) => {
    const url = new URL(request.url)
    const leftSnapshotId = url.searchParams.get('leftSnapshotId')
    const rightSnapshotId = url.searchParams.get('rightSnapshotId')
    const scene = parseScene(url.searchParams.get('scene'))
    if (!leftSnapshotId || !rightSnapshotId) {
      return HttpResponse.json({ message: 'leftSnapshotId and rightSnapshotId are required' }, { status: 400 })
    }
    await delay(180)
    try {
      return HttpResponse.json({
        result: queryCompare(leftSnapshotId, rightSnapshotId, scene),
      })
    } catch (error) {
      return HttpResponse.json(
        { message: error instanceof Error ? error.message : 'compare failed' },
        { status: 500 },
      )
    }
  }),
]
