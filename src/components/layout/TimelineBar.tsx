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
    <section className="panel-border rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95 p-4 shadow-[0_0_24px_rgba(15,23,42,0.8)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-300">
            当前任务
            <select
              value={mission?.id ?? ''}
              onChange={(event) => onMissionChange(event.target.value)}
              className="ml-2 rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-xs text-slate-50 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
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
            className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-colors hover:bg-emerald-500"
          >
            {isPlaying ? '暂停回放' : '开始回放'}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          帧进度：{Math.min(frameIndex + 1, totalFrames)} / {totalFrames}
        </p>
      </div>

      {/* 自定义样式的 range 输入，突出播放轨迹 */}
      <input
        type="range"
        min={0}
        max={Math.max(totalFrames - 1, 0)}
        value={Math.min(frameIndex, totalFrames - 1)}
        onChange={(event) => onFrameChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800/80 [accent-color:#34d399]"
      />
    </section>
  )
}
