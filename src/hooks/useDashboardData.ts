// 该文件封装看板数据请求逻辑，统一处理查询参数和依赖关系。
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchAlerts,
  fetchDashboard,
  fetchDetections,
  fetchFarm,
  fetchMissions,
  fetchReport,
} from '@/services/api'
import { useDashboardStore } from '@/stores/dashboardStore'

// 导出复合数据 Hook，供页面一处读取所有展示数据。
export const useDashboardData = () => {
  const scene = useDashboardStore((state) => state.scene)
  const filter = useDashboardStore((state) => state.filter)
  const selectedMissionId = useDashboardStore((state) => state.selectedMissionId)
  const frameIndex = useDashboardStore((state) => state.frameIndex)

  const farmQuery = useQuery({
    queryKey: ['farm'],
    queryFn: fetchFarm,
    staleTime: 300_000,
  })

  // 先查询任务列表，再派生默认任务 ID。
  const missionQuery = useQuery({
    queryKey: ['missions', scene],
    queryFn: () => fetchMissions(scene),
  })

  const missionId = selectedMissionId ?? missionQuery.data?.missions[0]?.id ?? ''

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', scene, filter],
    queryFn: () =>
      fetchDashboard({
        scene,
        agentType: filter.agentType,
        severity: filter.severity,
        pestType: filter.pestType,
      }),
  })

  const detectionQuery = useQuery({
    queryKey: ['detections', scene, missionId, frameIndex, filter],
    queryFn: () =>
      fetchDetections({
        scene,
        missionId,
        frameIndex,
        agentType: filter.agentType,
        severity: filter.severity,
        pestType: filter.pestType,
      }),
    enabled: missionId.length > 0,
  })

  const alertQuery = useQuery({
    queryKey: ['alerts', scene],
    queryFn: () => fetchAlerts(scene),
  })

  const reportQuery = useQuery({
    queryKey: ['report', scene],
    queryFn: () => fetchReport(scene),
  })

  // 输出统一状态，简化页面层组合逻辑。
  return useMemo(
    () => ({
      scene,
      missionId,
      filter,
      farm: farmQuery.data?.farm,
      plots: farmQuery.data?.plots ?? [],
      missions: missionQuery.data?.missions ?? [],
      dashboard: dashboardQuery.data,
      detections: detectionQuery.data,
      alerts: alertQuery.data?.alerts ?? [],
      report: reportQuery.data?.report,
      isLoading:
        farmQuery.isLoading ||
        missionQuery.isLoading ||
        dashboardQuery.isLoading ||
        detectionQuery.isLoading ||
        alertQuery.isLoading ||
        reportQuery.isLoading,
      isError:
        farmQuery.isError ||
        missionQuery.isError ||
        dashboardQuery.isError ||
        detectionQuery.isError ||
        alertQuery.isError ||
        reportQuery.isError,
      refetchAll: async () => {
        await Promise.all([
          farmQuery.refetch(),
          missionQuery.refetch(),
          dashboardQuery.refetch(),
          detectionQuery.refetch(),
          alertQuery.refetch(),
          reportQuery.refetch(),
        ])
      },
    }),
    [
      scene,
      missionId,
      filter,
      farmQuery,
      missionQuery,
      dashboardQuery,
      detectionQuery,
      alertQuery,
      reportQuery,
    ],
  )
}
