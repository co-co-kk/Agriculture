// 该文件定义底部时间轴组件，支持任务切换和帧回放控制。
import type { DroneMission } from '@/types/domain'

interface TimelineBarProps {
  missions: DroneMission[]
  selectedMissionId: string | null
  frameIndex: number
  isPlaying: boolean
  onMissionChange: (missionId: string) => void
  onFrameChange: (frameIndex: number) => void
  onTogglePlaying: () => void
}

// 导出时间轴组件，统一管理任务和帧播放交互。
export const TimelineBar = ({
  missions,
  selectedMissionId,
  frameIndex,
  isPlaying,
  onMissionChange,
  onFrameChange,
  onTogglePlaying,
}: TimelineBarProps): JSX.Element => {
  const mission = missions.find((item) => item.id === selectedMissionId) ?? missions[0]
  const totalFrames = mission?.frames.length ?? 1

  return (
    <section className="panel-border rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-slate-600">
            当前任务
            <select
              value={mission?.id ?? ''}
              onChange={(event) => onMissionChange(event.target.value)}
              className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
            >
              {missions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onTogglePlaying}
            className="rounded-lg bg-cyan-700 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-800"
          >
            {isPlaying ? '暂停回放' : '开始回放'}
          </button>
        </div>

        <p className="text-xs text-slate-500">
          帧进度：{Math.min(frameIndex + 1, totalFrames)} / {totalFrames}
        </p>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(totalFrames - 1, 0)}
        value={Math.min(frameIndex, totalFrames - 1)}
        onChange={(event) => onFrameChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
      />
    </section>
  )
}
