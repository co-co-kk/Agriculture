// 该文件实现数据中心闭环状态与快照仓库，并提供 localStorage 持久化。
import { createFarm, createPlots } from '@/mocks/factory/farmFactory'
import { getRealImageUrl } from '@/mocks/data/realImagePool'
import type {
  AlertEvent,
  AnalysisReport,
  DashboardKpi,
  DiseaseDetection,
  DroneMission,
  GeoGridCell,
  MissionFrame,
  NutrientDetection,
  PestDetection,
  Plot,
  SceneType,
  SeverityLevel,
  SuggestionItem,
  WeedDetection,
  DiseaseDashboardData,
  PestDashboardData,
  NutrientDashboardData,
  WeedDashboardData,
} from '@/types/domain'
import type {
  AnalysisSnapshot,
  IngestionJob,
  IngestionSource,
  SnapshotCompareResult,
  SnapshotCompareMetric,
} from '@/types/dataCenter'

type SceneDashboard = DiseaseDashboardData | PestDashboardData | NutrientDashboardData | WeedDashboardData

interface SceneBundle {
  dashboard: SceneDashboard
  missions: DroneMission[]
  diseaseDetections: DiseaseDetection[]
  pestDetections: PestDetection[]
  nutrientDetections: NutrientDetection[]
  weedDetections: WeedDetection[]
  alerts: AlertEvent[]
  report: AnalysisReport
}

interface SnapshotBundle {
  meta: AnalysisSnapshot
  scenes: Record<SceneType, SceneBundle>
}

interface SnapshotPersistedState {
  sources: IngestionSource[]
  jobs: IngestionJob[]
  snapshots: AnalysisSnapshot[]
  currentSnapshotId: string | null
  bundles: Record<string, SnapshotBundle>
}

interface QueryDetectionParams {
  scene: SceneType
  snapshotId: string | null
  missionId: string
  frameIndex: number
  agentType?: string
  severity?: SeverityLevel
  pestType?: string
  deficiencyType?: string
  weedType?: string
}

const STORAGE_KEY = 'agri_ai_data_center_v1'
const farm = createFarm()
const plots = createPlots()

const sceneLabelMap: Record<SceneType, string> = {
  disease: '病害识别',
  pest: '虫害检测',
  nutrient: '营养诊断',
  weed: '杂草喷洒规划',
}

const severityList: SeverityLevel[] = ['轻度', '中度', '重度']
const diseaseAgents = ['fungus', 'bacteria', 'virus'] as const
const pestTypes = ['蚜虫', '稻飞虱', '棉铃虫', '白粉虱', '红蜘蛛']
const deficiencyTypes = ['缺氮', '缺磷', '缺钾'] as const
const weedTypes = ['阔叶杂草', '禾本科杂草', '莎草'] as const

const toDateKey = (value: string): string => {
  return new Date(value).toISOString().slice(0, 10)
}

const nowIso = (): string => new Date().toISOString()

const createRng = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hashSeed = (text: string): number => {
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const pick = <T,>(rng: () => number, items: readonly T[]): T => {
  const index = Math.floor(rng() * items.length)
  return items[Math.min(index, items.length - 1)]
}

const intIn = (rng: () => number, min: number, max: number): number => {
  return Math.floor(rng() * (max - min + 1)) + min
}

const floatIn = (rng: () => number, min: number, max: number, digits = 2): number => {
  const value = min + (max - min) * rng()
  return Number(value.toFixed(digits))
}

const shuffle = <T,>(rng: () => number, items: readonly T[]): T[] => {
  const cloned = [...items]
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const swapIndex = Math.floor(rng() * (i + 1))
    const temp = cloned[i]
    cloned[i] = cloned[swapIndex]
    cloned[swapIndex] = temp
  }
  return cloned
}

const scoreBySeverity = (severity: SeverityLevel): number => {
  if (severity === '重度') {
    return 0.92
  }
  if (severity === '中度') {
    return 0.68
  }
  return 0.44
}

const confidenceAvg = (values: number[]): number => {
  if (values.length === 0) {
    return 0.42
  }
  return Number((values.reduce((acc, value) => acc + value, 0) / values.length).toFixed(2))
}

const percentText = (value: number): string => `${(value * 100).toFixed(1)}%`

