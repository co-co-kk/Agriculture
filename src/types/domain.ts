// 该文件定义农业 AI 平台的核心业务类型，供 mock、状态与组件统一复用。

// 场景类型用于控制页面模块切换和接口数据域。
export type SceneType = 'disease' | 'pest'

// 病害感染类型用于场景1统计与筛选。
export type DiseaseAgentType = 'fungus' | 'bacteria' | 'virus'

// 病害严重度用于告警分级和处置建议优先级。
export type SeverityLevel = '轻度' | '中度' | '重度'

// 告警等级用于右侧告警流样式映射。
export type AlertLevel = '提示' | '预警' | '严重'

// 地图点位采用经纬度数组表达，便于直接喂给地图引擎。
export type LngLat = [number, number]

// 统一定义识别框结构，用于病害和虫害目标框展示。
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

// 农场基础信息用于顶部状态与报告头信息展示。
export interface Farm {
  id: string
  name: string
  province: string
  city: string
  totalAreaMu: number
}

// 地块信息用于地图网格渲染和区域详情联动。
export interface Plot {
  id: string
  name: string
  crop: string
  areaMu: number
  center: LngLat
  polygon: LngLat[]
}

// 每帧影像用于时间轴回放和识别框叠加。
export interface MissionFrame {
  id: string
  missionId: string
  capturedAt: string
  imageUrl: string
  ndvi: number
  temperature: number
  humidity: number
  plotId: string
}

// 无人机任务用于底部任务切换与轨迹展示。
export interface DroneMission {
  id: string
  scene: SceneType
  name: string
  droneId: string
  startedAt: string
  endedAt: string
  path: LngLat[]
  plotIds: string[]
  frames: MissionFrame[]
}

// 地块风险网格用于地图热力和区域问题分布展示。
export interface GeoGridCell {
  plotId: string
  center: LngLat
  riskScore: number
  primaryRiskType: string
  confidence: number
}

// 病害识别结果用于场景1目标框和类别统计。
export interface DiseaseDetection {
  id: string
  missionId: string
  frameId: string
  plotId: string
  agentType: DiseaseAgentType
  severity: SeverityLevel
  bbox: BoundingBox
  confidence: number
}

// 害虫识别结果用于场景2数量趋势和密度分析。
export interface PestDetection {
  id: string
  missionId: string
  frameId: string
  plotId: string
  pestType: string
  count: number
  density: number
  bbox: BoundingBox
  confidence: number
}

// 告警事件用于右侧实时告警流与地图联动定位。
export interface AlertEvent {
  id: string
  scene: SceneType
  plotId: string
  level: AlertLevel
  title: string
  description: string
  suggestedAction: string
  occurredAt: string
}

// 场景看板 KPI 用于顶部关键指标展示。
export interface DashboardKpi {
  key: string
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
}

// 场景建议项用于右侧处置建议列表。
export interface SuggestionItem {
  id: string
  title: string
  priority: '高' | '中' | '低'
  description: string
}

// 高风险区域项用于场景详情列表与报告输出。
export interface HotAreaItem {
  plotId: string
  plotName: string
  score: number
  issue: string
}

// 病害场景的看板数据结构。
export interface DiseaseDashboardData {
  scene: 'disease'
  kpis: DashboardKpi[]
  mapCells: GeoGridCell[]
  agentDistribution: Array<{ name: string; value: number }>
  severityDistribution: Array<{ name: string; value: number }>
  hotAreas: HotAreaItem[]
  suggestions: SuggestionItem[]
}

// 虫害场景的看板数据结构。
export interface PestDashboardData {
  scene: 'pest'
  kpis: DashboardKpi[]
  mapCells: GeoGridCell[]
  pestDistribution: Array<{ name: string; value: number }>
  densityTrend: Array<{ time: string; value: number }>
  hotAreas: HotAreaItem[]
  suggestions: SuggestionItem[]
}

// 报告结构用于抽屉展示和导出。
export interface AnalysisReport {
  id: string
  scene: SceneType
  generatedAt: string
  summary: string
  topAreas: HotAreaItem[]
  measures: string[]
}
