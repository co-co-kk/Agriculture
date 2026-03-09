// 该文件封装看板数据请求逻辑，统一处理快照、筛选和联动依赖。
import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchAlerts,
  fetchCompareSnapshot,
  fetchDashboard,
  fetchDetections,
  fetchFarm,
  fetchMissions,
  fetchReport,
  listSnapshots,
} from '@/services/api'
import { useDashboardStore } from '@/stores/dashboardStore'

export const useDashboardData = () => {
  const scene = useDashboardStore((state) => state.scene)
  const filter = useDashboardStore((state) => state.filter)
  const snapshotId = useDashboardStore((state) => state.snapshotId)
  const comparison = useDashboardStore((state) => state.comparison)
  const selectedMissionId = useDashboardStore((state) => state.selectedMissionId)
  const frameIndex = useDashboardStore((state) => state.frameIndex)
  const setSnapshotId = useDashboardStore((state) => state.setSnapshotId)
  const setComparisonLeftSnapshotId = useDashboardStore((state) => state.setComparisonLeftSnapshotId)
  const setComparisonRightSnapshotId = useDashboardStore((state) => state.setComparisonRightSnapshotId)

  const snapshotQuery = useQuery({
    queryKey: ['snapshots'],
    queryFn: listSnapshots,
    staleTime: 30_000,
  })

  const activeSnapshotId = snapshotId ?? snapshotQuery.data?.currentSnapshotId ?? snapshotQuery.data?.snapshots[0]?.id ?? null

  useEffect(() => {
    if (!snapshotId && activeSnapshotId) {
      setSnapshotId(activeSnapshotId)
    }
  }, [snapshotId, activeSnapshotId, setSnapshotId])

  useEffect(() => {
    const list = snapshotQuery.data?.snapshots ?? []
    if (list.length < 2) {
      return
    }
    if (!comparison.leftSnapshotId) {
      setComparisonLeftSnapshotId(list[0].id)
    }
    if (!comparison.rightSnapshotId) {
      setComparisonRightSnapshotId(list[1].id)
    }
  }, [
    snapshotQuery.data?.snapshots,
    comparison.leftSnapshotId,
    comparison.rightSnapshotId,
    setComparisonLeftSnapshotId,
    setComparisonRightSnapshotId,
  ])

  const farmQuery = useQuery({
    queryKey: ['farm'],
    queryFn: fetchFarm,
    staleTime: 300_000,
  })

  const missionQuery = useQuery({
    queryKey: ['missions', scene, activeSnapshotId],
    queryFn: () => fetchMissions(scene, activeSnapshotId),
    enabled: Boolean(activeSnapshotId),
  })

  const missionId = selectedMissionId ?? missionQuery.data?.missions[0]?.id ?? ''

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', scene, activeSnapshotId, filter],
    queryFn: () =>
      fetchDashboard({
        scene,
        snapshotId: activeSnapshotId,
        agentType: filter.agentType,
        severity: filter.severity,
        pestType: filter.pestType,
        deficiencyType: filter.deficiencyType,
        weedType: filter.weedType,
      }),
    enabled: Boolean(activeSnapshotId),
  })

  const detectionQuery = useQuery({
    queryKey: ['detections', scene, activeSnapshotId, missionId, frameIndex, filter],
    queryFn: () =>
      fetchDetections({
        scene,
        snapshotId: activeSnapshotId,
        missionId,
        frameIndex,
        agentType: filter.agentType,
        severity: filter.severity,
        pestType: filter.pestType,
        deficiencyType: filter.deficiencyType,
        weedType: filter.weedType,
      }),
    enabled: Boolean(activeSnapshotId) && missionId.length > 0,
  })

  const alertQuery = useQuery({
    queryKey: ['alerts', scene, activeSnapshotId],
    queryFn: () => fetchAlerts(scene, activeSnapshotId),
    enabled: Boolean(activeSnapshotId),
  })

  const reportQuery = useQuery({
    queryKey: ['report', scene, activeSnapshotId],
    queryFn: () => fetchReport(scene, activeSnapshotId),
    enabled: Boolean(activeSnapshotId),
  })

  const compareQuery = useQuery({
    queryKey: ['snapshot-compare', scene, comparison.leftSnapshotId, comparison.rightSnapshotId],
    queryFn: () =>
      fetchCompareSnapshot(
        comparison.leftSnapshotId ?? '',
        comparison.rightSnapshotId ?? '',
        scene,
      ),
    enabled: comparison.enabled && Boolean(comparison.leftSnapshotId && comparison.rightSnapshotId),
  })

  return useMemo(
    () => ({
      scene,
      snapshotId: activeSnapshotId,
      missionId,
      filter,
      snapshots: snapshotQuery.data?.snapshots ?? [],
      farm: farmQuery.data?.farm,
      plots: farmQuery.data?.plots ?? [],
      missions: missionQuery.data?.missions ?? [],
      dashboard: dashboardQuery.data,
      detections: detectionQuery.data,
      alerts: alertQuery.data?.alerts ?? [],
      report: reportQuery.data?.report,
      compareResult: compareQuery.data?.result,
      isLoading:
        snapshotQuery.isLoading ||
        farmQuery.isLoading ||
        missionQuery.isLoading ||
        dashboardQuery.isLoading ||
        detectionQuery.isLoading ||
        alertQuery.isLoading ||
        reportQuery.isLoading,
      isError:
        snapshotQuery.isError ||
        farmQuery.isError ||
        missionQuery.isError ||
        dashboardQuery.isError ||
        detectionQuery.isError ||
        alertQuery.isError ||
        reportQuery.isError,
      refetchAll: async () => {
        await Promise.all([
          snapshotQuery.refetch(),
          farmQuery.refetch(),
          missionQuery.refetch(),
          dashboardQuery.refetch(),
          detectionQuery.refetch(),
          alertQuery.refetch(),
          reportQuery.refetch(),
          compareQuery.refetch(),
        ])
      },
    }),
    [
      scene,
      activeSnapshotId,
      missionId,
      filter,
      snapshotQuery,
      farmQuery,
      missionQuery,
      dashboardQuery,
      detectionQuery,
      alertQuery,
      reportQuery,
      compareQuery,
    ],
  )
}
