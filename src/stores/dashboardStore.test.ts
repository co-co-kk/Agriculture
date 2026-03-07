// 该文件用于验证看板状态管理的核心行为。
import { beforeEach, describe, expect, it } from 'vitest'
import { useDashboardStore } from '@/stores/dashboardStore'

// 在每个用例前重置状态，确保测试相互独立。
beforeEach(() => {
  useDashboardStore.setState({
    scene: 'disease',
    filter: {},
    selectedPlotId: null,
    selectedMissionId: null,
    frameIndex: 0,
    isPlaying: false,
    reportOpen: false,
  })
})

describe('dashboardStore', () => {
  it('切换场景时应重置筛选与播放状态', () => {
    useDashboardStore.getState().setFilter({ severity: '重度', agentType: 'fungus' })
    useDashboardStore.getState().setSelectedMissionId('disease-mission-01')
    useDashboardStore.getState().togglePlaying()

    useDashboardStore.getState().setScene('pest')
    const state = useDashboardStore.getState()

    expect(state.scene).toBe('pest')
    expect(state.filter).toEqual({})
    expect(state.selectedMissionId).toBeNull()
    expect(state.isPlaying).toBe(false)
  })

  it('设置任务时应重置帧索引', () => {
    useDashboardStore.setState({ frameIndex: 12 })
    useDashboardStore.getState().setSelectedMissionId('disease-mission-03')

    const state = useDashboardStore.getState()
    expect(state.selectedMissionId).toBe('disease-mission-03')
    expect(state.frameIndex).toBe(0)
  })
})
