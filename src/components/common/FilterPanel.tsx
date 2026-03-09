// 该文件定义筛选控件面板，支持四场景筛选条件。
import type { SceneType, SeverityLevel } from '@/types/domain'

interface FilterPanelProps {
  scene: SceneType
  filter: {
    severity?: SeverityLevel
    agentType?: string
    pestType?: string
    deficiencyType?: string
    weedType?: string
  }
  onFilterChange: (
    patch: Partial<{
      severity?: SeverityLevel
      agentType?: string
      pestType?: string
      deficiencyType?: string
      weedType?: string
    }>,
  ) => void
}

export const FilterPanel = ({ scene, filter, onFilterChange }: FilterPanelProps): JSX.Element => {
  if (scene === 'disease') {
    return (
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
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
      </div>
    )
  }

  if (scene === 'pest') {
    return (
      <label className="text-xs text-slate-600">
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
    )
  }

  if (scene === 'nutrient') {
    return (
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <label className="text-xs text-slate-600">
          缺素类型
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
            value={filter.deficiencyType ?? ''}
            onChange={(event) => onFilterChange({ deficiencyType: event.target.value || undefined })}
          >
            <option value="">全部</option>
            <option value="缺氮">缺氮</option>
            <option value="缺磷">缺磷</option>
            <option value="缺钾">缺钾</option>
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
      </div>
    )
  }

  return (
    <label className="text-xs text-slate-600">
      杂草类型
      <select
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
        value={filter.weedType ?? ''}
        onChange={(event) => onFilterChange({ weedType: event.target.value || undefined })}
      >
        <option value="">全部</option>
        <option value="阔叶杂草">阔叶杂草</option>
        <option value="禾本科杂草">禾本科杂草</option>
        <option value="莎草">莎草</option>
      </select>
    </label>
  )
}
