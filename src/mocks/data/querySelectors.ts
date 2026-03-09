// 该文件提供接口层查询函数，统一处理场景筛选与快照查询。
import {
  createIngestionJob,
  getFarmData,
  listJobs,
  listSnapshots,
  listSources,
  queryAlertsBySnapshot,
  queryDashboardBySnapshot,
  queryDetectionsBySnapshot,
  queryReportBySnapshot,
  queryMissionsBySnapshot,
  querySnapshotCompare,
  setCurrentSnapshot,
  startAnalysis,
} from '@/mocks/data/snapshotStore'
import type { SceneType, SeverityLevel } from '@/types/domain'

// 查询农场基础信息。
export const queryFarm = () => {
  return getFarmData()
}

// 查询场景看板数据。
export const queryDashboard = (params: {
  scene: SceneType
  snapshotId: string | null
  agentType?: string
  severity?: SeverityLevel
  pestType?: string
  deficiencyType?: string
  weedType?: string
}) => {
  // 当前版本按快照聚合返回，筛选字段保留在 detections 查询层使用。
  return queryDashboardBySnapshot({
    scene: params.scene,
    snapshotId: params.snapshotId,
  })
}

// 查询场景任务列表。
export const queryMissions = (scene: SceneType, snapshotId: string | null) => {
  return queryMissionsBySnapshot(scene, snapshotId)
}

// 查询场景告警流。
export const queryAlerts = (scene: SceneType, snapshotId: string | null) => {
  return queryAlertsBySnapshot(scene, snapshotId)
}

// 查询场景报告。
export const queryReport = (scene: SceneType, snapshotId: string | null) => {
  return queryReportBySnapshot(scene, snapshotId)
}

// 查询当前帧识别结果。
export const queryDetectionsByFrame = (params: {
  scene: SceneType
  snapshotId: string | null
  missionId: string
  frameIndex: number
  agentType?: string
  severity?: SeverityLevel
  pestType?: string
  deficiencyType?: string
  weedType?: string
}) => {
  return queryDetectionsBySnapshot(params)
}

// 查询数据源列表。
export const querySources = () => {
  return listSources()
}

// 查询采集任务列表。
export const queryIngestionJobs = () => {
  return listJobs()
}

// 触发采集任务。
export const createJob = (sourceId: string) => {
  return createIngestionJob(sourceId)
}

// 触发解析任务。
export const analyzeJob = (jobId: string) => {
  return startAnalysis(jobId)
}

// 查询快照列表。
export const querySnapshots = () => {
  return listSnapshots()
}

// 设置当前快照。
export const updateCurrentSnapshot = (snapshotId: string) => {
  return setCurrentSnapshot(snapshotId)
}

// 查询双版本对比。
export const queryCompare = (leftSnapshotId: string, rightSnapshotId: string, scene: SceneType) => {
  return querySnapshotCompare({
    leftSnapshotId,
    rightSnapshotId,
    scene,
  })
}
