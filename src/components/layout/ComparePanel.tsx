// 该文件定义版本对比面板，展示左右快照核心指标差异。
import { PanelCard } from '@/components/common/PanelCard'
import type { SnapshotCompareResult } from '@/types/dataCenter'

interface ComparePanelProps {
  result?: SnapshotCompareResult
}

export const ComparePanel = ({ result }: ComparePanelProps): JSX.Element | null => {
  if (!result) {
    return null
  }

  return (
    <PanelCard title="双版本对比" subtitle={result.summary}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {result.metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{metric.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">左侧</p>
                <p className="text-sm font-semibold text-slate-800">{metric.leftValue}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">右侧</p>
                <p className="text-sm font-semibold text-slate-900">{metric.rightValue}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">变化</p>
                <p className="text-sm font-semibold text-emerald-700">{metric.delta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  )
}
