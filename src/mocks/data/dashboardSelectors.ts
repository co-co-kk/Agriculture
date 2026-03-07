// 该文件构建场景看板数据，供 /api/dashboard 接口直接返回。
import { dataset } from '@/mocks/data/dataset'
import { countBy, createPlotIndex, sortCells, toPercent } from '@/mocks/data/selectorUtils'
import type {
  DashboardKpi,
  DiseaseDashboardData,
  DiseaseDetection,
  GeoGridCell,
  PestDashboardData,
  PestDetection,
  Plot,
  SceneType,
  SeverityLevel,
} from '@/types/domain'

// 按病害结果生成地块风险网格，支持 agent 与严重度筛选。
const buildDiseaseCells = (
  plots: Plot[],
  detections: DiseaseDetection[],
  agentType?: string,
  severity?: SeverityLevel,
): GeoGridCell[] => {
  const scoped = detections.filter((item) => {
    const passAgent = agentType ? item.agentType === agentType : true
    const passSeverity = severity ? item.severity === severity : true
    return passAgent && passSeverity
  })

  const grouped = new Map<string, DiseaseDetection[]>()
  for (const item of scoped) {
    grouped.set(item.plotId, [...(grouped.get(item.plotId) ?? []), item])
  }

  return plots.map((plot) => {
    const list = grouped.get(plot.id) ?? []
    const avgSeverity =
      list.length === 0
        ? 0.2
        : list.reduce((acc, entry) => {
            const score = entry.severity === '重度' ? 1 : entry.severity === '中度' ? 0.7 : 0.45
            return acc + score
          }, 0) / list.length

    const agentCounts = countBy(list.map((entry) => entry.agentType))

    return {
      plotId: plot.id,
      center: plot.center,
      riskScore: Number(Math.min(0.99, avgSeverity).toFixed(2)),
      primaryRiskType: agentCounts[0]?.name ?? 'fungus',
      confidence: Number((list.reduce((acc, item) => acc + item.confidence, 0) / (list.length || 1)).toFixed(2)),
    }
  })
}

// 按虫害结果生成地块风险网格，支持虫种筛选。
const buildPestCells = (plots: Plot[], detections: PestDetection[], pestType?: string): GeoGridCell[] => {
  const scoped = detections.filter((item) => (pestType ? item.pestType === pestType : true))
  const grouped = new Map<string, PestDetection[]>()

  for (const item of scoped) {
    grouped.set(item.plotId, [...(grouped.get(item.plotId) ?? []), item])
  }

  return plots.map((plot) => {
    const list = grouped.get(plot.id) ?? []
    const avgDensity = list.length === 0 ? 0.25 : list.reduce((acc, item) => acc + item.density, 0) / list.length
    const avgCount = list.length === 0 ? 2 : list.reduce((acc, item) => acc + item.count, 0) / list.length
    const pestCounts = countBy(list.map((entry) => entry.pestType))

    return {
      plotId: plot.id,
      center: plot.center,
      riskScore: Number(Math.min(0.99, avgDensity * 0.7 + avgCount / 80).toFixed(2)),
      primaryRiskType: pestCounts[0]?.name ?? '蚜虫',
      confidence: Number((list.reduce((acc, item) => acc + item.confidence, 0) / (list.length || 1)).toFixed(2)),
    }
  })
}

// 生成场景通用 KPI 卡片集合。
const buildKpis = (scene: SceneType, cells: GeoGridCell[]): DashboardKpi[] => {
  const highRiskCount = cells.filter((item) => item.riskScore >= 0.75).length
  const avgRisk = cells.reduce((acc, item) => acc + item.riskScore, 0) / cells.length

  return [
    { key: `${scene}-risk`, label: '平均风险指数', value: toPercent(avgRisk), delta: '+2.6%', trend: 'up' },
    { key: `${scene}-high`, label: '高风险地块', value: `${highRiskCount}块`, delta: '-1', trend: 'down' },
    {
      key: `${scene}-cover`,
      label: '今日巡检覆盖',
      value: `${Math.round((cells.length / dataset.plots.length) * 100)}%`,
      delta: '+4.1%',
      trend: 'up',
    },
    {
      key: `${scene}-confidence`,
      label: '识别置信均值',
      value: toPercent(cells.reduce((acc, item) => acc + item.confidence, 0) / cells.length),
      delta: '+1.2%',
      trend: 'up',
    },
  ]
}

// 构建病害场景看板结构。
export const buildDiseaseDashboard = (params: {
  agentType?: string
  severity?: SeverityLevel
}): DiseaseDashboardData => {
  const cells = buildDiseaseCells(dataset.plots, dataset.detections.disease, params.agentType, params.severity)
  const sortedCells = sortCells(cells)
  const plotIndex = createPlotIndex(dataset.plots)

  return {
    scene: 'disease',
    kpis: buildKpis('disease', cells),
    mapCells: cells,
    agentDistribution: countBy(dataset.detections.disease.map((item) => item.agentType)),
    severityDistribution: countBy(dataset.detections.disease.map((item) => item.severity)),
    hotAreas: sortedCells.slice(0, 6).map((cell) => ({
      plotId: cell.plotId,
      plotName: plotIndex[cell.plotId]?.name ?? cell.plotId,
      score: cell.riskScore,
      issue: '病害感染风险',
    })),
    suggestions: [
      { id: 'd-sug-1', title: '优先处置重度感染区', priority: '高', description: '对风险指数最高的2块地执行分区喷施。' },
      { id: 'd-sug-2', title: '真菌高发区域复拍', priority: '中', description: '在24小时内安排二次飞巡，确认扩散趋势。' },
      { id: 'd-sug-3', title: '加强通风控湿', priority: '低', description: '对湿度高于75%的地块调整灌溉节奏。' },
    ],
  }
}

// 构建虫害场景看板结构。
export const buildPestDashboard = (params: { pestType?: string }): PestDashboardData => {
  const cells = buildPestCells(dataset.plots, dataset.detections.pest, params.pestType)
  const sortedCells = sortCells(cells)
  const plotIndex = createPlotIndex(dataset.plots)

  // 生成 12 个时间点趋势，模拟虫口密度变化。
  const densityTrend = Array.from({ length: 12 }).map((_, index) => {
    const value = Number((0.35 + Math.sin(index / 2.1) * 0.2 + index * 0.03).toFixed(2))
    return {
      time: `${(index + 8).toString().padStart(2, '0')}:00`,
      value: Math.max(0.1, Math.min(0.95, value)),
    }
  })

  return {
    scene: 'pest',
    kpis: buildKpis('pest', cells),
    mapCells: cells,
    pestDistribution: countBy(dataset.detections.pest.map((item) => item.pestType)),
    densityTrend,
    hotAreas: sortedCells.slice(0, 6).map((cell) => ({
      plotId: cell.plotId,
      plotName: plotIndex[cell.plotId]?.name ?? cell.plotId,
      score: cell.riskScore,
      issue: `${cell.primaryRiskType}聚集`,
    })),
    suggestions: [
      { id: 'p-sug-1', title: '执行高密区点喷', priority: '高', description: '优先处理虫口密度最高3个地块。' },
      { id: 'p-sug-2', title: '布设诱捕设施', priority: '中', description: '在热区周边增加诱虫板，降低扩散风险。' },
      { id: 'p-sug-3', title: '安排夜航复检', priority: '低', description: '夜间补采样确认活跃时段与迁飞方向。' },
    ],
  }
}