const countBy = (items: string[]): Array<{ name: string; value: number }> => {
  const counter = new Map<string, number>()
  for (const item of items) {
    counter.set(item, (counter.get(item) ?? 0) + 1)
  }
  return [...counter.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

const topAreas = (cells: GeoGridCell[], issueResolver: (cell: GeoGridCell) => string) => {
  const plotIndex = plots.reduce<Record<string, Plot>>((acc, plot) => {
    acc[plot.id] = plot
    return acc
  }, {})
  return [...cells]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 6)
    .map((cell) => ({
      plotId: cell.plotId,
      plotName: plotIndex[cell.plotId]?.name ?? cell.plotId,
      score: cell.riskScore,
      issue: issueResolver(cell),
    }))
}

const buildKpis = (scene: SceneType, cells: GeoGridCell[]): DashboardKpi[] => {
  const avgRisk = cells.reduce((acc, cell) => acc + cell.riskScore, 0) / (cells.length || 1)
  const highRiskCount = cells.filter((cell) => cell.riskScore >= 0.75).length
  const avgConfidence = cells.reduce((acc, cell) => acc + cell.confidence, 0) / (cells.length || 1)

  return [
    { key: `${scene}-risk`, label: '平均风险指数', value: percentText(avgRisk), delta: '+2.1%', trend: 'up' },
    { key: `${scene}-high`, label: '高风险地块', value: `${highRiskCount}块`, delta: '-1', trend: 'down' },
    { key: `${scene}-cover`, label: '巡检覆盖率', value: `${Math.round((cells.length / plots.length) * 100)}%`, delta: '+3.4%', trend: 'up' },
    { key: `${scene}-conf`, label: '识别置信均值', value: percentText(avgConfidence), delta: '+1.0%', trend: 'up' },
  ]
}

const buildSuggestions = (scene: SceneType): SuggestionItem[] => {
  if (scene === 'disease') {
    return [
      { id: 'd-s1', title: '优先处置重度感染区', priority: '高', description: '优先执行重度区域分区喷施与隔离。' },
      { id: 'd-s2', title: '真菌高发区域复拍', priority: '中', description: '在 24 小时内安排二次飞巡确认扩散。' },
      { id: 'd-s3', title: '控湿通风联动', priority: '低', description: '针对高湿地块调整灌溉与通风策略。' },
    ]
  }
  if (scene === 'pest') {
    return [
      { id: 'p-s1', title: '执行高密区点喷', priority: '高', description: '对虫口密度最高地块优先实施点喷。' },
      { id: 'p-s2', title: '布设诱捕设施', priority: '中', description: '在热点周边增设诱虫板并补采样。' },
      { id: 'p-s3', title: '夜航复检', priority: '低', description: '安排夜间巡检确认迁飞方向。' },
    ]
  }
  if (scene === 'nutrient') {
    return [
      { id: 'n-s1', title: '缺氮区域变量追肥', priority: '高', description: '对缺氮重度地块执行变量补肥。' },
      { id: 'n-s2', title: '复测叶绿素指标', priority: '中', description: '对中风险地块补采样验证诊断结果。' },
      { id: 'n-s3', title: '调整施肥窗口', priority: '低', description: '按天气与土壤条件调整施肥时段。' },
    ]
  }
  return [
    { id: 'w-s1', title: '优先喷洒 A 区', priority: '高', description: '对杂草覆盖率最高区域优先执行喷洒。' },
    { id: 'w-s2', title: '动态调整喷幅', priority: '中', description: '按杂草类型调整喷幅与飞行速度。' },
    { id: 'w-s3', title: '作业后复检', priority: '低', description: '72 小时后复检评估抑草效果。' },
  ]
}

const buildReport = (scene: SceneType, areas: Array<{ plotId: string; plotName: string; score: number; issue: string }>): AnalysisReport => {
  const summaryMap: Record<SceneType, string> = {
    disease: '病害风险主要集中于高湿地块，建议先处理重度感染区域。',
    pest: '虫口密度在局部地块持续升高，建议先点喷再复检。',
    nutrient: '营养缺失以缺氮和缺钾为主，建议变量补肥与复测并行。',
    weed: '杂草覆盖在 A 区聚集明显，建议按区块执行精准喷洒。',
  }
  const measuresMap: Record<SceneType, string[]> = {
    disease: ['48 小时内复拍重度区', '按病原类型分区用药', '增强通风控湿'],
    pest: ['高密区优先点喷', '补充诱捕设施', '安排 72 小时回访'],
    nutrient: ['变量补肥策略执行', '补采样校验诊断', '动态调整施肥窗口'],
    weed: ['按区块执行变量喷洒', '喷后 24 小时遥感复核', '按杂草类型更新处方'],
  }
  return {
    id: `report-${scene}-${Date.now()}`,
    scene,
    generatedAt: nowIso(),
    summary: summaryMap[scene],
    topAreas: areas.slice(0, 5),
    measures: measuresMap[scene],
  }
}

const buildAlerts = (scene: SceneType, cells: GeoGridCell[]): AlertEvent[] => {
  const now = Date.now()
  const sorted = [...cells].sort((a, b) => b.riskScore - a.riskScore).slice(0, 14)
  return sorted.map((cell, index) => {
    const plotName = plots.find((plot) => plot.id === cell.plotId)?.name ?? cell.plotId
    const level = cell.riskScore >= 0.82 ? '严重' : cell.riskScore >= 0.64 ? '预警' : '提示'
    return {
      id: `${scene}-alert-${cell.plotId}-${index}`,
      scene,
      plotId: cell.plotId,
      level,
      title: `${plotName}风险告警`,
      description: `${cell.primaryRiskType}指标异常，风险值 ${(cell.riskScore * 100).toFixed(0)}%。`,
      suggestedAction: scene === 'weed' ? '优先执行变量喷洒处方任务。' : '建议安排复检并执行对应处置动作。',
      occurredAt: new Date(now - index * 180_000).toISOString(),
    }
  })
}

const createMissionFrames = (
  rng: () => number,
  snapshotId: string,
  scene: SceneType,
  missionId: string,
  plotIds: string[],
  frameCount: number,
  startAt: Date,
): MissionFrame[] => {
  const frames: MissionFrame[] = []
  for (let i = 0; i < frameCount; i += 1) {
    const capturedAt = new Date(startAt.getTime() + i * 24_000)
    frames.push({
      id: `${missionId}-frame-${i + 1}`,
      missionId,
      capturedAt: capturedAt.toISOString(),
      imageUrl: getRealImageUrl(scene, i + hashSeed(snapshotId) % 9),
      ndvi: floatIn(rng, 0.42, 0.95),
      temperature: floatIn(rng, 18, 36),
      humidity: floatIn(rng, 35, 88),
      plotId: pick(rng, plotIds),
    })
  }
  return frames
}

const createMissionsByScene = (rng: () => number, snapshotId: string, scene: SceneType): DroneMission[] => {
  const missionCount = 6
  const frameCount = 24
  const missions: DroneMission[] = []
  for (let index = 0; index < missionCount; index += 1) {
    const missionId = `${snapshotId}-${scene}-mission-${index + 1}`
    const startAt = new Date(Date.now() - (missionCount - index) * 3_600_000)
    const selectedPlots = shuffle(rng, plots.map((plot) => plot.id)).slice(0, 4)
    const frames = createMissionFrames(rng, snapshotId, scene, missionId, selectedPlots, frameCount, startAt)
    missions.push({
      id: missionId,
      scene,
      name: `${sceneLabelMap[scene]}任务-${index + 1}`,
      droneId: `UAV-${intIn(rng, 100, 999)}`,
      startedAt: startAt.toISOString(),
      endedAt: new Date(startAt.getTime() + frameCount * 24_000).toISOString(),
      path: selectedPlots.map((plotId) => plots.find((plot) => plot.id === plotId)?.center ?? [118.39, 31.08]),
      plotIds: selectedPlots,
      frames,
    })
  }
  return missions
}

const createDiseaseScene = (rng: () => number, snapshotId: string): SceneBundle => {
  const missions = createMissionsByScene(rng, snapshotId, 'disease')
  const detections: DiseaseDetection[] = []
  for (const mission of missions) {
    mission.frames.forEach((frame, frameIndex) => {
      const amount = intIn(rng, 2, 4)
      for (let i = 0; i < amount; i += 1) {
        const severity = frameIndex >= 17 ? pick(rng, ['中度', '重度', '重度']) : pick(rng, severityList)
        detections.push({
          id: `${frame.id}-d-${i}`,
          missionId: mission.id,
          frameId: frame.id,
          plotId: frame.plotId,
          agentType: pick(rng, diseaseAgents),
          severity,
          bbox: {
            x: floatIn(rng, 0.08, 0.7),
            y: floatIn(rng, 0.08, 0.7),
            width: floatIn(rng, 0.12, 0.24),
            height: floatIn(rng, 0.12, 0.24),
          },
          confidence: floatIn(rng, 0.76, 0.99),
        })
      }
    })
  }

  const grouped = new Map<string, DiseaseDetection[]>()
  for (const item of detections) {
    grouped.set(item.plotId, [...(grouped.get(item.plotId) ?? []), item])
  }
  const mapCells: GeoGridCell[] = plots.map((plot) => {
    const list = grouped.get(plot.id) ?? []
    const risk = list.length === 0 ? 0.2 : list.reduce((acc, item) => acc + scoreBySeverity(item.severity), 0) / list.length
    const primaryRiskType = countBy(list.map((item) => item.agentType))[0]?.name ?? 'fungus'
    return {
      plotId: plot.id,
      center: plot.center,
      riskScore: Number(Math.min(0.98, risk).toFixed(2)),
      primaryRiskType,
      confidence: confidenceAvg(list.map((item) => item.confidence)),
    }
  })

  const areas = topAreas(mapCells, () => '病害感染风险')
  const dashboard: DiseaseDashboardData = {
    scene: 'disease',
    kpis: buildKpis('disease', mapCells),
    mapCells,
    agentDistribution: countBy(detections.map((item) => item.agentType)),
    severityDistribution: countBy(detections.map((item) => item.severity)),
    hotAreas: areas,
    suggestions: buildSuggestions('disease'),
  }

  return {
    dashboard,
    missions,
    diseaseDetections: detections,
    pestDetections: [],
    nutrientDetections: [],
    weedDetections: [],
    alerts: buildAlerts('disease', mapCells),
    report: buildReport('disease', areas),
  }
}

const createPestScene = (rng: () => number, snapshotId: string): SceneBundle => {
  const missions = createMissionsByScene(rng, snapshotId, 'pest')
  const detections: PestDetection[] = []
  for (const mission of missions) {
    mission.frames.forEach((frame, frameIndex) => {
      const amount = intIn(rng, 3, 6)
      for (let i = 0; i < amount; i += 1) {
        const densityBase = 0.22 + Math.min(0.42, frameIndex / 60)
        const density = floatIn(rng, densityBase, 0.95)
        detections.push({
          id: `${frame.id}-p-${i}`,
          missionId: mission.id,
          frameId: frame.id,
          plotId: frame.plotId,
          pestType: pick(rng, pestTypes),
          count: intIn(rng, 8, 65),
          density,
          bbox: {
            x: floatIn(rng, 0.05, 0.74),
            y: floatIn(rng, 0.05, 0.74),
            width: floatIn(rng, 0.1, 0.2),
            height: floatIn(rng, 0.1, 0.2),
          },
          confidence: floatIn(rng, 0.78, 0.99),
        })
      }
    })
  }

  const grouped = new Map<string, PestDetection[]>()
  for (const item of detections) {
    grouped.set(item.plotId, [...(grouped.get(item.plotId) ?? []), item])
  }
  const mapCells: GeoGridCell[] = plots.map((plot) => {
    const list = grouped.get(plot.id) ?? []
    const avgDensity = list.length === 0 ? 0.22 : list.reduce((acc, item) => acc + item.density, 0) / list.length
    const avgCount = list.length === 0 ? 6 : list.reduce((acc, item) => acc + item.count, 0) / list.length
    const primaryRiskType = countBy(list.map((item) => item.pestType))[0]?.name ?? '蚜虫'
    return {
      plotId: plot.id,
      center: plot.center,
      riskScore: Number(Math.min(0.99, avgDensity * 0.72 + avgCount / 92).toFixed(2)),
      primaryRiskType,
      confidence: confidenceAvg(list.map((item) => item.confidence)),
    }
  })

  const densityTrend = Array.from({ length: 12 }).map((_, index) => {
    const value = Math.max(0.08, Math.min(0.95, 0.32 + Math.sin(index / 2.2) * 0.18 + index * 0.03))
    return { time: `${(index + 8).toString().padStart(2, '0')}:00`, value: Number(value.toFixed(2)) }
  })

  const areas = topAreas(mapCells, (cell) => `${cell.primaryRiskType}聚集`)
  const dashboard: PestDashboardData = {
    scene: 'pest',
    kpis: buildKpis('pest', mapCells),
    mapCells,
    pestDistribution: countBy(detections.map((item) => item.pestType)),
    densityTrend,
    hotAreas: areas,
    suggestions: buildSuggestions('pest'),
  }

  return {
    dashboard,
    missions,
    diseaseDetections: [],
    pestDetections: detections,
    nutrientDetections: [],
    weedDetections: [],
    alerts: buildAlerts('pest', mapCells),
    report: buildReport('pest', areas),
  }
}

const createNutrientScene = (rng: () => number, snapshotId: string): SceneBundle => {
  const missions = createMissionsByScene(rng, snapshotId, 'nutrient')
  const detections: NutrientDetection[] = []
  for (const mission of missions) {
    mission.frames.forEach((frame) => {
      const amount = intIn(rng, 2, 4)
      for (let i = 0; i < amount; i += 1) {
        const severity = pick(rng, severityList)
        const ndviGap = floatIn(rng, 0.05, 0.4)
        detections.push({
          id: `${frame.id}-n-${i}`,
          missionId: mission.id,
          frameId: frame.id,
          plotId: frame.plotId,
          deficiencyType: pick(rng, deficiencyTypes),
          severity,
          ndviGap,
          bbox: {
            x: floatIn(rng, 0.06, 0.72),
            y: floatIn(rng, 0.06, 0.72),
            width: floatIn(rng, 0.13, 0.25),
            height: floatIn(rng, 0.13, 0.25),
          },
          confidence: floatIn(rng, 0.75, 0.98),
        })
      }
    })
  }

  const grouped = new Map<string, NutrientDetection[]>()
  for (const item of detections) {
    grouped.set(item.plotId, [...(grouped.get(item.plotId) ?? []), item])
  }
  const mapCells: GeoGridCell[] = plots.map((plot) => {
    const list = grouped.get(plot.id) ?? []
    const risk = list.length === 0
      ? 0.18
      : list.reduce((acc, item) => acc + scoreBySeverity(item.severity) * 0.65 + item.ndviGap * 0.35, 0) / list.length
    const primaryRiskType = countBy(list.map((item) => item.deficiencyType))[0]?.name ?? '缺氮'
    return {
      plotId: plot.id,
      center: plot.center,
      riskScore: Number(Math.min(0.98, risk).toFixed(2)),
      primaryRiskType,
      confidence: confidenceAvg(list.map((item) => item.confidence)),
    }
  })

  const areas = topAreas(mapCells, (cell) => `${cell.primaryRiskType}风险`)
  const dashboard: NutrientDashboardData = {
    scene: 'nutrient',
    kpis: buildKpis('nutrient', mapCells),
    mapCells,
    deficiencyDistribution: countBy(detections.map((item) => item.deficiencyType)),
    severityDistribution: countBy(detections.map((item) => item.severity)),
    hotAreas: areas,
    suggestions: buildSuggestions('nutrient'),
  }

  return {
    dashboard,
    missions,
    diseaseDetections: [],
    pestDetections: [],
    nutrientDetections: detections,
    weedDetections: [],
    alerts: buildAlerts('nutrient', mapCells),
    report: buildReport('nutrient', areas),
  }
}

const createWeedScene = (rng: () => number, snapshotId: string): SceneBundle => {
  const missions = createMissionsByScene(rng, snapshotId, 'weed')
  const detections: WeedDetection[] = []
  for (const mission of missions) {
    mission.frames.forEach((frame) => {
      const amount = intIn(rng, 2, 5)
      for (let i = 0; i < amount; i += 1) {
        const coverage = floatIn(rng, 0.1, 0.92)
        detections.push({
          id: `${frame.id}-w-${i}`,
          missionId: mission.id,
          frameId: frame.id,
          plotId: frame.plotId,
          weedType: pick(rng, weedTypes),
          coverage,
          sprayZone: coverage >= 0.68 ? 'A区' : coverage >= 0.45 ? 'B区' : 'C区',
          bbox: {
            x: floatIn(rng, 0.06, 0.7),
            y: floatIn(rng, 0.06, 0.7),
            width: floatIn(rng, 0.14, 0.28),
            height: floatIn(rng, 0.14, 0.28),
          },
          confidence: floatIn(rng, 0.74, 0.98),
        })
      }
    })
  }

  const grouped = new Map<string, WeedDetection[]>()
  for (const item of detections) {
    grouped.set(item.plotId, [...(grouped.get(item.plotId) ?? []), item])
  }
  const mapCells: GeoGridCell[] = plots.map((plot) => {
    const list = grouped.get(plot.id) ?? []
    const avgCoverage = list.length === 0 ? 0.16 : list.reduce((acc, item) => acc + item.coverage, 0) / list.length
    const primaryRiskType = countBy(list.map((item) => item.weedType))[0]?.name ?? '阔叶杂草'
    return {
      plotId: plot.id,
      center: plot.center,
      riskScore: Number(Math.min(0.99, avgCoverage).toFixed(2)),
      primaryRiskType,
      confidence: confidenceAvg(list.map((item) => item.confidence)),
    }
  })

  const sprayAreaTrend = Array.from({ length: 12 }).map((_, index) => {
    const value = Math.max(0.06, Math.min(0.96, 0.28 + Math.cos(index / 2.3) * 0.14 + index * 0.025))
    return { time: `${(index + 8).toString().padStart(2, '0')}:00`, value: Number(value.toFixed(2)) }
  })

  const areas = topAreas(mapCells, (cell) => `${cell.primaryRiskType}覆盖`)
  const dashboard: WeedDashboardData = {
    scene: 'weed',
    kpis: buildKpis('weed', mapCells),
    mapCells,
    weedDistribution: countBy(detections.map((item) => item.weedType)),
    sprayAreaTrend,
    hotAreas: areas,
    suggestions: buildSuggestions('weed'),
  }

  return {
    dashboard,
    missions,
    diseaseDetections: [],
    pestDetections: [],
    nutrientDetections: [],
    weedDetections: detections,
    alerts: buildAlerts('weed', mapCells),
    report: buildReport('weed', areas),
  }
}

const createSnapshotBundle = (meta: AnalysisSnapshot): SnapshotBundle => {
  const rng = createRng(hashSeed(meta.id + meta.createdAt + meta.sourceId))
  return {
    meta,
    scenes: {
      disease: createDiseaseScene(rng, meta.id),
      pest: createPestScene(rng, meta.id),
      nutrient: createNutrientScene(rng, meta.id),
      weed: createWeedScene(rng, meta.id),
    },
  }
}

const findPreferredSnapshotId = (snapshots: AnalysisSnapshot[]): string | null => {
  if (snapshots.length === 0) {
    return null
  }
  const today = toDateKey(nowIso())
  const sorted = [...snapshots].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const todayLatest = sorted.find((item) => item.date === today)
  return todayLatest?.id ?? sorted[0].id
}

const markActive = (snapshots: AnalysisSnapshot[], currentSnapshotId: string | null): AnalysisSnapshot[] => {
  return snapshots.map((snapshot) => ({
    ...snapshot,
    active: snapshot.id === currentSnapshotId,
  }))
}

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage
}

