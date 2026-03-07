// 该文件作为统一看板页面入口，负责组装各布局组件与联动逻辑。
import { useEffect, useMemo } from 'react'
import { ReportDrawer } from '@/components/common/ReportDrawer'
import { EmptyState } from '@/components/common/EmptyState'
import { HeaderBar } from '@/components/layout/HeaderBar'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { MapPanel } from '@/components/layout/MapPanel'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { TimelineBar } from '@/components/layout/TimelineBar'
import { useDashboardData } from '@/hooks/useDashboardData'
import { usePlayback } from '@/hooks/usePlayback'
import { useDashboardStore } from '@/stores/dashboardStore'

// 导出看板页面组件，承载全部场景 DOM 结构。
export const DashboardPage = (): JSX.Element => {
  const scene = useDashboardStore((state) => state.scene)
  const filter = useDashboardStore((state) => state.filter)
  const selectedPlotId = useDashboardStore((state) => state.selectedPlotId)
  const selectedMissionId = useDashboardStore((state) => state.selectedMissionId)
  const frameIndex = useDashboardStore((state) => state.frameIndex)
  const isPlaying = useDashboardStore((state) => state.isPlaying)
  const reportOpen = useDashboardStore((state) => state.reportOpen)

  const setScene = useDashboardStore((state) => state.setScene)
  const setFilter = useDashboardStore((state) => state.setFilter)
  const setSelectedPlotId = useDashboardStore((state) => state.setSelectedPlotId)
  const setSelectedMissionId = useDashboardStore((state) => state.setSelectedMissionId)
  const setFrameIndex = useDashboardStore((state) => state.setFrameIndex)
  const togglePlaying = useDashboardStore((state) => state.togglePlaying)
  const setReportOpen = useDashboardStore((state) => state.setReportOpen)

  const data = useDashboardData()

  // 选择当前任务对象，供地图轨迹和回放组件共享。
  const currentMission = useMemo(
    () => data.missions.find((item) => item.id === data.missionId) ?? data.missions[0],
    [data.missions, data.missionId],
  )

  // 初次加载或场景切换后自动选中首个任务。
  useEffect(() => {
    if (!selectedMissionId && data.missions[0]) {
      setSelectedMissionId(data.missions[0].id)
    }
  }, [selectedMissionId, data.missions, setSelectedMissionId])

  // 启用时间轴自动播放逻辑。
  usePlayback(currentMission)

  const mapCells = data.dashboard?.mapCells ?? []
  const hotAreas = data.dashboard?.hotAreas ?? []
  const suggestions = data.dashboard?.suggestions ?? []

  return (
    <main className="mx-auto max-w-[1700px] space-y-3 p-3 xl:p-4">
      <HeaderBar
        scene={scene}
        kpis={data.dashboard?.kpis ?? []}
        onSceneChange={setScene}
        onRefresh={() => void data.refetchAll()}
        onOpenReport={() => setReportOpen(true)}
      />

      {data.isError ? (
        <EmptyState title="数据加载失败" description="请检查 mock 服务状态后重试" />
      ) : null}

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* 左侧分析区 */}
        <LeftSidebar
          scene={scene}
          dashboard={data.dashboard}
          loading={data.isLoading}
          filter={filter}
          onFilterChange={setFilter}
        />

        {/* 中部地图与影像区 */}
        <MapPanel
          scene={scene}
          plots={data.plots}
          mapCells={mapCells}
          mission={currentMission}
          detections={data.detections}
          selectedPlotId={selectedPlotId}
          onSelectPlot={setSelectedPlotId}
        />

        {/* 右侧告警与建议区 */}
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
