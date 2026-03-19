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
    // 使用深色渐变与发光边框构建“作战指挥头部”
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel-border relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95 p-4 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
    >
      {/* 背景网格装饰，提升科技感 */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(45,212,191,0.16),_transparent_55%)]" />
      </div>

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-50">农业AI无人机巡检作战平台</h1>
            <p className="mt-1 text-xs text-slate-400">
              作战日：{new Date().toLocaleString()} · 聚焦病虫害与养分异常风险区域
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 场景切换保持独立组件，但依托深色背景更突出 */}
            <SceneToggle value={scene} onChange={onSceneChange} />

            <button
              type="button"
              onClick={onOpenDataCenter}
              className="rounded-lg bg-emerald-500/90 px-3 py-2 text-xs font-medium text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.6)] transition-colors hover:bg-emerald-400"
            >
              数据中心
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg border border-slate-600/80 bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-emerald-400 hover:text-emerald-200"
            >
              刷新数据
            </button>
            <button
              type="button"
              onClick={onOpenReport}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-colors hover:bg-emerald-500"
            >
              打开报告
            </button>
          </div>
        </div>

        {/* 快照与双版本对比区域，统一为暗底描边输入控件 */}
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
          <label className="text-xs text-slate-300 xl:col-span-2">
            当前快照
            <select
              className="mt-1 w-full rounded-lg border border-slate-600/80 bg-slate-900/80 px-2 py-1 text-sm text-slate-50 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
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

          <label className="flex items-center gap-2 text-xs text-slate-300 xl:col-span-1 xl:self-end">
            <input
              type="checkbox"
              checked={compareEnabled}
              onChange={(event) => onCompareEnabledChange(event.target.checked)}
              className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500/60"
            />
            开启双版本对比
          </label>

          {compareEnabled ? (
            <>
              <label className="text-xs text-slate-300">
                左侧版本
                <select
                  className="mt-1 w-full rounded-lg border border-slate-600/80 bg-slate-900/80 px-2 py-1 text-sm text-slate-50 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
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
              <label className="text-xs text-slate-300">
                右侧版本
                <select
                  className="mt-1 w-full rounded-lg border border-slate-600/80 bg-slate-900/80 px-2 py-1 text-sm text-slate-50 outline-none ring-emerald-500/40 focus:border-emerald-400 focus:ring"
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

        {/* KPI 区保持组件封装，只调整整体容器的上下间距 */}
        <div className="mt-2 rounded-xl border border-slate-700/80 bg-slate-900/80 p-3">
          <KpiGrid items={kpis} />
        </div>
      </div>
    </motion.header>
  )
}