const createInitialState = (): SnapshotPersistedState => {
  const sources: IngestionSource[] = [
    {
      id: 'source-a',
      name: '甲方北区无人机平台',
      provider: '甲方A公司',
      endpoint: 'https://partner-a.example.com/agri/data',
      description: '北区巡检任务实时汇聚接口',
    },
    {
      id: 'source-b',
      name: '甲方南区监测接口',
      provider: '甲方B公司',
      endpoint: 'https://partner-b.example.com/mission/pull',
      description: '南区病虫营养杂草统一数据通道',
    },
    {
      id: 'source-c',
      name: '甲方历史归档同步源',
      provider: '甲方数据中心',
      endpoint: 'https://partner-c.example.com/archive/sync',
      description: '用于补齐历史批次与复盘快照',
    },
  ]

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
  const historyDates = [twoDaysAgo, yesterday]

  const snapshots: AnalysisSnapshot[] = historyDates.map((date, index) => ({
    id: `snapshot-history-${index + 1}`,
    date: toDateKey(date.toISOString()),
    sourceId: sources[index % sources.length].id,
    sourceName: sources[index % sources.length].name,
    jobId: `job-history-${index + 1}`,
    createdAt: date.toISOString(),
    active: false,
  }))

  const jobs: IngestionJob[] = snapshots.map((snapshot, index) => ({
    id: snapshot.jobId,
    sourceId: snapshot.sourceId,
    sourceName: snapshot.sourceName,
    status: index === snapshots.length - 1 ? 'active' : 'analyzed',
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.createdAt,
    snapshotId: snapshot.id,
    message: '历史导入任务',
  }))

  const bundles: Record<string, SnapshotBundle> = {}
  for (const snapshot of snapshots) {
    bundles[snapshot.id] = createSnapshotBundle(snapshot)
  }

  const currentSnapshotId = findPreferredSnapshotId(snapshots)
  return {
    sources,
    jobs,
    snapshots: markActive(snapshots, currentSnapshotId),
    currentSnapshotId,
    bundles,
  }
}

