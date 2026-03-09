// 该文件用于验证当前快照下四场景每帧均有识别数据。
import { describe, expect, it } from 'vitest'
import { dataset } from '@/mocks/data/dataset'
import { queryCurrentSnapshotId, queryDetectionsBySnapshot } from '@/mocks/data/snapshotStore'
import type { SceneType } from '@/types/domain'

const sceneList: SceneType[] = ['disease', 'pest', 'nutrient', 'weed']

describe('snapshot dataset coverage', () => {
  it.each(sceneList)('%s 场景每帧都应有识别数据', (scene) => {
    const snapshotId = queryCurrentSnapshotId()
    const missions = dataset.missions[scene]

    for (const mission of missions) {
      mission.frames.forEach((frame, frameIndex) => {
        const result = queryDetectionsBySnapshot({
          scene,
          snapshotId,
          missionId: mission.id,
          frameIndex,
        })

        const count =
          result.diseaseDetections.length +
          result.pestDetections.length +
          result.nutrientDetections.length +
          result.weedDetections.length
        expect(count, `${scene} 场景帧 ${frame.id} 缺少识别数据`).toBeGreaterThan(0)
      })
    }
  })
})
