// 该文件提供接口层查询函数，统一处理筛选与联动数据。
import { dataset } from '@/mocks/data/dataset'
import { buildDiseaseDashboard, buildPestDashboard } from '@/mocks/data/dashboardSelectors'
import type {
  AlertEvent,
  AnalysisReport,
  DiseaseDetection,
  DroneMission,
  MissionFrame,
  PestDetection,
  SceneType,
  SeverityLevel,
} from '@/types/domain'

// 查询场景看板数据，自动按场景路由到对应构建器。
export const queryDashboard = (params: {
  scene: SceneType
  agentType?: string
  severity?: SeverityLevel
  pestType?: string
}) => {
  if (params.scene === 'disease') {
    return buildDiseaseDashboard({
      agentType: params.agentType,
      severity: params.severity,
    })
  }
  return buildPestDashboard({ pestType: params.pestType })
}

// 查询当前场景任务列表，供时间轴与任务下拉复用。
export const queryMissions = (scene: SceneType): DroneMission[] => {
  return dataset.missions[scene]
}

// 查询当前场景告警流，按时间倒序返回。
export const queryAlerts = (scene: SceneType): AlertEvent[] => {
  return dataset.alerts[scene]
}

// 查询当前场景报告，用于右侧抽屉展示与导出。
export const queryReport = (scene: SceneType): AnalysisReport => {
  return dataset.reports[scene]
}

// 根据任务与帧索引查找具体影像帧。
const findFrame = (missionId: string, frameIndex: number): MissionFrame | null => {
  const mission = [...dataset.missions.disease, ...dataset.missions.pest].find((item) => item.id === missionId)
  if (!mission) {
    return null
  }
  return mission.frames[frameIndex] ?? mission.frames[0] ?? null
}

// 按帧筛选病害检测结果并应用筛选条件。
const filterDiseaseDetections = (
  frameId: string,
  missionId: string,
  agentType?: string,
  severity?: SeverityLevel,
): DiseaseDetection[] => {
  return dataset.detections.disease.filter((item) => {
    const passFrame = item.frameId === frameId && item.missionId === missionId
    const passAgent = agentType ? item.agentType === agentType : true
    const passSeverity = severity ? item.severity === severity : true
    return passFrame && passAgent && passSeverity
  })
}

// 按帧筛选虫害检测结果并应用虫种筛选。
const filterPestDetections = (frameId: string, missionId: string, pestType?: string): PestDetection[] => {
  return dataset.detections.pest.filter((item) => {
    const passFrame = item.frameId === frameId && item.missionId === missionId
    const passType = pestType ? item.pestType === pestType : true
    return passFrame && passType
  })
}

// 查询当前帧识别明细，供中部影像预览与标注层渲染。
export const queryDetectionsByFrame = (params: {
  scene: SceneType
  missionId: string
  frameIndex: number
  agentType?: string
  severity?: SeverityLevel
  pestType?: string
}) => {
  const frame = findFrame(params.missionId, params.frameIndex)
  if (!frame) {
    return {
      frame: null,
      diseaseDetections: [],
      pestDetections: [],
    }
  }

  return {
    frame,
    diseaseDetections:
      params.scene === 'disease'
        ? filterDiseaseDetections(frame.id, params.missionId, params.agentType, params.severity)
        : [],
    pestDetections: params.scene === 'pest' ? filterPestDetections(frame.id, params.missionId, params.pestType) : [],
  }
}
