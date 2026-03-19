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
        tone="dark"
        action={
          <button
            type="button"
            onClick={onOpenReport}
            className="rounded-lg border border-emerald-400/40 bg-slate-900/80 px-2 py-1 text-xs text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.35)] transition-colors hover:bg-emerald-500/20"
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
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 p-2 text-left transition-colors hover:border-emerald-400/70 hover:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-50">{alert.title}</p>
                <StatusBadge text={alert.level} tone={levelTone(alert.level)} />
              </div>
              <p className="mt-1 text-xs text-slate-400">{alert.description}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {new Date(alert.occurredAt).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="高风险区域" subtitle="点击区域可联动地图定位" tone="dark">
        <HotAreaList areas={hotAreas} selectedPlotId={selectedPlotId} onSelect={onSelectPlot} />
      </PanelCard>

      <PanelCard title="行动建议" subtitle="按优先级输出本次巡检处置动作" tone="dark">
        <SuggestionList suggestions={suggestions} />
      </PanelCard>
    </aside>
  )
}
