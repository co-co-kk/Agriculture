// 该文件定义筛选控件面板，支持场景化筛选条件。
import type { SceneType, SeverityLevel } from '@/types/domain'

interface FilterPanelProps {
  scene: SceneType
  filter: {
    severity?: SeverityLevel
    agentType?: string
    pestType?: string
  }
  onFilterChange: (patch: Partial<{ severity?: SeverityLevel; agentType?: string; pestType?: string }>) => void
}

// 导出筛选面板组件，统一筛选字段与交互行为。
export const FilterPanel = ({ scene, filter, onFilterChange }: FilterPanelProps): JSX.Element => {
  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {scene === 'disease' ? (
        <>
          <label className="text-xs text-slate-600">
            病原类型
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
              value={filter.agentType ?? ''}
              onChange={(event) => onFilterChange({ agentType: event.target.value || undefined })}
            >
              <option value="">全部</option>
              <option value="fungus">真菌</option>
              <option value="bacteria">细菌</option>
              <option value="virus">病毒</option>
            </select>
          </label>
          <label className="text-xs text-slate-600">
            严重度
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
              value={filter.severity ?? ''}
              onChange={(event) => onFilterChange({ severity: (event.target.value as SeverityLevel) || undefined })}
            >
              <option value="">全部</option>
              <option value="轻度">轻度</option>
              <option value="中度">中度</option>
              <option value="重度">重度</option>
            </select>
          </label>
        </>
      ) : (
        <label className="text-xs text-slate-600 lg:col-span-2">
          虫种
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
            value={filter.pestType ?? ''}
            onChange={(event) => onFilterChange({ pestType: event.target.value || undefined })}
          >
            <option value="">全部</option>
            <option value="蚜虫">蚜虫</option>
            <option value="稻飞虱">稻飞虱</option>
            <option value="棉铃虫">棉铃虫</option>
            <option value="白粉虱">白粉虱</option>
            <option value="红蜘蛛">红蜘蛛</option>
          </select>
        </label>
      )}
    </div>
  )
}
