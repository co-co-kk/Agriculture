// 该文件封装前端请求函数，屏蔽组件对接口细节的直接依赖。
import type {
  AlertResponse,
  CreateIngestionJobResponse,
  DashboardResponse,
  DetectionResponse,
  FarmResponse,
  IngestionJobsResponse,
  MissionResponse,
  ReportResponse,
  SetCurrentSnapshotResponse,
  SnapshotCompareResponse,
  SnapshotsResponse,
  SourcesResponse,
  StartAnalysisResponse,
} from '@/types/api'
import type { SceneType, SeverityLevel } from '@/types/domain'

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`)
  }
  return (await response.json()) as T
}

export const fetchFarm = async (): Promise<FarmResponse> => {
  return requestJson<FarmResponse>('/api/farm')
}

export const fetchDashboard = async (params: {
  scene: SceneType
  snapshotId: string | null
  agentType?: string
  severity?: SeverityLevel
  pestType?: string
  deficiencyType?: string
  weedType?: string
}): Promise<DashboardResponse> => {
  const query = new URLSearchParams({ scene: params.scene })
  if (params.snapshotId) query.set('snapshotId', params.snapshotId)
  if (params.agentType) query.set('agentType', params.agentType)
  if (params.severity) query.set('severity', params.severity)
  if (params.pestType) query.set('pestType', params.pestType)
  if (params.deficiencyType) query.set('deficiencyType', params.deficiencyType)
  if (params.weedType) query.set('weedType', params.weedType)
  return requestJson<DashboardResponse>(`/api/dashboard?${query.toString()}`)
}

export const fetchMissions = async (scene: SceneType, snapshotId: string | null): Promise<MissionResponse> => {
  const query = new URLSearchParams({ scene })
  if (snapshotId) query.set('snapshotId', snapshotId)
  return requestJson<MissionResponse>(`/api/missions?${query.toString()}`)
}

export const fetchDetections = async (params: {
  scene: SceneType
  snapshotId: string | null
  missionId: string
  frameIndex: number
  agentType?: string
  severity?: SeverityLevel
  pestType?: string
  deficiencyType?: string
  weedType?: string
}): Promise<DetectionResponse> => {
  const query = new URLSearchParams({
    scene: params.scene,
    missionId: params.missionId,
    frameIndex: String(params.frameIndex),
  })
  if (params.snapshotId) query.set('snapshotId', params.snapshotId)
  if (params.agentType) query.set('agentType', params.agentType)
  if (params.severity) query.set('severity', params.severity)
  if (params.pestType) query.set('pestType', params.pestType)
  if (params.deficiencyType) query.set('deficiencyType', params.deficiencyType)
  if (params.weedType) query.set('weedType', params.weedType)
  return requestJson<DetectionResponse>(`/api/detections?${query.toString()}`)
}

export const fetchAlerts = async (scene: SceneType, snapshotId: string | null): Promise<AlertResponse> => {
  const query = new URLSearchParams({ scene })
  if (snapshotId) query.set('snapshotId', snapshotId)
  return requestJson<AlertResponse>(`/api/alerts?${query.toString()}`)
}

export const fetchReport = async (scene: SceneType, snapshotId: string | null): Promise<ReportResponse> => {
  const query = new URLSearchParams({ scene })
  if (snapshotId) query.set('snapshotId', snapshotId)
  return requestJson<ReportResponse>(`/api/reports?${query.toString()}`)
}

export const fetchSources = async (): Promise<SourcesResponse> => {
  return requestJson<SourcesResponse>('/api/sources')
}

export const listJobs = async (): Promise<IngestionJobsResponse> => {
  return requestJson<IngestionJobsResponse>('/api/ingestion/jobs')
}

export const createIngestionJob = async (sourceId: string): Promise<CreateIngestionJobResponse> => {
  return requestJson<CreateIngestionJobResponse>('/api/ingestion/jobs', {
    method: 'POST',
    body: JSON.stringify({ sourceId }),
  })
}

export const startAnalysis = async (jobId: string): Promise<StartAnalysisResponse> => {
  return requestJson<StartAnalysisResponse>(`/api/analysis/jobs/${jobId}/start`, {
    method: 'POST',
  })
}

export const listSnapshots = async (): Promise<SnapshotsResponse> => {
  return requestJson<SnapshotsResponse>('/api/snapshots')
}

export const setCurrentSnapshot = async (snapshotId: string): Promise<SetCurrentSnapshotResponse> => {
  return requestJson<SetCurrentSnapshotResponse>(`/api/snapshots/${snapshotId}/set-current`, {
    method: 'POST',
  })
}

export const fetchCompareSnapshot = async (
  leftSnapshotId: string,
  rightSnapshotId: string,
  scene: SceneType,
): Promise<SnapshotCompareResponse> => {
  const query = new URLSearchParams({
    leftSnapshotId,
    rightSnapshotId,
    scene,
  })
  return requestJson<SnapshotCompareResponse>(`/api/snapshots/compare?${query.toString()}`)
}
