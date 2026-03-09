// 该文件定义顶部状态栏，包含场景切换、版本管理与全局操作按钮。
import { motion } from 'framer-motion'
import { KpiGrid } from '@/components/common/KpiGrid'
import { SceneToggle } from '@/components/common/SceneToggle'
import type { AnalysisSnapshot } from '@/types/dataCenter'
import type { DashboardKpi, SceneType } from '@/types/domain'

interface HeaderBarProps {
  scene: SceneType
  kpis: DashboardKpi[]
  snapshots: AnalysisSnapshot[]
  snapshotId: string | null
  compareEnabled: boolean
  compareLeftSnapshotId: string | null
  compareRightSnapshotId: string | null
  onSceneChange: (scene: SceneType) => void
  onSnapshotChange: (snapshotId: string | null) => void
  onCompareEnabledChange: (enabled: boolean) => void
  onCompareLeftSnapshotChange: (snapshotId: string | null) => void
  onCompareRightSnapshotChange: (snapshotId: string | null) => void
  onRefresh: () => void
  onOpenReport: () => void
  onOpenDataCenter: () => void
}

const snapshotLabel = (snapshot: AnalysisSnapshot): string => {
  return `${snapshot.date} · ${new Date(snapshot.createdAt).toLocaleTimeString()}`
}

export const HeaderBar = ({
  scene,
  kpis,
  snapshots,
  snapshotId,
  compareEnabled,
  compareLeftSnapshotId,
  compareRightSnapshotId,
  onSceneChange,
  onSnapshotChange,
  onCompareEnabledChange,
  onCompareLeftSnapshotChange,
  onCompareRightSnapshotChange,
  onRefresh,
  onOpenReport,
  onOpenDataCenter,
}: HeaderBarProps): JSX.Element => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel-border rounded-2xl bg-white/95 p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">农业AI无人机巡检作战平台</h1>
            <p className="mt-1 text-xs text-slate-500">作战日：{new Date().toLocaleString()} · 重点监测病虫害风险区域</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SceneToggle value={scene} onChange={onSceneChange} />
            <button
              type="button"
              onClick={onOpenDataCenter}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              数据中心
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-300"
            >
              刷新数据
            </button>
            <button
              type="button"
              onClick={onOpenReport}
              className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-800"
            >
              打开报告
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 xl:grid-cols-5">
          <label className="text-xs text-slate-600 xl:col-span-2">
            当前快照
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
              value={snapshotId ?? ''}
              onChange={(event) => onSnapshotChange(event.target.value || null)}
            >
              {snapshots.map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {snapshotLabel(snapshot)} {snapshot.active ? '（当前）' : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-600 xl:col-span-1 xl:self-end">
            <input
              type="checkbox"
              checked={compareEnabled}
              onChange={(event) => onCompareEnabledChange(event.target.checked)}
            />
            开启双版本对比
          </label>

          {compareEnabled ? (
            <>
              <label className="text-xs text-slate-600">
                左侧版本
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                  value={compareLeftSnapshotId ?? ''}
                  onChange={(event) => onCompareLeftSnapshotChange(event.target.value || null)}
                >
                  {snapshots.map((snapshot) => (
                    <option key={`left-${snapshot.id}`} value={snapshot.id}>
                      {snapshotLabel(snapshot)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-600">
                右侧版本
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                  value={compareRightSnapshotId ?? ''}
                  onChange={(event) => onCompareRightSnapshotChange(event.target.value || null)}
                >
                  {snapshots.map((snapshot) => (
                    <option key={`right-${snapshot.id}`} value={snapshot.id}>
                      {snapshotLabel(snapshot)}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <div className="xl:col-span-2" />
          )}
        </div>
      </div>

      <div className="mt-4">
        <KpiGrid items={kpis} />
      </div>
    </motion.header>
  )
}