let memoryState: SnapshotPersistedState | null = null

const loadState = (): SnapshotPersistedState => {
  if (memoryState) {
    return memoryState
  }
  const storage = getLocalStorage()
  if (!storage) {
    memoryState = createInitialState()
    return memoryState
  }

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    memoryState = createInitialState()
    storage.setItem(STORAGE_KEY, JSON.stringify(memoryState))
    return memoryState
  }

  try {
    const parsed = JSON.parse(raw) as SnapshotPersistedState
    if (
      !parsed ||
      !Array.isArray(parsed.snapshots) ||
      !Array.isArray(parsed.jobs) ||
      !Array.isArray(parsed.sources) ||
      typeof parsed.bundles !== 'object' ||
      parsed.bundles === null
    ) {
      throw new Error('invalid persisted state')
    }
    const invalidSnapshot = parsed.snapshots.find((snapshot) => !parsed.bundles[snapshot.id])
    if (invalidSnapshot) {
      throw new Error('snapshot bundle missing')
    }
    const currentSnapshotId = findPreferredSnapshotId(parsed.snapshots)
    memoryState = {
      ...parsed,
      currentSnapshotId,
      snapshots: markActive(parsed.snapshots, currentSnapshotId),
    }
    return memoryState
  } catch {
    memoryState = createInitialState()
    storage.setItem(STORAGE_KEY, JSON.stringify(memoryState))
    return memoryState
  }
}

