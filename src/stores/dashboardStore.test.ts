// 该文件用于验证看板状态管理核心行为。
import { beforeEach, describe, expect, it } from 'vitest'
import { useDashboardStore } from '@/stores/dashboardStore'

beforeEach(() => {
  useDashboardStore.setState({
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

  it('设置快照时应重置任务与帧索引', () => {
    useDashboardStore.setState({ frameIndex: 9, selectedMissionId: 'disease-mission-03' })
    useDashboardStore.getState().setSnapshotId('snapshot-x')

    const state = useDashboardStore.getState()
    expect(state.snapshotId).toBe('snapshot-x')
    expect(state.selectedMissionId).toBeNull()
    expect(state.frameIndex).toBe(0)
  })
})
