// 该文件定义顶部状态栏，包含场景切换、指标与全局操作按钮。
import { motion } from 'framer-motion'
import { KpiGrid } from '@/components/common/KpiGrid'
import { SceneToggle } from '@/components/common/SceneToggle'
import type { DashboardKpi, SceneType } from '@/types/domain'

interface HeaderBarProps {
  scene: SceneType
  kpis: DashboardKpi[]
  onSceneChange: (scene: SceneType) => void
  onRefresh: () => void
  onOpenReport: () => void
}

// 导出顶部栏组件，统一承载全局状态展示与操作入口。
export const HeaderBar = ({ scene, kpis, onSceneChange, onRefresh, onOpenReport }: HeaderBarProps): JSX.Element => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel-border rounded-2xl bg-white/95 p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">农业AI无人机巡检作战平台</h1>
          <p className="mt-1 text-xs text-slate-500">作战日：{new Date().toLocaleString()} · 重点监测病虫害风险区域</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SceneToggle value={scene} onChange={onSceneChange} />
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

      <div className="mt-4">
        <KpiGrid items={kpis} />
      </div>
    </motion.header>
  )
}
