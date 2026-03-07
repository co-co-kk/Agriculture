// 该文件定义右侧面板，展示告警流、高风险区域和处置建议。
import { PanelCard } from '@/components/common/PanelCard'
import { HotAreaList } from '@/components/common/HotAreaList'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SuggestionList } from '@/components/common/SuggestionList'
import type { AlertEvent, HotAreaItem, SuggestionItem } from '@/types/domain'

interface RightSidebarProps {
  alerts: AlertEvent[]
  hotAreas: HotAreaItem[]
  suggestions: SuggestionItem[]
  selectedPlotId: string | null
  onSelectPlot: (plotId: string) => void
  onOpenReport: () => void
}

// 将告警等级映射为标签颜色，形成一致视觉语义。
const levelTone = (level: AlertEvent['level']) => {
  if (level === '严重') {
    return 'danger' as const
  }
  if (level === '预警') {
    return 'warn' as const
  }
  return 'neutral' as const
}

// 导出右侧面板组件，统一承载告警和行动建议。
export const RightSidebar = ({
  alerts,
  hotAreas,
  suggestions,
  selectedPlotId,
  onSelectPlot,
  onOpenReport,
}: RightSidebarProps): JSX.Element => {
  return (
    <aside className="space-y-3 xl:col-span-3">
      <PanelCard
        title="实时告警流"
        subtitle="按时间倒序推送风险事件"
        action={
          <button
            type="button"
            onClick={onOpenReport}
            className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700"
          >
            查看报告
          </button>
        }
      >
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {alerts.slice(0, 16).map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => onSelectPlot(alert.plotId)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-emerald-300"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-800">{alert.title}</p>
                <StatusBadge text={alert.level} tone={levelTone(alert.level)} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{alert.description}</p>
              <p className="mt-1 text-[11px] text-slate-400">{new Date(alert.occurredAt).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="高风险区域" subtitle="点击区域可联动地图定位">
        <HotAreaList areas={hotAreas} selectedPlotId={selectedPlotId} onSelect={onSelectPlot} />
      </PanelCard>

      <PanelCard title="行动建议" subtitle="按优先级输出本次巡检处置动作">
        <SuggestionList suggestions={suggestions} />
      </PanelCard>
    </aside>
  )
}
