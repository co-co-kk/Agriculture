// 该文件定义看板全局状态，统一管理场景、筛选和播放控制。
import { create } from 'zustand'
import type { SceneType, SeverityLevel } from '@/types/domain'

// 定义筛选器结构，便于场景切换时做局部重置。
interface DashboardFilter {
  severity?: SeverityLevel
  agentType?: string
  pestType?: string
}

// 定义看板状态与操作，减少组件间 props 传递。
interface DashboardState {
  scene: SceneType
  filter: DashboardFilter
  selectedPlotId: string | null
  selectedMissionId: string | null
  frameIndex: number
  isPlaying: boolean
  reportOpen: boolean
  setScene: (scene: SceneType) => void
  setFilter: (patch: Partial<DashboardFilter>) => void
  setSelectedPlotId: (plotId: string | null) => void
  setSelectedMissionId: (missionId: string | null) => void
  setFrameIndex: (index: number) => void
  togglePlaying: () => void
  setReportOpen: (open: boolean) => void
}

// 导出全局 store，保证页面联动状态集中管理。
export const useDashboardStore = create<DashboardState>((set, get) => ({
  scene: 'disease',
  filter: {},
  selectedPlotId: null,
  selectedMissionId: null,
  frameIndex: 0,
  isPlaying: false,
  reportOpen: false,
  setScene: (scene) => {
    // 切换场景时重置任务与帧索引，避免跨场景脏状态。
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
  setSelectedPlotId: (selectedPlotId) => set({ selectedPlotId }),
  setSelectedMissionId: (selectedMissionId) => set({ selectedMissionId, frameIndex: 0 }),
  setFrameIndex: (frameIndex) => set({ frameIndex: Math.max(frameIndex, 0) }),
  togglePlaying: () => set({ isPlaying: !get().isPlaying }),
  setReportOpen: (reportOpen) => set({ reportOpen }),
}))
