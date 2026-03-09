// 该文件定义数据中心任务流与快照管理类型。
import type { SceneType } from '@/types/domain'

// 数据采集任务状态机，用于闭环跟踪。
export type IngestionJobStatus =
  | 'collecting'
  | 'ready_to_parse'
  | 'parsing'
  | 'analyzed'
  | 'active'
  | 'failed'

// 甲方外部数据源配置项。
export interface IngestionSource {
  id: string
  name: string
  provider: string
  endpoint: string
  description: string
}

// 数据采集与解析任务记录。
export interface IngestionJob {
  id: string
  sourceId: string
  sourceName: string
  status: IngestionJobStatus
  createdAt: string
  updatedAt: string
  snapshotId: string | null
  message?: string
}

// 看板快照元信息，用于历史回看与版本切换。
export interface AnalysisSnapshot {
  id: string
  date: string
  sourceId: string
  sourceName: string
  jobId: string
  createdAt: string
  active: boolean
}

// 快照版本简化视图，用于下拉框展示。
export interface SnapshotVersion {
  id: string
  label: string
  createdAt: string
  active: boolean
}

// 对比模式选择状态。
export interface ComparisonSelection {
  enabled: boolean
  leftSnapshotId: string | null
  rightSnapshotId: string | null
}

// 快照对比指标项。
export interface SnapshotCompareMetric {
  label: string
  leftValue: string
  rightValue: string
  delta: string
}

// 快照对比结果。
export interface SnapshotCompareResult {
  scene: SceneType
  leftSnapshotId: string
  rightSnapshotId: string
  metrics: SnapshotCompareMetric[]
  summary: string
}
