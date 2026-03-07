// 该文件定义高风险区域列表组件，供右侧详情面板复用。
import { StatusBadge } from '@/components/common/StatusBadge'
import type { HotAreaItem } from '@/types/domain'

interface HotAreaListProps {
  areas: HotAreaItem[]
  selectedPlotId: string | null
  onSelect: (plotId: string) => void
}

// 导出高风险区域列表，支持点击联动地图地块。
export const HotAreaList = ({ areas, selectedPlotId, onSelect }: HotAreaListProps): JSX.Element => {
  return (
    <div className="space-y-2">
      {areas.map((area) => (
        <button
          key={area.plotId}
          type="button"
          onClick={() => onSelect(area.plotId)}
          className={`w-full rounded-lg border px-3 py-2 text-left transition ${
            selectedPlotId === area.plotId
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">{area.plotName}</p>
            <StatusBadge text={`${Math.round(area.score * 100)}分`} tone="warn" />
          </div>
          <p className="mt-1 text-xs text-slate-500">{area.issue}</p>
        </button>
      ))}
    </div>
  )
}
