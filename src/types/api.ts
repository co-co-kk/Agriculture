// 该文件定义接口层响应类型，保证请求与 mock 返回结构一致。
import type {
  AlertEvent,
  AnalysisReport,
  DiseaseDashboardData,
  DiseaseDetection,
  DroneMission,
  Farm,
  MissionFrame,
  NutrientDashboardData,
  NutrientDetection,
  PestDashboardData,
  PestDetection,
  Plot,
  WeedDashboardData,
  WeedDetection,
  SceneType,
} from '@/types/domain'
import type {
  AnalysisSnapshot,
  IngestionJob,
  IngestionSource,
  SnapshotCompareResult,
} from '@/types/dataCenter'

// 看板接口返回类型根据场景自动收敛。
export type DashboardResponse =
  | DiseaseDashboardData
  | PestDashboardData
  | NutrientDashboardData
  | WeedDashboardData

// 农场基础接口结构。
export interface FarmResponse {
  farm: Farm
  plots: Plot[]
}

// 当前帧识别返回结构用于影像详情卡片。
export interface DetectionResponse {
  scene: SceneType
  frame: MissionFrame | null
  diseaseDetections: DiseaseDetection[]
  pestDetections: PestDetection[]
  nutrientDetections: NutrientDetection[]
  weedDetections: WeedDetection[]
}

// 任务接口返回当前场景任务集合。
export interface MissionResponse {
  scene: SceneType
  missions: DroneMission[]
}

// 告警接口返回当前场景告警流。
export interface AlertResponse {
  scene: SceneType
  alerts: AlertEvent[]
}

// 报告接口返回场景最新分析报告。
export interface ReportResponse {
  scene: SceneType
  report: AnalysisReport
}

// 数据源列表响应。
export interface SourcesResponse {
  sources: IngestionSource[]
}

// 数据采集任务列表响应。
export interface IngestionJobsResponse {
  jobs: IngestionJob[]
}

// 触发采集任务响应。
export interface CreateIngestionJobResponse {
  job: IngestionJob
}

// 触发解析任务响应。
export interface StartAnalysisResponse {
  job: IngestionJob
  snapshot: AnalysisSnapshot
}

// 快照列表响应。
export interface SnapshotsResponse {
  snapshots: AnalysisSnapshot[]
  currentSnapshotId: string | null
}

// 设为当前快照响应。
export interface SetCurrentSnapshotResponse {
  currentSnapshotId: string
}

// 快照对比接口响应。
export interface SnapshotCompareResponse {
  result: SnapshotCompareResult
}
