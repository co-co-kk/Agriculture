// 该文件用于验证两个场景的每一帧都包含识别数据，保证回放拟真度。
import { describe, expect, it } from 'vitest'
import { dataset } from '@/mocks/data/dataset'

// 按 frameId 聚合检测数量，便于做逐帧覆盖校验。
const buildFrameCounter = (frameIds: string[], detectionFrameIds: string[]) => {
  const counter = new Map<string, number>(frameIds.map((frameId) => [frameId, 0]))
  for (const frameId of detectionFrameIds) {
    counter.set(frameId, (counter.get(frameId) ?? 0) + 1)
  }
  return counter
}

describe('mock dataset coverage', () => {
  it('病害场景每一帧都应有识别数据', () => {
    const frameIds = dataset.missions.disease.flatMap((mission) => mission.frames.map((frame) => frame.id))
    const detectionFrameIds = dataset.detections.disease.map((item) => item.frameId)
    const counter = buildFrameCounter(frameIds, detectionFrameIds)

    for (const frameId of frameIds) {
      expect(counter.get(frameId), `病害场景帧 ${frameId} 缺少识别数据`).toBeGreaterThan(0)
    }
  })

  it('虫害场景每一帧都应有识别数据', () => {
    const frameIds = dataset.missions.pest.flatMap((mission) => mission.frames.map((frame) => frame.id))
    const detectionFrameIds = dataset.detections.pest.map((item) => item.frameId)
    const counter = buildFrameCounter(frameIds, detectionFrameIds)

    for (const frameId of frameIds) {
      expect(counter.get(frameId), `虫害场景帧 ${frameId} 缺少识别数据`).toBeGreaterThan(0)
    }
  })
})
