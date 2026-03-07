// 该文件实现时间轴自动播放逻辑，驱动无人机帧回放体验。
import { useEffect } from 'react'
import type { DroneMission } from '@/types/domain'
import { useDashboardStore } from '@/stores/dashboardStore'

// 导出回放控制 Hook，根据播放状态自动推进帧索引。
export const usePlayback = (mission: DroneMission | undefined): void => {
  const isPlaying = useDashboardStore((state) => state.isPlaying)
  const frameIndex = useDashboardStore((state) => state.frameIndex)
  const setFrameIndex = useDashboardStore((state) => state.setFrameIndex)
  const togglePlaying = useDashboardStore((state) => state.togglePlaying)

  useEffect(() => {
    if (!isPlaying || !mission) {
      return
    }

    // 以 500ms 频率推进帧，模拟无人机巡检过程。
    const timer = window.setInterval(() => {
      const next = frameIndex + 1
      if (next >= mission.frames.length) {
        togglePlaying()
        return
      }
      setFrameIndex(next)
    }, 500)

    return () => window.clearInterval(timer)
  }, [isPlaying, mission, frameIndex, setFrameIndex, togglePlaying])
}
