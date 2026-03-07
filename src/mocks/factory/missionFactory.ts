// 该文件负责构建无人机任务与帧数据，支撑时间轴回放交互。
import type { DroneMission, MissionFrame, Plot, SceneType } from '@/types/domain'
import { getRealImageUrl } from '@/mocks/data/realImagePool'
import { faker, pickOne, randomFloat } from '@/mocks/factory/seed'

// 生成每个任务的飞行帧，保证影像回放数据量充足。
const createFrames = (
  missionId: string,
  scene: SceneType,
  plotIds: string[],
  startAt: Date,
  frameCount: number,
): MissionFrame[] => {
  const frames: MissionFrame[] = []

  for (let i = 0; i < frameCount; i += 1) {
    const capturedAt = new Date(startAt.getTime() + i * 24_000)
    frames.push({
      id: `${missionId}-frame-${i + 1}`,
      missionId,
      capturedAt: capturedAt.toISOString(),
      // 使用真实农业图片池替代随机占位图，增强案例拟真程度。
      imageUrl: getRealImageUrl(scene, i),
      ndvi: randomFloat(0.52, 0.94),
      temperature: randomFloat(19, 35),
      humidity: randomFloat(38, 87),
      plotId: pickOne(plotIds),
    })
  }

  return frames
}

// 根据选中地块生成简化轨迹，用于地图任务回放线展示。
const createPath = (plotIds: string[], plots: Plot[]): [number, number][] => {
  return plotIds
    .map((plotId) => plots.find((plot) => plot.id === plotId))
    .filter((item): item is Plot => Boolean(item))
    .map((plot) => plot.center)
}

// 为指定场景生成任务集，默认每个任务包含 72 帧以增强时间序列真实感。
export const createMissions = (
  scene: SceneType,
  plots: Plot[],
  missionCount = 30,
  frameCount = 72,
): DroneMission[] => {
  const missions: DroneMission[] = []

  for (let i = 0; i < missionCount; i += 1) {
    const missionId = `${scene}-mission-${(i + 1).toString().padStart(2, '0')}`
    const startAt = faker.date.recent({ days: 15 })
    const endAt = new Date(startAt.getTime() + frameCount * 24_000)
    const shuffled = faker.helpers.shuffle(plots.map((plot) => plot.id))
    const plotIds = shuffled.slice(0, 4)

    missions.push({
      id: missionId,
      scene,
      name: `${scene === 'disease' ? '病害识别' : '虫害巡检'}任务-${i + 1}`,
      droneId: `UAV-${faker.number.int({ min: 101, max: 998 })}`,
      startedAt: startAt.toISOString(),
      endedAt: endAt.toISOString(),
      path: createPath(plotIds, plots),
      plotIds,
      frames: createFrames(missionId, scene, plotIds, startAt, frameCount),
    })
  }

  // 按最新任务在前排序，提升看板首屏可读性。
  missions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  return missions
}