const saveState = (nextState: SnapshotPersistedState): SnapshotPersistedState => {
  memoryState = nextState
  const storage = getLocalStorage()
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  }
  return nextState
}

const resolveSnapshotId = (snapshotId: string | null): string | null => {
  const state = loadState()
  if (snapshotId && state.bundles[snapshotId]) {
    return snapshotId
  }
  return findPreferredSnapshotId(state.snapshots)
}

const findFrame = (bundle: SnapshotBundle, missionId: string, frameIndex: number): MissionFrame | null => {
  for (const scene of ['disease', 'pest', 'nutrient', 'weed'] as const) {
    const mission = bundle.scenes[scene].missions.find((item) => item.id === missionId)
    if (mission) {
      return mission.frames[frameIndex] ?? mission.frames[0] ?? null
    }
  }
  return null
}

export const getFarmData = () => ({ farm, plots })

export const listSources = (): IngestionSource[] => {
  return [...loadState().sources]
}

export const listJobs = (): IngestionJob[] => {
  return [...loadState().jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const createIngestionJob = (sourceId: string): IngestionJob => {
  const state = loadState()
  const source = state.sources.find((item) => item.id === sourceId)
  if (!source) {
    throw new Error('source not found')
  }

  const current = nowIso()
  const job: IngestionJob = {
    id: `job-${Date.now()}`,
    sourceId: source.id,
    sourceName: source.name,
    status: 'ready_to_parse',
    createdAt: current,
    updatedAt: current,
    snapshotId: null,
    message: '采集完成，等待解析',
  }

  const nextState = {
    ...state,
    jobs: [job, ...state.jobs],
  }
  saveState(nextState)
  return job
}

export const startAnalysis = (jobId: string): { job: IngestionJob; snapshot: AnalysisSnapshot } => {
  const state = loadState()
  const targetJob = state.jobs.find((item) => item.id === jobId)
  if (!targetJob) {
    throw new Error('job not found')
  }

  const createdAt = nowIso()
  const snapshot: AnalysisSnapshot = {
    id: `snapshot-${Date.now()}`,
    date: toDateKey(createdAt),
    sourceId: targetJob.sourceId,
    sourceName: targetJob.sourceName,
    jobId,
    createdAt,
    active: true,
  }

  const bundle = createSnapshotBundle(snapshot)
  const nextJobs = state.jobs.map((job) => {
    if (job.id === jobId) {
      return {
        ...job,
        status: 'active' as const,
        updatedAt: createdAt,
        snapshotId: snapshot.id,
        message: '解析完成并已自动生效',
      }
    }
    if (job.status === 'active') {
      return {
        ...job,
        status: 'analyzed' as const,
      }
    }
    return job
  })

  const nextSnapshots = markActive([snapshot, ...state.snapshots], snapshot.id)
  const nextState: SnapshotPersistedState = {
    ...state,
    jobs: nextJobs,
    snapshots: nextSnapshots,
    currentSnapshotId: snapshot.id,
    bundles: {
      ...state.bundles,
      [snapshot.id]: bundle,
    },
  }
  saveState(nextState)
  return {
    job: nextJobs.find((item) => item.id === jobId) ?? targetJob,
    snapshot,
  }
}

export const listSnapshots = (): { snapshots: AnalysisSnapshot[]; currentSnapshotId: string | null } => {
  const state = loadState()
  const currentSnapshotId = resolveSnapshotId(state.currentSnapshotId)
  const snapshots = markActive(
    [...state.snapshots].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    currentSnapshotId,
  )
  return { snapshots, currentSnapshotId }
}

export const setCurrentSnapshot = (snapshotId: string): string => {
  const state = loadState()
  if (!state.bundles[snapshotId]) {
    throw new Error('snapshot not found')
  }
  const nextSnapshots = markActive(state.snapshots, snapshotId)
  const nextJobs = state.jobs.map((job) => {
    if (job.snapshotId === snapshotId) {
      return { ...job, status: 'active' as const, updatedAt: nowIso() }
    }
    if (job.status === 'active') {
      return { ...job, status: 'analyzed' as const, updatedAt: nowIso() }
    }
    return job
  })
  saveState({
    ...state,
    currentSnapshotId: snapshotId,
    snapshots: nextSnapshots,
    jobs: nextJobs,
  })
  return snapshotId
}

export const queryDashboardBySnapshot = (params: {
  scene: SceneType
  snapshotId: string | null
}): SceneDashboard => {
  const state = loadState()
  const resolved = resolveSnapshotId(params.snapshotId)
  if (!resolved) {
    throw new Error('snapshot not found')
  }
  return state.bundles[resolved].scenes[params.scene].dashboard
}

export const queryMissionsBySnapshot = (scene: SceneType, snapshotId: string | null): DroneMission[] => {
  const state = loadState()
  const resolved = resolveSnapshotId(snapshotId)
  if (!resolved) {
    return []
  }
  return state.bundles[resolved].scenes[scene].missions
}

export const queryAlertsBySnapshot = (scene: SceneType, snapshotId: string | null): AlertEvent[] => {
  const state = loadState()
  const resolved = resolveSnapshotId(snapshotId)
  if (!resolved) {
    return []
  }
  return state.bundles[resolved].scenes[scene].alerts
}

export const queryReportBySnapshot = (scene: SceneType, snapshotId: string | null): AnalysisReport => {
  const state = loadState()
  const resolved = resolveSnapshotId(snapshotId)
  if (!resolved) {
    throw new Error('snapshot not found')
  }
  return state.bundles[resolved].scenes[scene].report
}

export const queryDetectionsBySnapshot = (params: QueryDetectionParams) => {
  const state = loadState()
  const resolved = resolveSnapshotId(params.snapshotId)
  if (!resolved) {
    return {
      frame: null,
      diseaseDetections: [],
      pestDetections: [],
      nutrientDetections: [],
      weedDetections: [],
    }
  }
  const bundle = state.bundles[resolved]
  const frame = findFrame(bundle, params.missionId, params.frameIndex)
  if (!frame) {
    return {
      frame: null,
      diseaseDetections: [],
      pestDetections: [],
      nutrientDetections: [],
      weedDetections: [],
    }
  }

  const sceneBundle = bundle.scenes[params.scene]
  const diseaseDetections =
    params.scene === 'disease'
      ? sceneBundle.diseaseDetections.filter((item) => {
          if (item.frameId !== frame.id || item.missionId !== params.missionId) {
            return false
          }
          const passAgent = params.agentType ? item.agentType === params.agentType : true
          const passSeverity = params.severity ? item.severity === params.severity : true
          return passAgent && passSeverity
        })
      : []

  const pestDetections =
    params.scene === 'pest'
      ? sceneBundle.pestDetections.filter((item) => {
          if (item.frameId !== frame.id || item.missionId !== params.missionId) {
            return false
          }
          return params.pestType ? item.pestType === params.pestType : true
        })
      : []

  const nutrientDetections =
    params.scene === 'nutrient'
      ? sceneBundle.nutrientDetections.filter((item) => {
          if (item.frameId !== frame.id || item.missionId !== params.missionId) {
            return false
          }
          const passType = params.deficiencyType ? item.deficiencyType === params.deficiencyType : true
          const passSeverity = params.severity ? item.severity === params.severity : true
          return passType && passSeverity
        })
      : []

  const weedDetections =
    params.scene === 'weed'
      ? sceneBundle.weedDetections.filter((item) => {
          if (item.frameId !== frame.id || item.missionId !== params.missionId) {
            return false
          }
          return params.weedType ? item.weedType === params.weedType : true
        })
      : []

  return {
    frame,
    diseaseDetections,
    pestDetections,
    nutrientDetections,
    weedDetections,
  }
}

const parsePercent = (value: string): number => {
  if (value.endsWith('%')) {
    return Number(value.replace('%', ''))
  }
  return Number.parseFloat(value)
}

const buildCompareMetric = (label: string, leftValue: string, rightValue: string): SnapshotCompareMetric => {
  const leftNum = parsePercent(leftValue)
  const rightNum = parsePercent(rightValue)
  const delta = Number.isFinite(leftNum) && Number.isFinite(rightNum) ? `${(rightNum - leftNum).toFixed(1)}` : '0.0'
  return {
    label,
    leftValue,
    rightValue,
    delta: `${delta}`,
  }
}

export const querySnapshotCompare = (params: {
  leftSnapshotId: string
  rightSnapshotId: string
  scene: SceneType
}): SnapshotCompareResult => {
  const state = loadState()
  const leftBundle = state.bundles[params.leftSnapshotId]
  const rightBundle = state.bundles[params.rightSnapshotId]
  if (!leftBundle || !rightBundle) {
    throw new Error('snapshot not found for compare')
  }

  const leftDashboard = leftBundle.scenes[params.scene].dashboard
  const rightDashboard = rightBundle.scenes[params.scene].dashboard
  const metrics = [
    buildCompareMetric('平均风险指数', leftDashboard.kpis[0]?.value ?? '0%', rightDashboard.kpis[0]?.value ?? '0%'),
    buildCompareMetric('高风险地块', leftDashboard.kpis[1]?.value ?? '0', rightDashboard.kpis[1]?.value ?? '0'),
    buildCompareMetric('巡检覆盖率', leftDashboard.kpis[2]?.value ?? '0%', rightDashboard.kpis[2]?.value ?? '0%'),
    buildCompareMetric('识别置信均值', leftDashboard.kpis[3]?.value ?? '0%', rightDashboard.kpis[3]?.value ?? '0%'),
  ]

  return {
    scene: params.scene,
    leftSnapshotId: params.leftSnapshotId,
    rightSnapshotId: params.rightSnapshotId,
    metrics,
    summary: `${sceneLabelMap[params.scene]}对比完成：右侧版本相较左侧在风险与覆盖指标上存在变化。`,
  }
}

export const queryCurrentSnapshotId = (): string | null => {
  const state = loadState()
  return resolveSnapshotId(state.currentSnapshotId)
}

export const resetSnapshotStoreForTest = (): void => {
  memoryState = createInitialState()
  const storage = getLocalStorage()
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(memoryState))
  }
}
