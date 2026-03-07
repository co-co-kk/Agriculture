// 该文件定义接口层响应类型，保证前端请求和 mock 返回结构一致。
import type {
  AlertEvent,
  AnalysisReport,
  DiseaseDashboardData,
  DiseaseDetection,
  DroneMission,
  Farm,
  MissionFrame,
  PestDashboardData,
  PestDetection,
  Plot,
  SceneType,
} from '@/types/domain'

// 看板接口返回类型根据场景自动收敛。
export type DashboardResponse = DiseaseDashboardData | PestDashboardData

// 农场基础接口结构，提供地块和农场元信息。
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
}

// 任务接口返回当前场景下的任务集合。
export interface MissionResponse {
  scene: SceneType
  missions: DroneMission[]
}

// 告警接口返回当前场景下的告警流。
export interface AlertResponse {
  scene: SceneType
  alerts: AlertEvent[]
}

// 报告接口返回场景最新分析报告。
export interface ReportResponse {
  scene: SceneType
  report: AnalysisReport
}
