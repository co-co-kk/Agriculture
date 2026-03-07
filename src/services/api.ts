// 该文件封装前端请求函数，屏蔽组件对接口细节的直接依赖。
import type {
  AlertResponse,
  DashboardResponse,
  DetectionResponse,
  FarmResponse,
  MissionResponse,
  ReportResponse,
} from '@/types/api'
import type { SceneType, SeverityLevel } from '@/types/domain'

// 通用 JSON 请求函数，负责错误处理与类型收敛。
const requestJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`)
  }
  return (await response.json()) as T
}

// 获取农场基础信息与地块边界。
export const fetchFarm = async (): Promise<FarmResponse> => {
  return requestJson<FarmResponse>('/api/farm')
}

// 获取场景看板数据，支持病害/虫害筛选。
export const fetchDashboard = async (params: {
  scene: SceneType
  agentType?: string
  severity?: SeverityLevel
  pestType?: string
}): Promise<DashboardResponse> => {
  const query = new URLSearchParams({ scene: params.scene })
  if (params.agentType) query.set('agentType', params.agentType)
  if (params.severity) query.set('severity', params.severity)
  if (params.pestType) query.set('pestType', params.pestType)
  return requestJson<DashboardResponse>(`/api/dashboard?${query.toString()}`)
}

// 获取场景任务列表，用于任务下拉和时间轴数据。
export const fetchMissions = async (scene: SceneType): Promise<MissionResponse> => {
  return requestJson<MissionResponse>(`/api/missions?scene=${scene}`)
}

// 获取当前帧识别结果，用于影像检测框展示。
export const fetchDetections = async (params: {
  scene: SceneType
  missionId: string
  frameIndex: number
  agentType?: string
  severity?: SeverityLevel
  pestType?: string
}): Promise<DetectionResponse> => {
  const query = new URLSearchParams({
    scene: params.scene,
    missionId: params.missionId,
    frameIndex: String(params.frameIndex),
  })
  if (params.agentType) query.set('agentType', params.agentType)
  if (params.severity) query.set('severity', params.severity)
  if (params.pestType) query.set('pestType', params.pestType)

  return requestJson<DetectionResponse>(`/api/detections?${query.toString()}`)
}

// 获取场景告警流，用于右侧告警列表。
export const fetchAlerts = async (scene: SceneType): Promise<AlertResponse> => {
  return requestJson<AlertResponse>(`/api/alerts?scene=${scene}`)
}

// 获取场景报告数据，用于抽屉展示与导出。
export const fetchReport = async (scene: SceneType): Promise<ReportResponse> => {
  return requestJson<ReportResponse>(`/api/reports?scene=${scene}`)
}
