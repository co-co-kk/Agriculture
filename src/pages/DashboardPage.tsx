// 该文件作为统一看板页面入口，负责组装各布局组件与联动逻辑。
import { useEffect, useMemo } from 'react'
import { ReportDrawer } from '@/components/common/ReportDrawer'
import { EmptyState } from '@/components/common/EmptyState'
import { ComparePanel } from '@/components/layout/ComparePanel'
import { HeaderBar } from '@/components/layout/HeaderBar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { MapPanel } from '@/components/layout/MapPanel'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { TimelineBar } from '@/components/layout/TimelineBar'
import { useDashboardData } from '@/hooks/useDashboardData'
import { usePlayback } from '@/hooks/usePlayback'
import { useDashboardStore } from '@/stores/dashboardStore'

interface DashboardPageProps {
  onOpenDataCenter: () => void
}

export const DashboardPage = ({ onOpenDataCenter }: DashboardPageProps): JSX.Element => {
  const scene = useDashboardStore((state) => state.scene)
  const filter = useDashboardStore((state) => state.filter)
  const comparison = useDashboardStore((state) => state.comparison)
  const selectedPlotId = useDashboardStore((state) => state.selectedPlotId)
  const selectedMissionId = useDashboardStore((state) => state.selectedMissionId)
  const frameIndex = useDashboardStore((state) => state.frameIndex)
  const isPlaying = useDashboardStore((state) => state.isPlaying)
  const reportOpen = useDashboardStore((state) => state.reportOpen)

  const setScene = useDashboardStore((state) => state.setScene)
  const setFilter = useDashboardStore((state) => state.setFilter)
  const setSnapshotId = useDashboardStore((state) => state.setSnapshotId)
  const setComparisonEnabled = useDashboardStore((state) => state.setComparisonEnabled)
  const setComparisonLeftSnapshotId = useDashboardStore((state) => state.setComparisonLeftSnapshotId)
  const setComparisonRightSnapshotId = useDashboardStore((state) => state.setComparisonRightSnapshotId)
  const setSelectedPlotId = useDashboardStore((state) => state.setSelectedPlotId)
  const setSelectedMissionId = useDashboardStore((state) => state.setSelectedMissionId)
  const setFrameIndex = useDashboardStore((state) => state.setFrameIndex)
  const togglePlaying = useDashboardStore((state) => state.togglePlaying)
  const setReportOpen = useDashboardStore((state) => state.setReportOpen)

  const data = useDashboardData()

  const currentMission = useMemo(
    () => data.missions.find((item) => item.id === data.missionId) ?? data.missions[0],
    [data.missions, data.missionId],
  )

  useEffect(() => {
    if (!selectedMissionId && data.missions[0]) {
      setSelectedMissionId(data.missions[0].id)
    }
  }, [selectedMissionId, data.missions, setSelectedMissionId])

  usePlayback(currentMission)

  const mapCells = data.dashboard?.mapCells ?? []
  const hotAreas = data.dashboard?.hotAreas ?? []
  const suggestions = data.dashboard?.suggestions ?? []

  return (
    <main className="mx-auto max-w-[1700px] space-y-3 p-3 xl:p-4">
      <HeaderBar
        scene={scene}
        kpis={data.dashboard?.kpis ?? []}
        snapshots={data.snapshots}
        snapshotId={data.snapshotId}
        compareEnabled={comparison.enabled}
        compareLeftSnapshotId={comparison.leftSnapshotId}
        compareRightSnapshotId={comparison.rightSnapshotId}
        onSceneChange={setScene}
        onSnapshotChange={setSnapshotId}
        onCompareEnabledChange={setComparisonEnabled}
        onCompareLeftSnapshotChange={setComparisonLeftSnapshotId}
        onCompareRightSnapshotChange={setComparisonRightSnapshotId}
        onRefresh={() => void data.refetchAll()}
        onOpenReport={() => setReportOpen(true)}
        onOpenDataCenter={onOpenDataCenter}
      />

      {comparison.enabled ? <ComparePanel result={data.compareResult} /> : null}

      {data.isError ? <EmptyState title="数据加载失败" description="请检查 mock 服务状态后重试" /> : null}

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <LeftSidebar
          scene={scene}
          dashboard={data.dashboard}
          loading={data.isLoading}
          filter={filter}
          onFilterChange={setFilter}
        />

        <MapPanel
          scene={scene}
          plots={data.plots}
          mapCells={mapCells}
          mission={currentMission}
          detections={data.detections}
          selectedPlotId={selectedPlotId}
          onSelectPlot={setSelectedPlotId}
        />

        <RightSidebar
          alerts={data.alerts}
          hotAreas={hotAreas}
          suggestions={suggestions}
          selectedPlotId={selectedPlotId}
          onSelectPlot={setSelectedPlotId}
          onOpenReport={() => setReportOpen(true)}
        />
      </section>

      <TimelineBar
        missions={data.missions}
        selectedMissionId={selectedMissionId}
        frameIndex={frameIndex}
        isPlaying={isPlaying}
        onMissionChange={setSelectedMissionId}
        onFrameChange={setFrameIndex}
        onTogglePlaying={togglePlaying}
      />

      <ReportDrawer open={reportOpen} report={data.report} onClose={() => setReportOpen(false)} />
    </main>
  )
}
