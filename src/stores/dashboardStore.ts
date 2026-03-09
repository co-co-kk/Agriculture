// 该文件定义看板全局状态，统一管理场景、筛选、快照和对比控制。
import { create } from 'zustand'
import type { ComparisonSelection } from '@/types/dataCenter'
import type { SceneType, SeverityLevel } from '@/types/domain'

interface DashboardFilter {
  severity?: SeverityLevel
  agentType?: string
  pestType?: string
  deficiencyType?: string
  weedType?: string
}

interface DashboardState {
  scene: SceneType
  filter: DashboardFilter
  snapshotId: string | null
  comparison: ComparisonSelection
  selectedPlotId: string | null
  selectedMissionId: string | null
  frameIndex: number
  isPlaying: boolean
  reportOpen: boolean
  setScene: (scene: SceneType) => void
  setFilter: (patch: Partial<DashboardFilter>) => void
  setSnapshotId: (snapshotId: string | null) => void
  setComparisonEnabled: (enabled: boolean) => void
  setComparisonLeftSnapshotId: (snapshotId: string | null) => void
  setComparisonRightSnapshotId: (snapshotId: string | null) => void
  setSelectedPlotId: (plotId: string | null) => void
  setSelectedMissionId: (missionId: string | null) => void
  setFrameIndex: (index: number) => void
  togglePlaying: () => void
  setReportOpen: (open: boolean) => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  scene: 'disease',
  filter: {},
  snapshotId: null,
  comparison: {
    enabled: false,
    leftSnapshotId: null,
    rightSnapshotId: null,
  },
  selectedPlotId: null,
  selectedMissionId: null,
  frameIndex: 0,
  isPlaying: false,
  reportOpen: false,
  setScene: (scene) => {
    set({
      scene,
      filter: {},
      selectedMissionId: null,
      selectedPlotId: null,
      frameIndex: 0,
      isPlaying: false,
    })
  },
  setFilter: (patch) => set({ filter: { ...get().filter, ...patch } }),
  setSnapshotId: (snapshotId) =>
    set({
      snapshotId,
      selectedMissionId: null,
      selectedPlotId: null,
      frameIndex: 0,
      isPlaying: false,
    }),
  setComparisonEnabled: (enabled) =>
    set((state) => ({
      comparison: {
        ...state.comparison,
        enabled,
      },
    })),
  setComparisonLeftSnapshotId: (snapshotId) =>
    set((state) => ({
      comparison: {
        ...state.comparison,
        leftSnapshotId: snapshotId,
      },
    })),
  setComparisonRightSnapshotId: (snapshotId) =>
    set((state) => ({
      comparison: {
        ...state.comparison,
        rightSnapshotId: snapshotId,
      },
    })),
  setSelectedPlotId: (selectedPlotId) => set({ selectedPlotId }),
  setSelectedMissionId: (selectedMissionId) => set({ selectedMissionId, frameIndex: 0 }),
  setFrameIndex: (frameIndex) => set({ frameIndex: Math.max(frameIndex, 0) }),
  togglePlaying: () => set({ isPlaying: !get().isPlaying }),
  setReportOpen: (reportOpen) => set({ reportOpen }),
}))
