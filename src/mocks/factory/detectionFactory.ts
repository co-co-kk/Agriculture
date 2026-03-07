// 该文件根据任务帧生成病害与虫害识别结果。
import type {
  DiseaseAgentType,
  DiseaseDetection,
  DroneMission,
  PestDetection,
  SeverityLevel,
} from '@/types/domain'
import { faker, pickOne, randomFloat } from '@/mocks/factory/seed'

// 生成单个识别框，便于各场景复用。
const createBox = () => {
  return {
    x: randomFloat(0.1, 0.72),
    y: randomFloat(0.1, 0.72),
    width: randomFloat(0.12, 0.28),
    height: randomFloat(0.12, 0.28),
  }
}

// 根据帧进度推导病害严重度，形成随时间可能加重的趋势。
const pickSeverityByFrame = (frameIndex: number, totalFrames: number): SeverityLevel => {
  const progress = totalFrames <= 1 ? 0 : frameIndex / (totalFrames - 1)
  if (progress >= 0.72) {
    return pickOne(['中度', '重度', '重度'])
  }
  if (progress >= 0.36) {
    return pickOne(['轻度', '中度', '中度'])
  }
  return pickOne(['轻度', '轻度', '中度'])
}

// 为病害场景批量生成识别结果，保证每帧均有识别框。
export const createDiseaseDetections = (missions: DroneMission[]): DiseaseDetection[] => {
  const agentTypes: DiseaseAgentType[] = ['fungus', 'bacteria', 'virus']
  const detections: DiseaseDetection[] = []

  for (const mission of missions) {
    // 为每个任务设置主导病原，模拟同一区域阶段性高发。
    const dominantAgent = pickOne(agentTypes)

    mission.frames.forEach((frame, frameIndex) => {
      // 每帧至少 2 个目标框，保证回放过程始终有病害数据。
      const amount = faker.number.int({ min: 2, max: 4 })
      for (let i = 0; i < amount; i += 1) {
        detections.push({
          id: `d-${mission.id}-${frame.id}-${i}`,
          missionId: mission.id,
          frameId: frame.id,
          plotId: frame.plotId,
          agentType: faker.number.float() < 0.58 ? dominantAgent : pickOne(agentTypes),
          severity: pickSeverityByFrame(frameIndex, mission.frames.length),
          bbox: createBox(),
          confidence: randomFloat(0.78, 0.99),
        })
      }
    })
  }

  return detections
}

// 为虫害场景批量生成识别结果，保证每帧均有虫口数据。
export const createPestDetections = (missions: DroneMission[]): PestDetection[] => {
  const pestTypes = ['蚜虫', '稻飞虱', '棉铃虫', '白粉虱', '红蜘蛛']
  const detections: PestDetection[] = []

  for (const mission of missions) {
    // 为每个任务设置主导虫种，模拟虫群爆发的聚集特征。
    const dominantPestType = pickOne(pestTypes)

    mission.frames.forEach((frame, frameIndex) => {
      // 每帧至少 3 个检测框，形成更真实的虫害密集感。
      const amount = faker.number.int({ min: 3, max: 6 })
      for (let i = 0; i < amount; i += 1) {
        const progress = mission.frames.length <= 1 ? 0 : frameIndex / (mission.frames.length - 1)
        const densityFloor = Number(Math.min(0.72, 0.22 + progress * 0.24).toFixed(2))
        const density = randomFloat(densityFloor, 0.98)
        const countMin = Math.max(4, Math.round(density * 18))
        const countMax = Math.max(countMin + 6, Math.round(density * 64))

        detections.push({
          id: `p-${mission.id}-${frame.id}-${i}`,
          missionId: mission.id,
          frameId: frame.id,
          plotId: frame.plotId,
          pestType: faker.number.float() < 0.6 ? dominantPestType : pickOne(pestTypes),
          count: faker.number.int({ min: countMin, max: countMax }),
          density,
          bbox: createBox(),
          confidence: randomFloat(0.8, 0.99),
        })
      }
    })
  }

  return detections
}
