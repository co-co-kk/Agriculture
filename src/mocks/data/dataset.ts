// 该文件负责初始化全量 mock 数据集，并作为所有 handler 的数据源。
import { createDiseaseAlerts, createPestAlerts } from '@/mocks/factory/alertFactory'
import { createDiseaseDetections, createPestDetections } from '@/mocks/factory/detectionFactory'
import { createFarm, createPlots } from '@/mocks/factory/farmFactory'
import { createMissions } from '@/mocks/factory/missionFactory'
import { createReport } from '@/mocks/factory/reportFactory'
import type {
  AlertEvent,
  AnalysisReport,
  DiseaseDetection,
  DroneMission,
  Farm,
  HotAreaItem,
  PestDetection,
  Plot,
  SceneType,
} from '@/types/domain'

// 聚合所有数据域，便于按场景快速查询。
export interface MockDataset {
  farm: Farm
  plots: Plot[]
  missions: Record<SceneType, DroneMission[]>
  detections: {
    disease: DiseaseDetection[]
    pest: PestDetection[]
  }
  alerts: Record<SceneType, AlertEvent[]>
  reports: Record<SceneType, AnalysisReport>
}

// 根据地块和检测聚合高风险区域，用于报告构建。
const buildHotAreas = (
  plots: Plot[],
  pairs: Array<{ plotId: string; score: number; issue: string }>,
): HotAreaItem[] => {
  // 先按地块取最高风险记录，避免报告列表出现重复键。
  const topByPlot = new Map<string, { score: number; issue: string }>()
  for (const pair of pairs) {
    const oldValue = topByPlot.get(pair.plotId)
    if (!oldValue || pair.score > oldValue.score) {
      topByPlot.set(pair.plotId, { score: pair.score, issue: pair.issue })
    }
  }

  return [...topByPlot.entries()]
    .map(([plotId, detail]) => {
      const plot = plots.find((item) => item.id === plotId)
      if (!plot) {
        return null
      }
      return {
        plotId: plot.id,
        plotName: plot.name,
        score: detail.score,
        issue: detail.issue,
      }
    })
    .filter((item): item is HotAreaItem => Boolean(item))
    .sort((a, b) => b.score - a.score)
}

// 初始化数据集，构建 60 个任务、4320 帧与 15000+ 检测记录。
const createDataset = (): MockDataset => {
  const farm = createFarm()
  const plots = createPlots()
  const diseaseMissions = createMissions('disease', plots, 30, 72)
  const pestMissions = createMissions('pest', plots, 30, 72)
  const diseaseDetections = createDiseaseDetections(diseaseMissions)
  const pestDetections = createPestDetections(pestMissions)
  const diseaseAlerts = createDiseaseAlerts(plots, diseaseDetections)
  const pestAlerts = createPestAlerts(plots, pestDetections)

  const diseaseHotAreas = buildHotAreas(
    plots,
    diseaseAlerts.slice(0, 8).map((item) => ({
      plotId: item.plotId,
      score: item.level === '严重' ? 0.92 : item.level === '预警' ? 0.72 : 0.55,
      issue: '病害感染风险',
    })),
  )

  const pestHotAreas = buildHotAreas(
    plots,
    pestAlerts.slice(0, 8).map((item) => ({
      plotId: item.plotId,
      score: item.level === '严重' ? 0.91 : item.level === '预警' ? 0.7 : 0.53,
      issue: '虫群聚集风险',
    })),
  )

  return {
    farm,
    plots,
    missions: {
      disease: diseaseMissions,
      pest: pestMissions,
    },
    detections: {
      disease: diseaseDetections,
      pest: pestDetections,
    },
    alerts: {
      disease: diseaseAlerts,
      pest: pestAlerts,
    },
    reports: {
      disease: createReport('disease', diseaseHotAreas),
      pest: createReport('pest', pestHotAreas),
    },
  }
}

// 导出全局只读数据集，确保请求返回稳定。
export const dataset = createDataset()
