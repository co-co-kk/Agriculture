// 该文件负责从识别结果中提炼告警事件流。
import type {
  AlertEvent,
  AlertLevel,
  DiseaseDetection,
  PestDetection,
  Plot,
  SceneType,
} from '@/types/domain'
import { faker, pickOne } from '@/mocks/factory/seed'

// 根据风险分数推导告警等级，供场景统一使用。
const inferLevel = (score: number): AlertLevel => {
  if (score >= 0.8) {
    return '严重'
  }
  if (score >= 0.6) {
    return '预警'
  }
  return '提示'
}

// 生成通用告警条目，避免场景代码重复。
const createAlert = (
  idPrefix: string,
  scene: SceneType,
  plot: Plot,
  score: number,
  issue: string,
  action: string,
): AlertEvent => {
  return {
    id: `${idPrefix}-${faker.string.nanoid(8)}`,
    scene,
    plotId: plot.id,
    level: inferLevel(score),
    title: `${plot.name}${issue}`,
    description: `检测置信度${Math.round(score * 100)}%，建议尽快安排农事处置。`,
    suggestedAction: action,
    occurredAt: faker.date.recent({ days: 5 }).toISOString(),
  }
}

// 由病害识别结果生成告警流，默认产出 120 条左右。
export const createDiseaseAlerts = (plots: Plot[], detections: DiseaseDetection[]): AlertEvent[] => {
  const actions = ['安排叶面药剂喷施', '执行隔离带巡检', '重点区域补拍复核']
  const grouped = new Map<string, number[]>()

  for (const item of detections.slice(0, 1200)) {
    const score = item.severity === '重度' ? 0.88 : item.severity === '中度' ? 0.68 : 0.52
    grouped.set(item.plotId, [...(grouped.get(item.plotId) ?? []), score])
  }

  const alerts: AlertEvent[] = []
  for (const [plotId, scores] of grouped) {
    const plot = plots.find((entry) => entry.id === plotId)
    if (!plot) {
      continue
    }

    for (const score of scores.slice(0, 12)) {
      alerts.push(createAlert('d-alert', 'disease', plot, score, '出现病害感染风险', pickOne(actions)))
    }
  }

  alerts.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
  return alerts.slice(0, 140)
}

// 由虫害识别结果生成告警流，默认产出 120 条左右。
export const createPestAlerts = (plots: Plot[], detections: PestDetection[]): AlertEvent[] => {
  const actions = ['执行定点喷洒任务', '调高诱捕器密度', '无人机夜航补采样']
  const alerts: AlertEvent[] = []

  for (const item of detections.slice(0, 1000)) {
    const plot = plots.find((entry) => entry.id === item.plotId)
    if (!plot) {
      continue
    }

    const score = Math.min(0.98, item.density * 0.65 + item.count / 100)
    alerts.push(createAlert('p-alert', 'pest', plot, score, `发现${item.pestType}聚集`, pickOne(actions)))
  }

  alerts.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
  return alerts.slice(0, 140)
}
